# Hyperjump - Pact

Higher order functions for iterators and async iterators. Each function is
a step you put in a `pipe`, and a pipeline does its work one value at a
time, only as values are asked for.

## Install

```bash
npm install @hyperjump/pact
```

## Usage

```javascript
import * as Pact from "@hyperjump/pact";

Pact.pipe(
  Pact.range(1, 10),
  Pact.filter((n) => n % 2 === 0),
  Pact.map((n) => n * 2),
  Pact.reduce((sum, n) => sum + n, 0)
); // 40
```

## Documentation

The documentation is in [`website/`](website/README.md), and on
[hyperjump.io](https://hyperjump.io/pact/). Start with
[Pipelines](website/pipelines.md).

## Contributing

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner

```bash
npm test -- --watch
```

Lint and type-check

```bash
npm run lint
npm run type-check
```

Check that the examples in `website/` give what they say they do

```bash
npm run check-website
```

The design docs, principles, and style guide are in
[`design/`](design/README.md).
