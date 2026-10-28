# toArray

First recorded 2026-10-28.

`toArray` was `[...iter]`. Spreading an iterator that isn't an array, and
`Array.from(iter)`, are much slower on Node 22.22.1 than a `for...of` loop
that pushes each value, so `toArray` is a loop now. The async `toArray`
already was.

Median time to collect an array, run 1,000,000 times for 10 items and 200
times for 100,000:

| Source | Spread | `Array.from` | Loop |
| --- | --- | --- | --- |
| Array iterator, 10 items | 0.237 µs | 0.280 µs | 0.031 µs |
| `map` step, 10 items | 0.311 µs | 0.475 µs | 0.140 µs |
| Array iterator, 100,000 items | 2.92 ms | 2.66 ms | 1.58 ms |
| `map` step, 100,000 items | 3.29 ms | 3.98 ms | 2.05 ms |

- `filter`, `map`, `toArray` over 10 numbers went from 0.29 µs to 0.16 µs
  (`benchmark/claude/short.js`). Array methods take 0.03 µs.
- What's left of that 0.16 µs is mostly the cost per value, about 10 ns
  for each value against about 2.5 ns for array methods: a `next()` call
  and a result object for each step. Setting up the pipeline is 0.066 µs.
  Extending `Iterator` instead of `Object` costs about 0.01 µs, making the
  steps' closures each time about 0.02 µs, and `pipe` about 0.02 µs.
