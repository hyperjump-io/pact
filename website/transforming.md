# Transforming

A step takes an iterable and returns an iterator over new values. You make
a step by calling its function with its configuration. See
[Pipelines](pipelines.md#sources-steps-and-collectors).

Like the native Iterator helpers, a step passes each value's index to its
callback as the second argument. A function with an optional second
parameter will get the index there. With a function like `parseInt`, wrap
it and pass the value yourself:

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  ["10", "10", "10"],
  Pact.map(parseInt),
  Pact.toArray
); // [10, NaN, 2]

Pact.pipe(
  ["10", "10", "10"],
  Pact.map((s) => parseInt(s)),
  Pact.toArray
); // [10, 10, 10]
```

## map

Calls a function with each value and yields what it returns.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  ["a", "b"],
  Pact.map((letter, index) => `${index}:${letter}`),
  Pact.toArray
); // ["0:a", "1:b"]
```

## filter

Yields the values a function returns `true` for.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  [1, 2, 3, 4],
  Pact.filter((n) => n > 2),
  Pact.toArray
); // [3, 4]
```

## flatMap

Calls a function with each value. The function returns an iterable, and
`flatMap` yields the values of that iterable, one level deep. The function
can also return an iterator. Returning a string or anything else that isn't
an iterable object throws a `TypeError`.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  ["a b", "c"],
  Pact.flatMap((s) => s.split(" ")),
  Pact.toArray
); // ["a", "b", "c"]
```

## flatten

Yields the values of nested iterables, down to a given depth. The depth is
1 by default. A value that isn't iterable is yielded as is. Strings are
iterable, so they're flattened into their characters.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  [1, [2, [3, [4]]]],
  Pact.flatten(),
  Pact.toArray
); // [1, 2, [3, [4]]]

Pact.pipe(
  [1, [2, [3, [4]]]],
  Pact.flatten(Infinity),
  Pact.toArray
); // [1, 2, 3, 4]
```

## scan

Like `reduce`, but it yields the accumulated value after every value
instead of only at the end. It needs an initial value.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  [1, 2, 3],
  Pact.scan((sum, n) => sum + n, 0),
  Pact.toArray
); // [1, 3, 6]
```

## tap

Calls a function with each value and yields the value itself, not what the
function returns. Use it to look at values in the middle of a pipeline, for
example to log them. To call a function with each value at the end of a
pipeline, use [`forEach`](collecting.md#foreach).

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  [1, 2],
  Pact.tap((n) => console.log("before", n)),
  Pact.map((n) => n * 2),
  Pact.toArray
); // [2, 4]
```

```text
before 1
before 2
```

## take and drop

`take` yields the first values. `drop` skips the first values and yields
the rest. `take` closes its source once it has enough, so it can end an
iterable that would otherwise never end. Both truncate the count to an
integer. A count that's `NaN` or negative throws a `RangeError`.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  Pact.range(0),
  Pact.take(3),
  Pact.toArray
); // [0, 1, 2]

Pact.pipe(
  [1, 2, 3, 4],
  Pact.drop(3),
  Pact.toArray
); // [4]
```

## takeWhile and dropWhile

`takeWhile` yields values until a function returns `false` for one. Then it
closes its source. `dropWhile` skips values until a function returns
`false` for one. Then it yields that value and the rest.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  [1, 2, 3, 1],
  Pact.takeWhile((n) => n < 3),
  Pact.toArray
); // [1, 2]

Pact.pipe(
  [1, 2, 3, 1],
  Pact.dropWhile((n) => n < 3),
  Pact.toArray
); // [3, 1]
```
