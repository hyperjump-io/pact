import { beforeEach, describe, expect, test } from "vitest";
import {
  map, asyncMap,
  filter, asyncFilter,
  reduce, asyncReduce,
  pipe
} from "./index.js";

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
    /** @type AsyncGenerator<number> */
    const result = pipe(
      subject,
      asyncFilter((/** @type number */ n) => n > 2)
    );
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).done).to.equal(true);
  });

  test("two functions", async () => {
    /** @type AsyncGenerator<number> */
    const result = pipe(
      subject,
      asyncFilter((/** @type number */ n) => n > 2),
      asyncMap((/** @type number */ n) => n * 2)
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
      asyncFilter((/** @type number */ n) => n > 2),
      asyncMap((/** @type number */ n) => n * 2),
      asyncReduce((acc, /** @type number */ n) => acc + n, 0)
    );
    expect(result).to.eql(24);
  });
});
