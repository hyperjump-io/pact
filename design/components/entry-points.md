# Entry points

- `@hyperjump/pact` has the sync functions.
- `@hyperjump/pact/async` has the async functions, with the same names.
- `pipe`, `compose`, and `range` are in both.

There are no `async`-prefixed exports (`asyncMap`). Code that uses both
imports them with a namespace (`import * as Async from
"@hyperjump/pact/async"`) or renames them.

Each entry point has its own `.d.ts` next to it.

## Why

The prefixed exports doubled the root module's API, and the two lists drift
apart: v1's `./async` doesn't export `dropWhile`, `takeWhile`, or `find`,
which the root has as `asyncDropWhile`, `asyncTakeWhile`, and `asyncFind`.
With one list per module, a function missing from one is easy to see.

## Rejected

- **Keeping the prefixed exports in the root** as aliases. Two names for
  each async function, and the drift above.
