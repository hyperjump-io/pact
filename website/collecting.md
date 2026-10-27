# Collecting

A collector takes an iterable and returns a value, so it ends a pipeline.
The ones that need configuration are called with it, like `reduce(fn, 0)`,
and the others go in a pipeline as they are, like `toArray`.

## toArray, toSet, toMap, and toObject

Collect the values into an array, a `Set`, a `Map`, or an object. `toMap`
and `toObject` take `[key, value]` pairs. `toObject` makes an object with
no prototype, so a key like `__proto__` is an ordinary property.

```javascript
import { pipe, toArray, toSet, toMap, toObject } from "@hyperjump/pact";

pipe(new Set([1, 2]), toArray); // [1, 2]
pipe([1, 1, 2], toSet); // new Set([1, 2])
pipe([["a", 1], ["b", 2]], toMap); // new Map([["a", 1], ["b", 2]])
pipe([["a", 1], ["b", 2]], toObject); // { a: 1, b: 2 }
```

## reduce

Calls a function with an accumulated value and each value, and returns the
last accumulated value. Without an initial value, the first value is the
initial value, and an empty iterable throws a `TypeError`, as with
`Array.prototype.reduce`.

```javascript
import { pipe, reduce } from "@hyperjump/pact";

pipe([1, 2, 3], reduce((sum, n) => sum + n, 10)); // 16
pipe([1, 2, 3], reduce((sum, n) => sum + n)); // 6
```

## every, some, and find

`every` returns whether a function returns `true` for every value, `some`
returns whether it does for any of them, and `find` returns the first value
it does for, or `undefined`. Each one stops reading, and closes the
iterable, as soon as it knows the answer.

```javascript
import { pipe, every, some, find } from "@hyperjump/pact";

pipe([1, 2, 3], every((n) => n > 0)); // true
pipe([1, 2, 3], some((n) => n > 2)); // true
pipe([1, 2, 3], find((n) => n > 1)); // 2
```

## forEach

Calls a function with each value, and returns `undefined`. It's for side
effects at the end of a pipeline. To look at values in the middle of one,
use [`tap`](transforming.md#tap).

```javascript
import { pipe, filter, forEach } from "@hyperjump/pact";

pipe(
  ["a.json", "b.txt"],
  filter((file) => file.endsWith(".json")),
  forEach((file) => console.log(file))
);
```

```text
a.json
```

## head and count

`head` returns the first value, or `undefined` if there isn't one, and then
closes the iterator. `count` returns how many values there are.

```javascript
import { pipe, range, head, count } from "@hyperjump/pact";

pipe(range(5), head); // 5
pipe(range(0, 5), count); // 5
```

## join

Joins the values into a string, with a separator between them.

```javascript
import { pipe, map, join } from "@hyperjump/pact";

pipe(["a", "b"], map((s) => s.toUpperCase()), join(", ")); // "A, B"
```
