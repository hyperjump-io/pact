import { beforeEach, describe, expect, test } from "vitest";
import {
  map, asyncMap,
  filter, asyncFilter,
  reduce, asyncReduce,
  pipe
} from "./index.js";


describe("pipe", () => {
  let subject: Iterable<number>;

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
    const result: Iterable<number> = pipe(
      subject,
      filter((n: number) => n > 2)
    );
    expect([...result]).to.eql([3, 4, 5]);
  });

  test("two functions", () => {
    const result: Iterable<number> = pipe(
      subject,
      filter((n: number) => n > 2),
      map((n: number) => n * 2)
    );
    expect([...result]).to.eql([6, 8, 10]);
  });

  test("three functions", () => {
    const result: number = pipe(
      subject,
      filter((n: number) => n > 2),
      map((n: number) => n * 2),
      reduce((acc, n: number) => acc + n, 0)
    );
    expect(result).to.eql(24);
  });
});

describe("async pipe", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    }());
  });

  test("one function", async () => {
    const result: AsyncGenerator<number> = pipe(
      subject,
      asyncFilter((n: number) => n > 2)
    );
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).done).to.equal(true);
  });

  test("two functions", async () => {
    const result: AsyncGenerator<number> = pipe(
      subject,
      asyncFilter((n: number) => n > 2),
      asyncMap((n: number) => n * 2)
    );
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).value).to.equal(8);
    expect((await result.next()).value).to.equal(10);
    expect((await result.next()).done).to.equal(true);
  });

  test("three functions", async () => {
    const result: number = await pipe(
      subject,
      asyncFilter((n: number) => n > 2),
      asyncMap((n: number) => n * 2),
      asyncReduce((acc, n: number) => acc + n, 0)
    );
    expect(result).to.eql(24);
  });
});
