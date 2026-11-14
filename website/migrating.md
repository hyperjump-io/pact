# Migrating from v1

v2 has the same ideas as v1, but the API is different in a few ways that
affect most code:

- Every function is a step. You call it with its configuration first and
  then with the iterable.
- The async functions have their own entry point.
- Some names now match the native Iterator helpers.

This page lists everything that can break and what to do about it.

v2 is also much faster. Sync pipelines are 2 to 15 times faster than in v1.
Async pipelines are about 1.5 times faster. That's because pact isn't built
on generators anymore.

## Requirements

v2 needs the global `Iterator` that comes with the native Iterator
helpers. That means Node.js 22 or later, Chrome 122 or later, Firefox 131
or later, or Safari 18.4 or later. Its types need TypeScript 5.6 or later.

## Functions don't take the iterable

In v1, you could call a function with its configuration and the iterable,
or with just its configuration. In v2, it only takes its configuration. It
returns a function that takes the iterable. Put it in a `pipe` or call the
function it returns.

```typescript
// v1
const doubled = map((n) => n * 2, numbers);
const total = reduce((sum, n) => sum + n, 0, numbers);

// v2
const doubled = Pact.pipe(
  numbers,
  Pact.map((n) => n * 2)
);
const total = Pact.reduce((sum, n) => sum + n, 0)(numbers);
```

In v1, `flatten` took the iterable first and the depth second. Now it only
takes the depth.

```typescript
// v1
flatten(nested, 2);

// v2
Pact.pipe(nested, Pact.flatten(2));
```

The sources are called the same way as before. Those are `range`,
`empty`, `concat`, and `zip`. So are collectors that don't need
configuration, like `head` and `count`.

## The async functions are in `@hyperjump/pact/async`

The root module now only has the sync functions. The async ones are in
`@hyperjump/pact/async` and no longer have the `async` prefix. v1 also
exported them from there.

```typescript
// v1
import { pipe, asyncMap, asyncCollectArray } from "@hyperjump/pact";

// v2
import * as PactAsync from "@hyperjump/pact/async";
```

A module that uses both should import each one as a namespace. See
[Mixing sync and async](async.md#mixing-sync-and-async). The types lost the
prefix too. `AsyncMapper` is now `Mapper` from `@hyperjump/pact/async`.

## Collectors are named like `toArray`

| v1 | v2 |
| --- | --- |
| `collectArray` | `toArray` |
| `collectSet` | `toSet` |
| `collectMap` | `toMap` |
| `collectObject` | `toObject` |

## `zip` takes an array, and stops at the shortest

`zip` takes an array of iterables instead of two arguments. It stops when
any of them is done. v1 kept going until the first one was done and used
`undefined` for the second one if it was shorter.

```typescript
// v1
zip(names, years);

// v2
Pact.zip([names, years], { mode: "longest" });
```

`{ mode: "longest" }` keeps going until all of them are done. Use it to get
v1's behavior when the first iterable is the longest. Without it, a longer
first iterable is cut short. See [zip](sources.md#zip).

## Callbacks get the index

Like the native Iterator helpers, callbacks get each value's index as the
argument after the value. A reducer gets it after the accumulated value and
the value. A function with an optional second or third parameter will get
the index there. The common example is `parseInt`, whose second parameter
is the radix.

```typescript
// v1, and wrong in v2
map(parseInt);

// v2
Pact.map((s) => parseInt(s));
```

## `reduce` without an initial value

`reduce(fn)` without an initial value starts with the first value. It
throws a `TypeError` for an empty iterable, just like
`Array.prototype.reduce`. v1 started with `undefined`.

## `head` closes the iterator

`head` closes the iterator it reads from, so the rest of the iterator can't
be read. To read the first value of a generator and then the rest, call its
`next()` instead.

```typescript
// v1
const first = head(lines);
const rest = [...lines];

// v2
const first = lines.next().value;
const rest = [...lines];
```

## `concat` checks its iterables

`concat` throws a `TypeError` when it's called with something that isn't an
iterable object. That includes strings. v1 yielded a string's characters.

```typescript
// v1
concat("ab", "cd");

// v2
Pact.concat([..."ab"], [..."cd"]);
```

## Steps get their iterator when they're made

Like the native helpers, a step gets an iterator from its iterable as soon
as it's called with it, not when it's first read. A step called with
something that isn't iterable throws right away instead of when it's
read.

## Iterators aren't generators

The functions don't return generators. Their return type is
`IteratorObject` instead of `Generator`. Change any variable declared as a
`Generator` to an `IteratorObject` or an `Iterable`. These iterators don't
have a `throw()` method, and `return()` is optional in their type.

## What's new

- [`compose`](pipelines.md#building-pipelines-with-compose) builds a
  pipeline without a source.
- [`flatMap`](transforming.md#flatmap),
  [`forEach`](collecting.md#foreach), and
  [`zipKeyed`](sources.md#zipkeyed).
- [`range`](sources.md#range) takes a step.
- The iterators pact returns have the [native helper
  methods](pipelines.md#native-helpers).
- Async iterators queue overlapping `next()` calls and can be disposed.
  See [Async](async.md).
