# Types

- The API is declared in hand-written `.d.ts` files next to the JS, and
  they're the source of truth for it. They have JSDoc explaining the
  details, which editors and the generated API docs show.
- The JS is typed with JSDoc. Type-checking (`npm run type-check`) includes
  the declaration files (`skipLibCheck` is off).
- A JSDoc cast wraps only what's being cast, like
  `/** @type any */ (item)`. The `no-extra-parens` lint rule doesn't allow
  a cast around a whole expression, so a declaration gets its type from
  `@type` above it instead, and its parameters are annotated where
  contextual typing doesn't reach.
- Return types say what a value can do, not how it's made:
  `IteratorObject<T>` and `AsyncIteratorObject<T>`, not `Generator<T>`
  (see [Iterators](../components/iterators.md)).
