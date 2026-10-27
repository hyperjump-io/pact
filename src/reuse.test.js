import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";

// A step made once can be used more than once, and each use starts from
// the step's configuration, not from where the last use left off.

const items = [1, 2, 3];
const add = (/** @type number */ a, /** @type number */ b) => a + b;

/** @type [string, (iter: any) => any][] */
const steps = [
  ["map", Pact.map((n) => n * 2)],
  ["tap", Pact.tap(() => {})],
  ["filter", Pact.filter((n) => n > 1)],
  ["scan", Pact.scan(add, 0)],
  ["drop", Pact.drop(1)],
  ["dropWhile", Pact.dropWhile((n) => n < 2)],
  ["take", Pact.take(2)],
  ["takeWhile", Pact.takeWhile((n) => n < 3)],
  ["reduce", Pact.reduce(add, 0)],
  ["every", Pact.every((n) => n > 0)],
  ["some", Pact.some((n) => n > 2)],
  ["find", Pact.find((n) => n > 1)],
  ["join", Pact.join(",")]
];

/** @type [string, (iter: any) => any][] */
const asyncSteps = [
  ["asyncMap", Pact.asyncMap((n) => n * 2)],
  ["asyncTap", Pact.asyncTap(() => {})],
  ["asyncFilter", Pact.asyncFilter((n) => n > 1)],
  ["asyncScan", Pact.asyncScan(add, 0)],
  ["asyncDrop", Pact.asyncDrop(1)],
  ["asyncDropWhile", Pact.asyncDropWhile((n) => n < 2)],
  ["asyncTake", Pact.asyncTake(2)],
  ["asyncTakeWhile", Pact.asyncTakeWhile((n) => n < 3)],
  ["asyncReduce", Pact.asyncReduce(add, 0)],
  ["asyncEvery", Pact.asyncEvery((n) => n > 0)],
  ["asyncSome", Pact.asyncSome((n) => n > 2)],
  ["asyncFind", Pact.asyncFind((n) => n > 1)],
  ["asyncJoin", Pact.asyncJoin(",")]
];

describe("a step can be used more than once", () => {
  test.each(steps)("%s", (_name, step) => {
    const first = collect(step(items));
    const second = collect(step(items));
    expect(second).to.eql(first);
  });

  test.each(asyncSteps)("%s", async (_name, step) => {
    const first = await asyncCollect(step(items));
    const second = await asyncCollect(step(items));
    expect(second).to.eql(first);
  });
});

/** @type (result: any) => any */
const collect = (result) => {
  return typeof result?.next === "function" ? [...result] : result;
};

/** @type (result: any) => Promise<any> */
const asyncCollect = async (result) => {
  if (typeof result?.next !== "function") {
    return result;
  }

  const items = [];
  for await (const item of result) {
    items.push(item);
  }
  return items;
};
