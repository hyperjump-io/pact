# Pipe first

Every function is made to be a step in a `pipe`. Configuration comes first
and the iterable comes last, and a function takes only its configuration
and returns the step.

Why: the native Iterator helpers already cover calling a function on an
iterator directly (`iterator.map(fn)`). What they don't do is compose: a
pipeline can't be built before it has a source, steps can't be shared
between pipelines, and functions the platform doesn't have, like `scan`
or `collectMap`, can't be chained. That's what pact is for.

Where it shows up:

- [Pipe](../components/pipe.md): there's no currying and no direct-call
  form.
- [Names](../components/names.md): functions with no configuration
  (`toArray`, `count`, `head`) are steps as they are.
