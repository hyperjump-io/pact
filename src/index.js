/**
 * @module pact
 */

export { pipe, compose, range } from "./common.js";

/**
 * @import { IterableItem } from "./type-utils.d.ts"
 * @import * as API from "./index.d.ts"
 */

/** @type API.map */
export const map = (fn) => function* (iter) {
  for (const n of iter) {
    yield fn(n);
  }
};

/** @type API.tap */
export const tap = (fn) => function* (iter) {
  for (const n of iter) {
    fn(n);
    yield n;
  }
};

/** @type API.filter */
export const filter = (fn) => function* (iter) {
  for (const n of iter) {
    if (fn(n)) {
      yield n;
    }
  }
};

/** @type API.scan */
export const scan = (fn, initial) => function* (iter) {
  let acc = initial;
  for (const item of iter) {
    acc = fn(acc, item);
    yield acc;
  }
};

/** @type API.flatten */
export const flatten = (depth = 1) => function* (iter) {
  for (const n of iter) {
    if (depth > 0 && n && typeof n === "object" && Symbol.iterator in n) {
      yield* flatten(depth - 1)(n);
    } else {
      yield n;
    }
  }
};

/** @type API.drop */
export const drop = (count) => function* (iter) {
  let index = 0;
  for (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }
};

/** @type API.dropWhile */
export const dropWhile = (fn) => function* (iter) {
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
};

/** @type API.take */
export const take = (count) => function* (iter) {
  const iterator = getIterator(iter);

  try {
    let remaining = count;
    let current;
    while (remaining-- > 0 && !(current = iterator.next())?.done) {
      yield current.value;
    }
  } finally {
    iterator.return?.();
  }
};

/** @type API.takeWhile */
export const takeWhile = (fn) => function* (iter) {
  for (const n of iter) {
    if (fn(n)) {
      yield n;
    } else {
      break;
    }
  }
};

/** @type API.head */
export const head = (iter) => {
  const iterator = getIterator(iter);
  const result = iterator.next();
  iterator.return?.();

  return result.done ? undefined : result.value;
};

/** @type API.empty */
export const empty = function* () {};

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

/** @type API.concat */
export const concat = function* (...iters) {
  for (const iter of iters) {
    yield* iter;
  }
};

/** @type API.reduce */
export const reduce = (fn, initial) => (iter) => {
  let acc = initial;
  for (const item of iter) {
    acc = fn(acc, item);
  }

  return acc;
};

/** @type API.every */
export const every = (fn) => (iter) => {
  for (const item of iter) {
    if (!fn(item)) {
      return false;
    }
  }

  return true;
};

/** @type API.some */
export const some = (fn) => (iter) => {
  for (const item of iter) {
    if (fn(item)) {
      return true;
    }
  }

  return false;
};

/** @type API.find */
export const find = (fn) => (iter) => {
  for (const item of iter) {
    if (fn(item)) {
      return item;
    }
  }
};

/** @type API.count */
export const count = (iter) => reduce((count) => count + 1, 0)(iter);

/** @type API.collectArray */
export const collectArray = (iter) => [...iter];

/** @type API.collectSet */
export const collectSet = (iter) => {
  /** @type Set<IterableItem<typeof iter>> */
  const result = new Set();
  for (const item of iter) {
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

/** @type API.join */
export const join = (separator) => (iter) => {
  let result = "";
  let prefix = "";

  for (const n of iter) {
    result += prefix + n;
    prefix = separator;
  }

  return result;
};

/** @type <A>(iter: Iterable<A>) => Iterator<A> */
const getIterator = (iter) => {
  if (typeof iter?.[Symbol.iterator] === "function") {
    return iter[Symbol.iterator]();
  } else {
    throw TypeError("`iter` is not iterable");
  }
};
