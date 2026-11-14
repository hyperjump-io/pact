# Sources

A source makes an iterator to start a pipeline. Any iterable can start a
pipeline, so sources are for values that aren't in an iterable yet or are
spread across several.

## `range`

Yields numbers from `from` up to but not including `to`. It counts by
`step`, which is 1 by default. Without `to`, it never ends. A negative
`step` counts down. A `step` of 0 throws a `RangeError`, and so does a
`from`, `to`, or `step` that's `NaN`.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.toArray(Pact.range(0, 5)); // [0, 1, 2, 3, 4]
Pact.toArray(Pact.range(0, 10, 3)); // [0, 3, 6, 9]
Pact.toArray(Pact.range(5, 0, -2)); // [5, 3, 1]

Pact.pipe(
  Pact.range(1),
  Pact.take(3),
  Pact.toArray
); // [1, 2, 3]
```

## `empty`

Yields nothing.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.toArray(Pact.empty()); // []
```

## `concat`

Yields the values of each iterable, one after the other. It works like
`Iterator.concat`. Each argument has to be an iterable object, so a string
throws a `TypeError`. An iterable isn't read until the ones before it are
done.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.toArray(Pact.concat([1, 2], new Set([3]), [4])); // [1, 2, 3, 4]
```

## `zip`

Yields arrays that hold the next value of each iterable. It works like
`Iterator.zip` from the TC39 Joint Iteration proposal. It takes an array of
any number of iterables or iterators. Strings aren't allowed.

```typescript
import * as Pact from "@hyperjump/pact";

const names = ["Ada", "Grace", "Alan"];
const years = [1815, 1906];

Pact.toArray(Pact.zip([names, years]));
// [["Ada", 1815], ["Grace", 1906]]
```

The `mode` option decides what happens when one iterable is done before
the others:

| `mode` | When one is done |
| --- | --- |
| `"shortest"` | It stops. This is the default. |
| `"longest"` | It keeps going until all of them are done. Finished iterables yield `undefined`, or the value at the same position in `padding`. |
| `"strict"` | It throws a `TypeError` unless they're all done |

```typescript
import * as Pact from "@hyperjump/pact";

const names = ["Ada", "Grace", "Alan"];
const years = [1815, 1906];

Pact.toArray(
  Pact.zip([names, years], { mode: "longest", padding: ["?", 0] })
);
// [["Ada", 1815], ["Grace", 1906], ["Alan", 0]]
```

When it stops, it closes the iterables that aren't done. If one of them
throws, that one isn't closed, but the others are.

## `zipKeyed`

Like `zip`, but it takes an object of iterables and yields objects with the
same keys. It works like `Iterator.zipKeyed`. A key whose value is
`undefined` is left out. In `longest` mode, `padding` is an object too.

```typescript
import * as Pact from "@hyperjump/pact";

Pact.toArray(
  Pact.zipKeyed({ name: ["Ada", "Grace"], year: [1815, 1906] })
);
// [{ name: "Ada", year: 1815 }, { name: "Grace", year: 1906 }]
```
