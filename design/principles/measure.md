# Measure, don't assume

A change made for performance comes with a benchmark, and the result is
recorded in [Benchmarks](../benchmarks/README.md) with its date.

Why: what's fast changes between engine versions, and guesses are often
wrong. Before measuring, the obvious fix for slow generators was the native
Iterator helpers, but on Node 22 they're no faster than generators.

Where it shows up:

- [Iterators](../components/iterators.md) was decided by
  [Generators](../benchmarks/generators.md).
- Delegating to the native helpers is an open question until they're
  measured to be faster.
