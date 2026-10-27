# Pipe

Every function takes only its configuration and returns a step, a
function from an iterable to an iterable or to a result. `pipe(source,
...steps)` runs a source through the steps. There's no currying, and no
form that takes the iterable as a last argument (see
[Pipe first](../principles/pipe-first.md)).

```javascript
pipe(range(1, 10), filter(isEven), map(double), reduce(add, 0));
```

- `pipe` is a plain loop over its steps.
- `compose(...steps)` returns a step that runs `steps` in order, for
  building a pipeline before it has a source.
- `pipe` and `compose` are typed with overloads for each number of steps,
  so each step's input is checked against the previous step's output.

## Why

v1's setup cost per pipeline was about 6 times the native helpers' (see
[Generators](../benchmarks/generators.md)). Part of that was `curry`, which
every call goes through to decide whether it got the iterable, and `pipe`,
which ran its steps with the curried `reduce` instead of a loop.

Dependents almost always use `pipe`. `json-schema-language-tools` has 22
`pipe` calls and about two direct calls (as of 2026-10-27).

## Rejected

- **Keeping both forms** (`map(fn)` and `map(fn, iterable)`). It doubles
  every declaration, and deciding which form was called is what `curry`
  does. It also had a bug: `map(fn, undefined)` returns a step instead of
  throwing, because `curry` looks for `undefined`.
- **Keeping both forms with hand-written overloads instead of `curry`.**
  It would be fast, but the direct form is what the native helpers are for.
