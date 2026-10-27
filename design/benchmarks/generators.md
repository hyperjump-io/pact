# Generators

First recorded 2026-10-27.

`benchmark/claude/sync.js` and `benchmark/claude/async.js` compare v1's
generators with other ways of writing the same pipeline. Each case is
warmed up, then run 10 times (7 for async), and the median is recorded.
Node 22.22.1.

Sync, `filter`, `map`, `reduce` over an array of 1,000,000 numbers:

| Implementation | Time |
| --- | --- |
| v1 (generators) | 21.9 ms |
| Native Iterator helpers (`array.values().filter().map().reduce()`) | 21.4 ms |
| Hand-written iterator objects, with the same pipe-style API | 9.8 ms |
| Array methods | 14.0 ms |
| A `for` loop | 7.0 ms |

Short pipelines, `map`, `take(10)`, `reduce`, run 100,000 times:

| Implementation | Time |
| --- | --- |
| v1 | 260.9 ms |
| Native Iterator helpers | 40.6 ms |

Async, `filter`, `map`, `reduce` over an array of 200,000 numbers:

| Implementation | Time |
| --- | --- |
| v1 (async generators) | 51.9 ms |
| Hand-written async iterator objects | 30.2 ms |
| Sync array methods, for comparison | 2.6 ms |

- Hand-written iterators are about 2.2 times faster than generators, and
  faster than array methods, which build an array at each step. This is
  what [Iterators](../components/iterators.md) is based on.
- The native helpers are about as fast as generators for a long pipeline,
  so using them wouldn't help.
- For short pipelines, v1 is about 6 times slower than the native helpers.
  That's setup: `curry`, a generator for each step, and `pipe`, which uses
  the curried `reduce`. See [Pipe](../components/pipe.md).
- The hand-written iterators here don't extend `Iterator.prototype`, which
  v2's will.
- Async is about 20 times slower than sync on the same data, and
  hand-written async iterators are about 1.7 times faster than async
  generators. See [Async](../components/async.md).
