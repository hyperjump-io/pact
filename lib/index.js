import curry from "just-curry-it";


export const map = curry(function* (fn, iter) {
  for (const n of iter) {
    yield fn(n);
  }
});

export const asyncMap = curry(async function* (fn, iter) {
  for await (const n of iter) {
    yield fn(n);
  }
});

export const filter = curry(function* (fn, iter) {
  for (const n of iter) {
    if (fn(n)) {
      yield n;
    }
  }
});

export const asyncFilter = curry(async function* (fn, iter) {
  for await (const n of iter) {
    if (await fn(n)) {
      yield n;
    }
  }
});

export const drop = curry(function* (count, iter) {
  let index = 0;
  for (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }
});

export const asyncDrop = curry(async function* (count, iter) {
  let index = 0;
  for await (const item of iter) {
    if (index++ >= count) {
      yield item;
    }
  }
});

export const take = curry(function* (count, iter) {
  let index = 0;
  for (const item of iter) {
    if (index++ >= count) {
      break;
    }

    yield item;
  }
});

export const asyncTake = curry(async function* (count, iter) {
  let index = 0;
  for await (const item of iter) {
    if (index++ >= count) {
      break;
    }

    yield item;
  }
});

export const range = function* (from, to) {
  for (let n = from; n < to || to === undefined; n++) {
    yield n;
  }
};

export const reduce = curry((fn, acc, iter) => {
  for (const item of iter) {
    acc = fn(acc, item);
  }

  return acc;
});

export const asyncReduce = curry(async (fn, acc, iter) => {
  for await (const item of iter) {
    acc = await fn(acc, item);
  }

  return acc;
});

export const every = curry((fn, iter) => {
  for (const item of iter) {
    if (!fn(item)) {
      return false;
    }
  }

  return true;
});

export const asyncEvery = curry(async (fn, iter) => {
  for await (const item of iter) {
    if (!await fn(item)) {
      return false;
    }
  }

  return true;
});

export const some = curry((fn, iter) => {
  for (const item of iter) {
    if (fn(item)) {
      return true;
    }
  }

  return false;
});

export const asyncSome = curry(async (fn, iter) => {
  for await (const item of iter) {
    if (await fn(item)) {
      return true;
    }
  }

  return false;
});

export const collectArray = (iter) => [...iter];
export const asyncCollectArray = async (iter) => {
  const result = [];
  for await (const item of iter) {
    result.push(item);
  }

  return result;
};

export const collectSet = (iter) => {
  const result = new Set();
  for (const item of iter) {
    result.add(item);
  }

  return result;
};

export const asyncCollectSet = async (iter) => {
  const result = new Set();
  for await (const item of iter) {
    result.add(item);
  }

  return result;
};

export const collectMap = (iter) => {
  const result = new Map();
  for (const [key, value] of iter) {
    result.set(key, value);
  }

  return result;
};

export const asyncCollectMap = async (iter) => {
  const result = new Map();
  for await (const [key, value] of iter) {
    result.set(key, value);
  }

  return result;
};

export const collectObject = (iter) => {
  const result = Object.create(null);
  for (const [key, value] of iter) {
    result[key] = value;
  }

  return result;
};

export const asyncCollectObject = async (iter) => {
  const result = Object.create(null);
  for await (const [key, value] of iter) {
    result[key] = value;
  }

  return result;
};

export const pipeline = (acc, ...fns) => reduce((acc, fn) => fn(acc), acc, fns);
export const compose = (...fns) => (acc) => reduce((acc, fn) => fn(acc), acc, fns);
