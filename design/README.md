# Design

`@hyperjump/pact` v2. It keeps what v1 is for (lazy, composable functions
over iterators and async iterators), but it isn't built on generators, and
the API is smaller and follows the platform.

These documents record the decisions made so far, and why. The `.d.ts`
files in `src/` are the source of truth for the API. They're written by
hand and have JSDoc explaining the details. Until the plan in `TODO.md` is
done, `src/` is still v1, so where it and these documents disagree, these
documents say where it's going.

## Goals

- Fast enough that it doesn't show up when profiling code that uses it.
  Generators did (see [Generators](benchmarks/generators.md)).
- Functions that compose with `pipe`. Calling a function directly on an
  iterator is what the native Iterator helpers are for.
- The same names and behavior as the native helpers and TC39 proposals
  where there's an equivalent.
- Correct early termination. Anything that stops before the end closes
  what it was reading.
- Dependents (`json-schema-errors`, `better-json-schema-errors`,
  `json-schema-language-tools`) don't need to keep working unchanged.
  They'll be migrated. Almost all of their calls already go through
  `pipe`.

## How it's organized

- **[Principles](principles/README.md)**: the rules decisions are made by.
- **[Style](style/README.md)**: how code here is laid out and written.
- **Components**: how each part works, what was decided, and what was
  rejected. Open questions are with the component they're about.
- **[Benchmarks](benchmarks/README.md)**: the measurements behind the
  performance decisions.

## Components

- [Iterators](components/iterators.md): hand-written iterators instead of
  generators
- [Pipe](components/pipe.md): pipe-only, with no currying
- [Entry points](components/entry-points.md): sync and async are separate
  modules
- [Names](components/names.md): what's renamed, added, and removed
- [Async](components/async.md): sync sources in async pipelines
- [Testing](components/testing.md)
- [Documentation](components/documentation.md)
