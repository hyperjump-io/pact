import { beforeEach, describe, expect, test } from "vitest";
import {
  map,
  tap,
  filter,
  scan,
  flatten,
  flatMap,
  drop,
  dropWhile,
  take,
  takeWhile,
  head,
  range,
  empty,
  zip,
  zipKeyed,
  concat
} from "./index.js";
import * as Async from "./async.js";
import { closable, asyncClosable } from "./test-utils.js";
/** @import { NestedIterable } from "./index.js" */
/** @import { NestedIterable as AsyncNestedIterable } from "./async.js" */

describe("map", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = map((n) => n * 2)(generator);
    expect([...result]).to.eql([2, 4, 6]);
  });

  test("array", () => {
    const result = map((n) => n * 2)(array);
    expect([...result]).to.eql([2, 4, 6]);
  });
});

describe("Async.map", () => {
  /** @type Generator<number> */
  let generator;
  /** @type AsyncGenerator<number> */
  let asyncGenerator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator with async mapper", async () => {
    const result = Async.map(async (n) => n * 2)(generator);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with sync mapper", async () => {
    const result = Async.map((n) => n * 2)(asyncGenerator);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("array with async mapper", async () => {
    const result = Async.map(async (n) => n * 2)(array);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("tap", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    let count = 0;
    const result = tap(() => {
      count++;
    })(generator);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });

  test("array", () => {
    let count = 0;
    const result = tap(() => {
      count++;
    })(array);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });
});

describe("Async.tap", () => {
  /** @type AsyncGenerator<number> */
  let asyncGenerator;

  beforeEach(() => {
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    let count = 0;
    const result = Async.tap(() => {
      count++;
    })(asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
    expect(count).to.equal(3);
  });
});

describe("filter", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = filter((n) => n > 2)(generator);
    expect([...result]).to.eql([3]);
  });

  test("array", () => {
    const result = filter((n) => n > 2)(array);
    expect([...result]).to.eql([3]);
  });
});

describe("Async.filter", () => {
  /** @type Generator<number> */
  let generator;
  /** @type AsyncGenerator<number> */
  let asyncGenerator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("async-generator with sync predicate", async () => {
    const result = Async.filter((n) => n > 2)(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("generator with async predicate", async () => {
    const result = Async.filter(async (n) => n > 2)(generator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with async predicate", async () => {
    const result = Async.filter(async (n) => n > 2)(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("array with async predicate", async () => {
    const result = Async.filter(async (n) => n > 2)(array);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("scan", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = scan((acc, n) => acc + n, 0)(generator);
    expect([...result]).to.eql([1, 3, 6]);
  });

  test("array", () => {
    const result = scan((acc, n) => acc + n, 0)(array);
    expect([...result]).to.eql([1, 3, 6]);
  });
});

describe("Async.scan", () => {
  /** @type Generator<number> */
  let generator;
  /** @type AsyncGenerator<number> */
  let asyncGenerator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("async-generator with sync reducer", async () => {
    const result = Async.scan((acc, n) => acc + n, 0)(asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("generator with async reducer", async () => {
    const result = Async.scan(async (acc, n) => acc + n, 0)(generator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with async reducer", async () => {
    const result = Async.scan(async (acc, n) => acc + n, 0)(asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("array with async reducer", async () => {
    const result = Async.scan(async (acc, n) => acc + n, 0)(array);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("flatten", () => {
  /** @type NestedIterable<number | string | boolean | null> */
  let subject;
  /** @type NestedIterable<number | string | boolean | null> */
  let deeplyNested;

  beforeEach(() => {
    deeplyNested = [3, 4];

    subject = (function* () {
      yield 1;
      yield (function* () {
        yield 2;
        yield deeplyNested;
      }());
      yield "foo";
      yield true;
      yield false;
      yield null;
    }());
  });

  test("default depth", () => {
    const result = flatten()(subject);
    expect([...result]).to.eql([1, 2, deeplyNested, "foo", true, false, null]);
  });

  test("depth 1", () => {
    const result = flatten(1)(subject);
    expect([...result]).to.eql([1, 2, deeplyNested, "foo", true, false, null]);
  });

  test("depth 2", () => {
    const result = flatten(2)(subject);
    expect([...result]).to.eql([1, 2, 3, 4, "foo", true, false, null]);
  });

  test("depth Infinity", () => {
    const result = flatten(Infinity)(subject);
    expect([...result]).to.eql([1, 2, 3, 4, "foo", true, false, null]);
  });
});

describe("Async.flatten", () => {
  /** @type AsyncNestedIterable<number | string | boolean | null> */
  let subject;
  /** @type AsyncNestedIterable<number | string | boolean | null> */
  let deeplyNested;

  beforeEach(() => {
    deeplyNested = (async function* () {
      yield 3;
      yield 4;
    }());

    subject = (async function* () {
      yield 1;
      yield (async function* () {
        yield 2;
        yield deeplyNested;
      }());
      yield [5];
      yield "foo";
      yield true;
      yield false;
      yield null;
    }());
  });

  test("default depth", async () => {
    const result = Async.flatten()(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(deeplyNested);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).value).to.equal("foo");
    expect((await result.next()).value).to.equal(true);
    expect((await result.next()).value).to.equal(false);
    expect((await result.next()).value).to.equal(null);
    expect((await result.next()).done).to.equal(true);
  });

  test("depth 1", async () => {
    const result = Async.flatten(1)(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(deeplyNested);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).value).to.equal("foo");
    expect((await result.next()).value).to.equal(true);
    expect((await result.next()).value).to.equal(false);
    expect((await result.next()).value).to.equal(null);
    expect((await result.next()).done).to.equal(true);
  });

  test("depth 2", async () => {
    const result = Async.flatten(2)(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).value).to.equal("foo");
    expect((await result.next()).value).to.equal(true);
    expect((await result.next()).value).to.equal(false);
    expect((await result.next()).value).to.equal(null);
    expect((await result.next()).done).to.equal(true);
  });

  test("depth Infinity", async () => {
    const result = Async.flatten(Infinity)(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).value).to.equal("foo");
    expect((await result.next()).value).to.equal(true);
    expect((await result.next()).value).to.equal(false);
    expect((await result.next()).value).to.equal(null);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("flatMap", () => {
  test("yields the values of each iterable", () => {
    const result = flatMap((/** @type string */ s) => s.split(" "))(["a b", "c"]);
    expect([...result]).to.eql(["a", "b", "c"]);
  });

  test("goes one level deep", () => {
    const result = flatMap((/** @type number */ n) => [[n]])([1, 2]);
    expect([...result]).to.eql([[1], [2]]);
  });

  test("accepts an iterator", () => {
    const result = flatMap((/** @type number[] */ items) => items.values())([[1, 2], [3]]);
    expect([...result]).to.eql([1, 2, 3]);
  });

  test("a string throws", () => {
    const result = flatMap(() => /** @type any */ ("ab"))([1]);
    expect(() => [...result]).to.throw(TypeError);
  });

  test("a value that isn't iterable throws", () => {
    const result = flatMap((n) => /** @type any */ (n))([1]);
    expect(() => [...result]).to.throw(TypeError);
  });

  test("closing it closes the iterable it's in", () => {
    const inner = closable([1, 2, 3]);
    const result = flatMap(() => inner)([1]);
    result.next();
    result.return?.(undefined);
    expect(inner.closed).to.equal(true);
  });
});

describe("Async.flatMap", () => {
  test("yields the values of each async iterable", async () => {
    const result = Async.flatMap(async (/** @type number */ n) => asyncClosable([n, n]))([1, 2]);
    expect(await Async.toArray(result)).to.eql([1, 1, 2, 2]);
  });

  test("accepts an async iterator", async () => {
    const result = Async.flatMap((/** @type number */ n) => asyncClosable([n])[Symbol.asyncIterator]())([1, 2]);
    expect(await Async.toArray(result)).to.eql([1, 2]);
  });

  test("waits for the promises a sync iterator that isn't iterable yields", async () => {
    const result = Async.flatMap((/** @type number */ n) => bare([Promise.resolve(n), n]))([1, 2]);
    expect(await Async.toArray(result)).to.eql([1, 1, 2, 2]);
  });

  test("a promise that rejects closes a sync iterator that isn't iterable", async () => {
    const inner = bare([Promise.reject(Error("boom")), 2]);
    const result = Async.flatMap(() => inner)([1]);
    await expect(result.next()).rejects.toThrow("boom");
    expect(inner.closed).to.equal(true);
  });

  test("a string throws", async () => {
    const result = Async.flatMap(() => /** @type any */ ("ab"))([1]);
    await expect(Async.toArray(result)).rejects.toThrow(TypeError);
  });

  test("closing it closes the iterable it's in", async () => {
    const inner = asyncClosable([1, 2, 3]);
    const result = Async.flatMap(() => inner)([1]);
    await result.next();
    await result.return?.(undefined);
    expect(inner.closed).to.equal(true);
  });
});

describe("drop", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = drop(2)(generator);
    expect([...result]).to.eql([3]);
  });

  test("array", () => {
    const result = drop(2)(array);
    expect([...result]).to.eql([3]);
  });
});

describe("Async.drop", () => {
  /** @type AsyncGenerator<number> */
  let asyncGenerator;

  beforeEach(() => {
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    const result = Async.drop(2)(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("dropWhile", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = dropWhile((n) => n < 3)(generator);
    expect([...result]).to.eql([3]);
  });

  test("array", () => {
    const result = dropWhile((n) => n < 3)(array);
    expect([...result]).to.eql([3]);
  });

  test("drop more than is available", () => {
    const result = dropWhile((n) => n < 10)(generator);
    expect([...result]).to.eql([]);
  });
});

describe("Async.dropWhile", () => {
  /** @type AsyncGenerator<number> */
  let asyncGenerator;

  beforeEach(() => {
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    const result = Async.dropWhile(async (n) => n < 3)(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("drop more than is available", async () => {
    const result = Async.dropWhile(async (n) => n < 10)(asyncGenerator);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("take", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = take(2)(generator);
    expect([...result]).to.eql([1, 2]);
  });

  test("array", () => {
    const result = take(2)(array);
    expect([...result]).to.eql([1, 2]);
  });

  test("take more than is available", () => {
    const result = take(10)(generator);
    expect([...result]).to.eql([1, 2, 3]);
  });

  test("the source is closed when it's done taking", () => {
    const source = closable([1, 2, 3]);
    const result = take(2)(source);
    expect([...result]).to.eql([1, 2]);
    expect(source.closed).to.equal(true);
  });

  test("the source is closed when the result is closed early", () => {
    const source = closable([1, 2, 3]);
    const result = take(3)(source);
    result.next();
    result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });
});

describe("Async.take", () => {
  /** @type AsyncGenerator<number> */
  let asyncGenerator;

  beforeEach(() => {
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    const result = Async.take(2)(asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
  });

  test("take more than is available", async () => {
    const result = Async.take(10)(asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("the source is closed when it's done taking", async () => {
    const source = asyncClosable([1, 2, 3]);
    const result = Async.take(2)(source);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
    expect(source.closed).to.equal(true);
  });

  test("a sync source is closed when it's done taking", async () => {
    const source = closable([1, 2, 3]);
    const result = Async.take(2)(source);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
    expect(source.closed).to.equal(true);
  });

  test("the source is closed when the result is closed early", async () => {
    const source = asyncClosable([1, 2, 3]);
    const result = Async.take(3)(source);
    await result.next();
    await result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });
});

describe("takeWhile", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = takeWhile((n) => n < 3)(generator);
    expect([...result]).to.eql([1, 2]);
  });

  test("array", () => {
    const result = takeWhile((n) => n < 3)(array);
    expect([...result]).to.eql([1, 2]);
  });

  test("take more than is available", () => {
    const result = takeWhile((n) => n < 10)(generator);
    expect([...result]).to.eql([1, 2, 3]);
  });
});

describe("Async.takeWhile", () => {
  /** @type AsyncGenerator<number> */
  let asyncGenerator;

  beforeEach(() => {
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    const result = Async.takeWhile(async (n) => n < 3)(asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
  });

  test("take more than is available", async () => {
    const result = Async.takeWhile(async (n) => n < 10)(asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("head", () => {
  /** @type Generator<number> */
  let generator;
  /** @type number[] */
  let array;

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("empty generator", () => {
    expect(head(empty())).to.eql(undefined);
  });

  test("generator", () => {
    expect(head(generator)).to.eql(1);
  });

  test("the generator is closed", () => {
    head(generator);
    expect([...generator]).to.eql([]);
  });

  test("array", () => {
    expect(head(array)).to.eql(1);
  });
});

describe("Async.head", () => {
  /** @type AsyncGenerator<number> */
  let subject;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("empty async-generator", async () => {
    expect(await Async.head(Async.empty())).to.eql(undefined);
  });

  test("non-empty async-generator", async () => {
    expect(await Async.head(subject)).to.eql(1);
  });

  test("the async-generator is closed", async () => {
    await Async.head(subject);
    expect((await subject.next()).done).to.equal(true);
  });
});

describe("range", () => {
  test("closed", () => {
    const result = range(0, 3);
    expect([...result]).to.eql([0, 1, 2]);
  });

  test("infinite", () => {
    const result = take(3)(range(3));
    expect([...result]).to.eql([3, 4, 5]);
  });

  test("step", () => {
    const result = range(0, 10, 3);
    expect([...result]).to.eql([0, 3, 6, 9]);
  });

  test("negative step", () => {
    const result = range(10, 0, -3);
    expect([...result]).to.eql([10, 7, 4, 1]);
  });

  test("infinite with a negative step", () => {
    const result = take(3)(range(0, undefined, -1));
    expect([...result]).to.eql([0, -1, -2]);
  });

  test("a fractional step doesn't add up its rounding errors", () => {
    const result = range(0, 1, 0.1);
    expect([...result]).to.have.length(10);
  });

  test("ends when the values are too big to be exact", () => {
    const result = take(5)(range(2 ** 53, 2 ** 53 + 4));
    expect([...result].at(-1)).to.equal(2 ** 53 + 2);
  });

  test("a step in the wrong direction is empty", () => {
    const result = range(0, 10, -1);
    expect([...result]).to.eql([]);
  });

  test("a step of 0 throws", () => {
    expect(() => [...range(0, 10, 0)]).to.throw(RangeError);
  });

  test.each([
    ["from", () => range(NaN, 10)],
    ["to", () => range(0, NaN)],
    ["step", () => range(0, 10, NaN)]
  ])("a %s of NaN throws", (_name, run) => {
    expect(run).to.throw(RangeError);
  });

  test.each([
    ["from", () => range(/** @type any */ ("0"), 10)],
    ["to", () => range(0, /** @type any */ ("abc"))],
    ["step", () => range(0, 10, /** @type any */ ("1"))]
  ])("a %s that isn't a number throws", (_name, run) => {
    expect(run).to.throw(TypeError);
  });
});

// A count that would never run out, or that can't be counted down, is an
// error, as it is for the native helpers
describe.each([
  ["take", take],
  ["drop", drop],
  ["Async.take", Async.take],
  ["Async.drop", Async.drop]
])("the count of %s", (_name, step) => {
  test.each([
    ["NaN", NaN],
    ["undefined", undefined],
    ["not a number", "abc"],
    ["negative", -1]
  ])("%s throws", (_name, count) => {
    expect(() => step(/** @type any */ (count))).to.throw(RangeError);
  });

  test("a fraction is truncated", async () => {
    const result = [];
    for await (const item of step(1.9)([1, 2, 3])) {
      result.push(item);
    }
    expect(result).to.have.length(step === take || step === Async.take ? 1 : 2);
  });

  test("Infinity is allowed", () => {
    expect(() => step(Infinity)).not.to.throw();
  });
});

describe("empty", () => {
  test("should be empty", () => {
    expect([...empty()]).to.eql([]);
  });
});

describe("Async.empty", () => {
  test("should be empty", async () => {
    const subject = Async.empty();
    expect((await subject.next()).done).to.equal(true);
  });
});

describe("zip", () => {
  test("same number of items", () => {
    const result = zip([[1, 2], ["a", "b"]]);
    expect([...result]).to.eql([[1, "a"], [2, "b"]]);
  });

  test("more than two", () => {
    const result = zip([[1, 2], ["a", "b"], [true, false]]);
    expect([...result]).to.eql([[1, "a", true], [2, "b", false]]);
  });

  test("none", () => {
    expect([...zip([])]).to.eql([]);
  });

  test("shortest is the default", () => {
    expect([...zip([[1, 2, 3], ["a", "b"]])]).to.eql([[1, "a"], [2, "b"]]);
    expect([...zip([[1, 2], ["a", "b", "c"]])]).to.eql([[1, "a"], [2, "b"]]);
  });

  test("shortest closes the others", () => {
    const longer = closable([1, 2, 3]);
    expect([...zip([longer, ["a"]], { mode: "shortest" })]).to.eql([[1, "a"]]);
    expect(longer.closed).to.equal(true);
  });

  test("longest", () => {
    const result = zip([[1, 2, 3], ["a"]], { mode: "longest" });
    expect([...result]).to.eql([[1, "a"], [2, undefined], [3, undefined]]);
  });

  test("longest with padding", () => {
    const result = zip([[1], ["a", "b", "c"]], { mode: "longest", padding: [0, "?"] });
    expect([...result]).to.eql([[1, "a"], [0, "b"], [0, "c"]]);
  });

  test("longest with less padding than iterables", () => {
    const result = zip([[1], ["a", "b"]], { mode: "longest", padding: [0] });
    expect([...result]).to.eql([[1, "a"], [0, "b"]]);
  });

  test("strict with the same lengths", () => {
    const result = zip([[1, 2], ["a", "b"]], { mode: "strict" });
    expect([...result]).to.eql([[1, "a"], [2, "b"]]);
  });

  test("strict throws when the first is shorter", () => {
    const longer = closable(["a", "b"]);
    const result = zip([[1], longer], { mode: "strict" });
    expect(result.next().value).to.eql([1, "a"]);
    expect(() => result.next()).to.throw(TypeError);
    expect(longer.closed).to.equal(true);
  });

  test("strict throws when the first is longer", () => {
    const longer = closable([1, 2]);
    const result = zip([longer, ["a"]], { mode: "strict" });
    expect(result.next().value).to.eql([1, "a"]);
    expect(() => result.next()).to.throw(TypeError);
    expect(longer.closed).to.equal(true);
  });

  test("an unknown mode throws", () => {
    expect(() => zip([[1]], /** @type any */ ({ mode: "widest" }))).to.throw(TypeError);
  });

  test("a string throws", () => {
    expect(() => zip([[1], /** @type any */ ("ab")])).to.throw(TypeError);
  });

  test("a string throws and closes the iterables before it", () => {
    // A generator that hasn't started doesn't run its finally when it's
    // closed, so this records return() itself
    let closed = false;
    const first = {
      [Symbol.iterator]: () => ({
        next: () => ({ done: false, value: 1 }),
        return: () => {
          closed = true;
          return { done: true, value: undefined };
        }
      })
    };
    expect(() => zip([first, /** @type any */ ("ab")])).to.throw(TypeError);
    expect(closed).to.equal(true);
  });

  test("accepts an iterator", () => {
    const result = zip([[1, 2].values(), ["a", "b"]]);
    expect([...result]).to.eql([[1, "a"], [2, "b"]]);
  });

  test("an iterable that throws closes the others", () => {
    const other = closable([1, 2]);
    const throwing = (function* () {
      yield "a";
      throw Error("boom");
    }());
    const result = zip([other, throwing]);
    result.next();
    expect(() => result.next()).to.throw("boom");
    expect(other.closed).to.equal(true);
  });
});

describe("zipKeyed", () => {
  test("yields objects with the same keys", () => {
    const result = zipKeyed({ n: [1, 2], s: ["a", "b"] });
    expect([...result]).to.eql([{ n: 1, s: "a" }, { n: 2, s: "b" }]);
  });

  test("leaves out undefined values", () => {
    const result = zipKeyed(/** @type any */ ({ n: [1], s: undefined }));
    expect([...result]).to.eql([{ n: 1 }]);
  });

  test("longest with padding", () => {
    const result = zipKeyed({ n: [1], s: ["a", "b"] }, { mode: "longest", padding: { n: 0 } });
    expect([...result]).to.eql([{ n: 1, s: "a" }, { n: 0, s: "b" }]);
  });

  test("strict throws for different lengths", () => {
    const result = zipKeyed({ n: [1], s: ["a", "b"] }, { mode: "strict" });
    expect(() => [...result]).to.throw(TypeError);
  });

  test("closing it closes the iterables", () => {
    const n = closable([1, 2]);
    const s = closable(["a", "b"]);
    const result = zipKeyed({ n, s });
    result.next();
    result.return?.(undefined);
    expect(n.closed).to.equal(true);
    expect(s.closed).to.equal(true);
  });
});

describe("Async.zip", () => {
  test("sync and async iterables", async () => {
    const result = Async.zip([[1, 2], asyncClosable(["a", "b"])]);
    expect(await Async.toArray(result)).to.eql([[1, "a"], [2, "b"]]);
  });

  test("shortest is the default", async () => {
    const longer = asyncClosable([1, 2, 3]);
    expect(await Async.toArray(Async.zip([longer, ["a"]]))).to.eql([[1, "a"]]);
    expect(longer.closed).to.equal(true);
  });

  test("longest with padding", async () => {
    const result = Async.zip([[1], asyncClosable(["a", "b"])], { mode: "longest", padding: [0] });
    expect(await Async.toArray(result)).to.eql([[1, "a"], [0, "b"]]);
  });

  test("strict throws for different lengths", async () => {
    const longer = asyncClosable(["a", "b", "c"]);
    const result = Async.zip([[1], longer], { mode: "strict" });
    await expect(Async.toArray(result)).rejects.toThrow(TypeError);
    expect(longer.closed).to.equal(true);
  });

  test("a string throws", () => {
    expect(() => Async.zip([[1], /** @type any */ ("ab")])).to.throw(TypeError);
  });

  test("reads the iterables at the same time", async () => {
    /** @type string[] */
    const events = [];
    /** @type (name: string) => AsyncIterable<string> */
    const slow = (name) => ({
      async* [Symbol.asyncIterator]() {
        events.push(`${name} start`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        events.push(`${name} end`);
        yield name;
      }
    });

    await Async.toArray(Async.zip([slow("a"), slow("b")]));
    expect(events.slice(0, 2)).to.eql(["a start", "b start"]);
  });

  test("an iterable that throws closes the others", async () => {
    const other = asyncClosable([1, 2]);
    const throwing = (async function* () {
      yield "a";
      throw Error("boom");
    }());
    const result = Async.zip([other, throwing]);
    await result.next();
    await expect(result.next()).rejects.toThrow("boom");
    expect(other.closed).to.equal(true);
  });
});

describe("Async.zip", () => {
  test("waits for the promises a sync iterator that isn't iterable yields", async () => {
    const result = Async.zip([bare([Promise.resolve(1), 2])]);
    expect(await Async.toArray(result)).to.eql([[1], [2]]);
  });
});

describe("Async.zipKeyed", () => {
  test("yields objects with the same keys", async () => {
    const result = Async.zipKeyed({ n: [1, 2], s: asyncClosable(["a", "b"]) });
    expect(await Async.toArray(result)).to.eql([{ n: 1, s: "a" }, { n: 2, s: "b" }]);
  });
});

describe("concat", () => {
  test("two iterators", () => {
    const iter1 = (function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (function* () {
      yield 3;
      yield 4;
    }());

    const result = concat(iter1, iter2);
    expect([...result]).to.eql([1, 2, 3, 4]);
  });
});

describe("Async.concat", () => {
  test("two iterators", async () => {
    const iter1 = (async function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (async function* () {
      yield 3;
      yield 4;
    }());

    const result = Async.concat(iter1, iter2);
    expect((await result.next()).value).to.eql(1);
    expect((await result.next()).value).to.eql(2);
    expect((await result.next()).value).to.eql(3);
    expect((await result.next()).value).to.eql(4);
    expect((await result.next()).done).to.equal(true);
  });

  test("mixed sync/async", async () => {
    const iter1 = (function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (async function* () {
      yield 3;
      yield 4;
    }());

    const result = Async.concat(iter1, iter2);
    expect((await result.next()).value).to.eql(1);
    expect((await result.next()).value).to.eql(2);
    expect((await result.next()).value).to.eql(3);
    expect((await result.next()).value).to.eql(4);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("native Iterator helpers", () => {
  test("work on what a step returns", () => {
    const evens = filter((/** @type number */ n) => n % 2 === 0)([1, 2, 3, 4]);
    expect(evens.map((n) => n * 2).toArray()).to.eql([4, 8]);
  });

  test("work on what a source returns", () => {
    expect(range(0, 3).toArray()).to.eql([0, 1, 2]);
    expect(zip([[1], ["a"]]).toArray()).to.eql([[1, "a"]]);
  });
});

/**
 * A sync iterator over `items` that isn't iterable, and records whether it
 * was closed.
 *
 * @type <A>(items: A[]) => Iterator<A> & { closed: boolean }
 */
const bare = (items) => {
  let position = 0;
  return {
    closed: false,
    next() {
      return position < items.length
        ? { value: items[position++], done: false }
        : { value: undefined, done: true };
    },
    return() {
      this.closed = true;
      return { value: undefined, done: true };
    }
  };
};
