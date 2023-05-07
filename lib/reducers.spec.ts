import { expect } from "chai";
import {
  reduce, asyncReduce,
  every, asyncEvery,
  some, asyncSome
} from "./index.js";


describe("reduce", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = reduce((acc, n) => acc + n, 0, subject);
    expect(result).to.eql(6);
  });

  it("curried", () => {
    const sum = reduce((acc, n: number) => acc + n, 0);
    const result = sum(subject);
    expect(result).to.eql(6);
  });
});

describe("asyncReduce", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("uncurried", async () => {
    const result = await asyncReduce((acc, n) => acc + n, 0, subject);
    expect(result).to.equal(6);
  });

  it("curried", async () => {
    const sum = asyncReduce((acc, n: number) => acc + n, 0);
    const result = await sum(subject);
    expect(result).to.equal(6);
  });
});

describe("every", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried positive", () => {
    const result = every((n) => n > 2, subject);
    expect(result).to.eql(false);
  });

  it("uncurried negative", () => {
    const result = every((n) => n < 5, subject);
    expect(result).to.eql(true);
  });

  it("curried positive", () => {
    const allLessThanFive = every((n: number) => n < 5);
    const result = allLessThanFive(subject);
    expect(result).to.eql(true);
  });

  it("curried negative", () => {
    const allGreaterThanTwo = every((n: number) => n > 2);
    const result = allGreaterThanTwo(subject);
    expect(result).to.eql(false);
  });
});

describe("asyncEvery", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("uncurried positive", async () => {
    const result = await asyncEvery((n) => n > 2, subject);
    expect(result).to.eql(false);
  });

  it("uncurried negative", async () => {
    const result = await asyncEvery((n: number) => n < 5, subject);
    expect(result).to.eql(true);
  });

  it("curried positive", async () => {
    const allLessThanFive = asyncEvery((n: number) => n < 5);
    const result = await allLessThanFive(subject);
    expect(result).to.eql(true);
  });

  it("curried negative", async () => {
    const allGreaterThanTwo = asyncEvery((n: number) => n > 2);
    const result = await allGreaterThanTwo(subject);
    expect(result).to.eql(false);
  });
});

describe("some", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried positive", () => {
    const result = some((n) => n > 2, subject);
    expect(result).to.eql(true);
  });

  it("uncurried negative", () => {
    const result = some((n) => n > 5, subject);
    expect(result).to.eql(false);
  });

  it("curried positive", () => {
    const someGreaterThanTwo = some((n: number) => n > 2);
    const result = someGreaterThanTwo(subject);
    expect(result).to.eql(true);
  });

  it("curried negative", () => {
    const someGreaterThanFive = some((n: number) => n > 5);
    const result = someGreaterThanFive(subject);
    expect(result).to.eql(false);
  });
});

describe("asyncSome", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("uncurried positive", async () => {
    const result = await asyncSome((n) => n > 2, subject);
    expect(result).to.eql(true);
  });

  it("uncurried negative", async () => {
    const result = await asyncSome((n: number) => n > 5, subject);
    expect(result).to.eql(false);
  });

  it("curried positive", async () => {
    const someGreaterThanTwo = asyncSome((n: number) => n > 2);
    const result = await someGreaterThanTwo(subject);
    expect(result).to.eql(true);
  });

  it("curried negative", async () => {
    const someGreaterThanFive = asyncSome((n: number) => n > 5);
    const result = await someGreaterThanFive(subject);
    expect(result).to.eql(false);
  });
});
