# Pipelines

First recorded 2026-10-27.

`benchmark/benchmarks/` compares the version checked out with the other
one: `next` is v2 and `branch` is v1 (`benchmark/link.js` checks the other
one out in a worktree next to this repo). Each version is used through an
adapter in `benchmark/lib/implementations/`, so v2's API can change
without changing the benchmarks. Run them with `npm run bench` in
`benchmark/`.

- `pipelines.bench.ts` runs the same pipelines with pact, the native
  Iterator helpers, and code without iterators. A long pipeline measures
  the cost per item, and a short one the cost of setting it up.
- `real-world.bench.ts` has pipelines from `@hyperjump/json-schema` v1,
  which uses pact when it compiles a schema: short pipelines, once per
  keyword, and the async ones start from an array.

Results from 2026-10-27 (mean time per run), Node 22.22.1. `next` is the
first commits on `v2`, which only add tests and make `head` close its
source, so it's the same as `branch` within noise. These are the numbers
v2 has to beat.

| Benchmark | `next` | `branch` | Baselines |
| --- | --- | --- | --- |
| Sync, 100,000 items: `filter`, `map`, `reduce` | 2.15 ms | 2.22 ms | native helpers 2.42 ms, array methods 1.66 ms, `for` loop 0.097 ms |
| Sync, 10 items: `map`, `take(5)`, `reduce` | 2.8 µs | 2.8 µs | native helpers 0.28 µs, array methods 0.07 µs |
| Async, 10,000 items from an array: `filter`, `map`, `reduce` | 3.36 ms | 3.37 ms | `for await` loop 0.97 ms |
| json-schema v1 `properties`: `asyncMap`, `collectObject` (10 entries) | 7.0 µs | 6.8 µs | `for` loop 1.6 µs |
| json-schema v1 `additionalProperties`: `map`, `concat`, `join` (12 items) | 2.2 µs | 2.3 µs | array methods 0.5 µs |

- Setting up a short pipeline costs about 10 times what the native helpers
  do. That's the case json-schema v1 is in: its pipelines are short, and
  most of their time is setup. It's where v2 can gain the most (see
  [Pipe](../components/pipe.md)).
- For a long pipeline, pact is about as fast as the native helpers, and
  both are slower than array methods. The `for` loop is about 20 times
  faster than either, because nothing is allocated and the callbacks are
  inlined. [Generators](generators.md) measured hand-written iterators at
  about 2 times faster than generators.
- Async from an array costs about 3.5 times a `for await` loop over the
  same array.

## Pipe-only

2026-10-27, after every function became a step with no direct form, and
`pipe` became a loop (see [Pipe](../components/pipe.md)).

- The short pipeline is about 11% faster than v1 (36.6 times the array
  methods' time, from 40.9).
- The others are the same as v1 within noise.
- Most of a short pipeline's setup is creating a generator for each step,
  not `curry`. That's what [Iterators](../components/iterators.md) is for.

## Iterator classes

2026-10-27, after every function that returns an iterator became a class
(see [Iterators](../components/iterators.md)). Mean time per run, Node
22.22.1.

| Benchmark | `next` | `branch` (v1) | Baselines |
| --- | --- | --- | --- |
| Sync, 100,000 items: `filter`, `map`, `reduce` | 0.97 ms | 2.18 ms | native helpers 2.46 ms, array methods 1.68 ms, `for` loop 0.12 ms |
| Sync, 10 items: `map`, `take(5)`, `reduce` | 0.2 µs | 3.0 µs | native helpers 0.3 µs, array methods 0.1 µs |
| Async, 10,000 items from an array: `filter`, `map`, `reduce` | 2.00 ms | 2.93 ms | `for await` loop 0.85 ms |
| json-schema v1 `properties`: `map`, `toObject` (10 entries) | 4.5 µs | 6.1 µs | `for` loop 1.4 µs |
| json-schema v1 `additionalProperties`: `map`, `concat`, `join` (12 items) | 0.5 µs | 2.6 µs | array methods 0.5 µs |

- Sync is 2.2 times faster than v1 for a long pipeline, and 15 times
  faster for a short one. It's faster than array methods for a long
  pipeline, and 1.5 times faster than the native helpers for a short one.
- Async is 1.35 to 1.5 times faster than v1. It was 1.6 times slower
  with every call queued on a promise chain. Starting a call right away
  when nothing is in progress, not waiting for values that aren't
  promises in the sync-to-async adapter, and not waiting for callback
  results that aren't promises each made a difference
  (`benchmark/claude/async-queue.js`).
- `additionalProperties` is as fast as array methods. Setting up a short
  pipeline isn't what it costs anymore.
