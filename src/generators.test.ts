import { beforeEach, describe, expect, test } from "vitest";
import {
  map, asyncMap,
  tap, asyncTap,
  filter, asyncFilter,
  scan, asyncScan,
  flatten, asyncFlatten,
  drop, asyncDrop,
  dropWhile, asyncDropWhile,
  take, asyncTake,
  takeWhile, asyncTakeWhile,
  head, asyncHead,
  range,
  empty, asyncEmpty,
  zip, asyncZip,
  concat, asyncConcat
} from "./index.js";
import type { NestedIterable, NestedAsyncIterable } from "./index.js";


describe("map", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = map((n) => n * 2, generator);
    expect([...result]).to.eql([2, 4, 6]);
  });

  test("generator curried", () => {
    const double = map((n: number) => n * 2);
    const result = double(generator);
    expect([...result]).to.eql([2, 4, 6]);
  });

  test("array", () => {
    const result = map((n) => n * 2, array);
    expect([...result]).to.eql([2, 4, 6]);
  });
});

describe("asyncMap", () => {
  let generator: Generator<number>;
  let asyncGenerator: AsyncGenerator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator with async mapper", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncMap(async (n) => n * 2, generator);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with sync mapper", async () => {
    const result = asyncMap((n) => n * 2, asyncGenerator);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with sync mapper curried", async () => {
    const double = asyncMap((n: number) => n * 2);
    const result = double(asyncGenerator);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("array with async mapper", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncMap(async (n) => n * 2, array);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(4);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("tap", () => {
  let generator: Generator<number>;
  let array: number[];

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
    }, generator);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });

  test("generator curried", () => {
    let count = 0;
    const double = tap(() => {
      count++;
    });
    const result = double(generator);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });

  test("array", () => {
    let count = 0;
    const result = tap(() => {
      count++;
    }, array);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });
});

describe("asyncTap", () => {
  let asyncGenerator: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    let count = 0;
    const result = asyncTap(() => {
      count++;
    }, asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
    expect(count).to.equal(3);
  });

  test("async-generator curried", async () => {
    let count = 0;
    const tapped = asyncTap(() => {
      count++;
    });

    const result = tapped(asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
    expect(count).to.equal(3);
  });
});

describe("filter", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = filter((n) => n > 2, generator);
    expect([...result]).to.eql([3]);
  });

  test("generator curried", () => {
    const greaterThanTwo = filter((n: number) => n > 2);
    const result = greaterThanTwo(generator);
    expect([...result]).to.eql([3]);
  });

  test("array", () => {
    const result = filter((n) => n > 2, array);
    expect([...result]).to.eql([3]);
  });
});

describe("asyncFilter", () => {
  let generator: Generator<number>;
  let asyncGenerator: AsyncGenerator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("async-generator with sync predicate", async () => {
    const result = asyncFilter((n) => n > 2, asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with sync predicate curried", async () => {
    const greaterThanTwo = asyncFilter((n: number) => n > 2);
    const result = greaterThanTwo(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("generator with async predicate", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncFilter(async (n) => n > 2, generator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with async predicate", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncFilter(async (n) => n > 2, asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("array with async predicate", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncFilter(async (n) => n > 2, array);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("scan", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = scan((acc, n) => acc + n, 0, generator);
    expect([...result]).to.eql([1, 3, 6]);
  });

  test("generator curried", () => {
    const sum = scan((acc, n: number) => acc + n, 0);
    const result = sum(generator);
    expect([...result]).to.eql([1, 3, 6]);
  });

  test("array", () => {
    const result = scan((acc, n) => acc + n, 0, array);
    expect([...result]).to.eql([1, 3, 6]);
  });
});

describe("asyncScan", () => {
  let generator: Generator<number>;
  let asyncGenerator: AsyncGenerator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("async-generator with sync reducer", async () => {
    const result = asyncScan((acc, n) => acc + n, 0, asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with sync reducer curried", async () => {
    const sum = asyncScan((acc, n: number) => acc + n, 0);
    const result = sum(asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("generator with async reducer", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncScan(async (acc, n) => acc + n, 0, generator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator with async reducer", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncScan(async (acc, n) => acc + n, 0, asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });

  test("array with async reducer", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncScan(async (acc, n) => acc + n, 0, array);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("flatten", () => {
  let subject: NestedIterable<number | string | boolean | null>;
  let deeplyNested: NestedIterable<number | string | boolean | null>;

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
    const result = flatten(subject);
    expect([...result]).to.eql([1, 2, deeplyNested, "foo", true, false, null]);
  });

  test("depth 1", () => {
    const result = flatten(subject, 1);
    expect([...result]).to.eql([1, 2, deeplyNested, "foo", true, false, null]);
  });

  test("depth 2", () => {
    const result = flatten(subject, 2);
    expect([...result]).to.eql([1, 2, 3, 4, "foo", true, false, null]);
  });

  test("depth Infinity", () => {
    const result = flatten(subject, Infinity);
    expect([...result]).to.eql([1, 2, 3, 4, "foo", true, false, null]);
  });
});

describe("asyncFlatten", () => {
  let subject: NestedAsyncIterable<number | string | boolean | null>;
  let deeplyNested: NestedAsyncIterable<number | string | boolean | null>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    deeplyNested = (async function* () {
      yield 3;
      yield 4;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    subject = (async function* () {
      yield 1;
      // eslint-disable-next-line @typescript-eslint/require-await
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
    const result = asyncFlatten(subject);
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
    const result = asyncFlatten(subject, 1);
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
    const result = asyncFlatten(subject, 2);
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
    const result = asyncFlatten(subject, Infinity);
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

describe("drop", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = drop(2, generator);
    expect([...result]).to.eql([3]);
  });

  test("generator curried", () => {
    const dropTwo = drop(2);
    const result = dropTwo(generator);
    expect([...result]).to.eql([3]);
  });

  test("array", () => {
    const result = drop(2, array);
    expect([...result]).to.eql([3]);
  });
});

describe("asyncDrop", () => {
  let asyncGenerator: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    const result = asyncDrop(2, asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator curried", async () => {
    const dropTwo = asyncDrop(2);
    const result = dropTwo(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("dropWhile", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = dropWhile((n) => n < 3, generator);
    expect([...result]).to.eql([3]);
  });

  test("generator curried", () => {
    const dropTwo = dropWhile((n: number) => n < 3);
    const result = dropTwo(generator);
    expect([...result]).to.eql([3]);
  });

  test("array", () => {
    const result = dropWhile((n) => n < 3, array);
    expect([...result]).to.eql([3]);
  });

  test("drop more than is available", () => {
    const result = dropWhile((n) => n < 10, generator);
    expect([...result]).to.eql([]);
  });
});

describe("asyncDropWhile", () => {
  let asyncGenerator: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncDropWhile(async (n) => n < 3, asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator curried", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const dropTwo = asyncDropWhile(async (n: number) => n < 3);
    const result = dropTwo(asyncGenerator);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });

  test("drop more than is available", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncDropWhile(async (n) => n < 10, asyncGenerator);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("take", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = take(2, generator);
    expect([...result]).to.eql([1, 2]);
  });

  test("generator curried", () => {
    const takeTwo = take(2);
    const result = takeTwo(generator);
    expect([...result]).to.eql([1, 2]);
  });

  test("array", () => {
    const result = take(2, array);
    expect([...result]).to.eql([1, 2]);
  });

  test("take more than is available", () => {
    const result = take(10, generator);
    expect([...result]).to.eql([1, 2, 3]);
  });
});

describe("asyncTake", () => {
  let asyncGenerator: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    const result = asyncTake(2, asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator curried", async () => {
    const takeTwo = asyncTake(2);
    const result = takeTwo(asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
  });

  test("take more than is available", async () => {
    const result = asyncTake(10, asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("takeWhile", () => {
  let generator: Generator<number>;
  let array: number[];

  beforeEach(() => {
    generator = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    array = [1, 2, 3];
  });

  test("generator", () => {
    const result = takeWhile((n) => n < 3, generator);
    expect([...result]).to.eql([1, 2]);
  });

  test("generator curried", () => {
    const takeTwo = takeWhile((n: number) => n < 3);
    const result = takeTwo(generator);
    expect([...result]).to.eql([1, 2]);
  });

  test("array", () => {
    const result = takeWhile((n) => n < 3, array);
    expect([...result]).to.eql([1, 2]);
  });

  test("take more than is available", () => {
    const result = takeWhile((n) => n < 10, generator);
    expect([...result]).to.eql([1, 2, 3]);
  });
});

describe("asyncTakeWhile", () => {
  let asyncGenerator: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("async-generator", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncTakeWhile(async (n) => n < 3, asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
  });

  test("async-generator curried", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const takeTwo = asyncTakeWhile(async (n: number) => n < 3);
    const result = takeTwo(asyncGenerator);

    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).done).to.equal(true);
  });

  test("take more than is available", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const result = asyncTakeWhile(async (n) => n < 10, asyncGenerator);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).done).to.equal(true);
  });
});

describe("head", () => {
  let generator: Generator<number>;
  let array: number[];

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
    expect([...generator]).to.eql([2, 3]);
  });

  test("array", () => {
    expect(head(array)).to.eql(1);
  });
});

describe("asyncHead", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  test("empty async-generator", async () => {
    expect(await asyncHead(asyncEmpty())).to.eql(undefined);
  });

  test("non-empty async-generator", async () => {
    expect(await asyncHead(subject)).to.eql(1);
    expect((await subject.next()).value).to.equal(2);
    expect((await subject.next()).value).to.equal(3);
    expect((await subject.next()).done).to.equal(true);
  });
});

describe("range", () => {
  test("closed", () => {
    const result = range(0, 3);
    expect([...result]).to.eql([0, 1, 2]);
  });

  test("infinite", () => {
    const result = take(3, range(3));
    expect([...result]).to.eql([3, 4, 5]);
  });
});

describe("empty", () => {
  test("should be empty", () => {
    expect([...empty()]).to.eql([]);
  });
});

describe("asyncEmpty", () => {
  test("should be empty", async () => {
    const subject = asyncEmpty();
    expect((await subject.next()).done).to.equal(true);
  });
});

describe("zip", () => {
  test("same number of items", () => {
    const iter1 = (function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (function* () {
      yield "a";
      yield "b";
    }());
    const result = zip(iter1, iter2);
    expect([...result]).to.eql([[1, "a"], [2, "b"]]);
  });

  test("iter1 has more items", () => {
    const iter1 = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    const iter2 = (function* () {
      yield "a";
      yield "b";
    }());
    const result = zip(iter1, iter2);
    expect([...result]).to.eql([[1, "a"], [2, "b"], [3, undefined]]);
  });

  test("iter2 has more items", () => {
    const iter1 = (function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (function* () {
      yield "a";
      yield "b";
      yield "c";
    }());
    const result = zip(iter1, iter2);
    expect([...result]).to.eql([[1, "a"], [2, "b"]]);
  });
});

describe("asyncZip", () => {
  test("same number of items", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const iter1 = (async function* () {
      yield 1;
      yield 2;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    const iter2 = (async function* () {
      yield "a";
      yield "b";
    }());
    const result = asyncZip(iter1, iter2);
    expect((await result.next()).value).to.eql([1, "a"]);
    expect((await result.next()).value).to.eql([2, "b"]);
    expect((await result.next()).done).to.equal(true);
  });

  test("iter1 has more items", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const iter1 = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    const iter2 = (async function* () {
      yield "a";
      yield "b";
    }());
    const result = asyncZip(iter1, iter2);
    expect((await result.next()).value).to.eql([1, "a"]);
    expect((await result.next()).value).to.eql([2, "b"]);
    expect((await result.next()).value).to.eql([3, undefined]);
    expect((await result.next()).done).to.equal(true);
  });

  test("iter2 has more items", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const iter1 = (async function* () {
      yield 1;
      yield 2;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    const iter2 = (async function* () {
      yield "a";
      yield "b";
      yield "c";
    }());
    const result = asyncZip(iter1, iter2);
    expect((await result.next()).value).to.eql([1, "a"]);
    expect((await result.next()).value).to.eql([2, "b"]);
    expect((await result.next()).done).to.equal(true);
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

describe("asyncConcat", () => {
  test("two iterators", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const iter1 = (async function* () {
      yield 1;
      yield 2;
    }());

    // eslint-disable-next-line @typescript-eslint/require-await
    const iter2 = (async function* () {
      yield 3;
      yield 4;
    }());

    const result = asyncConcat(iter1, iter2);
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

    // eslint-disable-next-line @typescript-eslint/require-await
    const iter2 = (async function* () {
      yield 3;
      yield 4;
    }());

    const result = asyncConcat(iter1, iter2);
    expect((await result.next()).value).to.eql(1);
    expect((await result.next()).value).to.eql(2);
    expect((await result.next()).value).to.eql(3);
    expect((await result.next()).value).to.eql(4);
    expect((await result.next()).done).to.equal(true);
  });
});
