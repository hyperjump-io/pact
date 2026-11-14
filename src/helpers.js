/**
 * @import { ZipOptions, ZipLongestOptions } from "./index.d.ts"
 */

// What the sync and async entry points both use and don't export. It's
// what they work out from their arguments before they open anything, which
// is the same for both.

/**
 * @typedef {"shortest" | "longest" | "strict"} ZipMode
 */

// A count is read as the native helpers read theirs: it's truncated to an
// integer, and one that's NaN or negative throws. Without this, `take(NaN)`
// would never stop.
/** @type (count: number) => number */
export const toCount = (count) => {
  const limit = Math.trunc(Number(count));
  if (Number.isNaN(limit) || limit < 0) {
    throw RangeError("`count` must be a number that's 0 or more");
  }

  return limit;
};

/**
 * What `zip` was called with: what to open, and the padding for each
 * position. The padding is read here, before anything is opened, so
 * padding that throws leaves nothing open.
 *
 * @type (iterables: Iterable<any>, options: ZipOptions | ZipLongestOptions<any> | undefined) => { mode: ZipMode, values: any[], padding: any[] }
 */
export const zipInputs = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const values = [...iterables];

  return { mode, values, padding: mode === "longest" ? readPadding(padding, values.length) : [] };
};

/**
 * Same as `zipInputs`, for `zipKeyed`. `values` and `padding` are in the
 * order of `keys`, which are the keys whose value isn't `undefined`.
 *
 * @type (iterables: Record<PropertyKey, any>, options: ZipOptions | ZipLongestOptions<any> | undefined) => { mode: ZipMode, keys: PropertyKey[], values: any[], padding: any[] }
 */
export const zipKeyedInputs = (iterables, options) => {
  const { mode, padding } = zipOptions(options);
  const keys = Reflect.ownKeys(iterables).filter((key) => {
    return Object.prototype.propertyIsEnumerable.call(iterables, key) && iterables[key] !== undefined;
  });
  const values = keys.map((key) => iterables[key]);

  return { mode, keys, values, padding: mode === "longest" && padding !== undefined ? keys.map((key) => padding[key]) : [] };
};

/**
 * Makes an object from the values `zip` yields, with a key for each
 * position.
 *
 * @type (keys: PropertyKey[]) => (values: any[]) => any
 */
export const toKeyed = (keys) => (values) => {
  const result = Object.create(null);
  keys.forEach((key, index) => {
    result[key] = values[index];
  });

  return result;
};

// Every result is written `{ value, done }`, in that order, so it has the
// same hidden class as the results of the built-in iterators, and code
// reading `done` and `value` only sees one (see
// design/benchmarks/array-sources.md)
/** @type () => IteratorReturnResult<undefined> */
export const finished = () => ({ value: undefined, done: true });

/** @type (options: ZipOptions | ZipLongestOptions<any> | undefined) => { mode: ZipMode, padding: any } */
const zipOptions = (options) => {
  if (options !== undefined && (options === null || typeof options !== "object")) {
    throw TypeError("`options` must be an object");
  }

  const mode = options?.mode ?? "shortest";
  if (mode !== "shortest" && mode !== "longest" && mode !== "strict") {
    throw TypeError("`mode` must be \"shortest\", \"longest\", or \"strict\"");
  }

  const padding = mode === "longest" ? /** @type ZipLongestOptions<any> */ (options)?.padding : undefined;
  if (padding !== undefined && (padding === null || typeof padding !== "object")) {
    throw TypeError("`padding` must be an object");
  }

  return { mode, padding };
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
