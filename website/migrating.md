# Migrating from v1

v2 has the same ideas as v1, but it's a different API in a few ways that
touch most code: every function is a step that's called with its
configuration and then the iterable, the async functions are in their own
entry point, and some names follow the native Iterator helpers. This page
lists everything that can break, and what to do about it.

It's also much faster: pipelines are 2 to 15 times faster than v1's, and
async ones about 1.5 times faster, because pact isn't built on generators
anymore.

## Requirements

v2 needs the global `Iterator` that the native Iterator helpers come with:
Node.js 22 or later, and browsers since Chrome 122, Firefox 131, and Safari
18.4. Its types need TypeScript 5.6 or later.

## Functions don't take the iterable

In v1, a function could be called with its configuration and the iterable,
or with just its configuration. In v2, it takes just its configuration,
and returns a function that takes the iterable. Put it in a `pipe`, or call
what it returns.

```typescript
// v1
const doubled = map((n) => n * 2, numbers);
const total = reduce((sum, n) => sum + n, 0, numbers);

// v2
const doubled = pipe(numbers, map((n) => n * 2));
const total = reduce((sum, n) => sum + n, 0)(numbers);
```

`flatten` took the iterable first, and its depth after it. It takes just
the depth now.

```typescript
// v1
flatten(nested, 2);

// v2
pipe(nested, flatten(2));
```

The sources, `range`, `empty`, `concat`, and `zip`, and the collectors
that don't need configuration, like `head` and `count`, are called the same
way as before.

## The async functions are in @hyperjump/pact/async

The root module has only the sync functions now. The async ones are in
`@hyperjump/pact/async`, without the `async` prefix, which v1 also exported
them from.

```typescript
// v1
import { pipe, asyncMap, asyncCollectArray } from "@hyperjump/pact";

// v2
import { pipe, map, toArray } from "@hyperjump/pact/async";
```

A module that uses both can import the async ones as a namespace (see
[Mixing sync and async](async.md#mixing-sync-and-async)). Their types lost
the prefix too: `AsyncMapper` is `Mapper` from `@hyperjump/pact/async`.

## Collectors are named like toArray

| v1 | v2 |
| --- | --- |
| `collectArray` | `toArray` |
| `collectSet` | `toSet` |
| `collectMap` | `toMap` |
| `collectObject` | `toObject` |

## zip takes an array, and stops at the shortest

`zip` takes an array of iterables instead of two arguments, and it stops
when any of them is done. v1 went on until the first one was done, with
`undefined` for the second one if it was shorter.

```typescript
// v1
zip(names, years);

// v2
zip([names, years], { mode: "longest" });
```

`{ mode: "longest" }` keeps going until all of them are done, so to get
v1's behavior when the first is the longest, use it. Without it, a longer
first iterable is cut short. See [zip](sources.md#zip).

## Callbacks get the index

A callback gets each value's index after the value, as with the native
Iterator helpers, and a reducer gets it after the accumulated value and the
value. A function with an optional second or third parameter gets the index
there. The usual one is `parseInt`, whose second parameter is the radix.

```typescript
// v1, and wrong in v2
map(parseInt);

// v2
map((s) => parseInt(s));
```

## reduce without an initial value

`reduce(fn)` without an initial value starts with the first value, and
throws a `TypeError` for an empty iterable, as `Array.prototype.reduce`
does. v1 started with `undefined`.

## head closes the iterator

`head` closes the iterator it reads the first value from, so the rest of it
can't be read. To read the first value of a generator and then the rest,
call its `next()` instead.

```typescript
// v1
const first = head(lines);
const rest = [...lines];

// v2
const first = lines.next().value;
const rest = [...lines];
```

## concat checks its iterables

`concat` throws a `TypeError` when it's called with something that isn't an
iterable object, including a string, which v1 yielded the characters of.

```typescript
// v1
concat("ab", "cd");

// v2
concat([..."ab"], [..."cd"]);
```

## Steps get their iterator when they're made

A step gets an iterator from its iterable when it's called with it, not
when it's first read, as the native helpers do. So a step called with
something that isn't iterable throws right away, instead of when it's
read.

## Iterators aren't generators

What the functions return isn't a generator. It's declared as an
`IteratorObject` instead of a `Generator`, so a variable declared as a
`Generator` needs to be an `IteratorObject` or an `Iterable`. It has no
`throw()` method, and its `return()` is optional in its type.

## What's new

- [`compose`](pipelines.md#building-pipelines-with-compose) builds a
  pipeline without a source.
- [`flatMap`](transforming.md#flatmap),
  [`forEach`](collecting.md#foreach), and
  [`zipKeyed`](sources.md#zipkeyed).
- [`range`](sources.md#range) takes a step.
- The iterators pact returns have the [native helper
  methods](pipelines.md#native-helpers).
- Async iterators queue overlapping `next()` calls, and can be disposed
  (see [Async](async.md)).
