# Array methods

First recorded 2026-10-27.

`benchmark/benchmarks/array-methods.bench.ts` runs the same pipelines with
pact and with array methods, for the website's
[Benchmarks](../../website/benchmarks.md) page. It's kept up to date, and
the page's numbers come from it. Only `next` is measured, since the page
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
  only 1.05 times for five. Why the difference shrinks with more steps
  hasn't been looked into. It could be the cost per step of passing a
  value between iterators, or the callbacks not being inlined when more
  than one closure goes through the same `Map` or `Filter` class.
- A short pipeline's setup is 6 times what array methods cost. The page
  says to use array methods for small arrays in a loop that's been
  measured to be slow.
- Memory isn't measured. The page says what's held, without numbers.
