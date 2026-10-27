# Hyperjump Pact

Hyperjump Pact is a utility library that provides higher order functions for
working with iterators and async iterators.

## Installation
Designed for node.js (ES Modules, TypeScript) and browsers.

```bash
npm install @hyperjump/pact --save
```

## Usage

```javascript
import { pipe, range, map, filter, reduce } from "@hyperjump/pact";


const result = pipe(
  range(1, 10),
  filter((n) => n % 2 === 0),
  map((n) => n * 2),
  reduce((sum, n) => sum + n, 0)
);
console.log(result);
```

The async versions are in `@hyperjump/pact/async`, with the same names. They
accept Iterables and AsyncIterables, and their callbacks can return promises.

```javascript
import { pipe, map, filter, reduce } from "@hyperjump/pact/async";


const asyncSequence = async function* () {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
};

const result = await pipe(
  asyncSequence(),
  filter((n) => n % 2 === 0),
  map(async (n) => n * 2),
  reduce((sum, n) => sum + n, 0)
);
console.log(result);
```

To use both in one module, import one of them as a namespace.

```javascript
import { pipe, range, filter } from "@hyperjump/pact";
import * as Async from "@hyperjump/pact/async";


const result = await pipe(
  range(1, 10),
  filter((n) => n % 2 === 0),
  Async.map(async (n) => n * 2),
  Async.toArray
);
console.log(result);
```

## API

https://pact.hyperjump.io

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

The design docs, principles, and style guide are in
[`design/`](design/README.md).
