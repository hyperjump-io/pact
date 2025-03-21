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
  let subject: Iterable<number>;

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
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
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
  let subject: Iterable<number>;

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
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
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
  let subject: Iterable<[string, number]>;

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
  let subject: AsyncGenerator<[string, number]>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    subject = (async function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }()) as AsyncGenerator<[string, number]>;
  });

  test("collect", async () => {
    const result = await asyncCollectMap(subject);
    expect(result).to.eql(new Map([["foo", 1], ["bar", 2], ["baz", 3]]));
  });
});

describe("collectObject", () => {
  let subject: Iterable<[string, number]>;

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
  let subject: AsyncGenerator<[string, number]>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    subject = (async function* () {
      yield ["foo", 1];
      yield ["bar", 2];
      yield ["baz", 3];
    }()) as AsyncGenerator<[string, number]>;
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
    // eslint-disable-next-line @typescript-eslint/require-await
    const subject = (async function* () {
      yield "foo";
    }());

    const result = await asyncJoin(",", subject);
    expect(result).to.equal("foo");
  });

  test("multiple items", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const subject = (async function* () {
      yield "foo";
      yield "bar";
      yield "baz";
    }());

    const result = await asyncJoin(",", subject);
    expect(result).to.equal("foo,bar,baz");
  });
});
