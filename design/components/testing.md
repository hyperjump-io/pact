# Testing

Tests are in JS, next to the code (`src/*.test.js`), and run with vitest.
`src/test-utils.js` has the helpers they share. It isn't published.

Each function has its own tests, by kind, in `generators.test.js`,
`reducers.test.js`, `collectors.test.js`, and `composers.test.js`. What
every function has to do is tested in tables, with one row per function,
so a function can't be missed and an API change updates one row:

- `inputs.test.js`: every function with a generator, an array, and a
  `Set`, each empty and not, and the async functions also with an async
  generator. v1 tested mostly generators, which can only be iterated
  once, so it missed that `join` repeated the first item of an array:
  `head` got its own iterator from the array, and then the loop started
  over.
- `closing.test.js` (see [Close what you open](../principles/close-what-you-open.md)):
  everything that stops early closes its source, closing a step closes
  its source, and a callback that throws closes the source. The async
  functions are tested with sync and async sources. A `closable` source
  records whether it was closed. It also counts as closed when it
  finishes, so each test stops before the last item.
- `reuse.test.js`: a step made once and used twice gives the same result
  both times. v1's `take`, `scan`, and `reduce` kept their state in the
  step, so `take(2)` gave nothing the second time and `reduce(add, 0)`
  carried its total over.
- `async.test.js`: both entry points have the same functions (see
  [Entry points](entry-points.md)).
