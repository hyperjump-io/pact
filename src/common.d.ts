import type { LastReturnType } from "./type-utils.d.ts";

/**
 * Yields numbers starting from `from` until `to`, counting by `step`, which
 * is 1 by default. A negative `step` counts down, and a `step` of 0 throws a
 * RangeError, and so does a `from`, `to`, or `step` that's NaN. If `to` is
 * not passed, the iterator will be infinite.
 */
export const range: (from: number, to?: number, step?: number) => IteratorObject<number, undefined, unknown>;

/**
 * Starting with an iterator, apply any number of functions to transform the
 * values and return the result. Each function's input is checked against the
 * output of the one before it, for the first 16 functions.
 */
export const pipe: (
  <A>(initialValue: A) => A
) & (
  <A, B>(initialValue: A, ...fns: [
    (a: A) => B
  ]) => B
) & (
  <A, B, C>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C
  ]) => C
) & (
  <A, B, C, D>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D
  ]) => D
) & (
  <A, B, C, D, E>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E
  ]) => E
) & (
  <A, B, C, D, E, F>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F
  ]) => F
) & (
  <A, B, C, D, E, F, G>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G
  ]) => G
) & (
  <A, B, C, D, E, F, G, H>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H
  ]) => H
) & (
  <A, B, C, D, E, F, G, H, I>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I
  ]) => I
) & (
  <A, B, C, D, E, F, G, H, I, J>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J
  ]) => J
) & (
  <A, B, C, D, E, F, G, H, I, J, K>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K
  ]) => K
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L
  ]) => L
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M
  ]) => M
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N
  ]) => N
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O
  ]) => O
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O,
    (o: O) => P
  ]) => P
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O,
    (o: O) => P,
    (p: P) => Q
  ]) => Q
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R extends ((r: any) => any)[]>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O,
    (o: O) => P,
    (p: P) => Q,
    ...R
  ]) => LastReturnType<R>
);

/**
 * Combine any number of steps into one step that applies them in order. It's
 * `pipe` without a starting value, for building a pipeline before it has a
 * source or reusing one with many sources.
 */
export const compose: (
  () => <A>(a: A) => A
) & (
  <A, B>(...fns: [
    (a: A) => B
  ]) => (a: A) => B
) & (
  <A, B, C>(...fns: [
    (a: A) => B,
    (b: B) => C
  ]) => (a: A) => C
) & (
  <A, B, C, D>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D
  ]) => (a: A) => D
) & (
  <A, B, C, D, E>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E
  ]) => (a: A) => E
) & (
  <A, B, C, D, E, F>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F
  ]) => (a: A) => F
) & (
  <A, B, C, D, E, F, G>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G
  ]) => (a: A) => G
) & (
  <A, B, C, D, E, F, G, H>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H
  ]) => (a: A) => H
) & (
  <A, B, C, D, E, F, G, H, I>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I
  ]) => (a: A) => I
) & (
  <A, B, C, D, E, F, G, H, I, J>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J
  ]) => (a: A) => J
) & (
  <A, B, C, D, E, F, G, H, I, J, K>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K
  ]) => (a: A) => K
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L
  ]) => (a: A) => L
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M
  ]) => (a: A) => M
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N
  ]) => (a: A) => N
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O
  ]) => (a: A) => O
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O,
    (o: O) => P
  ]) => (a: A) => P
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O,
    (o: O) => P,
    (p: P) => Q
  ]) => (a: A) => Q
) & (
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R extends ((r: any) => any)[]>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    (i: I) => J,
    (j: J) => K,
    (k: K) => L,
    (l: L) => M,
    (m: M) => N,
    (n: N) => O,
    (o: O) => P,
    (p: P) => Q,
    ...R
  ]) => (a: A) => LastReturnType<R>
);

/**
 * The options of `zip` and `zipKeyed` in the `shortest` and `strict` modes.
 */
export type ZipOptions = {
  mode?: "shortest" | "strict";
};

/**
 * The options of `zip` and `zipKeyed` in the `longest` mode. `P` is the type
 * of `padding`: an iterable for `zip`, and an object for `zipKeyed`.
 */
export type ZipLongestOptions<P> = {
  mode: "longest";
  padding?: P;
};

/**
 * The type of the padding at position `K` of the padding `P`, which is
 * `undefined` where `P` doesn't have a value.
 */
export type ZipPadding<P extends Iterable<unknown>, K> = P extends readonly unknown[]
  ? number extends P["length"] | K ? P[number] | undefined
    : K extends keyof P ? P[K] : undefined
  : P extends Iterable<infer Item> ? Item | undefined : never;

/**
 * A key of what `zipKeyed` was called with, unless its value is always
 * `undefined`, which leaves the key out.
 */
export type ZipKey<T, K extends keyof T> = [T[K]] extends [undefined] ? never : K;
