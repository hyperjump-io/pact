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

## Node 26

2026-11-16, on Node 26.3.1, with the same scripts reading v1 from the
`v1` branch.

Sync, 1,000,000 numbers:

| Implementation | Time |
| --- | --- |
| v1 (generators) | 19.7 ms |
| Native Iterator helpers | 22.8 ms |
| Hand-written iterator objects | 10.2 ms |
| Array methods | 11.3 ms |
| A `for` loop | 7.5 ms |

Short pipelines, run 100,000 times:

| Implementation | Time |
| --- | --- |
| v1 | 267.6 ms |
| Native Iterator helpers | 40.3 ms |

Async, 200,000 numbers:

| Implementation | Time |
| --- | --- |
| v1 (async generators) | 44.7 ms |
| Hand-written async iterator objects | 21.7 ms |
| Sync array methods, for comparison | 2.0 ms |

- Every conclusion holds. Hand-written iterators are 1.9 times faster
  than generators, and 2.1 times for async. The native helpers are slower
  than generators for a long pipeline. v1 is 6.6 times slower than the
  native helpers for a short one. Async is 22 times slower than sync.
- Array methods are faster than they were, so hand-written iterators are
  only 1.1 times faster than them, from 1.4 times.
