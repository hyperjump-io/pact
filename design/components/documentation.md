# Documentation

The API docs are generated from the `.d.ts` files with TypeDoc
(`npm run docs`), and the `docs` workflow publishes them to
pact.hyperjump.io with GitHub Pages. The README has an introduction and
examples.

## Open questions

- json-schema, hjlint, and browser have their user docs in `website/`,
  built into the hyperjump.io site from `../hyperjump.io`. Should pact move
  there? It would need a `website/` here, a `docs-changed` workflow, and
  pact.hyperjump.io redirected.
- v2 needs a migration guide from v1, wherever the docs end up.
