# Pipelines

`pipe` runs a value through any number of functions in order. Each function
gets what the one before it returned.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  [1, 2, 3, 4],
  Pact.filter((n) => n % 2 === 0),
  Pact.map((n) => n * 2),
  Pact.toArray
); // [4, 8]
```

## Sources, steps, and collectors

A pipeline starts with an iterable and usually ends with something that
isn't one. pact's functions have three roles in it:

| Role | Functions | Is |
| --- | --- | --- |
| Source | [`range`, `empty`, `concat`, `zip`, `zipKeyed`](sources.md) | Makes an iterator that starts a pipeline |
| Step | [`map`, `filter`, `take`, and the others](transforming.md) | Takes an iterable and returns an iterator over new values |
| Collector | [`toArray`, `reduce`, `find`, and the others](collecting.md) | Takes an iterable and returns a value |

Any iterable can start a pipeline: an array, a `Set`, a `Map`, a string, a
generator, or a source.

You make a step or a collector by calling a function with its
configuration, like `map(fn)` or `take(3)`. That returns a function that
takes the iterable. You can call a step without `pipe` too:

```typescript
import * as Pact from "@hyperjump/pact";

const double = Pact.map((n: number) => n * 2);
[...double([1, 2, 3])]; // [2, 4, 6]
```

A collector that doesn't need configuration, like `toArray` or `count`,
goes in a pipeline as is. You don't call it.

## Lazy

A step doesn't read anything when it's made. Values go through the
pipeline one at a time as the end of the pipeline asks for them. A step can
work on an iterable that never ends, as long as something stops asking.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  Pact.range(0),
  Pact.map((n) => n * n),
  Pact.take(4),
  Pact.toArray
); // [0, 1, 4, 9]
```

`range(0)` counts forever, but `take(4)` stops after four values. `map`
only squares those four.

## Building pipelines with `compose`

`compose` combines steps into one step without a source. You can make a
pipeline once and use it with any number of iterables. Since the result is
a step, it can also go in another pipeline.

```typescript
import * as Pact from "@hyperjump/pact";

const doubledEvens = Pact.compose(
  Pact.filter((n: number) => n % 2 === 0),
  Pact.map((n) => n * 2)
);

Pact.pipe(
  [1, 2, 3, 4],
  doubledEvens,
  Pact.toArray
); // [4, 8]

Pact.pipe(
  [5, 6],
  doubledEvens,
  Pact.toArray
); // [12]
```

A step can be used as many times as you like. Each use starts fresh from
its configuration, so `take(2)` takes two values every time.

## Native helpers

Every iterator pact returns is an `Iterator`. The native helper methods
work on it, so you can mix them with pact's steps.

```typescript
import * as Pact from "@hyperjump/pact";

const evens = Pact.filter((n: number) => n % 2 === 0)([1, 2, 3, 4]);
evens.map((n) => n * 10).toArray(); // [20, 40]
```

## Closing

When a pipeline stops before its source is done, it closes the source.
That runs the source's cleanup, like a generator's `finally` block or
closing a file. `take`, `takeWhile`, `find`, `some`, `every`, `head`, and
`zip` all stop early. So does a `break` in a `for...of` over a step. A
callback that throws closes the source too.

```typescript
import * as Pact from "@hyperjump/pact";

const letters = function* () {
  try {
    yield "a";
    yield "b";
    yield "c";
  } finally {
    console.log("closed");
  }
};

Pact.pipe(
  letters(),
  Pact.map((letter) => letter.toUpperCase()),
  Pact.find((letter) => letter === "A")
); // "A"
```

```text
closed
```

Once an iterator is closed, the rest of it can't be read. `head` closes
the iterator it reads from. To read the first value of a generator and
then the rest, call its `next()` instead.

A step gets an iterator from its iterable when the step is made, not when
it's first read. If you give a step something that isn't iterable, it
throws right away.
