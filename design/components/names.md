# Names

What changes from v1 (see [Follow the platform](../principles/follow-the-platform.md)).
Each applies to the sync and async versions.

## Renamed or changed

| v1 | v2 | Why |
| --- | --- | --- |
| `collectArray` | `toArray` | The native helper's name |
| `reduce(fn, acc)` | `reduce(fn, acc?)` | Without an initial value, the first item is the initial value, as natively |
| `zip(a, b)` | `zip(iterables, options?)` | Like the Joint Iteration proposal's `Iterator.zip` |
| `concat(...iterables)` | `concat(...iterables)` | Same signature, behaves like `Iterator.concat` |
| `range(from, to?)` | `range(from, to?, step?)` | |
| `asyncX` exports | `x` from `/async` | See [Entry points](entry-points.md) |

`zip` stops at the shortest input by default. Its `mode` option is
`"shortest"`, `"longest"` (with `padding`), or `"strict"` (throws if the
lengths differ), as in the proposal. It closes the inputs that aren't done
when it stops. v1 gave `undefined` for a shorter second input and never
closed it.

## Added

- `flatMap` and `forEach`, which the native helpers have.
- `compose` (see [Pipe](pipe.md)).

## Kept

pact's own functions, which the platform doesn't have: `scan`, `tap`,
`takeWhile`, `dropWhile`, `flatten` (with a depth), `head`, `count`,
`join`, `empty`, `collectSet`, `collectMap`, and `collectObject`. `drop`,
`take`, `filter`, `map`, `some`, `every`, and `find` keep their names,
which are the native ones.

## Open questions

- Should `collectSet`, `collectMap`, and `collectObject` become `toSet`,
  `toMap`, and `toObject`, to match `toArray`?
