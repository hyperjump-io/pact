# Iterators

Each function that returns an iterator returns an instance of a small
class written for it, not a generator. The class extends
`Iterator.prototype` (`AsyncIterator.prototype` for async), so the native
helpers work on what pact returns, and it implements `next()` and
`return()`.

- `return()` closes the source and anything else the iterator opened (see
  [Close what you open](../principles/close-what-you-open.md)). A done
  iterator doesn't read its source again.
- The declared return types are `IteratorObject<T>` and
  `AsyncIteratorObject<T>`. They don't promise `throw()`, which generators
  have and these don't.
- `AsyncIterator.prototype` isn't a global. It's found from an async
  generator function's prototype chain when the module loads.

## Why

Plain iterator objects are about 2.2 times faster than generators for a
`filter`, `map`, `reduce` pipeline over a million items, and faster than
array methods (see [Generators](../benchmarks/generators.md)). Async
iterators are about 1.7 times faster than async generators.

## Rejected

- **Generators**, as in v1. They show up when profiling code that uses
  pact. Their one advantage is that `for...of` and `yield*` close sources
  for free, and tests cover that instead.
- **Delegating to the native Iterator helpers.** On Node 22 they're no
  faster than generators for long pipelines. They are faster to set up for
  short pipelines, but most of v1's setup cost was currying and `pipe` (see
  [Pipe](pipe.md)). There are no native async helpers yet.
- **Plain objects that don't extend `Iterator.prototype`.** They'd work, but
  the native helpers wouldn't be available on them, and a user would have
  to wrap them with `Iterator.from`.

## Open questions

- Whether extending `Iterator.prototype` with a class costs anything
  compared to a plain object. It hasn't been measured.
- v2 needs a global `Iterator` (Node 22, and browsers from 2025). Is that
  acceptable as the minimum, or does it need a fallback?
