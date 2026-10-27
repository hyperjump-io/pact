import { beforeEach, describe, expect, test } from "vitest";
import {
  collectArray,
  collectSet,
  collectMap,
  collectObject,
  join,
  empty
} from "./index.js";
import * as Async from "./async.js";

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

describe("Async.collectArray", () => {
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
    const result = await Async.collectArray(subject);
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

describe("Async.collectSet", () => {
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
    const result = await Async.collectSet(subject);
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

describe("Async.collectMap", () => {
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
    const result = await Async.collectMap(subject);
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

describe("Async.collectObject", () => {
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
    const result = await Async.collectObject(subject);
    expect(result).to.eql({ foo: 1, bar: 2, baz: 3 });
  });
});

describe("join", () => {
  test("empty", () => {
    const result = join(",")(empty());
    expect(result).to.equal("");
  });

  test("one item", () => {
    const subject = (function* () {
      yield "foo";
    }());

    const result = join(",")(subject);
    expect(result).to.equal("foo");
  });

  test("multiple items", () => {
    const subject = (function* () {
      yield "foo";
      yield "bar";
      yield "baz";
    }());

    const result = join(",")(subject);
    expect(result).to.equal("foo,bar,baz");
  });

  test("array", () => {
    const result = join(",")(["foo", "bar", "baz"]);
    expect(result).to.equal("foo,bar,baz");
  });

  test("set", () => {
    const result = join(",")(new Set(["foo", "bar", "baz"]));
    expect(result).to.equal("foo,bar,baz");
  });
});

describe("Async.join", () => {
  test("empty", async () => {
    const result = await Async.join(",")(Async.empty());
    expect(result).to.equal("");
  });

  test("one item", async () => {
    const subject = (async function* () {
      yield "foo";
    }());

    const result = await Async.join(",")(subject);
    expect(result).to.equal("foo");
  });

  test("multiple items", async () => {
    const subject = (async function* () {
      yield "foo";
      yield "bar";
      yield "baz";
    }());

    const result = await Async.join(",")(subject);
    expect(result).to.equal("foo,bar,baz");
  });

  test("array", async () => {
    const result = await Async.join(",")(["foo", "bar", "baz"]);
    expect(result).to.equal("foo,bar,baz");
  });

  test("set", async () => {
    const result = await Async.join(",")(new Set(["foo", "bar", "baz"]));
    expect(result).to.equal("foo,bar,baz");
  });
});
