import { expect } from "chai";
import {
  map, asyncMap,
  tap, asyncTap,
  filter, asyncFilter,
  scan, asyncScan,
  flatten, asyncFlatten,
  drop, asyncDrop,
  take, asyncTake,
  range,
  zip, asyncZip
} from "./index.js";
import type { NestedIterable, NestedAsyncIterable } from "./index.js";


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
      yield 1;
      yield 2;
      yield 3;
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

describe("tap", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    let count = 0;
    const result = tap(() => count++, subject);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });

  it("curried", () => {
    let count = 0;
    const double = tap(() => count++);
    const result = double(subject);
    expect([...result]).to.eql([1, 2, 3]);
    expect(count).to.equal(3);
  });
});

describe("asyncTap", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", async () => {
    let count = 0;
    const result = asyncTap(() => count++, subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect(count).to.equal(3);
  });

  it("curried", async () => {
    let count = 0;
    const tapped = asyncTap(() => count++);
    const result = tapped(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(3);
    expect(count).to.equal(3);
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
      yield 1;
      yield 2;
      yield 3;
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

describe("scan", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = scan((acc, n) => acc + n, 0, subject);
    expect([...result]).to.eql([1, 3, 6]);
  });

  it("curried", () => {
    const sum = scan((acc, n: number) => acc + n, 0);
    const result = sum(subject);
    expect([...result]).to.eql([1, 3, 6]);
  });
});

describe("asyncScan", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", async () => {
    const result = asyncScan((acc, n) => acc + n, 0, subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
  });

  it("curried", async () => {
    const sum = asyncScan((acc, n: number) => acc + n, 0);
    const result = sum(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(3);
    expect((await result.next()).value).to.equal(6);
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

  it("default depth", () => {
    const result = flatten(subject);
    expect([...result]).to.eql([1, 2, deeplyNested, "foo", true, false, null]);
  });

  it("depth 1", () => {
    const result = flatten(subject, 1);
    expect([...result]).to.eql([1, 2, deeplyNested, "foo", true, false, null]);
  });

  it("depth 2", () => {
    const result = flatten(subject, 2);
    expect([...result]).to.eql([1, 2, 3, 4, "foo", true, false, null]);
  });

  it("depth Infinity", () => {
    const result = flatten(subject, Infinity);
    expect([...result]).to.eql([1, 2, 3, 4, "foo", true, false, null]);
  });
});

describe("asyncFlatten", () => {
  let subject: NestedAsyncIterable<number | string | boolean | null>;
  let deeplyNested: NestedAsyncIterable<number | string | boolean | null>;

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

  it("default depth", async () => {
    const result = asyncFlatten(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(deeplyNested);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).value).to.equal("foo");
    expect((await result.next()).value).to.equal(true);
    expect((await result.next()).value).to.equal(false);
    expect((await result.next()).value).to.equal(null);
  });

  it("depth 1", async () => {
    const result = asyncFlatten(subject, 1);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
    expect((await result.next()).value).to.equal(deeplyNested);
    expect((await result.next()).value).to.equal(5);
    expect((await result.next()).value).to.equal("foo");
    expect((await result.next()).value).to.equal(true);
    expect((await result.next()).value).to.equal(false);
    expect((await result.next()).value).to.equal(null);
  });

  it("depth 2", async () => {
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
  });

  it("depth Infinity", async () => {
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
      yield 1;
      yield 2;
      yield 3;
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

describe("take", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = take(2, subject);
    expect([...result]).to.eql([1, 2]);
  });

  it("curried", () => {
    const takeTwo = take(2);
    const result = takeTwo(subject);
    expect([...result]).to.eql([1, 2]);
  });
});

describe("asyncTake", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", async () => {
    const result = asyncTake(2, subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
  });

  it("curried", async () => {
    const takeTwo = asyncTake(2);
    const result = takeTwo(subject);
    expect((await result.next()).value).to.equal(1);
    expect((await result.next()).value).to.equal(2);
  });
});

describe("range", () => {
  it("closed", () => {
    const result = range(0, 3);
    expect([...result]).to.eql([0, 1, 2]);
  });

  it("infinite", () => {
    const result = take(3, range(0));
    expect([...result]).to.eql([0, 1, 2]);
  });
});

describe("zip", () => {
  it("same number of items", () => {
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

  it("iter1 has more items", () => {
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

  it("iter2 has more items", () => {
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
  it("same number of items", async () => {
    const iter1 = (async function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (async function* () {
      yield "a";
      yield "b";
    }());
    const result = asyncZip(iter1, iter2);
    expect((await result.next()).value).to.eql([1, "a"]);
    expect((await result.next()).value).to.eql([2, "b"]);
  });

  it("iter1 has more items", async () => {
    const iter1 = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    const iter2 = (async function* () {
      yield "a";
      yield "b";
    }());
    const result = asyncZip(iter1, iter2);
    expect((await result.next()).value).to.eql([1, "a"]);
    expect((await result.next()).value).to.eql([2, "b"]);
    expect((await result.next()).value).to.eql([3, undefined]);
  });

  it("iter2 has more items", async () => {
    const iter1 = (async function* () {
      yield 1;
      yield 2;
    }());

    const iter2 = (async function* () {
      yield "a";
      yield "b";
      yield "c";
    }());
    const result = asyncZip(iter1, iter2);
    expect((await result.next()).value).to.eql([1, "a"]);
    expect((await result.next()).value).to.eql([2, "b"]);
  });
});
