# Array sources

First recorded 2026-10-28.

What it costs a step to read its source, and what was tried to lower it:
handing values from step to step without `next()`, delegating to the
native Iterator helpers, and reading an array by index. Everything here is
warmed up, as in [Array methods](array-methods.md#warmed-up), on Node
22.22, with Node 24.20 where it says so.

## Where the time goes

`benchmark/claude/floor.js` runs `filter`, `map`, `reduce` over 100,000
numbers in one loop that calls each step's callback from an array of
steps, which is the fastest code that can't inline the callbacks:

| | Fresh | Warmed up |
| --- | --- | --- |
| Loop reading the array's iterator | 1.09 ms | 1.76 ms |
| Loop reading the array by index | 0.48 ms | 1.07 ms |
| Array methods | 1.55 ms | 1.61 ms |
| pact | 1.03 ms | 2.00 ms |

pact warmed up is close to the loop that reads the iterator, so its own
`next()` calls and result objects cost little. What's left is calling the
array iterator's `next()` for each value, from a call site that has seen
other kinds of iterators, and the callbacks.

## Handing values from step to step

`benchmark/claude/push.js` has two versions of `map`, `filter`, `take`,
and three collectors, besides copies of pact's classes:

- **sink**: a collector asks the last step to run, and each step passes
  every value to a function from the step after it.
- **fused**: a collector walks the steps back to the source, and runs one
  loop that applies each step to each value.

| Warmed up | pull (pact) | sink | fused |
| --- | --- | --- | --- |
| `filter`, `map`, `reduce` | 1.89 ms | 2.17 ms | 2.42 ms |
| Five steps | 3.38 ms | 3.32 ms | 3.09 ms |
| `filter`, `map`, `take(10)` | 0.50 µs | 0.69 µs | 0.77 µs |
| `map`, `find` | 19 µs | 25 µs | 26 µs |

In a fresh process, sink was up to 2.6 times faster for `take`, but warmed
up neither is faster. Each step's call to the next one's function is as
megamorphic as a call to `next()`. With an array source read by index,
sink was 1.08 ms for `filter`, `map`, `reduce` against 1.37 ms for pull
reading by index, but that's the only case where it was clearly faster.

## Native Iterator helpers

`array-methods.bench.ts` runs each pipeline with the native helpers too
(`array.values().filter().map()...`):

| Warmed up | pact (before) | Native helpers, Node 22 | Native helpers, Node 24 |
| --- | --- | --- | --- |
| `filter`, `map`, `reduce` | 2.00 ms | 2.41 ms | 2.69 ms |
| Five steps | 3.29 ms | 3.67 ms | 4.10 ms |
| `filter`, `map`, `take(10)` | 0.6 µs | 0.7 µs | 0.7 µs |
| `map`, `find` | 22.6 µs | 23.1 µs | 24.1 µs |
| A `Set` | 1.67 ms | 2.28 ms | 2.37 ms |
| 10 items | 0.33 µs | 0.34 µs | 0.35 µs |

pact was as fast or faster in every case, on both versions. Node 22 and
24 have no `Iterator.concat`, `Iterator.zip`, `Iterator.range`, or async
helpers, only the helper methods and `Iterator.from`.

## Reading an array by index

Each step that reads a source (`map`, `tap`, `filter`, `scan`, `flatMap`,
`drop`, `dropWhile`, `take`, and `takeWhile`) reads an array whose
`[Symbol.iterator]` is the built-in one by index. Three ways of doing it in
`src/` were compared:

- **A shared `Step` base class** with a static `read(step)`. Warmed up,
  five steps went from 3.29 to 3.78 ms, and a `Set` from 1.67 to 2.67 ms.
  `read` loads private fields from instances of nine classes, so the loads
  are megamorphic, and its call to `next()` sees every source from every
  step.
- **A reader object** for each step, an `ArrayReader` or an
  `IteratorReader`. Each step's call to `read()` only sees two classes,
  but `IteratorReader`'s call to `next()` sees every source. A `Set` was
  2.5 ms.
- **A private `#read()` in each class**, which is what's used.

`benchmark/claude/array-sources.js` compares copies of `src/`, each case
in a fresh process, with the variants taking turns. Median of 3, in µs:

| | Before | `#read()` returns a value or `DONE` | `#read()` returns a result |
| --- | --- | --- | --- |
| `filter`, `map`, `reduce` | 2058 | 1658 | 1766 |
| Five steps | 3360 | 2320 | 2508 |
| `filter`, `map`, `take(10)` | 0.95 | 0.95 | 0.82 |
| `map`, `find` | 20.0 | 10.8 | 13.2 |
| `Set`: `filter`, `map`, `reduce` | 1736 | 1964 | 1886 |
| Generator: `filter`, `map`, `reduce` | 2479 | 2838 | 2599 |
| 10 items: `filter`, `map`, `toArray` | 0.53 | 0.33 | 0.34 |

- Arrays are 1.2 to 1.9 times faster, and other sources 5 to 13% slower.
  Arrays are the source most pipelines start from.
- Returning a result keeps `filter`, `take`, and the others passing their
  source's result on without making a new one, which is why other sources
  lose less with it. That's the one used.
- Why other sources are slower is in
  [Result objects](#result-objects). Most of it was fixed by writing
  results in the same order as the built-in iterators.

## Async

2026-10-28. The async steps read an array by index too, instead of
through `FromSyncIterator`, and only wait for a value that's a promise. An
array with an async iterator is read with it, since that's what
`for await` would read. `benchmark/claude/async-array-sources.js` compares
copies of `src/` as `array-sources.js` does, warmed up with other
callbacks and sources. Median of 3, in µs, Node 22.22:

| | Before | After |
| --- | --- | --- |
| 10,000 items: `filter`, `map`, `reduce` | 2033 | 1199 |
| 10,000 items: async `map`, `reduce` | 2365 | 1535 |
| 10,000 items: `map`, `take(10)` | 3.6 | 4.6 |
| `Set`: `filter`, `map`, `reduce` | 1997 | 2047 |
| Async generator: `filter`, `map`, `reduce` | 2150 | 2246 |
| json-schema `properties`: `map`, `toObject` (10 entries) | 4.57 | 3.82 |

- Arrays are 1.5 to 1.7 times faster. A value from an array used to cost
  a call queued in `FromSyncIterator`, a promise, and a turn waiting for
  it, and now it's read with no promise at all.
- Other sources are 2 to 5% slower, as with the sync steps (see
  [Result objects](#result-objects)).
- `take(10)` is too short to measure this way. Run again, three times
  each, it was 3.9 to 8.9 µs before and 2.8 to 3.3 µs after.

## Result objects

2026-10-28. Why other sources got slower when steps started reading
arrays by index, with `array-sources.js` and `ROUNDS=7` (two runs of the
same code differed by less than 2%). Each variant changes one thing.

| Median µs | `Set` | Generator |
| --- | --- | --- |
| Before | 1731 | 2470 |
| Before, with `#array` and `#position` fields that aren't used | 1727 | 2479 |
| Before, reading the source through a `#read()` | 1771 | 2477 |
| After, with `isPlainArray` always false | 1786 | 2563 |
| After | 1921 | 2597 |

The fields cost nothing, and the extra method and check cost 2 to 4%.
Most of it came from arrays taking the new path at all: copying `#read()`
into `next()`, or checking `#source` before `#array`, didn't help.

The built-in iterators (an array's, a `Set`'s, a generator's, an async
generator's, and the native helpers) all return results with the same
hidden class, and an object literal only gets it if it's written
`{ value, done }`, in that order. pact wrote `{ done, value }`. Before,
most results came from an array iterator, and a step that passes its
source's result on, like `filter`, passed those on, so code reading
`done` and `value` mostly saw one hidden class. Results read from an array
by index were pact's own, so it saw two. Writing every result
`{ value, done }`:

| Median µs | Before | Before, `{ value, done }` | After | After, `{ value, done }` |
| --- | --- | --- | --- | --- |
| `filter`, `map`, `reduce` | 2123 | 1955 | 1787 | 1735 |
| Five steps | 3379 | 3248 | 2525 | 2329 |
| `filter`, `map`, `take(10)` | 1.00 | 0.91 | 0.97 | 1.00 |
| `map`, `find` | 20.1 | 20.0 | 12.6 | 12.4 |
| `Set`: `filter`, `map`, `reduce` | 1785 | 1651 | 1898 | 1712 |
| Generator: `filter`, `map`, `reduce` | 2548 | 2376 | 2591 | 2475 |
| 10 items: `filter`, `map`, `toArray` | 0.55 | 0.56 | 0.47 | 0.42 |

- With both, every pipeline is as fast as before steps read arrays by
  index, or faster.
- Other sources are still about 4% slower than they'd be with
  `{ value, done }` and no array path. That's the check and the extra
  method.

Async, with `async-array-sources.js` and `ROUNDS=5`:

| Median µs | Before arrays by index | After | After, `{ value, done }` |
| --- | --- | --- | --- |
| 10,000 items: `filter`, `map`, `reduce` | 2029 | 1190 | 1123 |
| 10,000 items: async `map`, `reduce` | 2337 | 1528 | 1508 |
| `Set`: `filter`, `map`, `reduce` | 1993 | 2035 | 1967 |
| Async generator: `filter`, `map`, `reduce` | 2125 | 2179 | 2203 |
| json-schema `properties` | 10.2 | 5.38 | 5.45 |

Promises are most of an async step's cost, so the order matters less
there. The async generator source is within noise of before.
