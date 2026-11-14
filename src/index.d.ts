/**
 * Higher order functions for iterators. The async versions are in
 * `@hyperjump/pact/async`.
 */

import type { ZipOptions, ZipLongestOptions, ZipPadding, ZipKey } from "./common.d.ts";

export { pipe, compose, range } from "./common.js";
export type { ZipOptions, ZipLongestOptions, ZipPadding } from "./common.d.ts";

/**
 * Apply a function to every value in the iterator. Like the native Iterator
 * helpers, functions that take a callback pass it each value and its index.
 */
export const map: <A, B>(fn: Mapper<A, B>) => (iterator: Iterable<A>) => IteratorObject<B, undefined, unknown>;
export type Mapper<A, B> = (item: A, index: number) => B;

/**
 * Apply a function to every value in the iterator, but yield the original
 * value, not the result of the function.
 */
export const tap: <B extends A, A = B>(fn: Tapper<A>) => (iterator: Iterable<B>) => IteratorObject<B, undefined, unknown>;
export type Tapper<A> = (item: A, index: number) => void;

/**
 * Yields only the values in the iterator that pass the predicate function.
 * A predicate that's a type guard narrows the type of the values.
 */
export const filter: (
  <A, S extends A>(fn: TypeGuard<A, S>) => (iterator: Iterable<A>) => IteratorObject<S, undefined, unknown>
) & (
  <B extends A, A = B>(fn: Predicate<A>) => (iterator: Iterable<B>) => IteratorObject<B, undefined, unknown>
);
export type Predicate<A> = (item: A, index: number) => unknown;
export type TypeGuard<A, S extends A> = (item: A, index: number) => item is S;

/**
 * Same as `reduce` except it emits the accumulated value after each update
 */
export const scan: <A, B>(fn: Reducer<A, B>, initial: B) => (iter: Iterable<A>) => IteratorObject<B, undefined, unknown>;

/**
 * Yields values from the iterator with all sub-iterator elements concatenated
 * into it recursively up to the specified depth. The default depth is 1.
 */
export const flatten: <Depth extends number = 1>(depth?: Depth) => <A>(iterator: Iterable<A>) => IteratorObject<Flattened<A, number extends Depth ? 20 : Depth>, undefined, unknown>;
export type NestedIterable<A> = Iterable<A | NestedIterable<A>>;

/**
 * What `flatten` yields for a value of type `A` that's `Depth` levels from
 * the last one it flattens. A string isn't flattened. A `Depth` that isn't
 * a literal number, like `Infinity`, flattens the type 20 levels.
 */
export type Flattened<A, Depth extends number> = {
  done: A;
  recur: A extends string ? A
    : A extends Iterable<infer Item> ? Flattened<Item, [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
      : A;
}[Depth extends 0 ? "done" : `${Depth}` extends `-${string}` ? "done" : "recur"];

/**
 * Apply a function that returns an iterable to every value in the iterator,
 * and yield the values of each iterable. Unlike `flatten`, it goes one level
 * deep, and `fn` has to return an iterable or an iterator, not a string or
 * other value.
 */
export const flatMap: <A, R extends Flattenable<unknown>>(fn: Mapper<A, R>) => (iterator: Iterable<A>) => IteratorObject<FlattenableItem<R>, undefined, unknown>;
export type FlatMapper<A, B> = Mapper<A, Flattenable<B>>;

/**
 * An iterable or an iterator of `A` that isn't a string, which is what
 * `flatMap`'s callback returns and what `zip` takes.
 */
export type Flattenable<A> = (Iterable<A> | Iterator<A>) & object;
export type FlattenableItem<R> = R extends Iterable<infer A> ? A : R extends Iterator<infer A> ? A : never;

/**
 * Yields all the values in the iterator except for the first `n` values.
 * `count` is truncated to an integer. One that's NaN or negative throws a
 * RangeError.
 */
export const drop: (count: number) => <A>(iterator: Iterable<A>) => IteratorObject<A, undefined, unknown>;

/**
 * Same as `drop` but instead of dropping a specific number of values, it drops
 * values until the `fn(value)` is `false` and then yields the remaining values.
 */
export const dropWhile: <B extends A, A = B>(fn: Predicate<A>) => (iterator: Iterable<B>) => IteratorObject<B, undefined, unknown>;

/**
 * Yields the first `n` values in the iterator.
 * `count` is truncated to an integer. One that's NaN or negative throws a
 * RangeError.
 */
export const take: (count: number) => <A>(iterator: Iterable<A>) => IteratorObject<A, undefined, unknown>;

/**
 * Same as `take` but instead of yielding a specific number of values, it yields
 * values as long as the `fn(value)` returns `true` and drops the rest.
 */
export const takeWhile: <B extends A, A = B>(fn: Predicate<A>) => (iterator: Iterable<B>) => IteratorObject<B, undefined, unknown>;

/**
 * Returns the first value in the iterator. The iterator is closed after
 * the first value is read, so the rest can't be read from it.
 */
export const head: <A>(iterator: Iterable<A>) => A | undefined;

/**
 * Yields nothing.
 */
export const empty: () => IteratorObject<never, undefined, unknown>;

/**
 * Yields tuples with the next value of each iterable, like `Iterator.zip` from
 * the Joint Iteration proposal. A string isn't accepted as an iterable.
 *
 * - `mode: "shortest"` (the default) stops when any of them is done.
 * - `mode: "longest"` stops when all of them are done, and uses the value at
 *   the same position in `padding` for the ones that are done, or
 *   `undefined`.
 * - `mode: "strict"` throws a TypeError if they aren't all done at the same
 *   time.
 *
 * When it stops, it closes the iterables that aren't done.
 */
export const zip: (
  <T extends readonly Flattenable<unknown>[]>(iterables: readonly [...T], options?: ZipOptions) => IteratorObject<{ [K in keyof T]: FlattenableItem<T[K]> }, undefined, unknown>
) & (
  <T extends readonly Flattenable<unknown>[], const P extends Iterable<unknown> = []>(iterables: readonly [...T], options: ZipOptions | ZipLongestOptions<P>) => IteratorObject<{ [K in keyof T]: FlattenableItem<T[K]> | ZipPadding<P, K> }, undefined, unknown>
) & (
  <R extends Flattenable<unknown>>(iterables: Iterable<R>, options?: ZipOptions) => IteratorObject<FlattenableItem<R>[], undefined, unknown>
) & (
  <R extends Flattenable<unknown>, const P extends Iterable<unknown> = []>(iterables: Iterable<R>, options: ZipOptions | ZipLongestOptions<P>) => IteratorObject<(FlattenableItem<R> | ZipPadding<P, number>)[], undefined, unknown>
);

/**
 * Same as `zip`, but takes an object of iterables, and yields objects with the
 * same keys, like `Iterator.zipKeyed` from the Joint Iteration proposal. Keys
 * whose value is `undefined` are left out. In `longest` mode, `padding` is an
 * object with a value for each key.
 */
export const zipKeyed: (
  <T extends ZipKeyedInputs>(iterables: T, options?: ZipOptions) => IteratorObject<{ [K in keyof T as ZipKey<T, K>]: ZipKeyedItem<T[K]> }, undefined, unknown>
) & (
  <T extends ZipKeyedInputs, const P extends { [K in keyof T]?: unknown } = {}>(iterables: T, options: ZipOptions | ZipLongestOptions<P>) => IteratorObject<{ [K in keyof T as ZipKey<T, K>]: ZipKeyedItem<T[K]> | (K extends keyof P ? P[K] : undefined) }, undefined, unknown>
);
export type ZipKeyedInputs = Record<PropertyKey, Flattenable<unknown> | undefined>;
type ZipKeyedItem<R> = FlattenableItem<R> | (undefined extends R ? undefined : never);

/**
 * Yields values from each iterator in order.
 */
export const concat: <T extends Iterable<unknown>[]>(...iters: T) => IteratorObject<FlattenableItem<T[number]>, undefined, unknown>;

/**
 * Reduce an iterator to a single value. Without an initial value, the first
 * value in the iterator is the initial value, and an empty iterator throws a
 * TypeError.
 */
export const reduce: (
  <A, B>(fn: Reducer<A, B>, initial: B) => (iter: Iterable<A>) => B
) & (
  <A>(fn: Reducer<A, A>) => (iter: Iterable<A>) => A
);
export type Reducer<A, B> = (acc: B, item: A, index: number) => B;

/**
 * Returns a boolean indicating whether or not all values in the iterator passes
 * the predicate function.
 */
export const every: <A>(fn: Predicate<A>) => (iterator: Iterable<A>) => boolean;

/**
 * Returns a boolean indicating whether or not there exists a value in the
 * iterator that passes the predicate function.
 */
export const some: <A>(fn: Predicate<A>) => (iterator: Iterable<A>) => boolean;

/**
 * Returns the first value that passes the predicate function. A predicate
 * that's a type guard narrows the type of the value.
 */
export const find: (
  <A, S extends A>(fn: TypeGuard<A, S>) => (iterator: Iterable<A>) => S | undefined
) & (
  <B extends A, A = B>(fn: Predicate<A>) => (iterator: Iterable<B>) => B | undefined
);

/**
 * Call a function with every value in the iterator. Unlike `tap`, it ends a
 * pipeline.
 */
export const forEach: <A>(fn: Tapper<A>) => (iterator: Iterable<A>) => void;

/**
 * Returns the number of items in the iterator.
 */
export const count: <A>(iterator: Iterable<A>) => number;

/**
 * Collect all the items in the iterator into an array.
 */
export const toArray: <A>(iterator: Iterable<A>) => A[];

/**
 * Collect all the items in the iterator into a Set.
 */
export const toSet: <A>(iterator: Iterable<A>) => Set<A>;

/**
 * Collect all the key/value tuples in the iterator into a Map.
 */
export const toMap: <K, V>(iterator: Iterable<readonly [K, V]>) => Map<K, V>;

/**
 * Collect all the key/value tuples in the iterator into an Object.
 */
export const toObject: <V>(iterator: Iterable<readonly [PropertyKey, V]>) => Record<string, V>;

/**
 * Collect all the items in the iterator into a string separated by the
 * separator token.
 */
export const join: (separator: string) => (iterator: Iterable<string>) => string;
