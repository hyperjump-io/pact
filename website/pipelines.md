# Pipelines

`pipe` runs a value through any number of functions, in order. Each one
gets what the one before it returned.

```javascript
import { pipe, filter, map, toArray } from "@hyperjump/pact";

pipe(
  [1, 2, 3, 4],
  filter((n) => n % 2 === 0),
  map((n) => n * 2),
  toArray
); // [4, 8]
```

## Sources, steps, and collectors

A pipeline starts with an iterable and usually ends with something that
isn't one. pact's functions have three roles in it:

| Role | Functions | Is |
| --- | --- | --- |
| Source | [`range`, `empty`, `concat`, `zip`, `zipKeyed`](sources.md) | Makes an iterator, to start a pipeline |
| Step | [`map`, `filter`, `take`, and the others](transforming.md) | Takes an iterable, and returns an iterator over new values |
| Collector | [`toArray`, `reduce`, `find`, and the others](collecting.md) | Takes an iterable, and returns a value |

Any iterable can start a pipeline: an array, a `Set`, a `Map`, a string, a
generator, or a source.

A step or a collector is made by calling a function with its
configuration, like `map(fn)` or `take(3)`. What it returns is a function
that takes the iterable, so a step can be called without `pipe` too:

```javascript
import { map } from "@hyperjump/pact";

const double = map((n) => n * 2);
[...double([1, 2, 3])]; // [2, 4, 6]
```

A collector that doesn't need configuration, like `toArray` or `count`,
goes in a pipeline as it is, without calling it.

## Lazy

A step doesn't read anything when it's made. Values go through the
pipeline one at a time, as the end of it asks for them. So a step can work
on an iterable that never ends, as long as something stops asking.

```javascript
import { pipe, range, map, take, toArray } from "@hyperjump/pact";

pipe(
  range(0),
  map((n) => n * n),
  take(4),
  toArray
); // [0, 1, 4, 9]
```

`range(0)` counts forever, but `take(4)` stops after four values, and
`map` only squares those four.

## Building pipelines with compose

`compose` combines steps into one, without a source, so a pipeline can be
made once and used with any number of iterables. What it returns is a step
itself, so it can go in another pipeline.

```javascript
import { pipe, compose, filter, map, toArray } from "@hyperjump/pact";

const doubledEvens = compose(
  filter((n) => n % 2 === 0),
  map((n) => n * 2)
);

pipe([1, 2, 3, 4], doubledEvens, toArray); // [4, 8]
pipe([5, 6], doubledEvens, toArray); // [12]
```

A step made once can be used as many times as you like. Each use starts
from its configuration, so `take(2)` takes two values every time.

## Native helpers

Every iterator pact returns is an `Iterator`, so the native helper methods
work on it, and you can mix them with pact's steps.

```javascript
import { filter } from "@hyperjump/pact";

const evens = filter((n) => n % 2 === 0)([1, 2, 3, 4]);
evens.map((n) => n * 10).toArray(); // [20, 40]
```

## Closing

When a pipeline stops before its source is done, it closes the source,
so its cleanup runs: a generator's `finally` block, or a file that's
closed. Stopping early is what `take`, `takeWhile`, `find`, `some`,
`every`, `head`, and `zip` do, and it's what `break` in a `for...of` over a
step does. A callback that throws closes the source too.

```javascript
import { pipe, find } from "@hyperjump/pact";

const letters = function* () {
  try {
    yield "a";
    yield "b";
    yield "c";
  } finally {
    console.log("closed");
  }
};

pipe(letters(), find((letter) => letter === "a")); // "a"
```

```text
closed
```

Closing means the rest of it can't be read. `head` closes the iterator it
reads the first value from, so to read the first value of a generator and
then the rest, call its `next()` instead.

A step gets an iterator from its iterable when it's made, not when it's
first read, so a step given something that isn't iterable throws right
away.
