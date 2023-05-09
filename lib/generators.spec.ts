import { expect } from "chai";
import {
  map, asyncMap,
  filter, asyncFilter,
  drop, asyncDrop
} from "./index.js";


describe("map", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = map((n) => n * 2, subject);
    expect([...result]).to.eql([2, 4, 6]);
  });

  it("curried", () => {
    const double = map((n: number) => n * 2);
    const result = double(subject);
    expect([...result]).to.eql([2, 4, 6]);
  });
});

describe("asyncMap", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("uncurried", async () => {
    const result = asyncMap((n) => n * 2, subject);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
  });

  it("curried", async () => {
    const double = asyncMap((n: number) => n * 2);
    const result = double(subject);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
  });
});

describe("filter", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = filter((n) => n > 2, subject);
    expect([...result]).to.eql([3]);
  });

  it("curried", () => {
    const greaterThanTwo = filter((n: number) => n > 2);
    const result = greaterThanTwo(subject);
    expect([...result]).to.eql([3]);
  });
});

describe("asyncFilter", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("uncurried", async () => {
    const result = asyncFilter((n) => n > 2, subject);
    expect((await result.next()).value).to.equal(3);
  });

  it("curried", async () => {
    const greaterThanTwo = asyncFilter((n: number) => n > 2);
    const result = greaterThanTwo(subject);
    expect((await result.next()).value).to.equal(3);
  });
});

describe("drop", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = drop(2, subject);
    expect([...result]).to.eql([3]);
  });

  it("curried", () => {
    const dropTwo = drop(2);
    const result = dropTwo(subject);
    expect([...result]).to.eql([3]);
  });
});

describe("asyncDrop", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("uncurried", async () => {
    const result = asyncDrop(2, subject);
    expect((await result.next()).value).to.equal(3);
  });

  it("curried", async () => {
    const dropTwo = asyncDrop(2);
    const result = dropTwo(subject);
    expect((await result.next()).value).to.equal(3);
  });
});
