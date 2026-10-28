# Benchmarks

Measurements behind the performance decisions in [the design docs](../README.md),
one experiment per file, with the date it was first recorded.

The benchmark code is in `benchmark/`, which isn't committed. The
benchmarks in `benchmark/benchmarks/` are kept up to date. The ones in
`benchmark/claude/` were written for one-off investigations.

- [Generators](generators.md) (2026-10-27)
- [Pipelines](pipelines.md) (2026-10-27): the benchmarks kept up to date
- [Array methods](array-methods.md) (2026-10-27): pact compared with array
  methods, for the website
- [toArray](to-array.md) (2026-10-28): spreading an iterator compared with a
  loop
- [Array sources](array-sources.md) (2026-10-28): reading a source, handing
  values between steps, and the native helpers
