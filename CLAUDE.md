# @hyperjump/pact

Higher order functions for iterators and async iterators. v2 is a major
version that replaces the generators with hand-written iterators and
changes the API (see `design/README.md`).

## Docs

- `design/` is for contributors. Start with `design/README.md`, the index,
  and read only the documents about what you're working on. `principles/`
  are the rules decisions are made by, `style/` is how code is laid out,
  `components/` say how each part works and what was decided, with its
  open questions, and `benchmarks/` are dated measurements.
- The API docs are generated from the `.d.ts` files with TypeDoc
  (`npm run docs`) and published to pact.hyperjump.io.
- `TODO.md` is the plan and what's next. It isn't committed.
- Prefer many small documents that each cover one thing. A change to how
  something works updates its document in the same commit. A decision
  that's made goes in its component's document, with what was rejected
  and why.

## Development

- `npm test`, `npm run lint`, `npm run type-check`
- The API is declared in hand-written `.d.ts` files next to the JS, which is
  typed with JSDoc. Type-checking includes the declaration files.
- `benchmark/` isn't committed. `benchmark/claude/` has one-off
  benchmarks.

## Working agreements

- Ask before committing. Keep unrelated changes in separate commits.
