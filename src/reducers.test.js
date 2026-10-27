import { beforeEach, describe, expect, test } from "vitest";
import {
  reduce, asyncReduce,
  every, asyncEvery,
  some, asyncSome,
  find, asyncFind,
  count, asyncCount
} from "./index.js";

describe("reduce", () => {
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
    const result = reduce((acc, n) => acc + n, 0)(generator);
    expect(result).to.eql(6);
  });

  test("array", () => {
    const result = reduce((acc, n) => acc + n, 0)(array);
    expect(result).to.eql(6);
  });
});

describe("asyncReduce", () => {
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
    const result = await asyncReduce((acc, n) => acc + n, 0)(asyncGenerator);
    expect(result).to.equal(6);
  });

  test("generator with async reducer", async () => {
    const result = await asyncReduce(async (acc, n) => acc + n, 0)(generator);
    expect(result).to.equal(6);
  });

  test("async-generator with async reducer", async () => {
    const result = await asyncReduce(async (acc, n) => acc + n, 0)(asyncGenerator);
    expect(result).to.equal(6);
  });

  test("array with async reducer", async () => {
    const result = await asyncReduce(async (acc, n) => acc + n, 0)(array);
    expect(result).to.equal(6);
  });
});

describe("every", () => {
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

  describe("generator", () => {
    test("positive", () => {
      const result = every((n) => n > 2)(generator);
      expect(result).to.equal(false);
    });

    test("negative", () => {
      const result = every((n) => n < 5)(generator);
      expect(result).to.equal(true);
    });
  });

  describe("array", () => {
    test("positive", () => {
      const result = every((n) => n > 2)(array);
      expect(result).to.equal(false);
    });

    test("negative", () => {
      const result = every((n) => n < 5)(array);
      expect(result).to.equal(true);
    });
  });
});

describe("asyncEvery", () => {
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

  describe("async-generator with sync predicate", () => {
    test("positive", async () => {
      const result = await asyncEvery((/** @type number */ n) => n < 5)(asyncGenerator);
      expect(result).to.equal(true);
    });

    test("negative", async () => {
      const result = await asyncEvery((n) => n > 2)(asyncGenerator);
      expect(result).to.equal(false);
    });
  });

  describe("generator with async predicate", () => {
    test("positive", async () => {
      const result = await asyncEvery(async (n) => n < 5)(generator);
      expect(result).to.equal(true);
    });

    test("negative", async () => {
      const result = await asyncEvery(async (n) => n > 2)(generator);
      expect(result).to.equal(false);
    });
  });

  describe("async-generator with async predicate", () => {
    test("positive", async () => {
      const result = await asyncEvery(async (n) => n < 5)(asyncGenerator);
      expect(result).to.equal(true);
    });

    test("negative", async () => {
      const result = await asyncEvery(async (n) => n > 2)(asyncGenerator);
      expect(result).to.equal(false);
    });
  });

  describe("array with async predicate", () => {
    test("positive", async () => {
      const result = await asyncEvery(async (n) => n < 5)(array);
      expect(result).to.equal(true);
    });

    test("negative", async () => {
      const result = await asyncEvery(async (n) => n > 2)(array);
      expect(result).to.equal(false);
    });
  });
});

describe("some", () => {
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

  describe("generator", () => {
    test("positive", () => {
      const result = some((n) => n > 2)(generator);
      expect(result).to.equal(true);
    });

    test("negative", () => {
      const result = some((n) => n > 5)(generator);
      expect(result).to.equal(false);
    });
  });

  describe("array", () => {
    test("positive", () => {
      const result = some((n) => n > 2)(array);
      expect(result).to.equal(true);
    });

    test("negative", () => {
      const result = some((n) => n > 5)(array);
      expect(result).to.equal(false);
    });
  });
});

describe("asyncSome", () => {
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

  describe("async-generator with sync predicate", () => {
    test("positive", async () => {
      const result = await asyncSome((n) => n > 2)(asyncGenerator);
      expect(result).to.eql(true);
    });

    test("negative", async () => {
      const result = await asyncSome((n) => n > 5)(asyncGenerator);
      expect(result).to.eql(false);
    });
  });

  describe("generator with async predicate", () => {
    test("positive", async () => {
      const result = await asyncSome(async (n) => n > 2)(generator);
      expect(result).to.equal(true);
    });

    test("negative", async () => {
      const result = await asyncSome(async (n) => n > 5)(generator);
      expect(result).to.eql(false);
    });
  });

  describe("async-generator with async predicate", () => {
    test("positive", async () => {
      const result = await asyncSome(async (n) => n > 2)(asyncGenerator);
      expect(result).to.eql(true);
    });

    test("negative", async () => {
      const result = await asyncSome(async (n) => n > 5)(asyncGenerator);
      expect(result).to.eql(false);
    });
  });

  describe("array with async predicate", () => {
    test("positive", async () => {
      const result = await asyncSome(async (n) => n > 2)(array);
      expect(result).to.equal(true);
    });

    test("negative", async () => {
      const result = await asyncSome(async (n) => n > 5)(array);
      expect(result).to.eql(false);
    });
  });
});

describe("find", () => {
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

  describe("generator", () => {
    test("positive", () => {
      const result = find((n) => n > 2)(generator);
      expect(result).to.equal(3);
    });

    test("negative", () => {
      const result = find((n) => n > 5)(generator);
      expect(result).to.equal(undefined);
    });
  });

  describe("array", () => {
    test("positive", () => {
      const result = find((n) => n > 2)(array);
      expect(result).to.equal(3);
    });

    test("negative", () => {
      const result = find((n) => n > 5)(array);
      expect(result).to.equal(undefined);
    });
  });
});

describe("asyncFind", () => {
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

  describe("async-generator with sync predicate", () => {
    test("positive", async () => {
      const result = await asyncFind((n) => n > 2)(asyncGenerator);
      expect(result).to.eql(3);
    });

    test("negative", async () => {
      const result = await asyncFind((n) => n > 5)(asyncGenerator);
      expect(result).to.eql(undefined);
    });
  });

  describe("generator with async predicate", () => {
    test("positive", async () => {
      const result = await asyncFind(async (n) => n > 2)(generator);
      expect(result).to.equal(3);
    });

    test("negative", async () => {
      const result = await asyncFind(async (n) => n > 5)(generator);
      expect(result).to.eql(undefined);
    });
  });

  describe("async-generator with async predicate", () => {
    test("positive", async () => {
      const result = await asyncFind(async (n) => n > 2)(asyncGenerator);
      expect(result).to.eql(3);
    });

    test("negative", async () => {
      const result = await asyncFind(async (n) => n > 5)(asyncGenerator);
      expect(result).to.eql(undefined);
    });
  });

  describe("array with async predicate", () => {
    test("positive", async () => {
      const result = await asyncFind(async (n) => n > 2)(array);
      expect(result).to.equal(3);
    });

    test("negative", async () => {
      const result = await asyncFind(async (n) => n > 5)(array);
      expect(result).to.eql(undefined);
    });
  });
});

describe("count", () => {
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
    const result = count(generator);
    expect(result).to.eql(3);
  });

  test("array", () => {
    const result = count(array);
    expect(result).to.eql(3);
  });
});

describe("asyncCount", () => {
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
    const result = await asyncCount(asyncGenerator);
    expect(result).to.equal(3);
  });
});
