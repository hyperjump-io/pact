# Names

What changes from v1 (see [Follow the platform](../principles/follow-the-platform.md)).
Each applies to the sync and async versions.

## Renamed or changed

| v1 | v2 | Why |
| --- | --- | --- |
| `collectArray` | `toArray` | The native helper's name |
| `collectSet`, `collectMap`, `collectObject` | `toSet`, `toMap`, `toObject` | To read the same as `toArray`. The platform doesn't have them |
| `reduce(fn, acc)` | `reduce(fn, acc?)` | Without an initial value, the first item is the initial value, and an empty input throws a `TypeError`, as natively |
| `zip(a, b)` | `zip(iterables, options?)` | Like the Joint Iteration proposal's `Iterator.zip` |
| `concat(...iterables)` | `concat(...iterables)` | Same signature, behaves like `Iterator.concat` |
| `range(from, to?)` | `range(from, to?, step?)` | Like the `Iterator.range` proposal: a negative step counts down, and a step of 0 or an argument that's `NaN` throws a `RangeError` |
| `head(iterable)` | `head(iterable)` | Closes the iterator after reading the first value, so the rest can't be read from it (see [Close what you open](../principles/close-what-you-open.md)) |
| `asyncX` exports | `x` from `/async` | See [Entry points](entry-points.md) |

`zip` takes an array of any number of iterables and stops at the shortest
by default. Its `mode` option is `"shortest"`, `"longest"` (with
`padding`, an iterable with a value for each position), or `"strict"`
(throws a `TypeError` if they aren't all done at the same time), as in the
proposal. It closes the inputs that aren't done when it stops, including
when one of them throws, and a string isn't accepted as an input, as in
`flatMap`. v1 took two iterables, padded a shorter second one with
`undefined`, ignored the rest of a longer second one, and never closed it.

```javascript
zip([[1, 2, 3], ["a", "b"]]);                       // [1, "a"], [2, "b"]
zip([[1, 2, 3], ["a"]], { mode: "longest", padding: [0, "?"] });
                                                    // [1, "a"], [2, "?"], [3, "?"]
zipKeyed({ name: names, age: ages });               // { name, age }, ...
```

`zip` is a source, like `concat`, because it needs all of its iterables
before it starts.

The async `zip` reads the iterables that aren't done at the same time for
each tuple, so a tuple takes as long as the slowest iterable instead of
all of them together. The proposal has no async version. Reading them one
at a time was rejected: it's slower, and its only advantage is a
guaranteed order for iterables whose reads have side effects.

## Callbacks get the index

As in the native helpers, a callback gets each value's index after the
value: `map`, `filter`, `flatMap`, `forEach`, `some`, `every`, `find`,
`tap`, `takeWhile`, and `dropWhile` call `fn(value, index)`, and `reduce`
and `scan` call `fn(acc, value, index)`. Without an initial value,
`reduce`'s first call is for the second value, so its first index is 1, as
natively. It's tested for every function in `callbacks.test.js`.

The cost is the native one: a function with an optional second parameter
gets the index there, so `map(parseInt)` parses with the index as the
radix. Passing only the value was rejected because it would make a pact
step behave differently from the method of the same name.

## Added

- `flatMap(fn)`, as natively: `fn` returns an iterable or an iterator, and
  its values are yielded, one level deep. A string or another value that
  isn't an object throws a `TypeError`. `flatten(depth)` is still there for
  values that are already nested, to any depth, with values that aren't
  iterable passed through. The async `flatMap` also accepts async iterables
  and async iterators.
- `forEach(fn)`, as natively: a collector that calls `fn` with each value
  and returns `undefined`. It's for side effects at the end of a pipeline.
  `tap` is for looking at values in the middle of one.
- `zipKeyed(iterables, options?)`, like `Iterator.zipKeyed` from the same
  proposal: it takes an object of iterables and yields objects with the
  same keys. Keys whose value is `undefined` are left out, and `padding`
  is an object.
- `compose` (see [Pipe](pipe.md)).

## Kept

pact's own functions, which the platform doesn't have: `scan`, `tap`,
`takeWhile`, `dropWhile`, `flatten` (with a depth), `head`, `count`,
`join`, and `empty`. `drop`, `take`, `filter`, `map`, `some`, `every`, and
`find` keep their names, which are the native ones.
