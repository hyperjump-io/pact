# Install

```bash
npm install @hyperjump/pact
```

It's an ES module with no dependencies. It needs Node.js 24 or later. In
a browser, it needs the global `Iterator` that comes with the native
Iterator helpers. That means Chrome 122 or later, Firefox 131 or later, or
Safari 18.4 or later.

There are two entry points. Their functions have the same names, so import
each one as a namespace.

```typescript
import * as Pact from "@hyperjump/pact";
import * as PactAsync from "@hyperjump/pact/async";
```

- `@hyperjump/pact` has the functions for iterables.
- `@hyperjump/pact/async` has the functions for async iterables. See
  [Async](async.md).

## TypeScript

The package includes its type declarations. It needs TypeScript 5.6 or
later. Each step's input type is checked against the output of the step
before it. A pipeline that passes numbers to a step that takes strings is a
type error. A pipeline can have any number of steps, and the first 16 are
checked. A step made outside a pipeline has no step before it to get its
input type from. This includes a step made for `compose`. Give its
callback's parameter a type.

Every function that returns an iterator is declared to return an
`IteratorObject`. In `@hyperjump/pact/async` it's an `AsyncIteratorObject`.
With `esnext` or `es2025` in your `lib`, the native helper methods are
typed on it, just like on an array's iterator.

`filter` and `find` narrow the type of the values when the predicate is a
type guard. `flatten` returns the type at the depth you give it. `toMap`
and `toObject` take tuples, so a callback that makes the pairs needs
`as const` or a return type.

```typescript
import * as Pact from "@hyperjump/pact";

const values: (number | string)[] = [1, "a", 2];
const isNumber = (value: unknown): value is number => typeof value === "number";

Pact.pipe(values, Pact.filter(isNumber), Pact.toArray); // [1, 2]
Pact.pipe([[1, 2], [3]], Pact.flatten(), Pact.toArray); // [1, 2, 3]
Pact.pipe([1, 2], Pact.map((n) => [`n${n}`, n] as const), Pact.toMap); // new Map([["n1", 1], ["n2", 2]])
```

The types of the callbacks and options are exported too. The ones from
`@hyperjump/pact/async` have the same names. Their callbacks can return
promises.

| Type | Is |
| --- | --- |
| `Mapper<A, B>` | `(item: A, index: number) => B`, for `map` |
| `FlatMapper<A, B>` | A `Mapper` that returns an iterable or an iterator of `B`, for `flatMap` |
| `Predicate<A>` | `(item: A, index: number) => unknown`, for `filter`, `find`, and others |
| `TypeGuard<A, S>` | A `Predicate` that's a type guard for `S`, for `filter` and `find` |
| `Tapper<A>` | `(item: A, index: number) => void`, for `tap` and `forEach` |
| `Reducer<A, B>` | `(acc: B, item: A, index: number) => B`, for `reduce` and `scan` |
| `NestedIterable<A>` | An iterable of `A`s and other `NestedIterable<A>`s, for `flatten` |
| `Flattenable<A>` | An iterable or an iterator of `A` that isn't a string, for `flatMap` and `zip` |
| `AnyIterable<A>` | An iterable or an async iterable of `A`. Only in `@hyperjump/pact/async` |
| `ZipOptions` | `zip`'s options in the `shortest` and `strict` modes |
| `ZipLongestOptions<P>` | `zip`'s options in the `longest` mode, with `padding` |

```typescript
import * as Pact from "@hyperjump/pact";

const isEven: Pact.Predicate<number> = (n) => n % 2 === 0;
const evens = Pact.filter(isEven);
```
