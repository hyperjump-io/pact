import { expect } from "chai";
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

  it("one function", () => {
    const result: Iterable<number> = pipe(
      subject,
      filter((n: number) => n > 2)
    );
    expect([...result]).to.eql([3, 4, 5]);
  });

  it("two functions", () => {
    const result: Iterable<number> = pipe(
      subject,
      filter((n: number) => n > 2),
      map((n: number) => n * 2)
    );
    expect([...result]).to.eql([6, 8, 10]);
  });

  it("three functions", () => {
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
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
      yield Promise.resolve(4);
      yield Promise.resolve(5);
    }());
  });

  it("one function", async () => {
    const result: AsyncGenerator<number> = pipe(
      subject,
      asyncFilter((n: number) => n > 2)
    );
    expect((await result.next()).value).to.eql(3);
    expect((await result.next()).value).to.eql(4);
    expect((await result.next()).value).to.eql(5);
  });

  it("two functions", async () => {
    const result: AsyncGenerator<number> = pipe(
      subject,
      asyncFilter((n: number) => n > 2),
      asyncMap((n: number) => n * 2)
    );
    expect((await result.next()).value).to.eql(6);
    expect((await result.next()).value).to.eql(8);
    expect((await result.next()).value).to.eql(10);
  });

  it("three functions", async () => {
    const result: number = await pipe(
      subject,
      asyncFilter((n: number) => n > 2),
      asyncMap((n: number) => n * 2),
      asyncReduce((acc, n: number) => acc + n, 0)
    );
    expect(result).to.eql(24);
  });
});
