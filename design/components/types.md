# Types

What the declarations in `src/*.d.ts` promise, beyond the shape of each
function. How they're written is in [Types](../style/types.md), and
`src/types.test-d.ts` checks all of it (see [Testing](testing.md)).

## A step's callback doesn't decide the type of the values

`tap`, `filter`, `find`, `dropWhile`, and `takeWhile` give back the values
they were given, so their output type is their input's, not the type of
the callback's parameter.

```typescript
export const tap: <B extends A, A = B>(fn: Tapper<A>) => (iterator: Iterable<B>) => IteratorObject<B, undefined, unknown>;
```

`A` is what the callback takes and `B` is what the values are. In a
pipeline, `B` comes from the step before it. A callback written inline has
no type of its own, so `A` falls back to its default, `B`, and that's the
type of its parameter. A step made outside a pipeline has no `B` to infer,
so `B` falls back to its constraint, `A`, which is the type the callback's
parameter was given.

Before, both were one type parameter, and TypeScript prefers what it
infers from an argument to what it infers from where the result goes. So
`tap(console.log)` made a pipeline of `any`, and a predicate that takes
`unknown` made one of `unknown`.

## Predicates

- A predicate can return any value, as the native helpers' can. What
  matters is whether the value is truthy. `Predicate` returns `unknown`.
- `filter` and `find` have an overload for a type guard (`TypeGuard`),
  which narrows the values, as the native helpers do. It's first, so a
  guard isn't read as an ordinary predicate.

## `flatten`

`flatten(depth)` yields `Flattened<A, Depth>`, which unwraps the type
`Depth` levels, the way `Array.prototype.flat`'s `FlatArray` does. A
string is passed through, as the code does. A depth that isn't a literal
number, like `Infinity`, unwraps 20 levels, where `FlatArray` gives a
union of every level. A type that nests forever, like `NestedIterable`,
ends there with what's left.

## `flatMap`, `zip`, and `concat` work out their values from their inputs

They take each input as it is and work out the type of its values with
`FlattenableItem`, instead of inferring the type of the values from an
`Iterable<A>` parameter.

- A callback for `flatMap` that returns an array of numbers or an array of
  strings yields `number | string`. Inferring `A` from both failed.
- `concat` takes iterables of different types and yields a union.
- In the async versions, the promises a sync input yields are waited for.
  Inferring `A` through a mapped tuple gave `number | Promise<number>`
  for an array of promises.

`Flattenable<A>` is an iterable or an iterator `& object`, which a string
isn't, so the string `flatMap` and `zip` would throw on is a type error.

## `zip`

- The first argument is a tuple, for a tuple of results, or any iterable
  of iterables, for arrays of results.
- In `longest` mode, `padding` can be any values, and each position of the
  result is the input's type or its padding's (`ZipPadding`), or
  `undefined` where there's no padding. `P` is a `const` type parameter,
  so `padding: [0, ""]` is read as a tuple.
- The `longest` overload also takes `ZipOptions`, so options whose mode
  isn't known until it runs are accepted, with the `longest` result.
- `zipKeyed` takes `undefined` for a key. A key that's always `undefined`
  isn't in the result, and one that might be has `undefined` in its type.

## Async

- A source is an `AnyIterable<A>`: an `Iterable<A | PromiseLike<A>>` or an
  `AsyncIterable<A>`, because the promises a sync source yields are
  waited for (see [Async](async.md)).
- `map` takes a callback that returns `B` and yields `Awaited<B>`, so a
  callback can return a value, a promise, anything else with a `then`
  method, or one or the other. `Mapper<A, B>`, which returns `B | PromiseLike<B>`, is for
  typing a callback. With it as the parameter, a callback that returns a
  promise of a string or a number failed to infer `B`.
- `Tapper` and `Predicate` return `unknown`, which a promise is.

## `toMap` and `toObject`

They take `readonly [key, value]` tuples, as `Map` and
`Object.fromEntries` do, so pairs made with `as const` are accepted. A
callback that returns `[key, value]` without `as const` or a return type
is an array to TypeScript, not a tuple, and still isn't. `toObject` takes
any property key.

## `pipe` and `compose`

They're typed with an overload for each number of steps up to 16 (see
[Pipe](pipe.md)). After that, the rest aren't checked against each other,
and a step that's generic infers `unknown`. With no steps, `pipe` returns
its value and `compose` returns a function that does.

## Rejected

- **A generic step**, `(fn: Tapper<A>) => <B extends A>(iterator:
  Iterable<B>) => IteratorObject<B>`. It keeps the type of the values,
  but an inline callback's parameter is `unknown`, because TypeScript
  doesn't infer `A` from where a generic function goes.
- **`NoInfer` on the callback**, so only the pipeline decides the type. A
  step made outside a pipeline would have nothing to infer from.
- **`Awaited<A>` as the callback's parameter**, with `Iterable<A>` as the
  source. TypeScript can't infer `A` from a callback's parameter through
  `Awaited`, so a step made outside a pipeline didn't type-check.
- **Optional keys in `zipKeyed`'s result** for inputs that might be
  `undefined`. It takes two mapped types intersected, which reads badly
  in an editor, and reading the key gives `undefined` either way.
- **`noUncheckedIndexedAccess`**. Most of what it reports is a step
  reading an array by index after checking the length, and each would
  need a cast in the code that has to be fast.
- **`noImplicitOverride`**. It would put `@override` on every `next()` and
  `return()`, 42 of them, for little: a misspelled one fails the tests.
