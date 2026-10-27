import { beforeEach, describe, expect, test } from "vitest";
import {
  map,
  filter,
  reduce,
  toArray,
  pipe, compose
} from "./index.js";
import * as Async from "./async.js";

describe("pipe", () => {
  /** @type Iterable<number> */
  let subject;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    }());
  });

  test("one function", () => {
    /** @type Iterable<number> */
    const result = pipe(
      subject,
      filter((/** @type number */ n) => n > 2)
    );
    expect([...result]).to.eql([3, 4, 5]);
  });

  test("two functions", () => {
    /** @type Iterable<number> */
    const result = pipe(
      subject,
      filter((/** @type number */ n) => n > 2),
      map((/** @type number */ n) => n * 2)
    );
    expect([...result]).to.eql([6, 8, 10]);
  });

  test("three functions", () => {
    /** @type number */
    const result = pipe(
      subject,
      filter((/** @type number */ n) => n > 2),
      map((/** @type number */ n) => n * 2),
      reduce((acc, /** @type number */ n) => acc + n, 0)
    );
    expect(result).to.eql(24);
  });
});

describe("async pipe", () => {
  /** @type AsyncGenerator<number> */
  let subject;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    }());
  });

  test("one function", async () => {
    /** @type AsyncIteratorObject<number> */
    const result = pipe(
      subject,
      Async.filter((/** @type number */ n) => n > 2)
    );
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).done).to.equal(true);
  });

  test("two functions", async () => {
    /** @type AsyncIteratorObject<number> */
    const result = pipe(
      subject,
      Async.filter((/** @type number */ n) => n > 2),
      Async.map((/** @type number */ n) => n * 2)
    );
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).value).to.equal(8);
    expect((await result.next()).value).to.equal(10);
    expect((await result.next()).done).to.equal(true);
  });

  test("three functions", async () => {
    /** @type number */
    const result = await pipe(
      subject,
      Async.filter((/** @type number */ n) => n > 2),
      Async.map((/** @type number */ n) => n * 2),
      Async.reduce((acc, /** @type number */ n) => acc + n, 0)
    );
    expect(result).to.eql(24);
  });
});

describe("compose", () => {
  test("one function", () => {
    const double = compose(map((/** @type number */ n) => n * 2));
    expect([...double([1, 2, 3])]).to.eql([2, 4, 6]);
  });

  test("three functions", () => {
    const sumOfDoubledEvens = compose(
      filter((/** @type number */ n) => n % 2 === 0),
      map((/** @type number */ n) => n * 2),
      reduce((acc, /** @type number */ n) => acc + n, 0)
    );
    expect(sumOfDoubledEvens([1, 2, 3, 4])).to.equal(12);
  });

  test("used more than once", () => {
    const doubledEvens = compose(
      filter((/** @type number */ n) => n % 2 === 0),
      map((/** @type number */ n) => n * 2),
      toArray
    );
    expect(doubledEvens([1, 2, 3, 4])).to.eql([4, 8]);
    expect(doubledEvens([5, 6])).to.eql([12]);
  });

  test("as a step in pipe", () => {
    const doubledEvens = compose(
      filter((/** @type number */ n) => n % 2 === 0),
      map((/** @type number */ n) => n * 2)
    );
    const result = pipe([1, 2, 3, 4], doubledEvens, toArray);
    expect(result).to.eql([4, 8]);
  });

  test("async", async () => {
    const sumOfDoubledEvens = compose(
      Async.filter(async (/** @type number */ n) => n % 2 === 0),
      Async.map((/** @type number */ n) => n * 2),
      Async.reduce((acc, /** @type number */ n) => acc + n, 0)
    );
    expect(await sumOfDoubledEvens([1, 2, 3, 4])).to.equal(12);
  });
});
