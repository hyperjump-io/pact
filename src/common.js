import { finished } from "./helpers.js";

/**
 * @import * as API from "./common.d.ts"
 */

/** @type API.range */
export const range = (from, to, step = 1) => {
  if (typeof from !== "number" || (to !== undefined && typeof to !== "number") || typeof step !== "number") {
    throw TypeError("`from`, `to`, and `step` must be numbers");
  }
  if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(step)) {
    throw RangeError("`from`, `to`, and `step` can't be NaN");
  }
  if (step === 0) {
    throw RangeError("`step` can't be 0");
  }

  return new RangeIterator(from, to, step);
};

/** @type API.pipe */
export const pipe = (/** @type any */ value, /** @type ((a: any) => any)[] */ ...fns) => {
  let result = value;
  for (const fn of fns) {
    result = fn(result);
  }

  return result;
};

/** @type API.compose */
export const compose = (/** @type ((a: any) => any)[] */ ...fns) => (/** @type any */ value) => {
  let result = value;
  for (const fn of fns) {
    result = fn(result);
  }

  return result;
};

/** @extends {Iterator<number, undefined, unknown>} */
class RangeIterator extends Iterator {
  /** @type number */
  #from;
  /** @type number | undefined */
  #to;
  /** @type number */
  #step;
  #index = 0;
  #done = false;

  /**
   * @param {number} from
   * @param {number | undefined} to
   * @param {number} step
   */
  constructor(from, to, step) {
    super();
    this.#from = from;
    this.#to = to;
    this.#step = step;
  }

  /** @type () => IteratorResult<number, undefined> */
  next() {
    if (this.#done) {
      return finished();
    }

    // Each value is worked out from its index, as Iterator.range does.
    // Adding `step` to the last value would add up its rounding errors.
    const value = this.#from + this.#index * this.#step;
    if (this.#to !== undefined && (this.#step > 0 ? value >= this.#to : value <= this.#to)) {
      return this.return();
    }

    this.#index++;
    return { value, done: false };
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    this.#done = true;
    return finished();
  }
}
