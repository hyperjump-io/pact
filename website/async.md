# Async

`@hyperjump/pact/async` has the same functions as `@hyperjump/pact`, with
the same names, for async iterables. Their callbacks can return promises,
and what a collector returns is a promise.

```typescript
import { pipe, filter, map, toArray } from "@hyperjump/pact/async";

const fetchUser = async (id) => ({ id, name: `User ${id}` });

await pipe(
  [1, 2, 3],
  filter((id) => id !== 2),
  map(fetchUser),
  map((user) => user.name),
  toArray
); // ["User 1", "User 3"]
```

Each function takes iterables as well as async iterables, so an async
pipeline can start with an array. A promise in an iterable is waited for,
as in a `for await` loop.

## Mixing sync and async

To use both in one module, import the async functions as a namespace. A
pipeline can start with sync steps and switch to async ones at the first
step that needs it. `pipe` is the same function in both.

```typescript
import { pipe, range, filter } from "@hyperjump/pact";
import * as Async from "@hyperjump/pact/async";

await pipe(
  range(1, 5),
  filter((n) => n % 2 === 1),
  Async.map(async (n) => n * 10),
  Async.toArray
); // [10, 30]
```

Everything async costs at least a promise for each value at each step, so
an async pipeline is several times slower than a sync one over the same
values. Use the sync functions for values that aren't async, and switch to
async only where a step needs it.

## Reading in order

A call to `next()` that's made before the one before it is done waits for
it, as with an async generator. So `next()` calls that overlap get the
values in order, even through a step like `filter`, which reads a
different number of values for each one.

`zip` is the exception, where it helps: for each array it yields, it reads
the iterables that aren't done at the same time, so an array takes as long
as the slowest of them instead of all of them together.

## Disposing

Every async iterator pact returns has a `[Symbol.asyncDispose]()` method,
which closes it, so it works with `await using`.

```typescript
import { map } from "@hyperjump/pact/async";

const lines = async function* () {
  try {
    yield "a";
    yield "b";
  } finally {
    console.log("closed");
  }
};

const upper = map((line) => line.toUpperCase())(lines());
await upper.next(); // { done: false, value: "A" }
await upper[Symbol.asyncDispose]();
```

```text
closed
```
