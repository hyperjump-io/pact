/**
 * @module pact
 */

import { curry } from "./curry.js";

/**
 * @import { AsyncIterableItem, IterableItem } from "./type-utils.d.ts"
 * @import * as API from "./index.d.ts"
 */

/** @type API.map */
export const map = curry((fn) => function* (iter) {
  for (const n of iter) {
    yield fn(n);
  }
});

/** @type API.asyncMap */
export const asyncMap = curry((fn) => async function* (iter) {
  for await (const n of iter) {
    yield fn(n);
  }
});

/** @type API.tap */
export const tap = curry((fn) => function* (iter) {
  for (const n of iter) {
    fn(n);
    yield n;
  }
});

/** @type API.asyncTap */
export const asyncTap = curry((fn) => async function* (iter) {
  for await (const n of iter) {
    await fn(n);
    yield n;
  }
});

/** @type API.filter */
export const filter = curry((fn) => function* (iter) {
  for (const n of iter) {
    if (fn(n)) {
      yield n;
    }
  }
});

/** @type API.asyncFilter */
export const asyncFilter = curry((fn) => async function* (iter) {
  for await (const n of iter) {
    if (await fn(n)) {
      yield n;
    }
  }
});

export const scan = /** @type API.scan */ (curry(
  (/** @type API.Reducer<any, any> */ fn, /** @type any */ initial) => function* (/** @type Iterable<any> */ iter) {
    let acc = initial;
    for (const item of iter) {
      acc = fn(acc, /** @type any */ (item));
      yield acc;
    }
  }
));

export const asyncScan = /** @type API.asyncScan */ (curry(
  (/** @type API.AsyncReducer<any, any> */ fn, /** @type any */ initial) => async function* (/** @type Iterable<any> | AsyncIterable<any> */ iter) {
    let acc = initial;
    for await (const item of iter) {
      acc = await fn(acc, /** @type any */ (item));
      yield acc;
    }
  }
));

/** @type API.flatten */
export const flatten = function* (iter, depth = 1) {
  for (const n of iter) {
    if (depth > 0 && n && typeof n === "object" && Symbol.iterator in n) {
      yield* flatten(n, depth - 1);
    } else {
      yield n;
    }
  }
};

/** @type API.asyncFlatten */
export const asyncFlatten = async function* (iter, depth = 1) {
  for await (const n of iter) {
    if (depth > 0 && n && typeof n === "object" && (Symbol.asyncIterator in n || Symbol.iterator in n)) {
      yield* asyncFlatten(n, depth - 1);
    } else {
      yield n;
    }
  }
};

/** @type API.drop */
export const drop = curry((count) => function* (iter) {
  let index = 0;
  for (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }
});

/** @type API.asyncDrop */
export const asyncDrop = curry((count) => async function* (iter) {
  let index = 0;
  for await (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }
});

/** @type API.dropWhile */
export const dropWhile = curry((fn) => function* (iter) {
  let dropping = true;
  for (const n of iter) {
    if (dropping) {
      if (fn(n)) {
        continue;
      } else {
        dropping = false;
      }
    }

    yield n;
  }
});

/** @type API.asyncDropWhile */
export const asyncDropWhile = curry((fn) => async function* (iter) {
  let dropping = true;
  for await (const n of iter) {
    if (dropping) {
      if (await fn(n)) {
        continue;
      } else {
        dropping = false;
      }
    }

    yield n;
  }
});

/** @type API.take */
export const take = curry((count) => function* (iter) {
  const iterator = getIterator(iter);

  let remaining = count;
  let current;
  while (remaining-- > 0 && !(current = iterator.next())?.done) {
    yield current.value;
  }
});

/** @type API.asyncTake */
export const asyncTake = curry((count) => async function* (iter) {
  const iterator = getAsyncIterator(iter);

  let remaining = count;
  let current;
  while (remaining-- > 0 && !(current = await iterator.next())?.done) {
    yield current.value;
  }
});

/** @type API.takeWhile */
export const takeWhile = curry((fn) => function* (iter) {
  for (const n of iter) {
    if (fn(n)) {
      yield n;
    } else {
      break;
    }
  }
});

/** @type API.asyncTakeWhile */
export const asyncTakeWhile = curry((fn) => async function* (iter) {
  for await (const n of iter) {
    if (await fn(n)) {
      yield n;
    } else {
      break;
    }
  }
});

/** @type API.head */
export const head = (iter) => {
  const iterator = getIterator(iter);
  const result = iterator.next();

  return result.done ? undefined : result.value;
};

/** @type API.asyncHead */
export const asyncHead = async (iter) => {
  const iterator = getAsyncIterator(iter);
  const result = await iterator.next();

  return result.done ? undefined : result.value;
};

/** @type API.range */
export const range = function* (from, to) {
  for (let n = from; to === undefined || n < to; n++) {
    yield n;
  }
};

/** @type API.empty */
export const empty = function* () {};

/** @type API.asyncEmpty */
export const asyncEmpty = async function* () {};

/** @type API.zip */
export const zip = function* (a, b) {
  const bIter = getIterator(b);
  try {
    for (const item1 of a) {
      yield [item1, bIter.next().value];
    }
  } finally {
    bIter.return?.();
  }
};

/** @type API.asyncZip */
export const asyncZip = async function* (a, b) {
  const bIter = getAsyncIterator(b);
  try {
    for await (const item1 of a) {
      yield [item1, (await bIter.next()).value];
    }
  } finally {
    await bIter.return?.();
  }
};

/** @type API.concat */
export const concat = function* (...iters) {
  for (const iter of iters) {
    yield* iter;
  }
};

/** @type API.asyncConcat */
export const asyncConcat = async function* (...iters) {
  for (const iter of iters) {
    yield* iter;
  }
};

export const reduce = /** @type API.reduce */ (curry(
  (/** @type API.Reducer<any, any> */ fn, /** @type any */ initial) => (/** @type Iterable<any> */ iter) => {
    let acc = initial;
    for (const item of iter) {
      acc = fn(acc, /** @type any */ (item));
    }

    return acc;
  }
));

export const asyncReduce = /** @type API.asyncReduce */ (curry(
  (/** @type API.AsyncReducer<any, any> */ fn, /** @type any */ initial) => async (/** @type Iterable<any> | AsyncIterable<any> */ iter) => {
    let acc = initial;
    for await (const item of iter) {
      acc = await fn(acc, /** @type any */ (item));
    }

    return acc;
  }
));

/** @type API.every */
export const every = curry((fn) => (iter) => {
  for (const item of iter) {
    if (!fn(item)) {
      return false;
    }
  }

  return true;
});

/** @type API.asyncEvery */
export const asyncEvery = curry((fn) => async (iter) => {
  for await (const item of iter) {
    if (!await fn(item)) {
      return false;
    }
  }

  return true;
});

/** @type API.some */
export const some = curry((fn) => (iter) => {
  for (const item of iter) {
    if (fn(item)) {
      return true;
    }
  }

  return false;
});

/** @type API.asyncSome */
export const asyncSome = curry((fn) => async (iter) => {
  for await (const item of iter) {
    if (await fn(item)) {
      return true;
    }
  }

  return false;
});

/** @type API.find */
export const find = curry((fn) => (iter) => {
  for (const item of iter) {
    if (fn(item)) {
      return item;
    }
  }
});

/** @type API.asyncFind */
export const asyncFind = curry((fn) => async (iter) => {
  for await (const item of iter) {
    if (await fn(item)) {
      return item;
    }
  }
});

/** @type API.count */
export const count = (iter) => reduce((count) => count + 1, 0, iter);

/** @type API.asyncCount */
export const asyncCount = (iter) => asyncReduce((count) => count + 1, 0, iter);

/** @type API.collectArray */
export const collectArray = (iter) => [...iter];

/** @type API.asyncCollectArray */
export const asyncCollectArray = async (iter) => {
  const result = [];
  for await (const item of iter) {
    result.push(item);
  }

  return result;
};

/** @type API.collectSet */
export const collectSet = (iter) => {
  /** @type Set<IterableItem<typeof iter>> */
  const result = new Set();
  for (const item of iter) {
    result.add(item);
  }

  return result;
};

/** @type API.asyncCollectSet */
export const asyncCollectSet = async (iter) => {
  /** @type Set<AsyncIterableItem<typeof iter>> */
  const result = new Set();
  for await (const item of iter) {
    result.add(item);
  }

  return result;
};

/** @type API.collectMap */
export const collectMap = (iter) => {
  /** @typedef {IterableItem<typeof iter>[0]} K */
  /** @typedef {IterableItem<typeof iter>[1]} V */

  /** @type Map<K, V> */
  const result = new Map();
  for (const [key, value] of iter) {
    result.set(key, value);
  }

  return result;
};

/** @type API.asyncCollectMap */
export const asyncCollectMap = async (iter) => {
  /** @typedef {AsyncIterableItem<typeof iter>[0]} K */
  /** @typedef {AsyncIterableItem<typeof iter>[1]} V */

  /** @type Map<K, V> */
  const result = new Map();
  for await (const [key, value] of iter) {
    result.set(key, value);
  }

  return result;
};

/** @type API.collectObject */
export const collectObject = (iter) => {
  /** @typedef {IterableItem<typeof iter>[1]} V */

  /** @type Record<string, V> */
  const result = Object.create(null);
  for (const [key, value] of iter) {
    result[key] = value;
  }

  return result;
};

/** @type API.asyncCollectObject */
export const asyncCollectObject = async (iter) => {
  /** @typedef {AsyncIterableItem<typeof iter>[1]} V */

  /** @type Record<string, V> */
  const result = Object.create(null);
  for await (const [key, value] of iter) {
    result[key] = value;
  }

  return result;
};

/** @type API.join */
export const join = curry((separator) => (iter) => {
  let result = "";
  let prefix = "";

  for (const n of iter) {
    result += prefix + n;
    prefix = separator;
  }

  return result;
});

/** @type API.asyncJoin */
export const asyncJoin = curry((separator) => async (iter) => {
  let result = "";
  let prefix = "";

  for await (const n of iter) {
    result += prefix + n;
    prefix = separator;
  }

  return result;
});

/** @type <A>(iter: Iterable<A>) => Iterator<A> */
const getIterator = (iter) => {
  if (typeof iter?.[Symbol.iterator] === "function") {
    return iter[Symbol.iterator]();
  } else {
    throw TypeError("`iter` is not iterable");
  }
};

/** @type <A>(iter: Iterable<A> | AsyncIterable<A>) => AsyncIterator<A> */
const getAsyncIterator = (iter) => {
  if (Symbol.asyncIterator in iter && typeof iter[Symbol.asyncIterator] === "function") {
    return iter[Symbol.asyncIterator]();
  } else if (Symbol.iterator in iter && typeof iter[Symbol.iterator] === "function") {
    return asyncMap((a) => a, iter);
  } else {
    throw TypeError("`iter` is not iterable");
  }
};

/** @type API.pipe */
export const pipe = (/** @type any */ acc, /** @type ((a: any) => any)[] */ ...fns) => {
  return reduce((acc, fn) => fn(acc), acc, fns);
};
