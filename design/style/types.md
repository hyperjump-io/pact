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
  contextual typing doesn't reach. That's every function declared with
  overloads, like `filter` and `zip`.
- A type that both entry points declare the same way is in
  `common.d.ts`, and each entry point exports it from there.
- What the declarations infer is tested in `src/types.test-d.ts` (see
  [Testing](../components/testing.md)), and why they're declared the way
  they are is in [Types](../components/types.md).
- Return types say what a value can do, not how it's made:
  `IteratorObject<T, undefined, unknown>` and
  `AsyncIteratorObject<T, undefined, unknown>`, not `Generator<T>` (see
  [Iterators](../components/iterators.md)). The `undefined` and `unknown`
  are what the native helpers declare. `IteratorObject` is where
  TypeScript declares the native helper methods, so they're typed on what
  pact returns. It needs TypeScript 5.6 or later.
