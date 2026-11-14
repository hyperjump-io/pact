# Iterators

Each function that returns an iterator returns an instance of a small
class written for it, not a generator: `MapIterator`, `FilterIterator`,
`ZipIterator`, and so on, in `index.js` and `async.js`, and
`RangeIterator` in `common.js`. A sync class extends `Iterator`, and an
async one extends `AsyncStep`, which has `AsyncIterator.prototype` in its
prototype chain, so the native helpers work on what pact returns. Fields
are `#private`.

Every class follows the same rules, which are the native helpers' and
which `iterators.test.js`, `closing.test.js`, and the other table tests
check for every function:

- Once it's done, it stays done. `next()` returns
  `{ done: true, value: undefined }` and doesn't read its source again.
- `return()` closes the source and anything else the iterator opened, once
  (see [Close what you open](../principles/close-what-you-open.md)).
  `flatten` and `flatMap` close the iterable they're in, and `concat`
  closes the one it's reading.
- A step with more than one iterator open (`flatMap`, `flatten`, and
  `zip`) closes all of them, even if closing one throws, and then throws
  the first error, as the native helpers do. `zip` called with something
  that isn't iterable closes the ones it opened and throws the
  `TypeError`, not an error from closing.
- A callback that throws closes the source before the error is passed on.
- An error from the source is passed on without closing it, as a
  generator's `for...of` does, and the iterator is done, as a generator
  and the native helpers are. Without that, the next call would read the
  source that failed again.
- `flatten` closes the iterators it's in if a nested iterable throws when
  it's opened, as `for...of` did in v1.
- `zip` and `zipKeyed` read `padding` before they open anything, so
  padding that throws leaves nothing open. `Iterator.zip` opens the
  iterables first and closes them, which is the same unless reading the
  padding and opening an iterable have side effects on each other.
- It has no `throw()` method.
- A step opens its source when it's called, not when it's first read, as
  the native helpers do, so a step called with something that isn't
  iterable throws right away. `concat` checks its iterables when it's
  called and opens each one when it gets to it, as `Iterator.concat` does,
  so a string throws.

## Array sources

A step that reads a source (`map`, `tap`, `filter`, `scan`, `flatMap`,
`drop`, `dropWhile`, `take`, and `takeWhile`) reads an array by index
instead of through its iterator, when the array's `[Symbol.iterator]` is
`Array.prototype[Symbol.iterator]`. The async steps do too, unless the
array has a `[Symbol.asyncIterator]`, and they only wait for a value
that's a promise, as `FromSyncIterator` does. If it rejects, the step
is done, as with any error from a source. An array with its own iterator, or a
subclass that overrides it, is read through it. Like the array iterator,
it reads `length` each time, so values added while it's read are read,
and a hole is `undefined`.

Each class has its own private `#read()`, which returns the next result
from the array or the source. It isn't shared, in a base class or a
helper, because V8 keeps type feedback for each call site in a function's
code: a shared one would see every kind of source from every step, and
stop being optimized (see [Array sources](../benchmarks/array-sources.md)).

## Range

`RangeIterator` works out each value from its index, `from + index * step`,
as `Iterator.range` does. Adding `step` to the last value added up the
rounding errors, so `range(0, 1, 0.1)` had an eleventh value just under 1,
and it never ended once a value was too big for adding `step` to change
it.

## Result objects

Every result is written `{ value, done }`, in that order. The built-in
iterators' results all have one hidden class, and an object literal only
has the same one if its properties are in that order. With
`{ done, value }`, code that reads `done` and `value`, in pact and in
`for...of`, sees two, and is slower (see
[Array sources](../benchmarks/array-sources.md#result-objects)).

The declared return types are `IteratorObject<T, undefined, unknown>` and
`AsyncIteratorObject<T, undefined, unknown>` (see
[Types](../style/types.md)).

## Async

`AsyncIterator.prototype` isn't a global. It's found from an async
generator function's prototype chain when the module loads, and `AsyncStep`
is given it as its prototype's prototype.

- **Calls are queued.** A call to `next()` or `return()` that's made while
  another one is in progress waits for it, as with an async generator, so
  `next()` calls that overlap get their values in order, even through
  `filter`, whose calls read a different number of values from the
  source. A call made when nothing is in progress starts right away,
  without waiting a turn. Each class implements `[pull]()` and `[close]()`,
  which `AsyncStep` calls one at a time. A step that closes itself, because
  a callback threw or it's done early, calls `[close]()` directly, because
  `return()` would wait for the call it's in.
- **A callback's result is only waited for if it's a promise.** Waiting
  for a value that isn't one still takes a turn, and most callbacks are
  sync.
- **`[Symbol.asyncDispose]()`** calls `return()`, as the spec defines it on
  `AsyncIterator.prototype`, which doesn't have it in every engine yet.
  TypeScript's `AsyncIteratorObject` requires it.

## Minimum version

The classes extend the global `Iterator`, which Node has from 22 and
browsers have from 2025. pact supports every Node version that's still
maintained, and 22 is the oldest of those, so `engines` in `package.json`
says `>=22`, and npm warns when it's installed on an older one. Without
it, importing pact on Node 20 fails with `Iterator is not defined`. The
floor goes up as versions reach their end of life.

## Why

A class that extends `Iterator` is as fast as a plain object for a long
pipeline, and faster for a short one, because a class's methods are on its
prototype instead of being created for each object
(`benchmark/claude/iterator-prototype.js`, 2026-10-27). Compared to v1,
sync pipelines are 2.2 to 15 times faster and async ones 1.35 to 1.5
times faster (see [Pipelines](../benchmarks/pipelines.md#iterator-classes)).

## Rejected

- **Generators**, as in v1. They show up when profiling code that uses
  pact. Their one advantage is that `for...of` and `yield*` close sources
  for free, and tests cover that instead.
- **Delegating to the native Iterator helpers.** Warmed up, they're as
  fast as pact or slower for every pipeline measured, on Node 22 and 24,
  and they can't read an array by index. There are no native async
  helpers, `Iterator.concat`, or `Iterator.zip` yet (see
  [Array sources](../benchmarks/array-sources.md#native-iterator-helpers)).
- **Handing values from step to step without `next()`**, either through a
  function from each step to the one before it, or by fusing the steps
  into one loop in the collector. Warmed up, neither was faster, because
  those calls are as megamorphic as `next()`
  (see [Array sources](../benchmarks/array-sources.md#handing-values-from-step-to-step)).
- **Reading sources through shared code**, a `Step` base class or reader
  objects. A `Set` source got up to 1.6 times slower.
- **Plain objects that don't extend `Iterator.prototype`.** The native
  helpers wouldn't be available on them, and they were slower for short
  pipelines.
- **A fallback for engines without a global `Iterator`.** Every Node
  version that's still maintained has it.
- **Not queuing async calls**, and documenting that each `next()` has to
  be waited for. Most code does wait, but `filter`, `take`, `scan`, and
  others would give wrong results if it doesn't. The queue with a fast
  path costs nothing measurable.
- **Queuing every call on a promise chain**, without the fast path. It
  made async pipelines 1.6 times slower than v1, because every call waited
  a turn before it started (`benchmark/claude/async-queue.js`).
- **Checking for a call to `next()` from inside its own callback**, which
  a generator throws a TypeError for. It costs something on every call,
  and the native helpers don't all do it.

## Open questions

- Sync classes don't implement `[Symbol.dispose]()`. TypeScript's
  `IteratorObject` type has it from `Iterator.prototype`, which has it in
  engines that support explicit resource management, but not in Node 22.
