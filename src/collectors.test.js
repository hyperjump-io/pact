import { beforeEach, describe, expect, test } from "vitest";
import {
  collectArray, asyncCollectArray,
  collectSet, asyncCollectSet,
  collectMap, asyncCollectMap,
  collectObject, asyncCollectObject,
  join, asyncJoin,
  empty, asyncEmpty
} from "./index.js";

describe("collectArray", () => {
  /** @type Iterable<number> */
  let subject;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("collect", () => {
    const result = collectArray(subject);
    expect(result).to.eql([1, 2, 3]);
  });
});

describe("asyncCollectArray", () => {
  /** @type AsyncGenerator<number> */
  let subject;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("collect", async () => {
    const result = await asyncCollectArray(subject);
    expect(result).to.eql([1, 2, 3]);
  });
});

describe("collectSet", () => {
  /** @type Iterable<number> */
  let subject;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("collect", () => {
    const result = collectSet(subject);
    expect(result).to.eql(new Set([1, 2, 3]));
  });
});

describe("asyncCollectSet", () => {
  /** @type AsyncGenerator<number> */
  let subject;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("collect", async () => {
    const result = await asyncCollectSet(subject);
    expect(result).to.eql(new Set([1, 2, 3]));
  });
});

describe("collectMap", () => {
  /** @type Iterable<[string, number]> */
  let subject;

  beforeEach(() => {
    subject = (function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }());
  });

  test("collect", () => {
    const result = collectMap(subject);
    expect(result).to.eql(new Map([["foo", 1], ["bar", 2], ["baz", 3]]));
  });
});

describe("asyncCollectMap", () => {
  /** @type AsyncGenerator<[string, number]> */
  let subject;

  beforeEach(() => {
    subject = /** @type AsyncGenerator<[string, number]> */ ((async function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }()));
  });

  test("collect", async () => {
    const result = await asyncCollectMap(subject);
    expect(result).to.eql(new Map([["foo", 1], ["bar", 2], ["baz", 3]]));
  });
});

describe("collectObject", () => {
  /** @type Iterable<[string, number]> */
  let subject;

  beforeEach(() => {
    subject = (function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }());
  });

  test("collect", () => {
    const result = collectObject(subject);
    expect(result).to.eql({ foo: 1, bar: 2, baz: 3 });
  });
});

describe("asyncCollectObject", () => {
  /** @type AsyncGenerator<[string, number]> */
  let subject;

  beforeEach(() => {
    subject = /** @type AsyncGenerator<[string, number]> */ ((async function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }()));
  });

  test("collect", async () => {
    const result = await asyncCollectObject(subject);
    expect(result).to.eql({ foo: 1, bar: 2, baz: 3 });
  });
});

describe("join", () => {
  test("empty", () => {
    const result = join(",", empty());
    expect(result).to.equal("");
  });

  test("one item", () => {
    const subject = (function* () {
      yield "foo";
    }());

    const result = join(",", subject);
    expect(result).to.equal("foo");
  });

  test("multiple items", () => {
    const subject = (function* () {
      yield "foo";
      yield "bar";
      yield "baz";
    }());

    const result = join(",", subject);
    expect(result).to.equal("foo,bar,baz");
  });
});

describe("asyncJoin", () => {
  test("empty", async () => {
    const result = await asyncJoin(",", asyncEmpty());
    expect(result).to.equal("");
  });

  test("one item", async () => {
    const subject = (async function* () {
      yield "foo";
    }());

    const result = await asyncJoin(",", subject);
    expect(result).to.equal("foo");
  });

  test("multiple items", async () => {
    const subject = (async function* () {
      yield "foo";
      yield "bar";
      yield "baz";
    }());

    const result = await asyncJoin(",", subject);
    expect(result).to.equal("foo,bar,baz");
  });
});
