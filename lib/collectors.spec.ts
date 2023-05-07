import { expect } from "chai";
import {
  collectArray, asyncCollectArray,
  collectSet, asyncCollectSet,
  collectMap, asyncCollectMap
} from "./index.js";


describe("collectArray", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("collect", () => {
    const result = collectArray(subject);
    expect(result).to.eql([1, 2, 3]);
  });
});

describe("asyncCollectArray", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("collect", async () => {
    const result = await asyncCollectArray(subject);
    expect(result).to.eql([1, 2, 3]);
  });
});

describe("collectSet", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("collect", () => {
    const result = collectSet(subject);
    expect(result).to.eql(new Set([1, 2, 3]));
  });
});

describe("asyncCollectSet", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }());
  });

  it("collect", async () => {
    const result = await asyncCollectSet(subject);
    expect(result).to.eql(new Set([1, 2, 3]));
  });
});

describe("collectMap", () => {
  let subject: Iterable<[string, number]>;

  beforeEach(() => {
    subject = (function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }());
  });

  it("collect", () => {
    const result = collectMap(subject);
    expect(result).to.eql(new Map([["foo", 1], ["bar", 2], ["baz", 3]]));
  });
});

describe("asyncCollectMap", () => {
  let subject: AsyncGenerator<[string, number]>;

  beforeEach(() => {
    subject = (async function* () {
      yield Promise.resolve(["foo", 1]);
      yield Promise.resolve(["bar", 2]);
      yield Promise.resolve(["baz", 3]);
    }()) as AsyncGenerator<[string, number]>;
  });

  it("collect", async () => {
    const result = await asyncCollectMap(subject);
    expect(result).to.eql(new Map([["foo", 1], ["bar", 2], ["baz", 3]]));
  });
});
