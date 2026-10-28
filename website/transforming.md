# Transforming

A step takes an iterable and returns an iterator over new values. Each one
is made by calling it with its configuration (see
[Pipelines](pipelines.md#sources-steps-and-collectors)).

Like the native Iterator helpers, a step's callback gets each value's index
after the value. A function with an optional second parameter gets the
index there, so pass `parseInt` its value yourself:

```typescript
import { pipe, map, toArray } from "@hyperjump/pact";

pipe(["10", "10", "10"], map(parseInt), toArray); // [10, NaN, 2]
pipe(["10", "10", "10"], map((s) => parseInt(s)), toArray); // [10, 10, 10]
```

## map

Calls a function with each value, and yields what it returns.

```typescript
import { pipe, map, toArray } from "@hyperjump/pact";

pipe(["a", "b"], map((letter, index) => `${index}:${letter}`), toArray);
// ["0:a", "1:b"]
```

## filter

Yields the values a function returns `true` for.

```typescript
import { pipe, filter, toArray } from "@hyperjump/pact";

pipe([1, 2, 3, 4], filter((n) => n > 2), toArray); // [3, 4]
```

## flatMap

Calls a function that returns an iterable with each value, and yields the
values of each iterable, one level deep. The function can return an
iterator too, but not a string or another value that isn't iterable,
which throws a `TypeError`.

```typescript
import { pipe, flatMap, toArray } from "@hyperjump/pact";

pipe(["a b", "c"], flatMap((s) => s.split(" ")), toArray);
// ["a", "b", "c"]
```

## flatten

Yields the values of the iterables in an iterable, down to a depth, which
is 1 by default. A value that isn't iterable is yielded as it is. A string
is iterable, so it's flattened into its characters.

```typescript
import { pipe, flatten, toArray } from "@hyperjump/pact";

pipe([1, [2, [3, [4]]]], flatten(), toArray); // [1, 2, [3, [4]]]
pipe([1, [2, [3, [4]]]], flatten(Infinity), toArray); // [1, 2, 3, 4]
```

## scan

Like `reduce`, but yields the accumulated value after each one, instead of
only the last one. It needs an initial value.

```typescript
import { pipe, scan, toArray } from "@hyperjump/pact";

pipe([1, 2, 3], scan((sum, n) => sum + n, 0), toArray); // [1, 3, 6]
```

## tap

Calls a function with each value, and yields the value, not what the
function returns. It's for looking at values in the middle of a pipeline,
like logging them. To call a function with each value at the end of one,
use [`forEach`](collecting.md#foreach).

```typescript
import { pipe, tap, map, toArray } from "@hyperjump/pact";

pipe(
  [1, 2],
  tap((n) => console.log("before", n)),
  map((n) => n * 2),
  toArray
); // [2, 4]
```

```text
before 1
before 2
```

## take and drop

`take` yields the first values, and `drop` yields the values after them.
`take` closes its source when it has enough, so it can end an iterable that
never ends.

```typescript
import { pipe, range, take, drop, toArray } from "@hyperjump/pact";

pipe(range(0), take(3), toArray); // [0, 1, 2]
pipe([1, 2, 3, 4], drop(3), toArray); // [4]
```

## takeWhile and dropWhile

`takeWhile` yields values until a function returns `false` for one, and
then closes its source. `dropWhile` drops values until a function returns
`false` for one, and yields that one and the rest.

```typescript
import { pipe, takeWhile, dropWhile, toArray } from "@hyperjump/pact";

pipe([1, 2, 3, 1], takeWhile((n) => n < 3), toArray); // [1, 2]
pipe([1, 2, 3, 1], dropWhile((n) => n < 3), toArray); // [3, 1]
```
