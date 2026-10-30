# Async

`@hyperjump/pact/async` has the same functions as `@hyperjump/pact` with
the same names, but for async iterables. Their callbacks can return
promises. Collectors return a promise.

```typescript
import * as PactAsync from "@hyperjump/pact/async";

const fetchUser = async (id: number) => ({ id, name: `User ${id}` });

await PactAsync.pipe(
  [1, 2, 3],
  PactAsync.filter((id) => id !== 2),
  PactAsync.map(fetchUser),
  PactAsync.map((user) => user.name),
  PactAsync.toArray
); // ["User 1", "User 3"]
```

Each function accepts sync iterables as well as async ones, so an async
pipeline can start with an array. If an iterable contains promises, they're
awaited, just like in a `for await` loop.

## Mixing sync and async

A pipeline can start with sync steps and switch to async steps where it
needs to. `pipe` is the same function in both entry points.

```typescript
import * as Pact from "@hyperjump/pact";
import * as PactAsync from "@hyperjump/pact/async";

await Pact.pipe(
  Pact.range(1, 5),
  Pact.filter((n) => n % 2 === 1),
  PactAsync.map(async (n) => n * 10),
  PactAsync.toArray
); // [10, 30]
```

Every async step costs at least one promise per value. That makes an async
pipeline several times slower than a sync one over the same values. Use the
sync functions for values that aren't async. Switch to async only at the
step that needs it.

## Reading in order

If you call `next()` before the previous call is done, it waits for the
previous call to finish. Async generators work the same way. That means
overlapping `next()` calls get the values in order. This holds even through
a step like `filter`, which may read several source values for each value
it yields.

`zip` is the exception, because running in parallel helps there. For each
array it yields, it reads from all the unfinished iterables at the same
time. Each array takes as long as the slowest iterable instead of the sum
of all of them.

## Disposing

Every async iterator pact returns has a `[Symbol.asyncDispose]()` method
that closes it. That means it works with `await using`.

```typescript
import * as PactAsync from "@hyperjump/pact/async";

const lines = async function* () {
  try {
    yield "a";
    yield "b";
  } finally {
    console.log("closed");
  }
};

const upper = PactAsync.map((line: string) => line.toUpperCase())(lines());
await upper.next(); // { done: false, value: "A" }
await upper[Symbol.asyncDispose]();
```

```text
closed
```
