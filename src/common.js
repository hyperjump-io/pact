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
  #next;
  /** @type number | undefined */
  #to;
  /** @type number */
  #step;
  #done = false;

  /**
   * @param {number} from
   * @param {number | undefined} to
   * @param {number} step
   */
  constructor(from, to, step) {
    super();
    this.#next = from;
    this.#to = to;
    this.#step = step;
  }

  /** @type () => IteratorResult<number, undefined> */
  next() {
    if (this.#done) {
      return { value: undefined, done: true };
    }

    const value = this.#next;
    if (this.#to !== undefined && (this.#step > 0 ? value >= this.#to : value <= this.#to)) {
      return this.return();
    }

    this.#next += this.#step;
    return { value, done: false };
  }

  /** @type () => IteratorReturnResult<undefined> */
  return() {
    this.#done = true;
    return { value: undefined, done: true };
  }
}
