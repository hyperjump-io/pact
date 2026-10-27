/**
 * The async versions of the functions in `@hyperjump/pact`. Each one accepts
 * Iterables and AsyncIterables, and its callbacks can return promises.
 *
 * @module @hyperjump/pact/async
 */

export { pipe, compose, range } from "./common.js";

/**
 * Apply a function to every value in the iterator. Like the native Iterator
 * helpers, functions that take a callback pass it each value and its index.
 */
export const map: <A, B>(fn: Mapper<A, B>) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<B>;
export type Mapper<A, B> = (item: A, index: number) => Promise<B> | B;

/**
 * Apply a function to every value in the iterator, but yield the original
 * value, not the result of the function.
 */
export const tap: <A>(fn: Tapper<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<A>;
export type Tapper<A> = (item: A, index: number) => Promise<void> | void;

/**
 * Yields only the values in the iterator that pass the predicate function.
 */
export const filter: <A>(fn: Predicate<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<A>;
export type Predicate<A> = (item: A, index: number) => Promise<boolean> | boolean;

/**
 * Same as `reduce` except it emits the accumulated value after each update
 */
export const scan: <A, B>(fn: Reducer<A, B>, initial: B) => (iter: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<B>;

/**
 * Yields values from the iterator with all sub-iterator elements concatenated
 * into it recursively up to the specified depth. The default depth is 1.
 */
export const flatten: (depth?: number) => <A>(iterator: NestedIterable<A>) => AsyncGenerator<A | NestedIterable<A>>;
export type NestedIterable<A> = Iterable<A | NestedIterable<A>> | AsyncIterable<A | NestedIterable<A>>;

/**
 * Apply a function that returns an iterable to every value in the iterator,
 * and yield the values of each iterable. Unlike `flatten`, it goes one level
 * deep, and `fn` has to return an iterable or an iterator, not a string or
 * other value.
 */
export const flatMap: <A, B>(fn: FlatMapper<A, B>) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<B>;
export type FlatMapper<A, B> = (item: A, index: number) => Promise<FlatMapResult<B>> | FlatMapResult<B>;
type FlatMapResult<B> = Iterable<B> | AsyncIterable<B> | Iterator<B> | AsyncIterator<B>;

/**
 * Yields all the values in the iterator except for the first `n` values.
 */
export const drop: <A>(count: number) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<A>;

/**
 * Same as `drop` but instead of dropping a specific number of values, it drops
 * values until the `fn(value)` is `false` and then yields the remaining values.
 */
export const dropWhile: <A>(fn: Predicate<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<A>;

/**
 * Yields the first `n` values in the iterator.
 */
export const take: <A>(count: number) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<A>;

/**
 * Same as `take` but instead of yielding a specific number of values, it yields
 * values as long as the `fn(value)` returns `true` and drops the rest.
 */
export const takeWhile: <A>(fn: Predicate<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => AsyncGenerator<A>;

/**
 * Returns the first value in the iterator. The iterator is closed after
 * the first value is read, so the rest can't be read from it.
 */
export const head: <A>(iterator: Iterable<A> | AsyncIterable<A>) => Promise<A | undefined>;

/**
 * Yields nothing.
 */
export const empty: () => AsyncGenerator<never>;

/**
 * Yields tuples containing a value from each iterator. The iterator will have
 * the same length as `iter1`. If `iter1` is longer than `iter2`, the second
 * value of the tuple will be undefined. If `iter2` is longer than `iter1`, the
 * remaining values in `iter2` will be ignored.
 */
export const zip: <A, B>(iter1: Iterable<A> | AsyncIterable<A>, iter2: Iterable<B> | AsyncIterable<B>) => AsyncGenerator<[A, B]>;

/**
 * Yields values from each iterator in order.
 */
export const concat: <A>(...iters: (Iterable<A> | AsyncIterable<A>)[]) => AsyncGenerator<A>;

/**
 * Reduce an iterator to a single value. Without an initial value, the first
 * value in the iterator is the initial value, and an empty iterator throws a
 * TypeError.
 */
export const reduce: (
  <A, B>(fn: Reducer<A, B>, initial: B) => (iter: Iterable<A> | AsyncIterable<A>) => Promise<B>
) & (
  <A>(fn: Reducer<A, A>) => (iter: Iterable<A> | AsyncIterable<A>) => Promise<A>
);
export type Reducer<A, B> = (acc: B, item: A, index: number) => Promise<B> | B;

/**
 * Returns a boolean indicating whether or not all values in the iterator passes
 * the predicate function.
 */
export const every: <A>(fn: Predicate<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => Promise<boolean>;

/**
 * Returns a boolean indicating whether or not there exists a value in the
 * iterator that passes the predicate function.
 */
export const some: <A>(fn: Predicate<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => Promise<boolean>;

/**
 * Returns the first value that passes the predicate function.
 */
export const find: <A>(fn: Predicate<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => Promise<A | undefined>;

/**
 * Call a function with every value in the iterator. Unlike `tap`, it ends a
 * pipeline.
 */
export const forEach: <A>(fn: Tapper<A>) => (iterator: Iterable<A> | AsyncIterable<A>) => Promise<void>;

/**
 * Returns the number of items in the iterator.
 */
export const count: <A>(iterator: Iterable<A> | AsyncIterable<A>) => Promise<number>;

/**
 * Collect all the items in the iterator into an array.
 */
export const toArray: <A>(iterator: Iterable<A> | AsyncIterable<A>) => Promise<A[]>;

/**
 * Collect all the items in the iterator into a Set.
 */
export const toSet: <A>(iterator: Iterable<A> | AsyncIterable<A>) => Promise<Set<A>>;

/**
 * Collect all the key/value tuples in the iterator into a Map.
 */
export const toMap: <A, B>(iterator: Iterable<[A, B]> | AsyncIterable<[A, B]>) => Promise<Map<A, B>>;

/**
 * Collect all the key/value tuples in the iterator into an Object.
 */
export const toObject: <A>(iterator: Iterable<[string, A]> | AsyncIterable<[string, A]>) => Promise<Record<string, A>>;

/**
 * Collect all the items in the iterator into a string separated by the
 * separator token.
 */
export const join: (separator: string) => (iterator: Iterable<string> | AsyncIterable<string>) => Promise<string>;
