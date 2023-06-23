import { expect } from "chai";
import {
  reduce, asyncReduce,
  every, asyncEvery,
  some, asyncSome,
  count, asyncCount
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
  describe("curried", () => {
    let subject: AsyncGenerator<number>;

    beforeEach(() => {
      subject = (async function* () {
        yield 1;
        yield 2;
        yield 3;
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

  it("synchronous iterator with async reducer", async () => {
    const subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    const result = await asyncReduce(async (acc, n) => acc + n, 0, subject);
    expect(result).to.equal(6);
  });

  it("asynchronous iterator with async reducer", async () => {
    const subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    const result = await asyncReduce(async (acc, n) => acc + n, 0, subject);
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
    expect(result).to.equal(false);
  });

  it("uncurried negative", () => {
    const result = every((n) => n < 5, subject);
    expect(result).to.equal(true);
  });

  it("curried positive", () => {
    const allLessThanFive = every((n: number) => n < 5);
    const result = allLessThanFive(subject);
    expect(result).to.equal(true);
  });

  it("curried negative", () => {
    const allGreaterThanTwo = every((n: number) => n > 2);
    const result = allGreaterThanTwo(subject);
    expect(result).to.equal(false);
  });
});

describe("asyncEvery", () => {
  let subject: AsyncGenerator<number>;
  let syncSubject: Generator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    syncSubject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried positive", async () => {
    const result = await asyncEvery((n) => n > 2, subject);
    expect(result).to.equal(false);
  });

  it("uncurried negative", async () => {
    const result = await asyncEvery((n: number) => n < 5, subject);
    expect(result).to.equal(true);
  });

  it("curried positive", async () => {
    const allLessThanFive = asyncEvery((n: number) => n < 5);
    const result = await allLessThanFive(subject);
    expect(result).to.equal(true);
  });

  it("curried negative", async () => {
    const allGreaterThanTwo = asyncEvery((n: number) => n > 2);
    const result = await allGreaterThanTwo(subject);
    expect(result).to.equal(false);
  });

  it("synchronous iterable with async predicate", async () => {
    const result = await asyncEvery(async (n) => n > 2, syncSubject);
    expect(result).to.equal(false);

    const result2 = await asyncEvery(async (n) => n < 5, syncSubject);
    expect(result2).to.equal(true);
  });

  it("async iterable with async predicate", async () => {
    const result = await asyncEvery(async (n) => n > 2, subject);
    expect(result).to.equal(false);

    const result2 = await asyncEvery(async (n) => n < 5, subject);
    expect(result2).to.equal(true);
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
    expect(result).to.equal(true);
  });

  it("uncurried negative", () => {
    const result = some((n) => n > 5, subject);
    expect(result).to.equal(false);
  });

  it("curried positive", () => {
    const someGreaterThanTwo = some((n: number) => n > 2);
    const result = someGreaterThanTwo(subject);
    expect(result).to.equal(true);
  });

  it("curried negative", () => {
    const someGreaterThanFive = some((n: number) => n > 5);
    const result = someGreaterThanFive(subject);
    expect(result).to.equal(false);
  });
});

describe("asyncSome", () => {
  let subject: AsyncGenerator<number>;
  let syncSubject: Generator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());

    syncSubject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried positive", async () => {
    const result = await asyncSome((n) => n > 2, subject);
    expect(result).to.eql(true);
  });

  it("uncurried negative", async () => {
    const result = await asyncSome((n) => n > 5, subject);
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

  it("synchronous iterable with async predicate", async () => {
    const result = await asyncSome(async (n) => n > 2, syncSubject);
    expect(result).to.equal(true);

    const result2 = await asyncSome(async (n) => n > 5, syncSubject);
    expect(result2).to.eql(false);
  });

  it("async iterable with async predicate", async () => {
    const result = await asyncSome(async (n) => n > 2, subject);
    expect(result).to.eql(true);

    const result2 = await asyncSome(async (n) => n < 5, subject);
    expect(result2).to.eql(false);
  });
});

describe("count", () => {
  let subject: Iterable<number>;

  beforeEach(() => {
    subject = (function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", () => {
    const result = count(subject);
    expect(result).to.eql(3);
  });
});

describe("asyncCount", () => {
  let subject: AsyncGenerator<number>;

  beforeEach(() => {
    subject = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("uncurried", async () => {
    const result = await asyncCount(subject);
    expect(result).to.equal(3);
  });
});
