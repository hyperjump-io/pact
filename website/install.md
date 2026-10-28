# Install

```bash
npm install @hyperjump/pact
```

It's an ES module with no dependencies. It needs the global `Iterator`
that the native Iterator helpers come with: Node.js 22 or later, and
browsers since Chrome 122, Firefox 131, and Safari 18.4.

There are two entry points. Their functions have the same names.

```typescript
import { pipe, map, toArray } from "@hyperjump/pact";
import * as Async from "@hyperjump/pact/async";
```

- `@hyperjump/pact` has the functions for iterables.
- `@hyperjump/pact/async` has the functions for async iterables (see
  [Async](async.md)).

## TypeScript

The package includes its type declarations, and needs TypeScript 5.6 or
later. Each step's input is checked against the step before it, so a
pipeline that passes numbers to a step that takes strings is a type error.
A step that's made outside a pipeline, like one made for `compose`, has no
step before it to get its input's type from, so give its callback's
parameter a type.

Every function that returns an iterator is declared to return an
`IteratorObject` (`AsyncIteratorObject` from `@hyperjump/pact/async`).
With `esnext` or `es2025` in your `lib`, the native helper methods are
typed on it, as they are on an array's iterator.

The types of the callbacks and options are exported too. The ones from
`@hyperjump/pact/async` have the same names, and their callbacks can
return promises.

| Type | Is |
| --- | --- |
| `Mapper<A, B>` | `(item: A, index: number) => B`, for `map` |
| `FlatMapper<A, B>` | A `Mapper` that returns an iterable or an iterator of `B`, for `flatMap` |
| `Predicate<A>` | `(item: A, index: number) => boolean`, for `filter`, `find`, and others |
| `Tapper<A>` | `(item: A, index: number) => void`, for `tap` and `forEach` |
| `Reducer<A, B>` | `(acc: B, item: A, index: number) => B`, for `reduce` and `scan` |
| `NestedIterable<A>` | An iterable of `A`s and other `NestedIterable<A>`s, for `flatten` |
| `ZipOptions` | `zip`'s options in the `shortest` and `strict` modes |
| `ZipLongestOptions<P>` | `zip`'s options in the `longest` mode, with `padding` |

```typescript
import { filter } from "@hyperjump/pact";
import type { Predicate } from "@hyperjump/pact";

const isEven: Predicate<number> = (n) => n % 2 === 0;
const evens = filter(isEven);
```
