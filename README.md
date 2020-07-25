# Hyperjump Pact

Hyperjump Pact is a utility library for working with promises. Many promise
implementations include these kinds of functions, but this is a
promise-implementation agnostic library. All functions are curried and designed
for pipelining.

## Installation

```bash
npm install @hyperjump/pact --save
```

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

## Usage

The following is short demo using the [Hyperjump Browser][browser] whose use of
promises is ideal for illustrating how these functions can be used. See the
[API](#api) section below to see all of the things you can do.

This example uses the API at [https://swapi.hyperjump.io](https://explore.hyperjump.io#https://swapi.hyperjump.io/api/films/1).
It's a variation of the [Star Wars API (SWAPI)](https://swapi.dev)
implemented using the [JRef][jref] media type.

```javascript
const Hyperjump = require("@hyperjump/browser");
const Pact = require("@hyperjump/pact");


const characterHomeworlds = Pact.map(async (character) => {
  const name = await character.name;
  const homeworld = await character.homeworld.name;

  return `${name} is from ${homeworld}`;
});

const ladies = Pact.pipeline([
  Pact.filter(async (character) => (await character.gender) === "female"),
  Pact.map((character) => character.name)
]);

const mass = Pact.reduce(async (acc, character) => {
  return acc + (parseInt(await character.mass, 10) || 0);
}, 0);

(async function () {
  const film = Hyperjump.fetch("https://swapi.hyperjump.io/api/films/1");

  await film.title; // --> A New Hope
  await characterHomeworlds(film.characters); // --> [ 'Luke Skywalker is from Tatooine',
                                              // -->   'C-3PO is from Tatooine',
                                              // -->   'R2-D2 is from Naboo',
                                              // -->   ... ]
  await ladies(film.characters); // --> [ 'Leia Organa', 'Beru Whitesun lars' ]
  await mass(film.characters); // --> 1290
}());
```

## API

The documentation here is pretty light, but these are implementations of common
higher-order functions and they work exactly like you would expect them to
except that they work with promises.

### entries
`(object<A>) => Promise<[string, A][]>`

### map
`((A, number?) => any, A[]|Promise<A[]>, Options) => Promise<any>`

### filter
`((A, number?) => boolean|Promise<boolean>, A[]|Promise<A[]>, Options) => Promise<A[]>`

### reduce
`((B, A, number?) => B, A[]|Promise<A[]>, B, Options) => Promise<B>`

### some
`((A, number?) => boolean|Promise<boolean>, A[]|Promise<A[]>, Options) => Promise<boolean>`

### every
`((A, number?) => boolean|Promise<boolean>, A|Promise<A>, Options) => Promise<boolean>`

### pipeline
`(Function[], any) => Promise<any>`

Compose an array of functions that call the next function with result of the
previous function.

### all
`(Promise<A>[]) => A[]`

### allValues
`(object<Promise<A>>) => object<A>`

`allValues` is like `all` except it resolves promise for each value in an object
rather than each item in an array.

[hyperjump]: https://github.com/hyperjump-io/browser
[jref]: https://github.com/hyperjump-io/browser/blob/master/lib/json-reference/README.md
[rollup]: https://rollupjs.org
