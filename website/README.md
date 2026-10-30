# Pact

Higher-order functions for iterators and async iterators. Each function is
a step you put in a `pipe`. A pipeline does its work one value at a time,
and only when a value is asked for.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  Pact.range(1, 10),
  Pact.filter((n) => n % 2 === 0),
  Pact.map((n) => n * 2),
  Pact.reduce((sum, n) => sum + n, 0)
); // 40
```

- **Composable.** Steps are plain functions. Use `compose` to build a
  pipeline without a source, then use it with as many sources as you like.
- **The platform's names.** `map`, `filter`, `take`, `flatMap`, `toArray`,
  and the rest work like the native Iterator helpers. pact adds what the
  helpers don't have, like `scan`, `takeWhile`, `zip`, and `toObject`.
- **Sync and async.** `@hyperjump/pact/async` has the same functions for
  async iterables. Its callbacks can return promises.
- **Closes what it opens.** When a pipeline stops early, it closes the
  iterators it was reading. A generator's `finally` block runs.
- **Small and fast.** No dependencies. It has TypeScript types and works in
  Node.js and browsers.

## Why not array methods?

Array methods like `filter` and `map` each build a whole new array before
the next method starts. They also only work on arrays.

A pipeline doesn't build arrays in between steps. It passes each value
through every step before it reads the next value. That means it works on
any iterable, like a `Set`, a `Map`, a generator, or an iterable that never
ends. It also means a step like `take` or a collector like `find` stops
reading as soon as it has what it needs. If you spread an iterable into an
array so you can use array methods, the whole thing is read first.
[Benchmarks](benchmarks.md) measures the difference.

Using version 1.x? Its docs are in the
[1.x README](https://github.com/hyperjump-io/pact/tree/v1#readme).
[Migrating from v1](migrating.md) lists what changed.

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
- [Benchmarks](benchmarks.md): pipelines compared with array methods
- [Migrating from v1](migrating.md): what changed and what to do about it
