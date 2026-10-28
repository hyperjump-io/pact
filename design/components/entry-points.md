# Entry points

- `@hyperjump/pact` has the sync functions.
- `@hyperjump/pact/async` has the async functions, with the same names.
- `pipe`, `compose`, and `range` are in both.

There are no `async`-prefixed exports (`asyncMap`). Code that uses both
imports them with a namespace (`import * as PactAsync from
"@hyperjump/pact/async"`) or renames them.

- Type names don't have the prefix either. `Mapper`, `Predicate`, and
  `Reducer` from `./async` are the ones whose callbacks can return
  promises, and `NestedIterable` there can nest AsyncIterables.
- `pipe`, `compose`, and `range` are in `src/common.js`, which both entry
  points re-export. It isn't in `exports`.
- Each entry point has its own `.d.ts` next to it, and the API docs
  (`npm run docs`) have a module for each.
- `async.test.js` checks that both entry points export the same names, and
  that `pipe`, `compose`, and `range` are the same functions in both.

```javascript
import * as Pact from "@hyperjump/pact";
import * as PactAsync from "@hyperjump/pact/async";

await Pact.pipe(
  Pact.range(1, 10),
  Pact.filter((n) => n % 2 === 0),
  PactAsync.map(async (n) => n * 2),
  PactAsync.toArray
);
```

A pipeline can start sync and switch to async at the first step that needs
it, because the async functions accept sync iterables.

## Why

The prefixed exports doubled the root module's API, and the two lists drift
apart: v1's `./async` doesn't export `dropWhile`, `takeWhile`, or `find`,
which the root has as `asyncDropWhile`, `asyncTakeWhile`, and `asyncFind`.
With one list per module, a function missing from one is easy to see.

## Rejected

- **Keeping the prefixed exports in the root** as aliases. Two names for
  each async function, and the drift above.
- **Keeping the `Async` prefix on type names** (`AsyncMapper`), so a module
  that imports types from both entry points doesn't have to rename them.
  The function names don't have the prefix, and the types are named after
  what they're for, so they don't either.
