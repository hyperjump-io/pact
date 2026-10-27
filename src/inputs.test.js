import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";

// Every function, with each kind of input. An array or a Set can be
// iterated more than once, which a generator can't, and an empty input
// is where an off-by-one shows up.

/**
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
  { name: "map", items: numbers, run: (iter) => [...Pact.map(double, iter)], expected: [2, 4, 6, 8], expectedEmpty: [] },
  { name: "tap", items: numbers, run: (iter) => [...Pact.tap(() => {}, iter)], expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "filter", items: numbers, run: (iter) => [...Pact.filter(isEven, iter)], expected: [2, 4], expectedEmpty: [] },
  { name: "scan", items: numbers, run: (iter) => [...Pact.scan(add, 0, iter)], expected: [1, 3, 6, 10], expectedEmpty: [] },
  { name: "flatten", items: [[1, 2], [3], 4], run: (iter) => [...Pact.flatten(iter)], expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "drop", items: numbers, run: (iter) => [...Pact.drop(2, iter)], expected: [3, 4], expectedEmpty: [] },
  { name: "dropWhile", items: numbers, run: (iter) => [...Pact.dropWhile((n) => n < 3, iter)], expected: [3, 4], expectedEmpty: [] },
  { name: "take", items: numbers, run: (iter) => [...Pact.take(2, iter)], expected: [1, 2], expectedEmpty: [] },
  { name: "takeWhile", items: numbers, run: (iter) => [...Pact.takeWhile((n) => n < 3, iter)], expected: [1, 2], expectedEmpty: [] },
  { name: "head", items: numbers, run: (iter) => Pact.head(iter), expected: 1, expectedEmpty: undefined },
  { name: "zip (first)", items: numbers, run: (iter) => [...Pact.zip(iter, strings)], expected: [[1, "a"], [2, "b"], [3, "c"], [4, undefined]], expectedEmpty: [] },
  { name: "zip (second)", items: numbers, run: (iter) => [...Pact.zip(strings, iter)], expected: [["a", 1], ["b", 2], ["c", 3]], expectedEmpty: [["a", undefined], ["b", undefined], ["c", undefined]] },
  { name: "concat", items: numbers, run: (iter) => [...Pact.concat([0], iter, [5])], expected: [0, 1, 2, 3, 4, 5], expectedEmpty: [0, 5] },
  { name: "reduce", items: numbers, run: (iter) => Pact.reduce(add, 0, iter), expected: 10, expectedEmpty: 0 },
  { name: "every", items: numbers, run: (iter) => Pact.every((n) => n > 0, iter), expected: true, expectedEmpty: true },
  { name: "some", items: numbers, run: (iter) => Pact.some((n) => n > 3, iter), expected: true, expectedEmpty: false },
  { name: "find", items: numbers, run: (iter) => Pact.find((n) => n > 2, iter), expected: 3, expectedEmpty: undefined },
  { name: "count", items: numbers, run: (iter) => Pact.count(iter), expected: 4, expectedEmpty: 0 },
  { name: "collectArray", items: numbers, run: (iter) => Pact.collectArray(iter), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "collectSet", items: numbers, run: (iter) => Pact.collectSet(iter), expected: new Set(numbers), expectedEmpty: new Set() },
  { name: "collectMap", items: pairs, run: (iter) => Pact.collectMap(iter), expected: new Map([["a", 1], ["b", 2]]), expectedEmpty: new Map() },
  { name: "collectObject", items: pairs, run: (iter) => Pact.collectObject(iter), expected: { a: 1, b: 2 }, expectedEmpty: {} },
  { name: "join", items: strings, run: (iter) => Pact.join(",", iter), expected: "a,b,c", expectedEmpty: "" },
  { name: "pipe", items: numbers, run: (iter) => Pact.pipe(iter, Pact.filter(isEven), Pact.map(double), Pact.collectArray), expected: [4, 8], expectedEmpty: [] }
];

/** @type Case[] */
const asyncCases = [
  { name: "asyncMap", items: numbers, run: (iter) => toArray(Pact.asyncMap(double, iter)), expected: [2, 4, 6, 8], expectedEmpty: [] },
  { name: "asyncTap", items: numbers, run: (iter) => toArray(Pact.asyncTap(() => {}, iter)), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "asyncFilter", items: numbers, run: (iter) => toArray(Pact.asyncFilter(isEven, iter)), expected: [2, 4], expectedEmpty: [] },
  { name: "asyncScan", items: numbers, run: (iter) => toArray(Pact.asyncScan(add, 0, iter)), expected: [1, 3, 6, 10], expectedEmpty: [] },
  { name: "asyncFlatten", items: [[1, 2], [3], 4], run: (iter) => toArray(Pact.asyncFlatten(iter)), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "asyncDrop", items: numbers, run: (iter) => toArray(Pact.asyncDrop(2, iter)), expected: [3, 4], expectedEmpty: [] },
  { name: "asyncDropWhile", items: numbers, run: (iter) => toArray(Pact.asyncDropWhile((n) => n < 3, iter)), expected: [3, 4], expectedEmpty: [] },
  { name: "asyncTake", items: numbers, run: (iter) => toArray(Pact.asyncTake(2, iter)), expected: [1, 2], expectedEmpty: [] },
  { name: "asyncTakeWhile", items: numbers, run: (iter) => toArray(Pact.asyncTakeWhile((n) => n < 3, iter)), expected: [1, 2], expectedEmpty: [] },
  { name: "asyncHead", items: numbers, run: (iter) => Pact.asyncHead(iter), expected: 1, expectedEmpty: undefined },
  { name: "asyncZip (first)", items: numbers, run: (iter) => toArray(Pact.asyncZip(iter, strings)), expected: [[1, "a"], [2, "b"], [3, "c"], [4, undefined]], expectedEmpty: [] },
  { name: "asyncZip (second)", items: numbers, run: (iter) => toArray(Pact.asyncZip(strings, iter)), expected: [["a", 1], ["b", 2], ["c", 3]], expectedEmpty: [["a", undefined], ["b", undefined], ["c", undefined]] },
  { name: "asyncConcat", items: numbers, run: (iter) => toArray(Pact.asyncConcat([0], iter, [5])), expected: [0, 1, 2, 3, 4, 5], expectedEmpty: [0, 5] },
  { name: "asyncReduce", items: numbers, run: (iter) => Pact.asyncReduce(add, 0, iter), expected: 10, expectedEmpty: 0 },
  { name: "asyncEvery", items: numbers, run: (iter) => Pact.asyncEvery((n) => n > 0, iter), expected: true, expectedEmpty: true },
  { name: "asyncSome", items: numbers, run: (iter) => Pact.asyncSome((n) => n > 3, iter), expected: true, expectedEmpty: false },
  { name: "asyncFind", items: numbers, run: (iter) => Pact.asyncFind((n) => n > 2, iter), expected: 3, expectedEmpty: undefined },
  { name: "asyncCount", items: numbers, run: (iter) => Pact.asyncCount(iter), expected: 4, expectedEmpty: 0 },
  { name: "asyncCollectArray", items: numbers, run: (iter) => Pact.asyncCollectArray(iter), expected: [1, 2, 3, 4], expectedEmpty: [] },
  { name: "asyncCollectSet", items: numbers, run: (iter) => Pact.asyncCollectSet(iter), expected: new Set(numbers), expectedEmpty: new Set() },
  { name: "asyncCollectMap", items: pairs, run: (iter) => Pact.asyncCollectMap(iter), expected: new Map([["a", 1], ["b", 2]]), expectedEmpty: new Map() },
  { name: "asyncCollectObject", items: pairs, run: (iter) => Pact.asyncCollectObject(iter), expected: { a: 1, b: 2 }, expectedEmpty: {} },
  { name: "asyncJoin", items: strings, run: (iter) => Pact.asyncJoin(",", iter), expected: "a,b,c", expectedEmpty: "" },
  { name: "pipe", items: numbers, run: (iter) => Pact.pipe(iter, Pact.asyncFilter(isEven), Pact.asyncMap(double), Pact.asyncCollectArray), expected: [4, 8], expectedEmpty: [] }
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
    expect(run(input([]))).to.eql(expectedEmpty);
  });
});

describe.each(asyncCases)("$name", ({ items, run, expected, expectedEmpty }) => {
  test.each(Object.entries(asyncInputs))("%s", async (_kind, input) => {
    expect(await run(input(items))).to.eql(expected);
  });

  test.each(Object.entries(asyncInputs))("empty %s", async (_kind, input) => {
    expect(await run(input([]))).to.eql(expectedEmpty);
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
