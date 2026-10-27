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
  let index = 0;
  for (const n of iter) {
    yield fn(n, index++);
  }
};

/** @type API.tap */
export const tap = (fn) => function* (iter) {
  let index = 0;
  for (const n of iter) {
    fn(n, index++);
    yield n;
  }
};

/** @type API.filter */
export const filter = (fn) => function* (iter) {
  let index = 0;
  for (const n of iter) {
    if (fn(n, index++)) {
      yield n;
    }
  }
};

/** @type API.scan */
export const scan = (fn, initial) => function* (iter) {
  let acc = initial;
  let index = 0;
  for (const item of iter) {
    acc = fn(acc, item, index++);
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

/** @type API.flatMap */
export const flatMap = (fn) => function* (iter) {
  let index = 0;
  for (const n of iter) {
    yield* getFlattenable(fn(n, index++));
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
  let index = 0;
  for (const n of iter) {
    if (dropping) {
      if (fn(n, index++)) {
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
  let index = 0;
  for (const n of iter) {
    if (fn(n, index++)) {
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
export const reduce = (/** @type API.Reducer<any, any> */ fn, /** @type any[] */ ...initial) => (/** @type Iterable<any> */ iter) => {
  let hasAcc = initial.length > 0;
  let acc = initial[0];
  let index = 0;
  for (const item of iter) {
    if (hasAcc) {
      acc = fn(acc, item, index);
    } else {
      acc = item;
      hasAcc = true;
    }
    index++;
  }

  if (!hasAcc) {
    throw TypeError("Reduce of an empty iterator with no initial value");
  }

  return acc;
};

/** @type API.every */
export const every = (fn) => (iter) => {
  let index = 0;
  for (const item of iter) {
    if (!fn(item, index++)) {
      return false;
    }
  }

  return true;
};

/** @type API.some */
export const some = (fn) => (iter) => {
  let index = 0;
  for (const item of iter) {
    if (fn(item, index++)) {
      return true;
    }
  }

  return false;
};

/** @type API.find */
export const find = (fn) => (iter) => {
  let index = 0;
  for (const item of iter) {
    if (fn(item, index++)) {
      return item;
    }
  }
};

/** @type API.forEach */
export const forEach = (fn) => (iter) => {
  let index = 0;
  for (const n of iter) {
    fn(n, index++);
  }
};

/** @type API.count */
export const count = (iter) => reduce((count) => count + 1, 0)(iter);

/** @type API.toArray */
export const toArray = (iter) => [...iter];

/** @type API.toSet */
export const toSet = (iter) => {
  /** @type Set<IterableItem<typeof iter>> */
  const result = new Set();
  for (const item of iter) {
    result.add(item);
  }

  return result;
};

/** @type API.toMap */
export const toMap = (iter) => {
  /** @typedef {IterableItem<typeof iter>[0]} K */
  /** @typedef {IterableItem<typeof iter>[1]} V */

  /** @type Map<K, V> */
  const result = new Map();
  for (const [key, value] of iter) {
    result.set(key, value);
  }

  return result;
};

/** @type API.toObject */
export const toObject = (iter) => {
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

/** @type <A>(value: Iterable<A> | Iterator<A>) => Iterable<A> */
const getFlattenable = (value) => {
  if (value === null || typeof value !== "object") {
    throw TypeError("`fn` must return an iterable or an iterator");
  }

  return Symbol.iterator in value ? value : { [Symbol.iterator]: () => value };
};
