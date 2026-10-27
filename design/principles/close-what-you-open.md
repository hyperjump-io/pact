# Close what you open

Anything that gets an iterator from an iterable and stops before the
iterator is done calls its `return()`. That includes a step that stops
early (`take`, `takeWhile`), a collector that stops early (`find`, `some`,
`every`, `head`), and `zip` when one input runs out before the others. A
step whose own `return()` is called passes it on to its source.

Why: closing an iterator is how its source cleans up. A generator's
`finally` blocks run, and a file or a network stream gets closed. Leaving
an iterator open leaks whatever it was holding.

Generators did this for free (`for...of` and `yield*` call `return()`), so
v1 got it right except where it called `next()` itself (`zip` never closes
its second input). Hand-written iterators have to do it themselves, which
is why it's tested for every function (see [Testing](../components/testing.md)).
