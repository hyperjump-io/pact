import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";

// Like the native Iterator helpers, callbacks get each value's index after
// the value, and reducers get it after the value too. Without an initial
// value, reduce's first call is for the second value, so its index is 1.

const items = ["a", "b", "c"];

/** @type [string, (fn: (...args: any[]) => any) => any, number[]][] */
const sync = [
  ["map", (fn) => [...Pact.map(fn)(items)], [0, 1, 2]],
  ["tap", (fn) => [...Pact.tap(fn)(items)], [0, 1, 2]],
  ["filter", (fn) => [...Pact.filter(fn)(items)], [0, 1, 2]],
  ["flatMap", (fn) => [...Pact.flatMap((...args) => (fn(...args), []))(items)], [0, 1, 2]],
  ["dropWhile", (fn) => [...Pact.dropWhile((...args) => (fn(...args), true))(items)], [0, 1, 2]],
  ["takeWhile", (fn) => [...Pact.takeWhile((...args) => (fn(...args), true))(items)], [0, 1, 2]],
  ["every", (fn) => Pact.every((...args) => (fn(...args), true))(items), [0, 1, 2]],
  ["some", (fn) => Pact.some((...args) => (fn(...args), false))(items), [0, 1, 2]],
  ["find", (fn) => Pact.find((...args) => (fn(...args), false))(items), [0, 1, 2]],
  ["forEach", (fn) => Pact.forEach(fn)(items), [0, 1, 2]],
  ["scan", (fn) => [...Pact.scan((_acc, ...args) => fn(...args), "")(items)], [0, 1, 2]],
  ["reduce", (fn) => Pact.reduce((_acc, ...args) => fn(...args), "")(items), [0, 1, 2]],
  ["reduce without an initial value", (fn) => Pact.reduce((_acc, ...args) => fn(...args))(items), [1, 2]]
];

/** @type [string, (fn: (...args: any[]) => any) => Promise<any>, number[]][] */
const async = [
  ["Async.map", (fn) => Async.toArray(Async.map(fn)(items)), [0, 1, 2]],
  ["Async.tap", (fn) => Async.toArray(Async.tap(fn)(items)), [0, 1, 2]],
  ["Async.filter", (fn) => Async.toArray(Async.filter(fn)(items)), [0, 1, 2]],
  ["Async.flatMap", (fn) => Async.toArray(Async.flatMap((...args) => (fn(...args), []))(items)), [0, 1, 2]],
  ["Async.dropWhile", (fn) => Async.toArray(Async.dropWhile((...args) => (fn(...args), true))(items)), [0, 1, 2]],
  ["Async.takeWhile", (fn) => Async.toArray(Async.takeWhile((...args) => (fn(...args), true))(items)), [0, 1, 2]],
  ["Async.every", (fn) => Async.every((...args) => (fn(...args), true))(items), [0, 1, 2]],
  ["Async.some", (fn) => Async.some((...args) => (fn(...args), false))(items), [0, 1, 2]],
  ["Async.find", (fn) => Async.find((...args) => (fn(...args), false))(items), [0, 1, 2]],
  ["Async.forEach", (fn) => Async.forEach(fn)(items), [0, 1, 2]],
  ["Async.scan", (fn) => Async.toArray(Async.scan((_acc, ...args) => fn(...args), "")(items)), [0, 1, 2]],
  ["Async.reduce", (fn) => Async.reduce((_acc, ...args) => fn(...args), "")(items), [0, 1, 2]],
  ["Async.reduce without an initial value", (fn) => Async.reduce((_acc, ...args) => fn(...args))(items), [1, 2]]
];

describe("callbacks get the index", () => {
  test.each(sync)("%s", (_name, run, expected) => {
    /** @type number[] */
    const indexes = [];
    run((_item, index) => {
      indexes.push(index);
      return _item;
    });
    expect(indexes).to.eql(expected);
  });

  test.each(async)("%s", async (_name, run, expected) => {
    /** @type number[] */
    const indexes = [];
    await run((_item, index) => {
      indexes.push(index);
      return _item;
    });
    expect(indexes).to.eql(expected);
  });
});
