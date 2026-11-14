/**
 * @module pact/async
 */

export { pipe, compose, range } from "./common.js";

/**
 * @import { AsyncIterableItem } from "./type-utils.d.ts"
 * @import * as API from "./async.d.ts"
 */

/** @type API.map */
export const map = (fn) => (iter) => new MapIterator(iter, fn);

/** @type API.tap */
export const tap = (fn) => (iter) => new TapIterator(iter, fn);

/** @type API.filter */
export const filter = (fn) => (iter) => new FilterIterator(iter, fn);

/** @type API.scan */
export const scan = (fn, initial) => (iter) => new ScanIterator(iter, fn, initial);

/** @type API.flatten */
export const flatten = (depth = 1) => (iter) => new FlattenIterator(getAsyncIterator(iter), depth);

/** @type API.flatMap */
export const flatMap = (fn) => (iter) => new FlatMapIterator(iter, fn);

/** @type API.drop */
export const drop = (count) => {
  const limit = toCount(count);
  return (iter) => new DropIterator(iter, limit);
};

/** @type API.dropWhile */
export const dropWhile = (fn) => (iter) => new DropWhileIterator(iter, fn);

/** @type API.take */
export const take = (count) => {
  const limit = toCount(count);
  return (iter) => new TakeIterator(iter, limit);
};

/** @type API.takeWhile */
export const takeWhile = (fn) => (iter) => new TakeWhileIterator(iter, fn);

/** @type API.head */
export const head = async (iter) => {
  const iterator = getAsyncIterator(iter);
  const result = await iterator.next();
  await iterator.return?.();

  return result.done ? undefined : result.value;
};

/** @type API.empty */
export const empty = () => new ConcatIterator([]);

/** @type API.zip */
export const zip = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const values = [...iterables];
  const paddingValues = mode === "longest" ? readPadding(padding, values.length) : [];
  return new ZipIterator(openAll(values), mode, paddingValues);
};

/** @type API.zipKeyed */
export const zipKeyed = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const keys = Reflect.ownKeys(iterables).filter((key) => {
    return Object.prototype.propertyIsEnumerable.call(iterables, key) && iterables[/** @type any */ (key)] !== undefined;
  });
  const paddingValues = mode === "longest" && padding !== undefined
    ? keys.map((key) => /** @type any */ (padding)[key])
    : [];
  const iterators = openAll(keys.map((key) => iterables[/** @type any */ (key)]));

  return map((/** @type any[] */ values) => {
    const result = Object.create(null);
    keys.forEach((key, index) => {
      result[key] = values[index];
    });
    return result;
  })(new ZipIterator(iterators, mode, paddingValues));
};

/** @type API.concat */
export const concat = (...iters) => {
  for (const iter of iters) {
    if (!isIterable(iter)) {
      throw TypeError("Expected an iterable or an async iterable");
    }
  }

  return new ConcatIterator(iters);
};

/** @type API.reduce */
export const reduce = (/** @type API.Reducer<any, any> */ fn, /** @type any[] */ ...initial) => async (/** @type Iterable<any> | AsyncIterable<any> */ iter) => {
  let hasAcc = initial.length > 0;
  let acc = initial[0];
  let index = 0;
  for await (const item of iter) {
    if (hasAcc) {
      let value = fn(acc, item, index);
      if (isThenable(value)) {
        value = await value;
      }
      acc = value;
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
    let pass = fn(item, index++);
    if (isThenable(pass)) {
      pass = await pass;
    }
    if (!pass) {
      return false;
    }
  }

  return true;
};

/** @type API.some */
export const some = (fn) => async (iter) => {
  let index = 0;
  for await (const item of iter) {
    let pass = fn(item, index++);
    if (isThenable(pass)) {
      pass = await pass;
    }
    if (pass) {
      return true;
    }
  }

  return false;
};

/** @type API.find */
export const find = (fn) => async (iter) => {
  let index = 0;
  for await (const item of iter) {
    let pass = fn(item, index++);
    if (isThenable(pass)) {
      pass = await pass;
    }
    if (pass) {
      return item;
    }
  }
};

/** @type API.forEach */
export const forEach = (fn) => async (iter) => {
  let index = 0;
  for await (const n of iter) {
    const result = fn(n, index++);
    if (isThenable(result)) {
      await result;
    }
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

// A count is read as the native helpers read theirs: it's truncated to an
// integer, and one that's NaN or negative throws. Without this, `take(NaN)`
// would never stop.
/** @type (count: number) => number */
const toCount = (count) => {
  const limit = Math.trunc(Number(count));
  if (Number.isNaN(limit) || limit < 0) {
    throw RangeError("`count` must be a number that's 0 or more");
  }

  return limit;
};

/** @type (value: unknown) => boolean */
const isIterable = (value) => {
  return value !== null && typeof value === "object"
    && (typeof (/** @type any */ (value))[Symbol.asyncIterator] === "function" || typeof (/** @type any */ (value))[Symbol.iterator] === "function");
};

/** @type <A>(iter: Iterable<A> | AsyncIterable<A>) => AsyncIterator<A> */
const getAsyncIterator = (iter) => {
  if (Symbol.asyncIterator in iter && typeof iter[Symbol.asyncIterator] === "function") {
    return iter[Symbol.asyncIterator]();
  } else if (Symbol.iterator in iter && typeof iter[Symbol.iterator] === "function") {
    return new FromSyncIterator(iter[Symbol.iterator]());
  } else {
    throw TypeError("`iter` is not iterable");
  }
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
 * this throws before anything is read, and an error from closing is dropped,
 * because the error that stopped it is the one to pass on.
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
    void closeAll(iterators).catch(() => {});
    throw error;
  }

  return iterators;
};

/**
 * Closes every iterator, one after the other, even if closing one of them
 * throws, and then throws the first error, as the native helpers do.
 *
 * @type (iterators: (AsyncIterator<any> | undefined)[]) => Promise<void>
 */
const closeAll = async (iterators) => {
  let failed = false;
  let firstError;
  for (const iterator of iterators) {
    try {
      await iterator?.return?.();
    } catch (error) {
      if (!failed) {
        failed = true;
        firstError = error;
      }
    }
  }

  if (failed) {
    throw firstError;
  }
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

// `{ value, done }`, in that order, as in index.js
/** @type () => IteratorReturnResult<undefined> */
const finished = () => ({ value: undefined, done: true });

// The method a step implements to read its next result, and the one it
// implements to close. AsyncStep calls them one at a time.
const pull = Symbol("pull");
const close = Symbol("close");

const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {}).prototype);

/**
 * The base of every async step. It has AsyncIterator.prototype in its
 * prototype chain, and it queues calls to `next()` and `return()`, so each
 * one starts when the one before it is done, as an async generator's do. A
 * call that's made when nothing is in progress starts right away. A step
 * that closes itself, because a callback threw or it's done early, calls
 * `[close]()` directly, because `return()` would wait for the call it's in.
 * (see design/components/iterators.md)
 *
 * @template A
 */
class AsyncStep {
  #busy = false;
  /** @type {{ method: typeof pull | typeof close, resolve: (value: any) => void, reject: (reason: unknown) => void }[]} */
  #waiting = [];

  /** @type () => Promise<IteratorResult<A, undefined>> */
  next() {
    return this.#call(pull);
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  return() {
    return this.#call(close);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  // As the spec defines it on AsyncIterator.prototype, which doesn't have it
  // in every engine yet
  /** @type () => Promise<void> */
  async [Symbol.asyncDispose]() {
    await this.return();
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    return finished();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    return finished();
  }

  /** @type (method: typeof pull | typeof close) => Promise<any> */
  #call(method) {
    if (this.#busy) {
      return new Promise((resolve, reject) => {
        this.#waiting.push({ method, resolve, reject });
      });
    }

    return this.#run(method);
  }

  /** @type (method: typeof pull | typeof close) => Promise<any> */
  #run(method) {
    this.#busy = true;

    /** @type Promise<any> */
    let result;
    try {
      result = this[method]();
    } catch (error) {
      result = Promise.reject(error);
    }

    result.then(this.#release, this.#release);
    return result;
  }

  #release = () => {
    const waiting = this.#waiting.shift();
    if (waiting) {
      this.#run(waiting.method).then(waiting.resolve, waiting.reject);
    } else {
      this.#busy = false;
    }
  };
}
Object.setPrototypeOf(AsyncStep.prototype, AsyncIteratorPrototype);

/**
 * Adapts a sync iterator to the async protocol. A value that's a promise is
 * waited for, and if it rejects, the iterator is closed.
 *
 * @template A
 * @extends {AsyncStep<A>}
 */
class FromSyncIterator extends AsyncStep {
  /** @type Iterator<A | PromiseLike<A>> */
  #source;
  #done = false;

  /**
   * @param {Iterator<A | PromiseLike<A>>} source
   */
  constructor(source) {
    super();
    this.#source = source;
  }

  // Most values aren't promises, so this isn't an async function, which
  // would wait an extra turn for each of them
  /** @type () => Promise<IteratorResult<A, undefined>> */
  [pull]() {
    if (this.#done) {
      return Promise.resolve(finished());
    }

    let result;
    try {
      result = this.#source.next();
    } catch (error) {
      this.#done = true;
      throw error;
    }
    if (result.done) {
      this.#done = true;
      return Promise.resolve(finished());
    }

    const value = result.value;
    if (isThenable(value)) {
      return this.#settle(value);
    }

    return Promise.resolve({ value, done: false });
  }

  /** @type (value: PromiseLike<A>) => Promise<IteratorResult<A, undefined>> */
  async #settle(value) {
    try {
      return { value: await value, done: false };
    } catch (error) {
      await this[close]();
      throw error;
    }
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  [close]() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return Promise.resolve(finished());
  }
}

/** @type (value: unknown) => value is PromiseLike<any> */
const isThenable = (value) => {
  return value !== null && (typeof value === "object" || typeof value === "function")
    && typeof (/** @type any */ (value)).then === "function";
};

// A step reads an array that iterates with the built-in iterator, and
// doesn't have an async iterator, by index instead of through
// FromSyncIterator, and only waits for a value that's a promise. Each step
// has its own #read(), as in index.js (see
// design/benchmarks/array-sources.md).
/** @type <A>(iter: Iterable<A> | AsyncIterable<A>) => iter is A[] */
const isPlainArray = (iter) => {
  return Array.isArray(iter) && iter[Symbol.iterator] === arrayIterator && !(Symbol.asyncIterator in iter);
};

const arrayIterator = Array.prototype[Symbol.iterator];

/**
 * Waits for a value from an array that's a promise, as FromSyncIterator
 * does.
 *
 * @type <A>(value: PromiseLike<A>) => Promise<IteratorResult<A, undefined>>
 */
const settle = async (value) => ({ value: await value, done: false });

/**
 * @template A, B
 * @extends {AsyncStep<B>}
 */
class MapIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.Mapper<A, B> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.Mapper<A, B>} fn
   */
  constructor(iter, fn) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
  }

  /** @type () => Promise<IteratorResult<B, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    let result;
    try {
      result = this.#read();
      if (isThenable(result)) {
        result = await result;
      }
    } catch (error) {
      this.#done = true;
      throw error;
    }
    if (result.done) {
      this.#done = true;
      return finished();
    }

    try {
      let value = this.#fn(result.value, this.#index++);
      if (isThenable(value)) {
        value = await value;
      }
      return { value, done: false };
    } catch (error) {
      await this[close]();
      throw error;
    }
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {AsyncStep<A>}
 */
class TapIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.Tapper<A> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.Tapper<A>} fn
   */
  constructor(iter, fn) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    let result;
    try {
      result = this.#read();
      if (isThenable(result)) {
        result = await result;
      }
    } catch (error) {
      this.#done = true;
      throw error;
    }
    if (result.done) {
      this.#done = true;
      return finished();
    }

    try {
      const tapped = this.#fn(result.value, this.#index++);
      if (isThenable(tapped)) {
        await tapped;
      }
    } catch (error) {
      await this[close]();
      throw error;
    }

    return result;
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {AsyncStep<A>}
 */
class FilterIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.Predicate<A> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.Predicate<A>} fn
   */
  constructor(iter, fn) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      let result;
      try {
        result = this.#read();
        if (isThenable(result)) {
          result = await result;
        }
      } catch (error) {
        this.#done = true;
        throw error;
      }
      if (result.done) {
        this.#done = true;
        return finished();
      }

      let keep;
      try {
        keep = this.#fn(result.value, this.#index++);
        if (isThenable(keep)) {
          keep = await keep;
        }
      } catch (error) {
        await this[close]();
        throw error;
      }

      if (keep) {
        return result;
      }
    }
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * @template A, B
 * @extends {AsyncStep<B>}
 */
class ScanIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.Reducer<A, B> */
  #fn;
  /** @type B */
  #acc;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.Reducer<A, B>} fn
   * @param {B} initial
   */
  constructor(iter, fn, initial) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
    this.#acc = initial;
  }

  /** @type () => Promise<IteratorResult<B, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    let result;
    try {
      result = this.#read();
      if (isThenable(result)) {
        result = await result;
      }
    } catch (error) {
      this.#done = true;
      throw error;
    }
    if (result.done) {
      this.#done = true;
      return finished();
    }

    try {
      let acc = this.#fn(this.#acc, result.value, this.#index++);
      if (isThenable(acc)) {
        acc = await acc;
      }
      this.#acc = acc;
    } catch (error) {
      await this[close]();
      throw error;
    }

    return { value: this.#acc, done: false };
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * Reads a stack of iterators, one for each level it's in, down to `depth`
 * levels below its source.
 *
 * @extends {AsyncStep<any>}
 */
class FlattenIterator extends AsyncStep {
  /** @type AsyncIterator<any>[] */
  #stack;
  /** @type number */
  #depth;

  /**
   * @param {AsyncIterator<any>} source
   * @param {number} depth
   */
  constructor(source, depth) {
    super();
    this.#stack = [source];
    this.#depth = depth;
  }

  /** @type () => Promise<IteratorResult<any, undefined>> */
  async [pull]() {
    while (this.#stack.length > 0) {
      const level = this.#stack.length - 1;

      let result;
      try {
        result = await this.#stack[level].next();
      } catch (error) {
        this.#stack.pop();
        await this[close]();
        throw error;
      }

      if (result.done) {
        this.#stack.pop();
        continue;
      }

      const value = result.value;
      if (level < this.#depth && value && typeof value === "object" && (Symbol.asyncIterator in value || Symbol.iterator in value)) {
        try {
          this.#stack.push(getAsyncIterator(value));
        } catch (error) {
          await this[close]();
          throw error;
        }
        continue;
      }

      return result;
    }

    return finished();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    await closeAll(this.#stack.splice(0).reverse());

    return finished();
  }
}

/**
 * @template A, B
 * @extends {AsyncStep<B>}
 */
class FlatMapIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.FlatMapper<A, B> */
  #fn;
  /** @type AsyncIterator<B> | undefined */
  #inner;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.FlatMapper<A, B>} fn
   */
  constructor(iter, fn) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
  }

  /** @type () => Promise<IteratorResult<B, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      if (this.#inner) {
        let result;
        try {
          result = await this.#inner.next();
        } catch (error) {
          this.#inner = undefined;
          await this[close]();
          throw error;
        }

        if (!result.done) {
          return result;
        }
        this.#inner = undefined;
      }

      let result;
      try {
        result = this.#read();
        if (isThenable(result)) {
          result = await result;
        }
      } catch (error) {
        this.#done = true;
        throw error;
      }
      if (result.done) {
        this.#done = true;
        return finished();
      }

      try {
        let mapped = this.#fn(result.value, this.#index++);
        if (isThenable(mapped)) {
          mapped = await mapped;
        }
        this.#inner = getAsyncIterator(getFlattenable(mapped));
      } catch (error) {
        await this[close]();
        throw error;
      }
    }
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await closeAll([this.#inner, this.#source]);
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {AsyncStep<A>}
 */
class DropIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type number */
  #remaining;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {number} count
   */
  constructor(iter, count) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#remaining = count;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      let result;
      try {
        result = this.#read();
        if (isThenable(result)) {
          result = await result;
        }
      } catch (error) {
        this.#done = true;
        throw error;
      }
      if (result.done) {
        this.#done = true;
        return finished();
      }

      if (this.#remaining > 0) {
        this.#remaining--;
      } else {
        return result;
      }
    }
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {AsyncStep<A>}
 */
class DropWhileIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.Predicate<A> */
  #fn;
  #dropping = true;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.Predicate<A>} fn
   */
  constructor(iter, fn) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      let result;
      try {
        result = this.#read();
        if (isThenable(result)) {
          result = await result;
        }
      } catch (error) {
        this.#done = true;
        throw error;
      }
      if (result.done) {
        this.#done = true;
        return finished();
      }

      if (this.#dropping) {
        try {
          let drop = this.#fn(result.value, this.#index++);
          if (isThenable(drop)) {
            drop = await drop;
          }
          this.#dropping = Boolean(drop);
        } catch (error) {
          await this[close]();
          throw error;
        }
      }

      if (!this.#dropping) {
        return result;
      }
    }
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {AsyncStep<A>}
 */
class TakeIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type number */
  #remaining;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {number} count
   */
  constructor(iter, count) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#remaining = count;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    if (this.#remaining <= 0) {
      return this[close]();
    }
    this.#remaining--;

    let result;
    try {
      result = this.#read();
      if (isThenable(result)) {
        result = await result;
      }
    } catch (error) {
      this.#done = true;
      throw error;
    }
    if (result.done) {
      this.#done = true;
      return finished();
    }

    return result;
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {AsyncStep<A>}
 */
class TakeWhileIterator extends AsyncStep {
  /** @type AsyncIterator<A> | undefined */
  #source;
  /** @type (A | PromiseLike<A>)[] | undefined */
  #array;
  #position = 0;
  /** @type API.Predicate<A> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A> | AsyncIterable<A>} iter
   * @param {API.Predicate<A>} fn
   */
  constructor(iter, fn) {
    super();
    if (isPlainArray(iter)) {
      this.#array = iter;
    } else {
      this.#source = getAsyncIterator(iter);
    }
    this.#fn = fn;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    let result;
    try {
      result = this.#read();
      if (isThenable(result)) {
        result = await result;
      }
    } catch (error) {
      this.#done = true;
      throw error;
    }
    if (result.done) {
      this.#done = true;
      return finished();
    }

    let keep;
    try {
      keep = this.#fn(result.value, this.#index++);
      if (isThenable(keep)) {
        keep = await keep;
      }
    } catch (error) {
      await this[close]();
      throw error;
    }

    return keep ? result : this[close]();
  }

  /** @type () => IteratorResult<A, undefined> | Promise<IteratorResult<A, undefined>> */
  #read() {
    if (this.#array) {
      if (this.#position >= this.#array.length) {
        return finished();
      }

      const value = this.#array[this.#position++];
      if (isThenable(value)) {
        return settle(value);
      }

      return { value, done: false };
    }

    return /** @type AsyncIterator<A, undefined> */ (this.#source).next();
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#source?.return?.();
    }

    return finished();
  }
}

/**
 * Reads each iterable in turn. An iterable isn't opened until the ones
 * before it are done.
 *
 * @template A
 * @extends {AsyncStep<A>}
 */
class ConcatIterator extends AsyncStep {
  /** @type (Iterable<A> | AsyncIterable<A>)[] */
  #iterables;
  /** @type AsyncIterator<A> | undefined */
  #current;
  #index = 0;
  #done = false;

  /**
   * @param {(Iterable<A> | AsyncIterable<A>)[]} iterables
   */
  constructor(iterables) {
    super();
    this.#iterables = iterables;
  }

  /** @type () => Promise<IteratorResult<A, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    try {
      while (true) {
        if (this.#current) {
          const result = await this.#current.next();
          if (!result.done) {
            return result;
          }
          this.#current = undefined;
        }

        if (this.#index >= this.#iterables.length) {
          this.#done = true;
          return finished();
        }

        this.#current = getAsyncIterator(this.#iterables[this.#index++]);
      }
    } catch (error) {
      this.#done = true;
      throw error;
    }
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      await this.#current?.return?.();
    }

    return finished();
  }
}

/**
 * Yields an array of the next value of each iterator, until `mode` says to
 * stop. The iterators that aren't done are read at the same time for each
 * array. Every iterator that isn't done is closed when it stops, except one
 * that threw.
 *
 * @extends {AsyncStep<any>}
 */
class ZipIterator extends AsyncStep {
  /** @type AsyncIterator<any>[] */
  #iterators;
  /** @type ZipMode */
  #mode;
  /** @type any[] */
  #padding;
  /** @type boolean[] */
  #iteratorDone;
  /** @type number */
  #remaining;
  #done = false;

  /**
   * @param {AsyncIterator<any>[]} iterators
   * @param {ZipMode} mode
   * @param {any[]} padding
   */
  constructor(iterators, mode, padding) {
    super();
    this.#iterators = iterators;
    this.#mode = mode;
    this.#padding = padding;
    this.#iteratorDone = iterators.map(() => false);
    this.#remaining = iterators.length;
  }

  /** @type () => Promise<IteratorResult<any, undefined>> */
  async [pull]() {
    if (this.#done) {
      return finished();
    }

    try {
      const values = await this.#nextValues();
      if (values === undefined) {
        return await this[close]();
      }
      return { value: values, done: false };
    } catch (error) {
      await this[close]();
      throw error;
    }
  }

  /** @type () => Promise<any[] | undefined> */
  async #nextValues() {
    if (this.#remaining === 0) {
      return undefined;
    }

    const results = await Promise.allSettled(this.#iterators.map((iterator, index) => {
      return this.#iteratorDone[index] ? undefined : iterator.next();
    }));

    // One that's done, or that threw, isn't closed later
    let rejected;
    let finishedCount = 0;
    let continuing = 0;
    const values = [];
    for (let index = 0; index < this.#iterators.length; index++) {
      if (this.#iteratorDone[index]) {
        values.push(this.#padding[index]);
        continue;
      }

      const settled = results[index];
      if (settled.status === "rejected") {
        this.#iteratorDone[index] = true;
        rejected ??= settled;
        continue;
      }

      const result = /** @type IteratorResult<any> */ (settled.value);
      if (result.done) {
        this.#iteratorDone[index] = true;
        this.#remaining--;
        finishedCount++;
        values.push(this.#padding[index]);
      } else {
        continuing++;
        values.push(result.value);
      }
    }

    if (rejected) {
      throw rejected.reason;
    }

    if (finishedCount > 0) {
      if (this.#mode === "shortest") {
        return undefined;
      } else if (this.#mode === "strict") {
        if (continuing > 0) {
          throw TypeError("The iterables passed to zip in strict mode have different lengths");
        }
        return undefined;
      }
    }

    return this.#remaining > 0 ? values : undefined;
  }

  /** @type () => Promise<IteratorReturnResult<undefined>> */
  async [close]() {
    if (!this.#done) {
      this.#done = true;
      // At the same time, as they're read. The callback is async so that a
      // `return()` that throws doesn't stop the others being closed.
      const results = await Promise.allSettled(this.#iterators.map(async (iterator, index) => {
        return this.#iteratorDone[index] ? undefined : iterator.return?.();
      }));
      const rejected = results.find((result) => result.status === "rejected");
      if (rejected) {
        throw rejected.reason;
      }
    }

    return finished();
  }
}
