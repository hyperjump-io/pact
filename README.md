# Hyperjump - Pact

Higher-order functions for iterators and async iterators. Each function is
a step you put in a `pipe`. A pipeline does its work one value at a time,
and only when a value is asked for.

**[Read the documentation at hyperjump.io](https://hyperjump.io/pact/)**

```bash
npm install @hyperjump/pact
```

```typescript
import * as Pact from "@hyperjump/pact";

const numbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

Pact.pipe(
  numbers,
  Pact.filter((n) => n % 2 === 0),
  Pact.map((n) => n * 2),
  Pact.take(3),
  Pact.toArray
); // [4, 8, 12]
```

The pipeline reads the `Set` directly, without making arrays in between
steps, and `take(3)` stops it at 6. Array methods would copy the `Set` into
an array first, and then filter and map all of it.

- **Composable.** Steps are plain functions. Use `compose` to build a
  pipeline without a source, then use it with as many sources as you like.
- **The platform's names.** `map`, `filter`, `take`, `flatMap`, `toArray`,
  and the rest work like the native Iterator helpers. pact adds what the
  helpers don't have, like `scan`, `takeWhile`, `zip`, and `toObject`.
- **Sync and async.** `@hyperjump/pact/async` has the same functions for
  async iterables. Its callbacks can return promises.
- **Closes what it opens.** When a pipeline stops early, it closes the
  iterators it was reading. A generator's `finally` block runs.
- **Small and fast.** No dependencies. TypeScript types included. Works in
  Node.js 24 or later and browsers.

## Documentation

The documentation is at **[hyperjump.io/pact](https://hyperjump.io/pact/)**.

- [Install](https://hyperjump.io/pact/install/): Node.js, browsers, and
  TypeScript
- [Pipelines](https://hyperjump.io/pact/pipelines/): `pipe`, `compose`,
  and what a step is
- [Transforming](https://hyperjump.io/pact/transforming/): `map`,
  `filter`, `take`, and the other steps
- [Sources](https://hyperjump.io/pact/sources/): `range`, `concat`, `zip`,
  and `zipKeyed`
- [Collecting](https://hyperjump.io/pact/collecting/): `toArray`,
  `reduce`, `find`, and the other functions that end a pipeline
- [Async](https://hyperjump.io/pact/async/): async iterables, async
  callbacks, and mixing them with sync ones
- [Benchmarks](https://hyperjump.io/pact/benchmarks/): pipelines compared
  with array methods
- [Migrating from v1](https://hyperjump.io/pact/migrating/): what changed,
  and what to do about it

Using v1? See the
[v1 README](https://github.com/hyperjump-io/pact/tree/v1#readme).

## Contributing

See [`design/`](design/README.md) for how it works and why. The
documentation's source is in [`website/`](website/README.md).

```bash
npm install
npm test               # Run the tests
npm test -- --watch    # Run the tests when files change
npm run lint
npm run type-check
npm run check-website  # Check the examples in website/
```

## License

MIT
