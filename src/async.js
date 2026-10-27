/**
 * @module pact/async
 */

export { pipe, compose, range } from "./common.js";

/**
 * @import { AsyncIterableItem } from "./type-utils.d.ts"
 * @import * as API from "./async.d.ts"
 */

/** @type API.map */
export const map = (fn) => async function* (iter) {
  let index = 0;
  for await (const n of iter) {
    yield await fn(n, index++);
  }
};

/** @type API.tap */
export const tap = (fn) => async function* (iter) {
  let index = 0;
  for await (const n of iter) {
    await fn(n, index++);
    yield n;
  }
};

/** @type API.filter */
export const filter = (fn) => async function* (iter) {
  let index = 0;
  for await (const n of iter) {
    if (await fn(n, index++)) {
      yield n;
    }
  }
};

/** @type API.scan */
export const scan = (fn, initial) => async function* (iter) {
  let acc = initial;
  let index = 0;
  for await (const item of iter) {
    acc = await fn(acc, item, index++);
    yield acc;
  }
};

/** @type API.flatten */
export const flatten = (depth = 1) => async function* (iter) {
  for await (const n of iter) {
    if (depth > 0 && n && typeof n === "object" && (Symbol.asyncIterator in n || Symbol.iterator in n)) {
      yield* flatten(depth - 1)(n);
    } else {
      yield n;
    }
  }
};

/** @type API.flatMap */
export const flatMap = (fn) => async function* (iter) {
  let index = 0;
  for await (const n of iter) {
    yield* getFlattenable(await fn(n, index++));
  }
};

/** @type API.drop */
export const drop = (count) => async function* (iter) {
  let index = 0;
  for await (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }
};

/** @type API.dropWhile */
export const dropWhile = (fn) => async function* (iter) {
  let dropping = true;
  let index = 0;
  for await (const n of iter) {
    if (dropping) {
      if (await fn(n, index++)) {
        continue;
      } else {
        dropping = false;
      }
    }

    yield n;
  }
};

/** @type API.take */
export const take = (count) => async function* (iter) {
  const iterator = getAsyncIterator(iter);

  try {
    let remaining = count;
    let current;
    while (remaining-- > 0 && !(current = await iterator.next())?.done) {
      yield current.value;
    }
  } finally {
    await iterator.return?.();
  }
};

/** @type API.takeWhile */
export const takeWhile = (fn) => async function* (iter) {
  let index = 0;
  for await (const n of iter) {
    if (await fn(n, index++)) {
      yield n;
    } else {
      break;
    }
  }
};

/** @type API.head */
export const head = async (iter) => {
  const iterator = getAsyncIterator(iter);
  const result = await iterator.next();
  await iterator.return?.();

  return result.done ? undefined : result.value;
};

/** @type API.empty */
export const empty = async function* () {};

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
export const concat = async function* (...iters) {
  for (const iter of iters) {
    yield* iter;
  }
};

/** @type API.reduce */
export const reduce = (/** @type API.Reducer<any, any> */ fn, /** @type any[] */ ...initial) => async (/** @type Iterable<any> | AsyncIterable<any> */ iter) => {
  let hasAcc = initial.length > 0;
  let acc = initial[0];
  let index = 0;
  for await (const item of iter) {
    if (hasAcc) {
      acc = await fn(acc, item, index);
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
export const every = (fn) => async (iter) => {
  let index = 0;
  for await (const item of iter) {
    if (!await fn(item, index++)) {
      return false;
    }
  }

  return true;
};

/** @type API.some */
export const some = (fn) => async (iter) => {
  let index = 0;
  for await (const item of iter) {
    if (await fn(item, index++)) {
      return true;
    }
  }

  return false;
};

/** @type API.find */
export const find = (fn) => async (iter) => {
  let index = 0;
  for await (const item of iter) {
    if (await fn(item, index++)) {
      return item;
    }
  }
};

/** @type API.forEach */
export const forEach = (fn) => async (iter) => {
  let index = 0;
  for await (const n of iter) {
    await fn(n, index++);
  }
};

/** @type API.count */
export const count = (iter) => reduce((count) => count + 1, 0)(iter);

/** @type API.toArray */
export const toArray = async (iter) => {
  const result = [];
  for await (const item of iter) {
    result.push(item);
  }

  return result;
};

/** @type API.toSet */
export const toSet = async (iter) => {
  /** @type Set<AsyncIterableItem<typeof iter>> */
  const result = new Set();
  for await (const item of iter) {
    result.add(item);
  }

  return result;
};

/** @type API.toMap */
export const toMap = async (iter) => {
  /** @typedef {AsyncIterableItem<typeof iter>[0]} K */
  /** @typedef {AsyncIterableItem<typeof iter>[1]} V */

  /** @type Map<K, V> */
  const result = new Map();
  for await (const [key, value] of iter) {
    result.set(key, value);
  }

  return result;
};

/** @type API.toObject */
export const toObject = async (iter) => {
  /** @typedef {AsyncIterableItem<typeof iter>[1]} V */

  /** @type Record<string, V> */
  const result = Object.create(null);
  for await (const [key, value] of iter) {
    result[key] = value;
  }

  return result;
};

/** @type API.join */
export const join = (separator) => async (iter) => {
  let result = "";
  let prefix = "";

  for await (const n of iter) {
    result += prefix + n;
    prefix = separator;
  }

  return result;
};

/** @type <A>(iter: Iterable<A> | AsyncIterable<A>) => AsyncIterator<A> */
const getAsyncIterator = (iter) => {
  if (Symbol.asyncIterator in iter && typeof iter[Symbol.asyncIterator] === "function") {
    return iter[Symbol.asyncIterator]();
  } else if (Symbol.iterator in iter && typeof iter[Symbol.iterator] === "function") {
    return fromSync(iter);
  } else {
    throw TypeError("`iter` is not iterable");
  }
};

/** @type <A>(iter: Iterable<A>) => AsyncGenerator<A> */
const fromSync = async function* (iter) {
  yield* iter;
};

/** @type <A>(value: Iterable<A> | AsyncIterable<A> | Iterator<A> | AsyncIterator<A>) => Iterable<A> | AsyncIterable<A> */
const getFlattenable = (value) => {
  if (value === null || typeof value !== "object") {
    throw TypeError("Expected an iterable or an iterator");
  }

  return Symbol.asyncIterator in value || Symbol.iterator in value
    ? value
    : { [Symbol.asyncIterator]: () => /** @type AsyncIterator<any> */ (value) };
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
 * of them isn't iterable. Closing is started but not waited for, because
 * this throws before anything is read.
 *
 * @type (values: any[]) => AsyncIterator<any>[]
 */
const openAll = (values) => {
  /** @type AsyncIterator<any>[] */
  const iterators = [];
  try {
    for (const value of values) {
      iterators.push(getAsyncIterator(getFlattenable(value)));
    }
  } catch (error) {
    for (const iterator of iterators) {
      void iterator.return?.();
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
 * stop. The iterators that aren't done are read at the same time for each
 * array. Every iterator that isn't done is closed when it stops, except one
 * that threw.
 *
 * @type (iterators: AsyncIterator<any>[], mode: ZipMode, padding: any[]) => AsyncGenerator<any>
 */
const zipIterators = async function* (iterators, mode, padding) {
  const done = iterators.map(() => false);
  let remaining = iterators.length;

  try {
    while (remaining > 0) {
      const results = await Promise.allSettled(iterators.map((iterator, index) => {
        return done[index] ? undefined : iterator.next();
      }));

      const rejected = results.findIndex((result) => result.status === "rejected");
      if (rejected !== -1) {
        results.forEach((result, index) => {
          if (result.status === "rejected" || (result.status === "fulfilled" && result.value?.done)) {
            done[index] = true;
          }
        });
        throw /** @type PromiseRejectedResult */ (results[rejected]).reason;
      }

      const values = [];
      let finished = 0;
      let continuing = 0;
      for (let index = 0; index < iterators.length; index++) {
        if (done[index]) {
          values.push(padding[index]);
          continue;
        }

        const result = /** @type PromiseFulfilledResult<IteratorResult<any>> */ (results[index]).value;
        if (result.done) {
          done[index] = true;
          remaining--;
          finished++;
          values.push(padding[index]);
        } else {
          continuing++;
          values.push(result.value);
        }
      }

      if (finished > 0) {
        if (mode === "shortest") {
          return;
        } else if (mode === "strict") {
          if (continuing > 0) {
            throw TypeError("The iterables passed to zip in strict mode have different lengths");
          }
          return;
        }
      }

      if (remaining > 0) {
        yield values;
      }
    }
  } finally {
    await Promise.all(iterators.map((iterator, index) => {
      return done[index] ? undefined : iterator.return?.();
    }));
  }
};
