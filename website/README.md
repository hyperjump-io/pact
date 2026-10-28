# Pact

Higher order functions for iterators and async iterators. Each function is
a step you put in a `pipe`, and a pipeline does its work one value at a
time, only as values are asked for.

```javascript
import { pipe, range, filter, map, reduce } from "@hyperjump/pact";

pipe(
  range(1, 10),
  filter((n) => n % 2 === 0),
  map((n) => n * 2),
  reduce((sum, n) => sum + n, 0)
); // 40
```

- **Composable.** Steps are plain functions. Build a pipeline before it
  has a source with `compose`, and use it with as many sources as you
  like.
- **The platform's names.** `map`, `filter`, `take`, `flatMap`, `toArray`,
  and the rest work like the native Iterator helpers, and pact adds what
  they don't have, like `scan`, `takeWhile`, `zip`, and `toObject`.
- **Sync and async.** `@hyperjump/pact/async` has the same functions for
  async iterables, and its callbacks can return promises.
- **Closes what it opens.** When a pipeline stops early, the iterators it
  was reading are closed, so a generator's `finally` runs.
- **Small and fast.** No dependencies, with TypeScript types, for Node.js
  and browsers.

## Why not array methods?

Each of an array's `filter`, `map`, and the rest makes a whole new array
before the next one starts, and they only work on arrays. A pipeline makes
no arrays in between. It passes each value through every step before it
reads the next one, so it works on any iterable, like a `Set`, a `Map`, a
generator, or one that never ends, and a step like `take` or a collector
like `find` stops reading as soon as it has what it needs. Spreading an
iterable into an array to use array methods reads all of it first.

Using v1? [Migrating from v1](migrating.md) lists what changed.

## Contents

- [Install](install.md): Node.js, browsers, and TypeScript
- [Pipelines](pipelines.md): `pipe`, `compose`, and what a step is
- [Transforming](transforming.md): `map`, `filter`, `take`, and the other
  steps
- [Sources](sources.md): `range`, `concat`, `zip`, and `zipKeyed`
- [Collecting](collecting.md): `toArray`, `reduce`, `find`, and the other
  functions that end a pipeline
- [Async](async.md): async iterables, async callbacks, and mixing them
  with sync ones
- [Migrating from v1](migrating.md): what changed, and what to do about it
