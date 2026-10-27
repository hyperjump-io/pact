import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";

// Every function, with each kind of input. An array or a Set can be
// iterated more than once, which a generator can't, and an empty input
// is where an off-by-one shows up.

/**
 * An `expectedEmpty` of `TypeError` means an empty input throws one.
 *
 * @typedef {{
 *   name: string;
 *   items: any[];
 *   run: (iter: any) => any;
 *   expected: any;
 *   expectedEmpty: any;
 * }} Case
 */

const double = (/** @type number */ n) => n * 2;
const isEven = (/** @type number */ n) => n % 2 === 0;
const add = (/** @type number */ a, /** @type number */ b) => a + b;
const numbers = [1, 2, 3, 4];
const pairs = [["a", 1], ["b", 2]];
const strings = ["a", "b", "c"];

/** @type Case[] */
const syncCases = [
  { name: "map", items: numbers, run: (iter) => [...Pact.map(double)(iter)], expected: [2, 4, 6, 8], expectedEmpty: [] },
  { name: "tap", items: numbers, run: (iter) => [...Pact.tap(() => {})(iter)], expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "filter", items: numbers, run: (iter) => [...Pact.filter(isEven)(iter)], expected: [2, 4], expectedEmpty: [] },
  { name: "scan", items: numbers, run: (iter) => [...Pact.scan(add, 0)(iter)], expected: [1, 3, 6, 10], expectedEmpty: [] },
  { name: "flatten", items: [[1, 2], [3], 4], run: (iter) => [...Pact.flatten()(iter)], expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "flatMap", items: numbers, run: (iter) => [...Pact.flatMap((n) => [n, n])(iter)], expected: [1, 1, 2, 2, 3, 3, 4, 4], expectedEmpty: [] },
  { name: "drop", items: numbers, run: (iter) => [...Pact.drop(2)(iter)], expected: [3, 4], expectedEmpty: [] },
  { name: "dropWhile", items: numbers, run: (iter) => [...Pact.dropWhile((n) => n < 3)(iter)], expected: [3, 4], expectedEmpty: [] },
  { name: "take", items: numbers, run: (iter) => [...Pact.take(2)(iter)], expected: [1, 2], expectedEmpty: [] },
  { name: "takeWhile", items: numbers, run: (iter) => [...Pact.takeWhile((n) => n < 3)(iter)], expected: [1, 2], expectedEmpty: [] },
  { name: "head", items: numbers, run: (iter) => Pact.head(iter), expected: 1, expectedEmpty: undefined },
  { name: "zip (first)", items: numbers, run: (iter) => [...Pact.zip(iter, strings)], expected: [[1, "a"], [2, "b"], [3, "c"], [4, undefined]], expectedEmpty: [] },
  { name: "zip (second)", items: numbers, run: (iter) => [...Pact.zip(strings, iter)], expected: [["a", 1], ["b", 2], ["c", 3]], expectedEmpty: [["a", undefined], ["b", undefined], ["c", undefined]] },
  { name: "concat", items: numbers, run: (iter) => [...Pact.concat([0], iter, [5])], expected: [0, 1, 2, 3, 4, 5], expectedEmpty: [0, 5] },
  { name: "reduce", items: numbers, run: (iter) => Pact.reduce(add, 0)(iter), expected: 10, expectedEmpty: 0 },
  { name: "every", items: numbers, run: (iter) => Pact.every((n) => n > 0)(iter), expected: true, expectedEmpty: true },
  { name: "some", items: numbers, run: (iter) => Pact.some((n) => n > 3)(iter), expected: true, expectedEmpty: false },
  { name: "find", items: numbers, run: (iter) => Pact.find((n) => n > 2)(iter), expected: 3, expectedEmpty: undefined },
  { name: "forEach", items: numbers, run: (iter) => seen((fn) => Pact.forEach(fn)(iter)), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "reduce without an initial value", items: numbers, run: (iter) => Pact.reduce(add)(iter), expected: 10, expectedEmpty: TypeError },
  { name: "count", items: numbers, run: (iter) => Pact.count(iter), expected: 4, expectedEmpty: 0 },
  { name: "toArray", items: numbers, run: (iter) => Pact.toArray(iter), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "toSet", items: numbers, run: (iter) => Pact.toSet(iter), expected: new Set(numbers), expectedEmpty: new Set() },
  { name: "toMap", items: pairs, run: (iter) => Pact.toMap(iter), expected: new Map([["a", 1], ["b", 2]]), expectedEmpty: new Map() },
  { name: "toObject", items: pairs, run: (iter) => Pact.toObject(iter), expected: { a: 1, b: 2 }, expectedEmpty: {} },
  { name: "join", items: strings, run: (iter) => Pact.join(",")(iter), expected: "a,b,c", expectedEmpty: "" },
  { name: "pipe", items: numbers, run: (iter) => Pact.pipe(iter, Pact.filter(isEven), Pact.map(double), Pact.toArray), expected: [4, 8], expectedEmpty: [] }
];

/** @type Case[] */
const asyncCases = [
  { name: "Async.map", items: numbers, run: (iter) => toArray(Async.map(double)(iter)), expected: [2, 4, 6, 8], expectedEmpty: [] },
  { name: "Async.tap", items: numbers, run: (iter) => toArray(Async.tap(() => {})(iter)), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "Async.filter", items: numbers, run: (iter) => toArray(Async.filter(isEven)(iter)), expected: [2, 4], expectedEmpty: [] },
  { name: "Async.scan", items: numbers, run: (iter) => toArray(Async.scan(add, 0)(iter)), expected: [1, 3, 6, 10], expectedEmpty: [] },
  { name: "Async.flatten", items: [[1, 2], [3], 4], run: (iter) => toArray(Async.flatten()(iter)), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "Async.flatMap", items: numbers, run: (iter) => toArray(Async.flatMap(async (n) => [n, n])(iter)), expected: [1, 1, 2, 2, 3, 3, 4, 4], expectedEmpty: [] },
  { name: "Async.drop", items: numbers, run: (iter) => toArray(Async.drop(2)(iter)), expected: [3, 4], expectedEmpty: [] },
  { name: "Async.dropWhile", items: numbers, run: (iter) => toArray(Async.dropWhile((n) => n < 3)(iter)), expected: [3, 4], expectedEmpty: [] },
  { name: "Async.take", items: numbers, run: (iter) => toArray(Async.take(2)(iter)), expected: [1, 2], expectedEmpty: [] },
  { name: "Async.takeWhile", items: numbers, run: (iter) => toArray(Async.takeWhile((n) => n < 3)(iter)), expected: [1, 2], expectedEmpty: [] },
  { name: "Async.head", items: numbers, run: (iter) => Async.head(iter), expected: 1, expectedEmpty: undefined },
  { name: "Async.zip (first)", items: numbers, run: (iter) => toArray(Async.zip(iter, strings)), expected: [[1, "a"], [2, "b"], [3, "c"], [4, undefined]], expectedEmpty: [] },
  { name: "Async.zip (second)", items: numbers, run: (iter) => toArray(Async.zip(strings, iter)), expected: [["a", 1], ["b", 2], ["c", 3]], expectedEmpty: [["a", undefined], ["b", undefined], ["c", undefined]] },
  { name: "Async.concat", items: numbers, run: (iter) => toArray(Async.concat([0], iter, [5])), expected: [0, 1, 2, 3, 4, 5], expectedEmpty: [0, 5] },
  { name: "Async.reduce", items: numbers, run: (iter) => Async.reduce(add, 0)(iter), expected: 10, expectedEmpty: 0 },
  { name: "Async.every", items: numbers, run: (iter) => Async.every((n) => n > 0)(iter), expected: true, expectedEmpty: true },
  { name: "Async.some", items: numbers, run: (iter) => Async.some((n) => n > 3)(iter), expected: true, expectedEmpty: false },
  { name: "Async.find", items: numbers, run: (iter) => Async.find((n) => n > 2)(iter), expected: 3, expectedEmpty: undefined },
  { name: "Async.forEach", items: numbers, run: (iter) => asyncSeen((fn) => Async.forEach(fn)(iter)), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "Async.reduce without an initial value", items: numbers, run: (iter) => Async.reduce(add)(iter), expected: 10, expectedEmpty: TypeError },
  { name: "Async.count", items: numbers, run: (iter) => Async.count(iter), expected: 4, expectedEmpty: 0 },
  { name: "Async.toArray", items: numbers, run: (iter) => Async.toArray(iter), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "Async.toSet", items: numbers, run: (iter) => Async.toSet(iter), expected: new Set(numbers), expectedEmpty: new Set() },
  { name: "Async.toMap", items: pairs, run: (iter) => Async.toMap(iter), expected: new Map([["a", 1], ["b", 2]]), expectedEmpty: new Map() },
  { name: "Async.toObject", items: pairs, run: (iter) => Async.toObject(iter), expected: { a: 1, b: 2 }, expectedEmpty: {} },
  { name: "Async.join", items: strings, run: (iter) => Async.join(",")(iter), expected: "a,b,c", expectedEmpty: "" },
  { name: "pipe", items: numbers, run: (iter) => Pact.pipe(iter, Async.filter(isEven), Async.map(double), Async.toArray), expected: [4, 8], expectedEmpty: [] }
];

/** @type Record<string, (items: any[]) => Iterable<any>> */
const syncInputs = {
  generator: (items) => (function* () {
    yield* items;
  }()),
  array: (items) => [...items],
  set: (items) => new Set(items)
};

/** @type Record<string, (items: any[]) => Iterable<any> | AsyncIterable<any>> */
const asyncInputs = {
  "async generator": (items) => (async function* () {
    yield* items;
  }()),
  "sync generator": syncInputs.generator,
  "array": syncInputs.array,
  "set": syncInputs.set
};

describe.each(syncCases)("$name", ({ items, run, expected, expectedEmpty }) => {
  test.each(Object.entries(syncInputs))("%s", (_kind, input) => {
    expect(run(input(items))).to.eql(expected);
  });

  test.each(Object.entries(syncInputs))("empty %s", (_kind, input) => {
    if (expectedEmpty === TypeError) {
      expect(() => run(input([]))).to.throw(TypeError);
    } else {
      expect(run(input([]))).to.eql(expectedEmpty);
    }
  });
});

describe.each(asyncCases)("$name", ({ items, run, expected, expectedEmpty }) => {
  test.each(Object.entries(asyncInputs))("%s", async (_kind, input) => {
    expect(await run(input(items))).to.eql(expected);
  });

  test.each(Object.entries(asyncInputs))("empty %s", async (_kind, input) => {
    if (expectedEmpty === TypeError) {
      await expect(run(input([]))).rejects.toThrow(TypeError);
    } else {
      expect(await run(input([]))).to.eql(expectedEmpty);
    }
  });
});

/** @type <A>(iter: AsyncIterable<A>) => Promise<A[]> */
const toArray = async (iter) => {
  const result = [];
  for await (const item of iter) {
    result.push(item);
  }
  return result;
};

/**
 * Runs `use` with a callback, and returns the values it was called with.
 *
 * @type (use: (fn: (n: any) => void) => void) => any[]
 */
const seen = (use) => {
  /** @type any[] */
  const values = [];
  use((n) => {
    values.push(n);
  });
  return values;
};

/** @type (use: (fn: (n: any) => void) => Promise<void>) => Promise<any[]> */
const asyncSeen = async (use) => {
  /** @type any[] */
  const values = [];
  await use((n) => {
    values.push(n);
  });
  return values;
};
