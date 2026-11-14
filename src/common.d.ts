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
 * values and return the result.
 */
export const pipe: (
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
    (c: D) => E
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
  <A, B, C, D, E, F, G, H, I, J extends ((j: any) => any)[]>(initialValue: A, ...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    ...J
  ]) => LastReturnType<J>
);

/**
 * Combine any number of steps into one step that applies them in order. It's
 * `pipe` without a starting value, for building a pipeline before it has a
 * source or reusing one with many sources.
 */
export const compose: (
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
  <A, B, C, D, E, F, G, H, I, J extends ((j: any) => any)[]>(...fns: [
    (a: A) => B,
    (b: B) => C,
    (c: C) => D,
    (d: D) => E,
    (e: E) => F,
    (f: F) => G,
    (g: G) => H,
    (h: H) => I,
    ...J
  ]) => (a: A) => LastReturnType<J>
);
