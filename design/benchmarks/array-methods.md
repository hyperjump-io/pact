# Array methods

First recorded 2026-10-27.

`benchmark/benchmarks/array-methods.bench.ts` runs the same pipelines with
pact and with array methods, for the website's
[Benchmarks](../../website/benchmarks.md) page. It's kept up to date, and
the page's numbers come from it. Pipelines are run through pact before
it measures (see [Warmed up](#warmed-up)). Only `next` is measured, since the page
is about the version that's released.

Results from 2026-10-27 (mean time per run), Node 22.22.1, at the iterator
classes (see [Iterators](../components/iterators.md)). 100,000 numbers
unless it says otherwise.

| Benchmark | pact | Array methods |
| --- | --- | --- |
| `filter`, `map`, `take(10)` (`slice(0, 10)`) | 0.6 µs | 1.41 ms |
| `map`, `find` the 1,000th | 15 µs | 0.84 ms |
| `filter`, `map`, `reduce` | 0.94 ms | 1.65 ms |
| `map`, `filter`, `map`, `filter`, `reduce` | 2.50 ms | 2.62 ms |
| A `Set`: `filter`, `map`, `reduce` (spread first) | 1.38 ms | 2.00 ms |
| 10 items: `filter`, `map`, `toArray` | 0.36 µs | 0.06 µs |

- Stopping early is where pact wins by the most, because its time depends
  on how much of the input is used, not how big it is.
- With every value used, pact is 1.8 times faster for three steps, but
  only 1.05 times for five. That's because the five-step pipeline uses
  `map` and `filter` with two callbacks each (see [Warmed up](#warmed-up)).
- A short pipeline's setup is 6 times what array methods cost. The page
  says to use array methods for small arrays in a loop that's been
  measured to be slow.
- Memory isn't measured. The page says what's held, without numbers.

## Warmed up

2026-10-28, after `toArray` became a loop (see [toArray](to-array.md)).

V8 keeps type feedback for each call site in a function's code, and every
pipeline runs the same `MapIterator.next()`, `FilterIterator.next()`, and
`pipe`. While a step has only seen one callback, V8 inlines it, which
`--trace-turbo-inlining` shows for `double` and `isEven` in a fresh
process. Once it has seen others, the callback is a real call, and each
value's result object isn't optimized away. Array methods are builtins
that TurboFan specializes at each call site in the caller, so what other
code does with them doesn't matter.

`benchmark/claude/steps.js`, each case in a fresh process, 100,000 items:

| `filter`, `map`, `reduce` | Time |
| --- | --- |
| pact, nothing else run first | 1.03 ms |
| pact, after the five-step pipeline | 1.78 ms |
| pact, after pipelines with 8 callbacks and 4 kinds of source | 2.00 ms |
| Array methods, in each of those | 1.6 ms |

So the first results were what a program that runs one pipeline gets,
not an app. `array-methods.bench.ts` now calls `warmUp`
(`benchmark/lib/warm-up.ts`) before it measures, which runs pipelines with
8 callbacks and 4 kinds of source through pact, and the same ones through
array methods. Mean time per run, Node 22.22.1, 100,000 numbers unless it
says otherwise:

| Benchmark | pact | Array methods |
| --- | --- | --- |
| `filter`, `map`, `take(10)` (`slice(0, 10)`) | 0.6 µs | 1.46 ms |
| `map`, `find` the 1,000th | 22 µs | 0.78 ms |
| A `Set`: `filter`, `map`, `reduce` (spread first) | 1.81 ms | 2.03 ms |
| `filter`, `map`, `reduce` | 2.01 ms | 1.65 ms |
| `map`, `filter`, `map`, `filter`, `reduce` | 3.32 ms | 2.67 ms |
| 10 items: `filter`, `map`, `toArray` | 0.36 µs | 0.05 µs |

- With every value used, array methods are 1.2 to 1.25 times faster.
  pact is only faster when it stops early or the source isn't an array.
- Warmed up, each value costs about 25 ns through `filter`, `map`, and
  `toArray`, against about 10 ns in a fresh process and 2.5 ns for array
  methods (`benchmark/claude/per-value.js`). Most of it is the call to
  each step's `next()` and the result object it returns. Handing values from step
  to step without them, when a pact step feeds a pact collector, could
  bring that down even when callbacks aren't inlined. It hasn't been
  tried.
- `pipelines.bench.ts` isn't warmed up, so its comparison of v1 and v2 is
  for one pipeline in a fresh process.

## Array sources and native helpers

2026-10-28, after steps started reading arrays by index (see
[Array sources](array-sources.md)), with the native Iterator helpers added
to each benchmark and to `warmUp`. Mean time per run, Node 22.22.2:

| Benchmark | pact | Array methods | Native helpers |
| --- | --- | --- | --- |
| `filter`, `map`, `take(10)` | 0.53 µs | 1.35 ms | 0.68 µs |
| `map`, `find` the 1,000th | 12 µs | 0.77 ms | 21 µs |
| A `Set`: `filter`, `map`, `reduce` | 1.95 ms | 2.01 ms | 2.34 ms |
| `filter`, `map`, `reduce` | 1.71 ms | 1.63 ms | 2.35 ms |
| `map`, `filter`, `map`, `filter`, `reduce` | 2.31 ms | 2.62 ms | 3.66 ms |
| 10 items: `filter`, `map`, `toArray` | 0.32 µs | 0.05 µs | 0.33 µs |

- With every value used, pact is about as fast as array methods for three
  steps, and 1.1 times faster for five.
- The native helpers are the slowest for every pipeline that reads every
  value, and slower than pact for the others.
