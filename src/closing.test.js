import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import { closable, asyncClosable } from "./test-utils.js";

// Anything that stops reading a source before it's done closes it (see
// design/principles/close-what-you-open.md). Each source has more items
// than the test reads, because a source that finishes counts as closed.

const items = [1, 2, 3, 4, 5];
const boom = () => {
  throw Error("boom");
};

/** @type [string, (source: any) => any][] */
const stopsEarly = [
  ["take", (source) => [...Pact.take(2)(source)]],
  ["takeWhile", (source) => [...Pact.takeWhile((n) => n < 3)(source)]],
  ["head", (source) => Pact.head(source)],
  ["find", (source) => Pact.find((n) => n > 1)(source)],
  ["some", (source) => Pact.some((n) => n > 1)(source)],
  ["every", (source) => Pact.every((n) => n < 2)(source)],
  ["zip (first)", (source) => [...Pact.zip(source, [1])]],
  ["zip (second)", (source) => [...Pact.zip([1], source)]],
  ["pipe", (source) => Pact.pipe(source, Pact.take(1), Pact.collectArray)]
];

/** @type [string, (source: any) => Iterator<any>][] */
const steps = [
  ["map", (source) => Pact.map((n) => n)(source)],
  ["tap", (source) => Pact.tap(() => {})(source)],
  ["filter", (source) => Pact.filter(() => true)(source)],
  ["scan", (source) => Pact.scan((a, n) => a + n, 0)(source)],
  ["flatten", (source) => Pact.flatten()(source)],
  ["drop", (source) => Pact.drop(1)(source)],
  ["dropWhile", (source) => Pact.dropWhile((n) => n < 2)(source)],
  ["take", (source) => Pact.take(4)(source)],
  ["takeWhile", (source) => Pact.takeWhile(() => true)(source)],
  ["zip (first)", (source) => Pact.zip(source, items)],
  ["zip (second)", (source) => Pact.zip(items, source)],
  ["concat", (source) => Pact.concat(source, items)]
];

/** @type [string, (source: any) => any][] */
const callbackThrows = [
  ["map", (source) => [...Pact.map(boom)(source)]],
  ["tap", (source) => [...Pact.tap(boom)(source)]],
  ["filter", (source) => [...Pact.filter(boom)(source)]],
  ["scan", (source) => [...Pact.scan(boom, 0)(source)]],
  ["dropWhile", (source) => [...Pact.dropWhile(boom)(source)]],
  ["takeWhile", (source) => [...Pact.takeWhile(boom)(source)]],
  ["reduce", (source) => Pact.reduce(boom, 0)(source)],
  ["every", (source) => Pact.every(boom)(source)],
  ["some", (source) => Pact.some(boom)(source)],
  ["find", (source) => Pact.find(boom)(source)]
];

/** @type [string, (source: any) => Promise<any>][] */
const asyncStopsEarly = [
  ["asyncTake", (source) => toArray(Pact.asyncTake(2)(source))],
  ["asyncTakeWhile", (source) => toArray(Pact.asyncTakeWhile((n) => n < 3)(source))],
  ["asyncHead", (source) => Pact.asyncHead(source)],
  ["asyncFind", (source) => Pact.asyncFind((n) => n > 1)(source)],
  ["asyncSome", (source) => Pact.asyncSome((n) => n > 1)(source)],
  ["asyncEvery", (source) => Pact.asyncEvery((n) => n < 2)(source)],
  ["asyncZip (first)", (source) => toArray(Pact.asyncZip(source, [1]))],
  ["asyncZip (second)", (source) => toArray(Pact.asyncZip([1], source))],
  ["pipe", (source) => Pact.pipe(source, Pact.asyncTake(1), Pact.asyncCollectArray)]
];

/** @type [string, (source: any) => AsyncIterator<any>][] */
const asyncSteps = [
  ["asyncMap", (source) => Pact.asyncMap((n) => n)(source)],
  ["asyncTap", (source) => Pact.asyncTap(() => {})(source)],
  ["asyncFilter", (source) => Pact.asyncFilter(() => true)(source)],
  ["asyncScan", (source) => Pact.asyncScan((a, n) => a + n, 0)(source)],
  ["asyncFlatten", (source) => Pact.asyncFlatten()(source)],
  ["asyncDrop", (source) => Pact.asyncDrop(1)(source)],
  ["asyncDropWhile", (source) => Pact.asyncDropWhile((n) => n < 2)(source)],
  ["asyncTake", (source) => Pact.asyncTake(4)(source)],
  ["asyncTakeWhile", (source) => Pact.asyncTakeWhile(() => true)(source)],
  ["asyncZip (first)", (source) => Pact.asyncZip(source, items)],
  ["asyncZip (second)", (source) => Pact.asyncZip(items, source)],
  ["asyncConcat", (source) => Pact.asyncConcat(source, items)]
];

/** @type [string, (source: any) => Promise<any>][] */
const asyncCallbackThrows = [
  ["asyncMap", (source) => toArray(Pact.asyncMap(boom)(source))],
  ["asyncTap", (source) => toArray(Pact.asyncTap(boom)(source))],
  ["asyncFilter", (source) => toArray(Pact.asyncFilter(boom)(source))],
  ["asyncScan", (source) => toArray(Pact.asyncScan(boom, 0)(source))],
  ["asyncDropWhile", (source) => toArray(Pact.asyncDropWhile(boom)(source))],
  ["asyncTakeWhile", (source) => toArray(Pact.asyncTakeWhile(boom)(source))],
  ["asyncReduce", (source) => Pact.asyncReduce(boom, 0)(source)],
  ["asyncEvery", (source) => Pact.asyncEvery(boom)(source)],
  ["asyncSome", (source) => Pact.asyncSome(boom)(source)],
  ["asyncFind", (source) => Pact.asyncFind(boom)(source)]
];

describe("stopping early closes the source", () => {
  test.each(stopsEarly)("%s", (_name, run) => {
    const source = closable(items);
    run(source);
    expect(source.closed).to.equal(true);
  });
});

describe("closing a step closes its source", () => {
  test.each(steps)("%s", (_name, step) => {
    const source = closable(items);
    const result = step(source);
    result.next();
    result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });

  test("flatten closes the nested iterable it's in", () => {
    const nested = closable(items);
    const result = Pact.flatten()([nested]);
    result.next();
    result.return(undefined);
    expect(nested.closed).to.equal(true);
  });

  test("concat doesn't open the iterables it hasn't reached", () => {
    const second = closable(items);
    const result = Pact.concat(items, second);
    result.next();
    result.return(undefined);
    expect(second.closed).to.equal(false);
  });
});

describe("a callback that throws closes the source", () => {
  test.each(callbackThrows)("%s", (_name, run) => {
    const source = closable(items);
    expect(() => run(source)).to.throw("boom");
    expect(source.closed).to.equal(true);
  });
});

describe("async stopping early closes the source", () => {
  test.each(asyncStopsEarly)("%s, async source", async (_name, run) => {
    const source = asyncClosable(items);
    await run(source);
    expect(source.closed).to.equal(true);
  });

  test.each(asyncStopsEarly)("%s, sync source", async (_name, run) => {
    const source = closable(items);
    await run(source);
    expect(source.closed).to.equal(true);
  });
});

describe("closing an async step closes its source", () => {
  test.each(asyncSteps)("%s, async source", async (_name, step) => {
    const source = asyncClosable(items);
    const result = step(source);
    await result.next();
    await result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });

  test.each(asyncSteps)("%s, sync source", async (_name, step) => {
    const source = closable(items);
    const result = step(source);
    await result.next();
    await result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });
});

describe("an async callback that throws closes the source", () => {
  test.each(asyncCallbackThrows)("%s, async source", async (_name, run) => {
    const source = asyncClosable(items);
    await expect(run(source)).rejects.toThrow("boom");
    expect(source.closed).to.equal(true);
  });

  test.each(asyncCallbackThrows)("%s, sync source", async (_name, run) => {
    const source = closable(items);
    await expect(run(source)).rejects.toThrow("boom");
    expect(source.closed).to.equal(true);
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
