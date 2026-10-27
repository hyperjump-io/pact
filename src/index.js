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

  return undefined;
};

/** @type API.tap */
export const tap = (fn) => function* (iter) {
  let index = 0;
  for (const n of iter) {
    fn(n, index++);
    yield n;
  }

  return undefined;
};

/** @type API.filter */
export const filter = (fn) => function* (iter) {
  let index = 0;
  for (const n of iter) {
    if (fn(n, index++)) {
      yield n;
    }
  }

  return undefined;
};

/** @type API.scan */
export const scan = (fn, initial) => function* (iter) {
  let acc = initial;
  let index = 0;
  for (const item of iter) {
    acc = fn(acc, item, index++);
    yield acc;
  }

  return undefined;
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

  return undefined;
};

/** @type API.flatMap */
export const flatMap = (fn) => function* (iter) {
  let index = 0;
  for (const n of iter) {
    yield* getFlattenable(fn(n, index++));
  }

  return undefined;
};

/** @type API.drop */
export const drop = (count) => function* (iter) {
  let index = 0;
  for (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }

  return undefined;
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

  return undefined;
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

  return undefined;
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

  return undefined;
};

/** @type API.head */
export const head = (iter) => {
  const iterator = getIterator(iter);
  const result = iterator.next();
  iterator.return?.();

  return result.done ? undefined : result.value;
};

/** @type API.empty */
export const empty = function* () {
  return undefined;
};

/** @type API.zip */
export const zip = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const iterators = openAll([...iterables]);
  return zipIterators(iterators, mode, mode === "longest" ? readPadding(padding, iterators.length) : []);
};

/** @type API.zipKeyed */
export const zipKeyed = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const keys = Reflect.ownKeys(iterables).filter((key) => {
    return Object.prototype.propertyIsEnumerable.call(iterables, key) && iterables[/** @type any */ (key)] !== undefined;
  });
  const iterators = openAll(keys.map((key) => iterables[/** @type any */ (key)]));
  const paddingValues = mode === "longest" && padding !== undefined
    ? keys.map((key) => /** @type any */ (padding)[key])
    : [];

  return map((/** @type any[] */ values) => {
    const result = Object.create(null);
    keys.forEach((key, index) => {
      result[key] = values[index];
    });
    return result;
  })(zipIterators(iterators, mode, paddingValues));
};

/** @type API.concat */
export const concat = function* (...iters) {
  for (const iter of iters) {
    yield* iter;
  }

  return undefined;
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
    throw TypeError("Expected an iterable or an iterator");
  }

  return Symbol.iterator in value ? value : { [Symbol.iterator]: () => value };
};

/**
 * @typedef {"shortest" | "longest" | "strict"} ZipMode
 */

/** @type (options: API.ZipOptions | API.ZipLongestOptions<any> | undefined) => { mode: ZipMode, padding: any } */
const zipOptions = (options) => {
  if (options !== undefined && (options === null || typeof options !== "object")) {
    throw TypeError("`options` must be an object");
  }

  const mode = options?.mode ?? "shortest";
  if (mode !== "shortest" && mode !== "longest" && mode !== "strict") {
    throw TypeError("`mode` must be \"shortest\", \"longest\", or \"strict\"");
  }

  const padding = mode === "longest" ? /** @type API.ZipLongestOptions<any> */ (options)?.padding : undefined;
  if (padding !== undefined && (padding === null || typeof padding !== "object")) {
    throw TypeError("`padding` must be an object");
  }

  return { mode, padding };
};

/**
 * Gets an iterator from each value, closing the ones it already got if one
 * of them isn't iterable.
 *
 * @type (values: any[]) => Iterator<any>[]
 */
const openAll = (values) => {
  /** @type Iterator<any>[] */
  const iterators = [];
  try {
    for (const value of values) {
      iterators.push(getIterator(getFlattenable(value)));
    }
  } catch (error) {
    for (const iterator of iterators) {
      iterator.return?.();
    }
    throw error;
  }

  return iterators;
};

/** @type (padding: Iterable<any> | undefined, length: number) => any[] */
const readPadding = (padding, length) => {
  /** @type any[] */
  const values = [];
  if (padding !== undefined && length > 0) {
    for (const value of padding) {
      values.push(value);
      if (values.length === length) {
        break;
      }
    }
  }

  return values;
};

/**
 * Yields an array of the next value of each iterator, until `mode` says to
 * stop. Every iterator that isn't done is closed when it stops, except one
 * that threw.
 *
 * @type (iterators: Iterator<any>[], mode: ZipMode, padding: any[]) => Generator<any>
 */
const zipIterators = function* (iterators, mode, padding) {
  const done = iterators.map(() => false);
  let remaining = iterators.length;

  try {
    while (remaining > 0) {
      const values = [];
      for (let index = 0; index < iterators.length; index++) {
        if (done[index]) {
          values.push(padding[index]);
          continue;
        }

        let result;
        try {
          result = iterators[index].next();
        } catch (error) {
          done[index] = true;
          throw error;
        }

        if (!result.done) {
          values.push(result.value);
          continue;
        }

        done[index] = true;
        remaining--;

        if (mode === "shortest") {
          return;
        } else if (mode === "strict") {
          if (index > 0) {
            throw TypeError("The iterables passed to zip in strict mode have different lengths");
          }
          for (let other = 1; other < iterators.length; other++) {
            let otherResult;
            try {
              otherResult = iterators[other].next();
            } catch (error) {
              done[other] = true;
              throw error;
            }
            if (!otherResult.done) {
              throw TypeError("The iterables passed to zip in strict mode have different lengths");
            }
            done[other] = true;
          }
          return;
        }

        values.push(padding[index]);
      }

      if (remaining > 0) {
        yield values;
      }
    }
  } finally {
    iterators.forEach((iterator, index) => {
      if (!done[index]) {
        iterator.return?.();
      }
    });
  }
};
