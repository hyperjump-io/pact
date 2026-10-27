/**
 * @import * as API from "./curry.d.ts"
 */

/** @type API.curry */
export const curry = (/** @type (a: any, b?: any) => (iterable: any) => any */ fn) => (/** @type any[] */ ...args) => {
  /** @typedef {Parameters<ReturnType<typeof fn>>[0]} I */

  const firstApplication = fn.length === 1
    ? /** @type Extract<typeof fn, (a: any) => any> */ (fn)(args[0])
    : fn(args[0], args[1]);
  const iterable = /** @type I */ (args[fn.length]);
  return iterable === undefined ? firstApplication : firstApplication(iterable);
};
