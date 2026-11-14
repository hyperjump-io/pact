import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";
import { asyncClosable } from "./test-utils.js";

// What's true of every iterator pact returns (see
// design/components/iterators.md)

const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {}).prototype);

/** @type [string, () => any][] */
const sync = [
  ["map", () => Pact.map((n) => n)([1])],
  ["tap", () => Pact.tap(() => {})([1])],
  ["filter", () => Pact.filter(() => true)([1])],
  ["scan", () => Pact.scan((a, n) => a + n, 0)([1])],
  ["flatten", () => Pact.flatten()([[1]])],
  ["flatMap", () => Pact.flatMap((n) => [n])([1])],
  ["drop", () => Pact.drop(0)([1])],
  ["dropWhile", () => Pact.dropWhile(() => false)([1])],
  ["take", () => Pact.take(1)([1])],
  ["takeWhile", () => Pact.takeWhile(() => true)([1])],
  ["range", () => Pact.range(0, 1)],
  ["empty", () => Pact.empty()],
  ["concat", () => Pact.concat([1])],
  ["zip", () => Pact.zip([[1]])],
  ["zipKeyed", () => Pact.zipKeyed({ a: [1] })]
];

/** @type [string, () => any][] */
const async = [
  ["Async.map", () => Async.map((n) => n)([1])],
  ["Async.tap", () => Async.tap(() => {})([1])],
  ["Async.filter", () => Async.filter(() => true)([1])],
  ["Async.scan", () => Async.scan((a, n) => a + n, 0)([1])],
  ["Async.flatten", () => Async.flatten()([[1]])],
  ["Async.flatMap", () => Async.flatMap((n) => [n])([1])],
  ["Async.drop", () => Async.drop(0)([1])],
  ["Async.dropWhile", () => Async.dropWhile(() => false)([1])],
  ["Async.take", () => Async.take(1)([1])],
  ["Async.takeWhile", () => Async.takeWhile(() => true)([1])],
  ["Async.empty", () => Async.empty()],
  ["Async.concat", () => Async.concat([1])],
  ["Async.zip", () => Async.zip([[1]])],
  ["Async.zipKeyed", () => Async.zipKeyed({ a: [1] })]
];

// What reads a source, with a source whose second next() throws
/** @type [string, (source: any) => Iterator<any>][] */
const syncReaders = [
  ["map", (source) => Pact.map((n) => n)(source)],
  ["tap", (source) => Pact.tap(() => {})(source)],
  ["filter", (source) => Pact.filter(() => true)(source)],
  ["scan", (source) => Pact.scan((a, n) => a + n, 0)(source)],
  ["flatten", (source) => Pact.flatten()(source)],
  ["flatMap", (source) => Pact.flatMap((n) => [n])(source)],
  ["drop", (source) => Pact.drop(0)(source)],
  ["dropWhile", (source) => Pact.dropWhile(() => false)(source)],
  ["take", (source) => Pact.take(3)(source)],
  ["takeWhile", (source) => Pact.takeWhile(() => true)(source)],
  ["concat", (source) => Pact.concat(source)],
  ["zip", (source) => Pact.zip([source])],
  ["zipKeyed", (source) => Pact.zipKeyed({ a: source })]
];

/** @type [string, (source: any) => AsyncIterator<any>][] */
const asyncReaders = [
  ["Async.map", (source) => Async.map((n) => n)(source)],
  ["Async.tap", (source) => Async.tap(() => {})(source)],
  ["Async.filter", (source) => Async.filter(() => true)(source)],
  ["Async.scan", (source) => Async.scan((a, n) => a + n, 0)(source)],
  ["Async.flatten", (source) => Async.flatten()(source)],
  ["Async.flatMap", (source) => Async.flatMap((n) => [n])(source)],
  ["Async.drop", (source) => Async.drop(0)(source)],
  ["Async.dropWhile", (source) => Async.dropWhile(() => false)(source)],
  ["Async.take", (source) => Async.take(3)(source)],
  ["Async.takeWhile", (source) => Async.takeWhile(() => true)(source)],
  ["Async.concat", (source) => Async.concat(source)],
  ["Async.zip", (source) => Async.zip([source])],
  ["Async.zipKeyed", (source) => Async.zipKeyed({ a: source })]
];

/** @type () => Iterable<number> */
const throwsSecond = () => {
  let calls = 0;
  return {
    [Symbol.iterator]: () => ({
      next() {
        if (++calls === 2) {
          throw Error("boom");
        }
        return { value: calls, done: false };
      }
    })
  };
};

/** @type () => AsyncIterable<number> */
const rejectsSecond = () => {
  let calls = 0;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (++calls === 2) {
          throw Error("boom");
        }
        return { value: calls, done: false };
      }
    })
  };
};

describe("sync iterators", () => {
  test.each(sync)("%s is an Iterator", (_name, make) => {
    const iterator = make();
    expect(iterator).to.be.instanceOf(Iterator);
    expect(iterator[Symbol.iterator]()).to.equal(iterator);
  });

  test.each(sync)("%s stays done", (_name, make) => {
    const iterator = make();
    [...iterator];
    expect(iterator.next()).to.eql({ done: true, value: undefined });
  });

  test.each(sync)("%s doesn't have throw()", (_name, make) => {
    expect(make().throw).to.equal(undefined);
  });

  test.each(syncReaders)("%s is done after its source throws", (_name, step) => {
    const iterator = step(throwsSecond());
    iterator.next();
    expect(() => iterator.next()).to.throw("boom");
    expect(iterator.next()).to.eql({ done: true, value: undefined });
  });
});

describe("async iterators", () => {
  test.each(async)("%s has AsyncIterator.prototype", (_name, make) => {
    const iterator = make();
    expect(AsyncIteratorPrototype.isPrototypeOf(iterator)).to.equal(true);
    expect(iterator[Symbol.asyncIterator]()).to.equal(iterator);
  });

  test.each(async)("%s stays done", async (_name, make) => {
    const iterator = make();
    await Async.toArray(iterator);
    expect(await iterator.next()).to.eql({ done: true, value: undefined });
  });

  describe.each([
    ["an async source", rejectsSecond],
    ["a sync source", throwsSecond],
    ["an array", () => [1, Promise.reject(Error("boom")), 3]]
  ])("%s", (_name, source) => {
    test.each(asyncReaders)("%s is done after its source throws", async (_name, step) => {
      const iterator = step(source());
      await iterator.next();
      await expect(iterator.next()).rejects.toThrow("boom");
      expect(await iterator.next()).to.eql({ done: true, value: undefined });
    });
  });

  test("calls to next() that overlap are answered in order", async () => {
    /** @type (n: number) => Promise<number> */
    const slowFirst = (n) => new Promise((resolve) => setTimeout(() => resolve(n), n === 1 ? 20 : 0));
    const iterator = Async.filter(async (/** @type number */ n) => (await slowFirst(n)) % 2 === 1)([1, 2, 3, 4, 5]);

    const results = await Promise.all([iterator.next(), iterator.next(), iterator.next(), iterator.next()]);
    expect(results.map(({ value }) => value)).to.eql([1, 3, 5, undefined]);
  });

  test("return() waits for a next() that's in progress", async () => {
    const source = asyncClosable([1, 2, 3]);
    const iterator = Async.map(async (/** @type number */ n) => n)(source);

    const [first, closed] = await Promise.all([iterator.next(), iterator.return?.()]);
    expect(first).to.eql({ done: false, value: 1 });
    expect(closed).to.eql({ done: true, value: undefined });
    expect(source.closed).to.equal(true);
  });

  // What `await using` calls, which Node 22 doesn't have the syntax for
  test("disposing it closes it", async () => {
    const source = asyncClosable([1, 2, 3]);
    const iterator = Async.map((/** @type number */ n) => n)(source);
    await iterator.next();
    await iterator[Symbol.asyncDispose]();
    expect(source.closed).to.equal(true);
  });
});
