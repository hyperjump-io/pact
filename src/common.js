/**
 * @import * as API from "./common.d.ts"
 */

/** @type API.range */
export const range = function* (from, to) {
  for (let n = from; to === undefined || n < to; n++) {
    yield n;
  }
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
