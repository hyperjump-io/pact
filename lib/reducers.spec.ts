import { expect } from "chai";
import {
  reduce, asyncReduce,
  every, asyncEvery,
  some, asyncSome,
  count, asyncCount
} from "./index.js";


describe("reduce", () => {
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

  it("generator", () => {
    const result = reduce((acc, n) => acc + n, 0, generator);
    expect(result).to.eql(6);
  });

  it("generator curried", () => {
    const sum = reduce((acc, n: number) => acc + n, 0);
    const result = sum(generator);
    expect(result).to.eql(6);
  });

  it("array", () => {
    const result = reduce((acc, n) => acc + n, 0, array);
    expect(result).to.eql(6);
  });
});

describe("asyncReduce", () => {
  let generator: Generator<number>;
  let asyncGenerator: AsyncGenerator<number>;
  let array: number[];

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

  it("async-generator with sync reducer", async () => {
    const result = await asyncReduce((acc, n) => acc + n, 0, asyncGenerator);
    expect(result).to.equal(6);
  });

  it("async-generator with sync reducer curried", async () => {
    const sum = asyncReduce((acc, n: number) => acc + n, 0);
    const result = await sum(asyncGenerator);
    expect(result).to.equal(6);
  });

  it("generator with async reducer", async () => {
    const result = await asyncReduce(async (acc, n) => acc + n, 0, generator);
    expect(result).to.equal(6);
  });

  it("async-generator with async reducer", async () => {
    const result = await asyncReduce(async (acc, n) => acc + n, 0, asyncGenerator);
    expect(result).to.equal(6);
  });

  it("array with async reducer", async () => {
    const result = await asyncReduce(async (acc, n) => acc + n, 0, array);
    expect(result).to.equal(6);
  });
});

describe("every", () => {
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

  describe("generator", () => {
    it("positive", () => {
      const result = every((n) => n > 2, generator);
      expect(result).to.equal(false);
    });

    it("negative", () => {
      const result = every((n) => n < 5, generator);
      expect(result).to.equal(true);
    });
  });

  describe("generator curried", () => {
    it("positive", () => {
      const allLessThanFive = every((n: number) => n < 5);
      const result = allLessThanFive(generator);
      expect(result).to.equal(true);
    });

    it("negative", () => {
      const allGreaterThanTwo = every((n: number) => n > 2);
      const result = allGreaterThanTwo(generator);
      expect(result).to.equal(false);
    });
  });

  describe("array", () => {
    it("positive", () => {
      const result = every((n) => n > 2, array);
      expect(result).to.equal(false);
    });

    it("negative", () => {
      const result = every((n) => n < 5, array);
      expect(result).to.equal(true);
    });
  });
});

describe("asyncEvery", () => {
  let generator: Generator<number>;
  let asyncGenerator: AsyncGenerator<number>;
  let array: number[];

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

  describe("async-generator with sync predicate", () => {
    it("positive", async () => {
      const result = await asyncEvery((n: number) => n < 5, asyncGenerator);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const result = await asyncEvery((n) => n > 2, asyncGenerator);
      expect(result).to.equal(false);
    });
  });

  describe("async-generator with sync predicate curried", () => {
    it("positive", async () => {
      const allLessThanFive = asyncEvery((n: number) => n < 5);
      const result = await allLessThanFive(asyncGenerator);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const allGreaterThanTwo = asyncEvery((n: number) => n > 2);
      const result = await allGreaterThanTwo(asyncGenerator);
      expect(result).to.equal(false);
    });
  });

  describe("generator with async predicate", () => {
    it("positive", async () => {
      const result = await asyncEvery(async (n) => n < 5, generator);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const result = await asyncEvery(async (n) => n > 2, generator);
      expect(result).to.equal(false);
    });
  });

  describe("async-generator with async predicate", () => {
    it("positive", async () => {
      const result = await asyncEvery(async (n) => n < 5, asyncGenerator);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const result = await asyncEvery(async (n) => n > 2, asyncGenerator);
      expect(result).to.equal(false);
    });
  });

  describe("array with async predicate", () => {
    it("positive", async () => {
      const result = await asyncEvery(async (n) => n < 5, array);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const result = await asyncEvery(async (n) => n > 2, array);
      expect(result).to.equal(false);
    });
  });
});

describe("some", () => {
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

  describe("generator", () => {
    it("positive", () => {
      const result = some((n) => n > 2, generator);
      expect(result).to.equal(true);
    });

    it("negative", () => {
      const result = some((n) => n > 5, generator);
      expect(result).to.equal(false);
    });
  });

  describe("generator curried", () => {
    it("positive", () => {
      const someGreaterThanTwo = some((n: number) => n > 2);
      const result = someGreaterThanTwo(generator);
      expect(result).to.equal(true);
    });

    it("negative", () => {
      const someGreaterThanFive = some((n: number) => n > 5);
      const result = someGreaterThanFive(generator);
      expect(result).to.equal(false);
    });
  });

  describe("array", () => {
    it("positive", () => {
      const result = some((n) => n > 2, array);
      expect(result).to.equal(true);
    });

    it("negative", () => {
      const result = some((n) => n > 5, array);
      expect(result).to.equal(false);
    });
  });
});

describe("asyncSome", () => {
  let generator: Generator<number>;
  let asyncGenerator: AsyncGenerator<number>;
  let array: number[];

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

  describe("async-generator with sync predicate", () => {
    it("positive", async () => {
      const result = await asyncSome((n) => n > 2, asyncGenerator);
      expect(result).to.eql(true);
    });

    it("negative", async () => {
      const result = await asyncSome((n) => n > 5, asyncGenerator);
      expect(result).to.eql(false);
    });
  });

  describe("async-generator with sync predicate curried", () => {
    it("positive", async () => {
      const someGreaterThanTwo = asyncSome((n: number) => n > 2);
      const result = await someGreaterThanTwo(asyncGenerator);
      expect(result).to.eql(true);
    });

    it("negative", async () => {
      const someGreaterThanFive = asyncSome((n: number) => n > 5);
      const result = await someGreaterThanFive(asyncGenerator);
      expect(result).to.eql(false);
    });
  });

  describe("generator with async predicate", () => {
    it("positive", async () => {
      const result = await asyncSome(async (n) => n > 2, generator);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const result = await asyncSome(async (n) => n > 5, generator);
      expect(result).to.eql(false);
    });
  });

  describe("async-generator with async predicate", () => {
    it("positive", async () => {
      const result = await asyncSome(async (n) => n > 2, asyncGenerator);
      expect(result).to.eql(true);
    });

    it("negative", async () => {
      const result = await asyncSome(async (n) => n > 5, asyncGenerator);
      expect(result).to.eql(false);
    });
  });

  describe("array with async predicate", () => {
    it("positive", async () => {
      const result = await asyncSome(async (n) => n > 2, array);
      expect(result).to.equal(true);
    });

    it("negative", async () => {
      const result = await asyncSome(async (n) => n > 5, array);
      expect(result).to.eql(false);
    });
  });
});

describe("count", () => {
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

  it("generator", () => {
    const result = count(generator);
    expect(result).to.eql(3);
  });

  it("array", () => {
    const result = count(array);
    expect(result).to.eql(3);
  });
});

describe("asyncCount", () => {
  let asyncGenerator: AsyncGenerator<number>;

  beforeEach(() => {
    asyncGenerator = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    }());
  });

  it("async-generator", async () => {
    const result = await asyncCount(asyncGenerator);
    expect(result).to.equal(3);
  });
});
