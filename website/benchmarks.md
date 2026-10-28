# Benchmarks

Array methods make a new array at every step, and each step reads all of
the one before it. A pipeline makes no arrays in between, and stops
reading when it has what it needs. Each benchmark here does the same work
both ways, with the time it took after it. The times include the native
Iterator helpers too (`numbers.values().filter(isEven).map(double)`),
which work like pact's steps.

The times are the mean for one run, measured with Vitest's `bench` on
Node.js 22.22, on 2026-10-28. Before they're measured, other pipelines
with other callbacks and sources are run, as in an app that uses pact in
many places. In a program that runs only one pipeline, pact is faster
than it is here, because the engine can optimize pact's code for that one
pipeline.

## Stopping early with take

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = Array.from({ length: 100_000 }, (_, n) => n);
const isEven = (n: number) => n % 2 === 0;
const double = (n: number) => n * 2;

Pact.pipe(
  numbers,
  Pact.filter(isEven),
  Pact.map(double),
  Pact.take(10),
  Pact.toArray
); // [0, 4, 8, 12, 16, 20, 24, 28, 32, 36]

numbers.filter(isEven).map(double).slice(0, 10);
// [0, 4, 8, 12, 16, 20, 24, 28, 32, 36]
```

| pact | Array methods | Native helpers |
| --- | --- | --- |
| 0.53 µs | 1.35 ms | 0.68 µs |

pact is 2,500 times faster than array methods. The pipeline reads 20 numbers. The array
methods read 100,000, make an array of 50,000 and another of 50,000, and
then copy 10 of them. A pipeline's time depends on how much of the input
it needs, and the array methods' on how big the input is.

## Stopping early with find

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = Array.from({ length: 100_000 }, (_, n) => n);
const double = (n: number) => n * 2;
const isTarget = (n: number) => n === 1998;

Pact.pipe(
  numbers,
  Pact.map(double),
  Pact.find(isTarget)
); // 1998

numbers.map(double).find(isTarget); // 1998
```

| pact | Array methods | Native helpers |
| --- | --- | --- |
| 12 µs | 0.77 ms | 21 µs |

pact is 64 times faster than array methods. The pipeline maps the first 1,000 numbers, and
the array methods map all 100,000 before `find` starts.

## A Set

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = new Set(Array.from({ length: 100_000 }, (_, n) => n));
const isEven = (n: number) => n % 2 === 0;
const double = (n: number) => n * 2;
const add = (total: number, n: number) => total + n;

Pact.pipe(
  numbers,
  Pact.filter(isEven),
  Pact.map(double),
  Pact.reduce(add, 0)
); // 4999900000

[...numbers].filter(isEven).map(double).reduce(add, 0); // 4999900000
```

| pact | Array methods | Native helpers |
| --- | --- | --- |
| 1.95 ms | 2.01 ms | 2.34 ms |

About the same. Array methods only work on arrays, so a `Set`, a `Map`,
or a generator has to be spread into an array first, which is one more
array. A pipeline reads any iterable as it is, including one
that never ends, which can't be spread at all.

## Every value used

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = Array.from({ length: 100_000 }, (_, n) => n);
const isEven = (n: number) => n % 2 === 0;
const double = (n: number) => n * 2;
const add = (total: number, n: number) => total + n;

Pact.pipe(
  numbers,
  Pact.filter(isEven),
  Pact.map(double),
  Pact.reduce(add, 0)
); // 4999900000

numbers.filter(isEven).map(double).reduce(add, 0); // 4999900000
```

| pact | Array methods | Native helpers |
| --- | --- | --- |
| 1.71 ms | 1.63 ms | 2.35 ms |

About the same. The engine optimizes array methods separately for each
place they're called, so it can put the callbacks' code inline. pact's
code is the same for every pipeline, so in an app it sees many callbacks,
and calls them as functions. What makes up for it is the arrays in
between, which take array methods time to fill and to collect as garbage.

## More steps

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = Array.from({ length: 100_000 }, (_, n) => n);
const increment = (n: number) => n + 1;
const isEven = (n: number) => n % 2 === 0;
const double = (n: number) => n * 2;
const isMultipleOf3 = (n: number) => n % 3 === 0;
const add = (total: number, n: number) => total + n;

Pact.pipe(
  numbers,
  Pact.map(increment),
  Pact.filter(isEven),
  Pact.map(double),
  Pact.filter(isMultipleOf3),
  Pact.reduce(add, 0)
); // 1666633332

numbers
  .map(increment)
  .filter(isEven)
  .map(double)
  .filter(isMultipleOf3)
  .reduce(add, 0); // 1666633332
```

| pact | Array methods | Native helpers |
| --- | --- | --- |
| 2.31 ms | 2.62 ms | 3.66 ms |

pact is 1.1 times faster. Each step adds a function call for each value
to the pipeline, and an array to the array methods.

The memory isn't in these times. A pipeline holds one value at a time,
and array methods hold an array the size of what each step makes, so an
input that doesn't fit in memory twice over can only go through a
pipeline.

## A short pipeline

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = Array.from({ length: 10 }, (_, n) => n);
const isEven = (n: number) => n % 2 === 0;
const double = (n: number) => n * 2;

Pact.pipe(
  numbers,
  Pact.filter(isEven),
  Pact.map(double),
  Pact.toArray
); // [0, 4, 8, 12, 16]

numbers.filter(isEven).map(double); // [0, 4, 8, 12, 16]
```

| pact | Array methods | Native helpers |
| --- | --- | --- |
| 0.32 µs | 0.05 µs | 0.33 µs |

Array methods are 6 times faster. Each value costs a pipeline a call
to each step's iterator and a new object to pass it in, and setting up
the steps costs more than calling array methods. Small arrays are where
array methods are fastest, because the arrays they make are small too.

It's a third of a microsecond, which only matters in a loop that's been
measured to be slow. If it does, and the input is an array that's always
small, use array methods.
