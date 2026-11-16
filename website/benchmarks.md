# Benchmarks

Array methods make a new array at every step, and each step reads the
whole array from the step before it. A pipeline doesn't make arrays in
between steps, and it stops reading when it has what it needs. Each
benchmark here does the same work both ways and shows how long each took.
The tables also include the native Iterator helpers, which work like pact's
steps: `numbers.values().filter(isEven).map(double)`.

The times are the mean for one run. They were measured with Vitest's
`bench` on Node.js 26.3 on 2026-11-16. Before each measurement, other
pipelines with other callbacks and sources are run. That simulates an app
that uses pact in many places. A program that runs only one pipeline will
see pact run faster than shown here, because the engine can optimize pact's
code for that one pipeline.

## Stopping early with `take`

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
| **0.50 µs** | 1.10 ms | 0.76 µs |

pact is 2,200 times faster than array methods. The pipeline reads 20
numbers. The array methods read 100,000, make two arrays of 50,000, and
then copy 10 of them. A pipeline's time depends on how much of the input it
needs. The array methods' time depends on how big the input is.

## Stopping early with `find`

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
| **12 µs** | 0.65 ms | 23 µs |

pact is 55 times faster than array methods. The pipeline maps the first
1,000 numbers. The array methods map all 100,000 before `find` starts.

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
| **1.67 ms** | 1.74 ms | 2.26 ms |

About the same. Array methods only work on arrays, so a `Set`, a `Map`, or
a generator has to be spread into an array first. That's one more array. A
pipeline reads any iterable as is. That includes an iterable that never
ends, which can't be spread at all.

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
| 1.69 ms | **1.26 ms** | 2.58 ms |

Array methods are 1.3 times faster. The engine optimizes array methods
separately for each place they're called, so it can inline the callbacks'
code. pact's code is shared by every pipeline, so in an app it sees many
different callbacks and has to call them as functions. Array methods also
spend time filling arrays in between steps and then garbage collecting
them, but that costs less than the function calls do.

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
| 2.46 ms | **2.03 ms** | 3.92 ms |

Array methods are 1.2 times faster. Each step adds a function call per
value to the pipeline. It adds a whole array to the array methods, so
their lead gets smaller as steps are added.

These times don't show memory use. A pipeline holds one value at a time.
Array methods hold an array for each step's output. If an input doesn't
fit in memory twice over, only a pipeline can process it.

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
| 0.28 µs | **0.04 µs** | 0.38 µs |

Array methods are 7 times faster. For each value, a pipeline calls each
step's iterator and creates a new object to pass the value along. Setting
up the steps also costs more than calling array methods. Array methods are
fastest on small arrays, because the arrays they make are small too.

The difference is a quarter of a microsecond. That only matters in a loop
you've measured to be slow. If it does matter, and the input is always a
small array, use array methods.
