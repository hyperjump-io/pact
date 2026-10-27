# Testing

Tests are in JS, next to the code (`src/*.test.js`), and run with vitest.

Every function is tested with:

- A generator, an array, and a `Set` as input. v1 tested mostly
  generators, which can only be iterated once, so it missed that `join`
  repeats the first item of an array: `head` gets its own iterator from
  the array, and then the loop starts over.
- An empty input.
- Closing (see [Close what you open](../principles/close-what-you-open.md)).
  A source that records whether its `return()` was called checks that each
  function that stops early closes it, and that calling a step's
  `return()` closes its source. `zip` is checked with each of its inputs
  running out first.
- For the async versions, a sync source and an async callback.
