const curry = require("just-curry-it");


module.exports = curry(async (fn, acc, doc) => {
  return (await doc).reduce(async (acc, item) => {
    let resolvedAcc;
    try {
      resolvedAcc = await acc;
    } catch (e) {
      try {
        await item;
      } catch (e) {
        // If we've already encountered an error, ignore subsequent errors.
      }

      return acc;
    }

    return fn(resolvedAcc, item);
  }, acc);
});
