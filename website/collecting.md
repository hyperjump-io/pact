# Collecting

A collector takes an iterable and returns a value, so it ends a pipeline.
The ones that need configuration are called with it, like `reduce(fn, 0)`,
and the others go in a pipeline as they are, like `toArray`.

## toArray, toSet, toMap, and toObject

Collect the values into an array, a `Set`, a `Map`, or an object. `toMap`
and `toObject` take `[key, value]` pairs. `toObject` makes an object with
no prototype, so a key like `__proto__` is an ordinary property.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.toArray(new Set([1, 2])); // [1, 2]
Pact.toSet([1, 1, 2]); // new Set([1, 2])

const pairs: [string, number][] = [["a", 1], ["b", 2]];
Pact.toMap(pairs); // new Map([["a", 1], ["b", 2]])
Pact.toObject(pairs); // { a: 1, b: 2 }
```

## reduce

Calls a function with an accumulated value and each value, and returns the
last accumulated value. Without an initial value, the first value is the
initial value, and an empty iterable throws a `TypeError`, as with
`Array.prototype.reduce`.

```typescript
import * as Pact from "@hyperjump/pact";

const sum = (total: number, n: number) => total + n;

Pact.reduce(sum, 10)([1, 2, 3]); // 16
Pact.reduce(sum)([1, 2, 3]); // 6
```

## every, some, and find

`every` returns whether a function returns `true` for every value, `some`
returns whether it does for any of them, and `find` returns the first value
it does for, or `undefined`. Each one stops reading, and closes the
iterable, as soon as it knows the answer.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.every((n: number) => n > 0)([1, 2, 3]); // true
Pact.some((n: number) => n > 2)([1, 2, 3]); // true
Pact.find((n: number) => n > 1)([1, 2, 3]); // 2
```

## forEach

Calls a function with each value, and returns `undefined`. It's for side
effects at the end of a pipeline. To look at values in the middle of one,
use [`tap`](transforming.md#tap).

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  ["a.json", "b.txt"],
  Pact.filter((file) => file.endsWith(".json")),
  Pact.forEach((file) => console.log(file))
);
```

```text
a.json
```

## head and count

`head` returns the first value, or `undefined` if there isn't one, and then
closes the iterator. `count` returns how many values there are.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.head(Pact.range(5)); // 5
Pact.count(Pact.range(0, 5)); // 5
```

## join

Joins the values into a string, with a separator between them.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  ["a", "b"],
  Pact.map((s) => s.toUpperCase()),
  Pact.join(", ")
); // "A, B"
```
