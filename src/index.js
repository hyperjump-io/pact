/**
 * @module pact
 */

export { pipe, compose, range } from "./common.js";

/**
 * @import { IterableItem } from "./type-utils.d.ts"
 * @import * as API from "./index.d.ts"
 */

/** @type API.map */
export const map = (fn) => (iter) => new MapIterator(getIterator(iter), fn);

/** @type API.tap */
export const tap = (fn) => (iter) => new TapIterator(getIterator(iter), fn);

/** @type API.filter */
export const filter = (fn) => (iter) => new FilterIterator(getIterator(iter), fn);

/** @type API.scan */
export const scan = (fn, initial) => (iter) => new ScanIterator(getIterator(iter), fn, initial);

/** @type API.flatten */
export const flatten = (depth = 1) => (iter) => new FlattenIterator(getIterator(iter), depth);

/** @type API.flatMap */
export const flatMap = (fn) => (iter) => new FlatMapIterator(getIterator(iter), fn);

/** @type API.drop */
export const drop = (count) => (iter) => new DropIterator(getIterator(iter), count);

/** @type API.dropWhile */
export const dropWhile = (fn) => (iter) => new DropWhileIterator(getIterator(iter), fn);

/** @type API.take */
export const take = (count) => (iter) => new TakeIterator(getIterator(iter), count);

/** @type API.takeWhile */
export const takeWhile = (fn) => (iter) => new TakeWhileIterator(getIterator(iter), fn);

/** @type API.head */
export const head = (iter) => {
  const iterator = getIterator(iter);
  const result = iterator.next();
  iterator.return?.();

  return result.done ? undefined : result.value;
};

/** @type API.empty */
export const empty = () => new ConcatIterator([]);

/** @type API.zip */
export const zip = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const iterators = openAll([...iterables]);
  return new ZipIterator(iterators, mode, mode === "longest" ? readPadding(padding, iterators.length) : []);
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
  })(new ZipIterator(iterators, mode, paddingValues));
};

/** @type API.concat */
export const concat = (...iters) => {
  for (const iter of iters) {
    if (iter === null || typeof iter !== "object" || typeof iter[Symbol.iterator] !== "function") {
      throw TypeError("Expected an iterable");
    }
  }

  return new ConcatIterator(iters);
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

/** @type () => IteratorReturnResult<undefined> */
const finished = () => ({ done: true, value: undefined });

// Each step is a class that extends Iterator, so the native helpers work on
// it. Once it's done, it stays done. Closing it closes its source, and so
// does a callback that throws. An error from the source is passed on
// without closing it, as a generator's for...of does.
// (see design/components/iterators.md)

/**
 * @template A, B
 * @extends {Iterator<B, undefined, unknown>}
 */
class MapIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.Mapper<A, B> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.Mapper<A, B>} fn
   */
  constructor(source, fn) {
    super();
    this.#source = source;
    this.#fn = fn;
  }

  /** @type () => IteratorResult<B, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    const result = this.#source.next();
    if (result.done) {
      this.#done = true;
      return finished();
    }

    try {
      return { done: false, value: this.#fn(result.value, this.#index++) };
    } catch (error) {
      this.return();
      throw error;
    }
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class TapIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.Tapper<A> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.Tapper<A>} fn
   */
  constructor(source, fn) {
    super();
    this.#source = source;
    this.#fn = fn;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    const result = this.#source.next();
    if (result.done) {
      this.#done = true;
      return finished();
    }

    try {
      this.#fn(result.value, this.#index++);
    } catch (error) {
      this.return();
      throw error;
    }

    return result;
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class FilterIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.Predicate<A> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.Predicate<A>} fn
   */
  constructor(source, fn) {
    super();
    this.#source = source;
    this.#fn = fn;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      const result = this.#source.next();
      if (result.done) {
        this.#done = true;
        return finished();
      }

      let keep;
      try {
        keep = this.#fn(result.value, this.#index++);
      } catch (error) {
        this.return();
        throw error;
      }

      if (keep) {
        return result;
      }
    }
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A, B
 * @extends {Iterator<B, undefined, unknown>}
 */
class ScanIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.Reducer<A, B> */
  #fn;
  /** @type B */
  #acc;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.Reducer<A, B>} fn
   * @param {B} initial
   */
  constructor(source, fn, initial) {
    super();
    this.#source = source;
    this.#fn = fn;
    this.#acc = initial;
  }

  /** @type () => IteratorResult<B, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    const result = this.#source.next();
    if (result.done) {
      this.#done = true;
      return finished();
    }

    try {
      this.#acc = this.#fn(this.#acc, result.value, this.#index++);
    } catch (error) {
      this.return();
      throw error;
    }

    return { done: false, value: this.#acc };
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * Reads a stack of iterators, one for each level it's in, down to `depth`
 * levels below its source.
 *
 * @extends {Iterator<any, undefined, unknown>}
 */
class FlattenIterator extends Iterator {
  /** @type Iterator<any>[] */
  #stack;
  /** @type number */
  #depth;

  /**
   * @param {Iterator<any>} source
   * @param {number} depth
   */
  constructor(source, depth) {
    super();
    this.#stack = [source];
    this.#depth = depth;
  }

  /** @type () => IteratorResult<any, undefined> */
  next() {
    while (this.#stack.length > 0) {
      const level = this.#stack.length - 1;

      let result;
      try {
        result = this.#stack[level].next();
      } catch (error) {
        this.#stack.pop();
        this.return();
        throw error;
      }

      if (result.done) {
        this.#stack.pop();
        continue;
      }

      const value = result.value;
      if (level < this.#depth && value && typeof value === "object" && Symbol.iterator in value) {
        this.#stack.push(value[Symbol.iterator]());
        continue;
      }

      return result;
    }

    return finished();
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    while (this.#stack.length > 0) {
      /** @type Iterator<any> */ (this.#stack.pop()).return?.();
    }

    return finished();
  }
}

/**
 * @template A, B
 * @extends {Iterator<B, undefined, unknown>}
 */
class FlatMapIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.FlatMapper<A, B> */
  #fn;
  /** @type Iterator<B> | undefined */
  #inner;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.FlatMapper<A, B>} fn
   */
  constructor(source, fn) {
    super();
    this.#source = source;
    this.#fn = fn;
  }

  /** @type () => IteratorResult<B, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      if (this.#inner) {
        let result;
        try {
          result = this.#inner.next();
        } catch (error) {
          this.#inner = undefined;
          this.return();
          throw error;
        }

        if (!result.done) {
          return result;
        }
        this.#inner = undefined;
      }

      const result = this.#source.next();
      if (result.done) {
        this.#done = true;
        return finished();
      }

      try {
        this.#inner = getIterator(getFlattenable(this.#fn(result.value, this.#index++)));
      } catch (error) {
        this.return();
        throw error;
      }
    }
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#inner?.return?.();
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class DropIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type number */
  #remaining;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {number} count
   */
  constructor(source, count) {
    super();
    this.#source = source;
    this.#remaining = count;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      const result = this.#source.next();
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

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class DropWhileIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.Predicate<A> */
  #fn;
  #dropping = true;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.Predicate<A>} fn
   */
  constructor(source, fn) {
    super();
    this.#source = source;
    this.#fn = fn;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      const result = this.#source.next();
      if (result.done) {
        this.#done = true;
        return finished();
      }

      if (this.#dropping) {
        try {
          this.#dropping = Boolean(this.#fn(result.value, this.#index++));
        } catch (error) {
          this.return();
          throw error;
        }
      }

      if (!this.#dropping) {
        return result;
      }
    }
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class TakeIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type number */
  #remaining;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {number} count
   */
  constructor(source, count) {
    super();
    this.#source = source;
    this.#remaining = count;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    if (this.#remaining <= 0) {
      return this.return();
    }
    this.#remaining--;

    const result = this.#source.next();
    if (result.done) {
      this.#done = true;
      return finished();
    }

    return result;
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class TakeWhileIterator extends Iterator {
  /** @type Iterator<A> */
  #source;
  /** @type API.Predicate<A> */
  #fn;
  #index = 0;
  #done = false;

  /**
   * @param {Iterator<A>} source
   * @param {API.Predicate<A>} fn
   */
  constructor(source, fn) {
    super();
    this.#source = source;
    this.#fn = fn;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    const result = this.#source.next();
    if (result.done) {
      this.#done = true;
      return finished();
    }

    let keep;
    try {
      keep = this.#fn(result.value, this.#index++);
    } catch (error) {
      this.return();
      throw error;
    }

    return keep ? result : this.return();
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#source.return?.();
    }

    return finished();
  }
}

/**
 * Reads each iterable in turn. An iterable isn't opened until the ones
 * before it are done.
 *
 * @template A
 * @extends {Iterator<A, undefined, unknown>}
 */
class ConcatIterator extends Iterator {
  /** @type Iterable<A>[] */
  #iterables;
  /** @type Iterator<A> | undefined */
  #current;
  #index = 0;
  #done = false;

  /**
   * @param {Iterable<A>[]} iterables
   */
  constructor(iterables) {
    super();
    this.#iterables = iterables;
  }

  /** @type () => IteratorResult<A, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    while (true) {
      if (this.#current) {
        const result = this.#current.next();
        if (!result.done) {
          return result;
        }
        this.#current = undefined;
      }

      if (this.#index >= this.#iterables.length) {
        this.#done = true;
        return finished();
      }

      this.#current = this.#iterables[this.#index++][Symbol.iterator]();
    }
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#current?.return?.();
    }

    return finished();
  }
}

/**
 * Yields an array of the next value of each iterator, until `mode` says to
 * stop. Every iterator that isn't done is closed when it stops, except one
 * that threw.
 *
 * @extends {Iterator<any, undefined, unknown>}
 */
class ZipIterator extends Iterator {
  /** @type Iterator<any>[] */
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
   * @param {Iterator<any>[]} iterators
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

  /** @type () => IteratorResult<any, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    try {
      const values = this.#nextValues();
      if (values === undefined) {
        return this.return();
      }
      return { done: false, value: values };
    } catch (error) {
      this.return();
      throw error;
    }
  }

  /** @type () => any[] | undefined */
  #nextValues() {
    if (this.#remaining === 0) {
      return undefined;
    }

    const values = [];
    for (let index = 0; index < this.#iterators.length; index++) {
      if (this.#iteratorDone[index]) {
        values.push(this.#padding[index]);
        continue;
      }

      const result = this.#read(index);
      if (!result.done) {
        values.push(result.value);
        continue;
      }

      this.#remaining--;

      if (this.#mode === "shortest") {
        return undefined;
      } else if (this.#mode === "strict") {
        if (index > 0) {
          throw TypeError("The iterables passed to zip in strict mode have different lengths");
        }
        for (let other = 1; other < this.#iterators.length; other++) {
          if (!this.#read(other).done) {
            throw TypeError("The iterables passed to zip in strict mode have different lengths");
          }
        }
        return undefined;
      }

      values.push(this.#padding[index]);
    }

    return this.#remaining > 0 ? values : undefined;
  }

  /**
   * Reads the next value of one iterator. One that's done, or that throws,
   * isn't closed later.
   *
   * @type (index: number) => IteratorResult<any>
   */
  #read(index) {
    let result;
    try {
      result = this.#iterators[index].next();
    } catch (error) {
      this.#iteratorDone[index] = true;
      throw error;
    }

    if (result.done) {
      this.#iteratorDone[index] = true;
    }

    return result;
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    if (!this.#done) {
      this.#done = true;
      this.#iterators.forEach((iterator, index) => {
        if (!this.#iteratorDone[index]) {
          iterator.return?.();
        }
      });
    }

    return finished();
  }
}
