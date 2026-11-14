import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";
import { closable, asyncClosable } from "./test-utils.js";

// Anything that stops reading a source before it's done closes it (see
// design/principles/close-what-you-open.md). Each source has more items
// than the test reads, because a source that finishes counts as closed.

const items = [1, 2, 3, 4, 5];
const boom = () => {
  throw Error("boom");
};

/** @type [string, (source: any) => any][] */
const stopsEarly = [
  ["take", (source) => [...Pact.take(2)(source)]],
  ["takeWhile", (source) => [...Pact.takeWhile((n) => n < 3)(source)]],
  ["flatMap", (source) => [...Pact.take(2)(Pact.flatMap((n) => [n])(source))]],
  ["head", (source) => Pact.head(source)],
  ["find", (source) => Pact.find((n) => n > 1)(source)],
  ["some", (source) => Pact.some((n) => n > 1)(source)],
  ["every", (source) => Pact.every((n) => n < 2)(source)],
  ["zip (first)", (source) => [...Pact.zip([source, [1]])]],
  ["zip (second)", (source) => [...Pact.zip([[1], source])]],
  ["pipe", (source) => Pact.pipe(source, Pact.take(1), Pact.toArray)]
];

/** @type [string, (source: any) => Iterator<any>][] */
const steps = [
  ["map", (source) => Pact.map((n) => n)(source)],
  ["tap", (source) => Pact.tap(() => {})(source)],
  ["filter", (source) => Pact.filter(() => true)(source)],
  ["scan", (source) => Pact.scan((a, n) => a + n, 0)(source)],
  ["flatten", (source) => Pact.flatten()(source)],
  ["flatMap", (source) => Pact.flatMap((n) => [n])(source)],
  ["drop", (source) => Pact.drop(1)(source)],
  ["dropWhile", (source) => Pact.dropWhile((n) => n < 2)(source)],
  ["take", (source) => Pact.take(4)(source)],
  ["takeWhile", (source) => Pact.takeWhile(() => true)(source)],
  ["zip (first)", (source) => Pact.zip([source, items])],
  ["zip (second)", (source) => Pact.zip([items, source])],
  ["concat", (source) => Pact.concat(source, items)]
];

/** @type [string, (source: any) => any][] */
const callbackThrows = [
  ["map", (source) => [...Pact.map(boom)(source)]],
  ["tap", (source) => [...Pact.tap(boom)(source)]],
  ["filter", (source) => [...Pact.filter(boom)(source)]],
  ["scan", (source) => [...Pact.scan(boom, 0)(source)]],
  ["dropWhile", (source) => [...Pact.dropWhile(boom)(source)]],
  ["takeWhile", (source) => [...Pact.takeWhile(boom)(source)]],
  ["reduce", (source) => Pact.reduce(boom, 0)(source)],
  ["flatMap", (source) => [...Pact.flatMap(boom)(source)]],
  ["forEach", (source) => Pact.forEach(boom)(source)],
  ["every", (source) => Pact.every(boom)(source)],
  ["some", (source) => Pact.some(boom)(source)],
  ["find", (source) => Pact.find(boom)(source)]
];

/** @type [string, (source: any) => Promise<any>][] */
const asyncStopsEarly = [
  ["Async.take", (source) => toArray(Async.take(2)(source))],
  ["Async.takeWhile", (source) => toArray(Async.takeWhile((n) => n < 3)(source))],
  ["Async.flatMap", (source) => toArray(Async.take(2)(Async.flatMap((n) => [n])(source)))],
  ["Async.head", (source) => Async.head(source)],
  ["Async.find", (source) => Async.find((n) => n > 1)(source)],
  ["Async.some", (source) => Async.some((n) => n > 1)(source)],
  ["Async.every", (source) => Async.every((n) => n < 2)(source)],
  ["Async.zip (first)", (source) => toArray(Async.zip([source, [1]]))],
  ["Async.zip (second)", (source) => toArray(Async.zip([[1], source]))],
  ["pipe", (source) => Pact.pipe(source, Async.take(1), Async.toArray)]
];

/** @type [string, (source: any) => AsyncIterator<any>][] */
const asyncSteps = [
  ["Async.map", (source) => Async.map((n) => n)(source)],
  ["Async.tap", (source) => Async.tap(() => {})(source)],
  ["Async.filter", (source) => Async.filter(() => true)(source)],
  ["Async.scan", (source) => Async.scan((a, n) => a + n, 0)(source)],
  ["Async.flatten", (source) => Async.flatten()(source)],
  ["Async.flatMap", (source) => Async.flatMap((n) => [n])(source)],
  ["Async.drop", (source) => Async.drop(1)(source)],
  ["Async.dropWhile", (source) => Async.dropWhile((n) => n < 2)(source)],
  ["Async.take", (source) => Async.take(4)(source)],
  ["Async.takeWhile", (source) => Async.takeWhile(() => true)(source)],
  ["Async.zip (first)", (source) => Async.zip([source, items])],
  ["Async.zip (second)", (source) => Async.zip([items, source])],
  ["Async.concat", (source) => Async.concat(source, items)]
];

/** @type [string, (source: any) => Promise<any>][] */
const asyncCallbackThrows = [
  ["Async.map", (source) => toArray(Async.map(boom)(source))],
  ["Async.tap", (source) => toArray(Async.tap(boom)(source))],
  ["Async.filter", (source) => toArray(Async.filter(boom)(source))],
  ["Async.scan", (source) => toArray(Async.scan(boom, 0)(source))],
  ["Async.dropWhile", (source) => toArray(Async.dropWhile(boom)(source))],
  ["Async.takeWhile", (source) => toArray(Async.takeWhile(boom)(source))],
  ["Async.reduce", (source) => Async.reduce(boom, 0)(source)],
  ["Async.flatMap", (source) => toArray(Async.flatMap(boom)(source))],
  ["Async.forEach", (source) => Async.forEach(boom)(source)],
  ["Async.every", (source) => Async.every(boom)(source)],
  ["Async.some", (source) => Async.some(boom)(source)],
  ["Async.find", (source) => Async.find(boom)(source)]
];

describe("stopping early closes the source", () => {
  test.each(stopsEarly)("%s", (_name, run) => {
    const source = closable(items);
    run(source);
    expect(source.closed).to.equal(true);
  });
});

describe("closing a step closes its source", () => {
  test.each(steps)("%s", (_name, step) => {
    const source = closable(items);
    const result = step(source);
    result.next();
    result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });

  test("flatten closes the nested iterable it's in", () => {
    const nested = closable(items);
    const result = Pact.flatten()([nested]);
    result.next();
    result.return?.(undefined);
    expect(nested.closed).to.equal(true);
  });

  test("concat doesn't open the iterables it hasn't reached", () => {
    const second = closable(items);
    const result = Pact.concat(items, second);
    result.next();
    result.return?.(undefined);
    expect(second.closed).to.equal(false);
  });
});

describe("an iterable that can't be opened closes what's open", () => {
  test("flatten", () => {
    const source = closable([unopenable, 2]);
    const result = Pact.flatten()(source);
    expect(() => result.next()).to.throw("boom");
    expect(source.closed).to.equal(true);
  });

  test("Async.flatten", async () => {
    const source = asyncClosable([unopenable, 2]);
    const result = Async.flatten()(source);
    await expect(result.next()).rejects.toThrow("boom");
    expect(source.closed).to.equal(true);
  });
});

// The padding is read before anything is opened, so there's nothing to close
describe("zip with padding that can't be read doesn't open its iterables", () => {
  /** @type [string, (source: any) => any][] */
  const zips = [
    ["zip", (source) => Pact.zip([source], { mode: "longest", padding: unopenable })],
    ["zipKeyed", (source) => Pact.zipKeyed({ a: source }, { mode: "longest", padding: unreadable })],
    ["Async.zip", (source) => Async.zip([source], { mode: "longest", padding: unopenable })],
    ["Async.zipKeyed", (source) => Async.zipKeyed({ a: source }, { mode: "longest", padding: unreadable })]
  ];

  test.each(zips)("%s", (_name, run) => {
    let opened = false;
    const source = {
      [Symbol.iterator]: () => {
        opened = true;
        return [][Symbol.iterator]();
      }
    };
    expect(() => run(source)).to.throw("boom");
    expect(opened).to.equal(false);
  });
});

/** @type Iterable<any> */
const unopenable = { [Symbol.iterator]: boom };

const unreadable = {
  get a() {
    return boom();
  }
};

describe("a callback that throws closes the source", () => {
  test.each(callbackThrows)("%s", (_name, run) => {
    const source = closable(items);
    expect(() => run(source)).to.throw("boom");
    expect(source.closed).to.equal(true);
  });
});

describe("async stopping early closes the source", () => {
  test.each(asyncStopsEarly)("%s, async source", async (_name, run) => {
    const source = asyncClosable(items);
    await run(source);
    expect(source.closed).to.equal(true);
  });

  test.each(asyncStopsEarly)("%s, sync source", async (_name, run) => {
    const source = closable(items);
    await run(source);
    expect(source.closed).to.equal(true);
  });
});

describe("closing an async step closes its source", () => {
  test.each(asyncSteps)("%s, async source", async (_name, step) => {
    const source = asyncClosable(items);
    const result = step(source);
    await result.next();
    await result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });

  test.each(asyncSteps)("%s, sync source", async (_name, step) => {
    const source = closable(items);
    const result = step(source);
    await result.next();
    await result.return?.(undefined);
    expect(source.closed).to.equal(true);
  });
});

describe("an async callback that throws closes the source", () => {
  test.each(asyncCallbackThrows)("%s, async source", async (_name, run) => {
    const source = asyncClosable(items);
    await expect(run(source)).rejects.toThrow("boom");
    expect(source.closed).to.equal(true);
  });

  test.each(asyncCallbackThrows)("%s, sync source", async (_name, run) => {
    const source = closable(items);
    await expect(run(source)).rejects.toThrow("boom");
    expect(source.closed).to.equal(true);
  });
});

/** @type <A>(iter: AsyncIterable<A>) => Promise<A[]> */
const toArray = async (iter) => {
  const result = [];
  for await (const item of iter) {
    result.push(item);
  }
  return result;
};

// A step with more than one iterator open closes all of them, even if
// closing one throws. These sources record a call to `return()`, because a
// generator that hasn't started doesn't run its `finally`.

/** @type () => Iterable<number> & { closed: boolean }  */
const recorder = () => {
  const iterable = {
    closed: false,
    /** @type () => Iterator<number> */
    [Symbol.iterator]: () => ({
      next: () => ({ value: 1, done: false }),
      return: () => {
        iterable.closed = true;
        return { value: undefined, done: true };
      }
    })
  };
  return iterable;
};

/** @type Iterable<number> */
const closeThrows = {
  [Symbol.iterator]: () => ({
    next: () => ({ value: 1, done: false }),
    return: () => {
      throw Error("close");
    }
  })
};

/** @type AsyncIterable<number> */
const asyncCloseThrows = {
  [Symbol.asyncIterator]: () => ({
    next: async () => ({ value: 1, done: false }),
    return: () => {
      throw Error("close");
    }
  })
};

/** @type AsyncIterable<number> */
const asyncCloseRejects = {
  [Symbol.asyncIterator]: () => ({
    next: async () => ({ value: 1, done: false }),
    return: async () => {
      throw Error("close");
    }
  })
};

describe("closing closes every iterator when closing one throws", () => {
  /** @type [string, (failing: any, source: any) => Iterator<any>][] */
  const steps = [
    ["flatMap", (failing, source) => Pact.flatMap(() => failing)(source)],
    ["flatten", (failing, source) => Pact.flatten()(Pact.map(() => failing)(source))],
    ["zip", (failing, source) => Pact.zip([failing, source])]
  ];

  test.each(steps)("%s", (_name, step) => {
    const source = recorder();
    const result = step(closeThrows, source);
    result.next();
    expect(() => result.return?.()).to.throw("close");
    expect(source.closed).to.equal(true);
  });

  test("zip with something that isn't iterable", () => {
    const source = recorder();
    expect(() => Pact.zip([closeThrows, source, /** @type any */ (5)])).to.throw(TypeError);
    expect(source.closed).to.equal(true);
  });
});

describe("async closing closes every iterator when closing one throws", () => {
  /** @type [string, (failing: any, source: any) => AsyncIterator<any>][] */
  const steps = [
    ["Async.flatMap", (failing, source) => Async.flatMap(() => failing)(source)],
    ["Async.flatten", (failing, source) => Async.flatten()(Async.map(() => failing)(source))],
    ["Async.zip", (failing, source) => Async.zip([failing, source])]
  ];

  /** @type [string, Iterable<number> | AsyncIterable<number>][] */
  const failures = [
    ["a sync source", closeThrows],
    ["an async source that throws", asyncCloseThrows],
    ["an async source that rejects", asyncCloseRejects]
  ];

  describe.each(failures)("%s", (_name, failing) => {
    test.each(steps)("%s", async (_name, step) => {
      const source = recorder();
      const result = step(failing, source);
      await result.next();
      await expect(result.return?.()).rejects.toThrow("close");
      expect(source.closed).to.equal(true);
    });

    test("Async.zip with something that isn't iterable", async () => {
      const source = recorder();
      expect(() => Async.zip([failing, source, /** @type any */ (5)])).to.throw(TypeError);
      await new Promise((resolve) => {
        setTimeout(resolve);
      });
      expect(source.closed).to.equal(true);
    });
  });
});
