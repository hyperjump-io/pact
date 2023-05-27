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

```javascript
import { pipe, asyncMap, asyncFilter, asyncReduce } from "@hyperjump/pact";


const asyncSequence = async function* () {
  yield Promise.resolve(1);
  yield Promise.resolve(2);
  yield Promise.resolve(3);
  yield Promise.resolve(4);
  yield Promise.resolve(5);
};

for await (const value of asyncSequence()) {
  console.log(value);
}

const result = await pipe(
  asyncSequence(),
  asyncFilter((n) => n % 2 === 0),
  asyncMap((n) => n * 2),
  asyncReduce((sum, n) => sum + n, 0)
);
console.log(result);
```

## API
* **map**: (fn: Function, iterator: Iterable) => Generator

    Apply a function to every value in the iterator
* **asyncMap**: (fn: Function, iterator: AsyncIterable) => AsyncGenerator

    Same as `map`, but works with promises.
* **filter**: (fn: Function, iterator: Iterable) => Generator

    Yields only the values in the iterator that pass the predicate function.
* **asyncFilter**: (fn: Function, iterator: AsyncIterable) => AsyncGenerator

    Same as `filter`, but works with promises.
* **drop**: (n: number, iterator: Iterable) => Generator

    Yields all the values in the iterator except for the first `n` values.
* **asyncDrop**: (n: number, iterator: AsyncIterable) => AsyncGenerator

    Same as `drop`, but works with promises.
* **take**: (n: number, iterator: Iterable) => Generator

    Yields the first `n` values in the iterator.
* **asyncTake**: (count: number, iterator: AsyncIterable) => AsyncGenerator

    Same as `take`, but works with promises.
* **range**: (from: number, to?: number) => Generator

    Yields numbers starting from `from` until `to`. If `to` is not passed, the
    iterator will be infinite.
* **zip**: (iter1: Iterable, iter2: Iterable) => Generator

    Yields tuples containing a value from each iterator. The iterator will have
    the same length as `iter1`. If `iter1` is longer than `iter2`, the second
    value of the tuple will be undefined. If `iter2` is longer than `iter1`, the
    remaining values in `iter2` will be ignored.
* **asyncZip**: (iter1: AsyncIterable, iter2: AsyncIterable) => AsyncGenerator

    Same as `zip` but works with promises.
* **reduce**: (fn: Function, acc: any, iter: Iterable) => any

    Reduce an iterator to a single value.
* **asyncReduce**: (fn: AsyncReducer, acc: any, iter: AsyncIterable) => Promise<any>

    Same as `reduce`, but works with promises.
* **every**: (fn: Function, iterator: Iterable) => boolean

    Returns a boolean indicating whether or not all values in the iterator
    passes the predicate function.
* **asyncEvery**: (fn: AsyncPredicate, iterator: AsyncIterable) => Promise<boolean>

    Same as `every`, but works with promises.
* **some**: (fn: Function, iterator: Iterable) => boolean

    Returns a boolean indicating whether or not there exists a value in the
    iterator that passes the predicate function.
* **asyncSome**: (fn: AsyncPredicate, iterator: AsyncIterable) => Promise<boolean>

    Same as `some`, but works with promises.
* **collectArray**: (fn: Iterable) => Array;

    Collect all the items in the iterator into an array.
* **asyncCollectArray**: (fn: AsyncIterable) => Promise<Array>;

    Same as `collectArray`, but works with promises.
* **collectSet**: (fn: Iterable) => Set;

    Collect all the items in the iterator into a Set.
* **asyncCollectSet**: (fn: AsyncIterable) => Promise<Set>;

    Same as `collectSet`, but works with promises.
* **collectMap**: (fn: Iterable) => Map;

    Collect all the key/value tuples in the iterator into a Map.
* **asyncCollectMap**: (fn: AsyncIterable) => Promise<Map>;

    Same as `collectMap`, but works with promises.
* **collectObject**: (fn: Iterable) => Object;

    Collect all the key/value tuples in the iterator into an Object.
* **asyncCollectObject**: (fn: AsyncIterable) => Promise<Object>;

    Same as `collectObject`, but works with promises.
* **pipe**: (iterator: Iterable | AsyncIterable, ...fns: Function) => any;

    Starting with an iterator, apply any number of functions to transform the
    values and return the result.

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

[hyperjump]: https://github.com/hyperjump-io/browser
[jref]: https://github.com/hyperjump-io/browser/blob/master/lib/json-reference/README.md
