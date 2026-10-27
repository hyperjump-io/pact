# Follow the platform

Where JavaScript has an equivalent, or a TC39 proposal is working on one,
pact uses its name and its behavior.

Why: users learn one vocabulary, a pipeline step does what the method of
the same name would, and pact can delegate to the native version later if
that becomes faster without changing what anything means.

Where it shows up:

- [Names](../components/names.md): `toArray`, `flatMap`, `forEach`,
  `reduce` without an initial value, the index passed to callbacks,
  `range` with a step like `Iterator.range`, `concat` like
  `Iterator.concat`, and `zip` and `zipKeyed` like the Joint Iteration
  proposal's `Iterator.zip` and `Iterator.zipKeyed`.
- [Iterators](../components/iterators.md): what pact returns extends
  `Iterator.prototype`, so the native helpers work on it.
