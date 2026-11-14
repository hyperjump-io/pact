// What the declarations infer. It's checked by `npm run type-check` and
// never run (see design/components/testing.md).

import { describe, expectTypeOf, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";

const { pipe, compose } = Pact;

type Items<T> = IteratorObject<T, undefined, unknown>;
type AsyncItems<T> = AsyncIteratorObject<T, undefined, unknown>;

declare const numbers: number[];
declare const strings: string[];
declare const mixed: (number | string | undefined)[];
declare const promises: Promise<number>[];
declare const asyncNumbers: AsyncIterable<number>;
declare const asyncStrings: AsyncIterable<string>;

const isNumber = (value: unknown): value is number => typeof value === "number";
const isTruthy = (value: unknown) => !!value;
const add = (a: number, b: number) => a + b;
const increment = Pact.map((n: number) => n + 1);
declare const mapper: Async.Mapper<number, string>;
declare const flatMapper: Pact.FlatMapper<number, string>;
declare const asyncFlatMapper: Async.FlatMapper<number, string>;

describe("pipe and compose", () => {
  test("no steps", () => {
    expectTypeOf(pipe(numbers)).toEqualTypeOf<number[]>();
    expectTypeOf(compose()(numbers)).toEqualTypeOf<number[]>();
  });

  test("each step gets its input type from the step before it", () => {
    expectTypeOf(pipe(numbers, Pact.map((n) => String(n)), Pact.filter((s) => s.length > 0), Pact.toArray)).toEqualTypeOf<string[]>();
    expectTypeOf(pipe(numbers, Pact.map((n, index) => n + index), Pact.reduce(add, 0))).toEqualTypeOf<number>();
  });

  test("a step that doesn't take what the step before it returns", () => {
    // @ts-expect-error
    pipe(numbers, Pact.map((n) => String(n)), Pact.reduce(add, 0));
    // @ts-expect-error
    pipe(asyncNumbers, Pact.toArray);
    // @ts-expect-error
    pipe(numbers, Async.map((n) => n), Pact.toArray);
  });

  test("16 steps are checked", () => {
    expectTypeOf(pipe(
      numbers,
      increment, increment, increment, increment, increment, increment, increment, increment,
      increment, increment, increment, increment, increment, increment, increment,
      Pact.toArray
    )).toEqualTypeOf<number[]>();

    pipe(
      numbers,
      increment, increment, increment, increment, increment, increment, increment, increment,
      increment, increment, increment, increment, increment, increment,
      // @ts-expect-error
      increment, Pact.join(",")
    );
  });

  test("compose", () => {
    expectTypeOf(compose(increment, Pact.toArray)).toEqualTypeOf<(a: Iterable<number>) => number[]>();
    expectTypeOf(compose(Pact.filter((n: number) => n > 1), Pact.count)).toEqualTypeOf<(a: Iterable<number>) => number>();
  });

  test("a sync pipeline that switches to async", () => {
    expectTypeOf(pipe(numbers, Pact.filter((n) => n > 1), Async.map(async (n) => String(n)), Async.toArray)).toEqualTypeOf<Promise<string[]>>();
  });
});

describe("callbacks typed for more than the values", () => {
  test("the values keep their type", () => {
    expectTypeOf(pipe(numbers, Pact.tap(console.log), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe(numbers, Pact.filter(isTruthy), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe(numbers, Pact.dropWhile(isTruthy), Pact.takeWhile(isTruthy), Pact.find(isTruthy))).toEqualTypeOf<number | undefined>();
    expectTypeOf(pipe(mixed, Pact.filter(Boolean), Pact.toArray)).toEqualTypeOf<(number | string | undefined)[]>();
  });

  test("async", () => {
    expectTypeOf(pipe(numbers, Async.tap(console.log), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(asyncNumbers, Async.filter(isTruthy), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(numbers, Async.dropWhile(isTruthy), Async.takeWhile(isTruthy), Async.find(isTruthy))).toEqualTypeOf<Promise<number | undefined>>();
  });

  test("a step made outside a pipeline gets its type from its callback", () => {
    expectTypeOf(Pact.tap((n: number) => n)).toEqualTypeOf<(iterator: Iterable<number>) => Items<number>>();
    expectTypeOf(Pact.filter((n: number) => n > 1)).toEqualTypeOf<(iterator: Iterable<number>) => Items<number>>();
    // @ts-expect-error
    pipe(strings, Pact.tap((n: number) => n));
    // @ts-expect-error
    pipe(strings, Pact.filter((n: number) => n > 1));
  });
});

describe("predicates", () => {
  test("a type guard narrows", () => {
    expectTypeOf(pipe(mixed, Pact.filter(isNumber), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe(mixed, Pact.filter((value) => value !== undefined), Pact.toArray)).toEqualTypeOf<(number | string)[]>();
    expectTypeOf(pipe(mixed, Pact.find(isNumber))).toEqualTypeOf<number | undefined>();
    expectTypeOf(pipe(mixed, Async.filter(isNumber), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(mixed, Async.find(isNumber))).toEqualTypeOf<Promise<number | undefined>>();
  });

  test("a predicate can return any value", () => {
    expectTypeOf(pipe(numbers, Pact.filter((n) => n), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe(numbers, Pact.every((n) => n))).toEqualTypeOf<boolean>();
    expectTypeOf(pipe(numbers, Async.filter(async (n) => n), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(numbers, Async.some((n) => Promise.resolve(n)))).toEqualTypeOf<Promise<boolean>>();
  });
});

describe("flatten", () => {
  test("the depth is in the type", () => {
    expectTypeOf(pipe([[1, 2], [3]], Pact.flatten(), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe([[[1]], [[2]]], Pact.flatten(), Pact.toArray)).toEqualTypeOf<number[][]>();
    expectTypeOf(pipe([[[1]], [[2]]], Pact.flatten(2), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe([[[1]], [[2]]], Pact.flatten(0), Pact.toArray)).toEqualTypeOf<number[][][]>();
    expectTypeOf(pipe([[[1]], [[2]]], Pact.flatten(Infinity), Pact.toArray)).toEqualTypeOf<number[]>();
  });

  test("values that aren't iterable and strings are passed through", () => {
    expectTypeOf(pipe([1, [2, [3]]], Pact.flatten(), Pact.toArray)).toEqualTypeOf<(number | number[])[]>();
    expectTypeOf(pipe([["ab"], "cd"], Pact.flatten(2), Pact.toArray)).toEqualTypeOf<string[]>();
  });

  test("async", () => {
    expectTypeOf(pipe([[1], asyncNumbers], Async.flatten(), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe([promises], Async.flatten(), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe([[[1]], [[2]]], Async.flatten(2), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
  });
});

describe("flatMap", () => {
  test("iterables and iterators", () => {
    expectTypeOf(pipe(numbers, Pact.flatMap((n) => [n, String(n)]), Pact.toArray)).toEqualTypeOf<(number | string)[]>();
    expectTypeOf(pipe(numbers, Pact.flatMap((n) => [n].values()), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(pipe(numbers, Pact.flatMap((n) => n > 1 ? [n] : ["a"]), Pact.toArray)).toEqualTypeOf<(number | string)[]>();
  });

  test("a string isn't accepted", () => {
    // @ts-expect-error
    Pact.flatMap((n: number) => String(n));
    // @ts-expect-error
    Async.flatMap((n: number) => String(n));
  });

  test("async", () => {
    expectTypeOf(pipe(numbers, Async.flatMap(async (n) => [n]), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(numbers, Async.flatMap(async function* (n) {
      yield String(n);
    }), Async.toArray)).toEqualTypeOf<Promise<string[]>>();
    expectTypeOf(pipe(numbers, Async.flatMap((n) => [Promise.resolve(n)]), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(numbers, Async.flatMap((n) => n > 1 ? [n] : asyncStrings), Async.toArray)).toEqualTypeOf<Promise<(number | string)[]>>();
  });
});

describe("async sources and callbacks", () => {
  test("promises from a sync source are waited for", () => {
    expectTypeOf(pipe(promises, Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(promises, Async.map((n) => n + 1), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(promises, Async.filter((n) => n > 1), Async.head)).toEqualTypeOf<Promise<number | undefined>>();
    expectTypeOf(pipe([Promise.resolve(1), 2], Async.reduce(add))).toEqualTypeOf<Promise<number>>();
    expectTypeOf(pipe(promises, Async.take(1), Async.toSet)).toEqualTypeOf<Promise<Set<number>>>();
  });

  test("what a callback returns is waited for", () => {
    expectTypeOf(pipe(numbers, Async.map(async (n) => String(n)), Async.toArray)).toEqualTypeOf<Promise<string[]>>();
    expectTypeOf(pipe(numbers, Async.map((n) => n > 1 ? Promise.resolve("a") : n), Async.toArray)).toEqualTypeOf<Promise<(number | string)[]>>();
    expectTypeOf(pipe(numbers, Async.map((n) => n as unknown as PromiseLike<string>), Async.toArray)).toEqualTypeOf<Promise<string[]>>();
    expectTypeOf(pipe(numbers, Async.reduce(async (sum, n) => sum + n, 0))).toEqualTypeOf<Promise<number>>();
    expectTypeOf(pipe(numbers, Async.scan(async (sum, n) => sum + n, 0), Async.toArray)).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(pipe(numbers, Async.forEach(async (n) => n))).toEqualTypeOf<Promise<void>>();
  });

  test("the callback types", () => {
    expectTypeOf(pipe(numbers, Async.map(mapper), Async.toArray)).toEqualTypeOf<Promise<string[]>>();
    expectTypeOf(pipe(numbers, Async.flatMap(asyncFlatMapper), Async.toArray)).toEqualTypeOf<Promise<string[]>>();
    expectTypeOf(pipe(numbers, Pact.flatMap(flatMapper), Pact.toArray)).toEqualTypeOf<string[]>();
  });
});

describe("zip", () => {
  test("a tuple for each position", () => {
    expectTypeOf(Pact.zip([numbers, strings])).toEqualTypeOf<Items<[number, string]>>();
    expectTypeOf(Pact.zip([numbers, strings.values()], { mode: "strict" })).toEqualTypeOf<Items<[number, string]>>();
    expectTypeOf(Async.zip([numbers, asyncStrings, promises])).toEqualTypeOf<AsyncItems<[number, string, number]>>();
  });

  test("longest", () => {
    expectTypeOf(Pact.zip([numbers, strings], { mode: "longest" })).toEqualTypeOf<Items<[number | undefined, string | undefined]>>();
    expectTypeOf(Pact.zip([numbers, strings], { mode: "longest", padding: [0, ""] })).toEqualTypeOf<Items<[number, string]>>();
    expectTypeOf(Pact.zip([numbers, strings], { mode: "longest", padding: [null] })).toEqualTypeOf<Items<[number | null, string | undefined]>>();
    expectTypeOf(Pact.zip([numbers, strings], { mode: "longest", padding: new Set([true]) })).toEqualTypeOf<Items<[number | boolean | undefined, string | boolean | undefined]>>();
    expectTypeOf(Async.zip([numbers, asyncStrings], { mode: "longest", padding: [0, ""] })).toEqualTypeOf<AsyncItems<[number, string]>>();
  });

  test("a mode that isn't known until it runs", () => {
    const options = {} as Pact.ZipOptions | Pact.ZipLongestOptions<[]>;
    expectTypeOf(Pact.zip([numbers, strings], options)).toEqualTypeOf<Items<[number | undefined, string | undefined]>>();
  });

  test("any iterable of iterables", () => {
    expectTypeOf(Pact.zip([] as number[][])).toEqualTypeOf<Items<number[]>>();
    expectTypeOf(Pact.zip(new Set([numbers]))).toEqualTypeOf<Items<number[]>>();
    expectTypeOf(Pact.zip(new Set([numbers]), { mode: "longest" })).toEqualTypeOf<Items<(number | undefined)[]>>();
    expectTypeOf(Async.zip(new Set([asyncNumbers]))).toEqualTypeOf<AsyncItems<number[]>>();
  });

  test("what isn't accepted", () => {
    // @ts-expect-error
    Pact.zip([numbers, "abc"]);
    // @ts-expect-error
    Async.zip([numbers, "abc"]);
    // @ts-expect-error
    Pact.zip([numbers, strings], { mode: "strict", padding: [0] });
    // @ts-expect-error
    Pact.zip([numbers, strings], { mode: "longest", padding: 0 });
  });
});

describe("zipKeyed", () => {
  test("an object with the same keys", () => {
    expectTypeOf(Pact.zipKeyed({ a: numbers, b: strings })).toEqualTypeOf<Items<{ a: number; b: string }>>();
    expectTypeOf(Async.zipKeyed({ a: numbers, b: asyncStrings, c: promises })).toEqualTypeOf<AsyncItems<{ a: number; b: string; c: number }>>();
  });

  test("a key whose value is undefined is left out", () => {
    expectTypeOf(Pact.zipKeyed({ a: numbers, b: undefined })).toEqualTypeOf<Items<{ a: number }>>();
    expectTypeOf(Pact.zipKeyed({ a: numbers, b: strings as string[] | undefined })).toEqualTypeOf<Items<{ a: number; b: string | undefined }>>();
  });

  test("longest", () => {
    expectTypeOf(Pact.zipKeyed({ a: numbers, b: strings }, { mode: "longest" })).toEqualTypeOf<Items<{ a: number | undefined; b: string | undefined }>>();
    expectTypeOf(Pact.zipKeyed({ a: numbers, b: strings }, { mode: "longest", padding: { a: null } })).toEqualTypeOf<Items<{ a: number | null; b: string | undefined }>>();
    expectTypeOf(Async.zipKeyed({ a: numbers, b: asyncStrings }, { mode: "longest", padding: { a: 0, b: "" } })).toEqualTypeOf<AsyncItems<{ a: number; b: string }>>();
    // @ts-expect-error
    Pact.zipKeyed({ a: numbers }, { mode: "longest", padding: { b: 0 } });
  });
});

describe("concat", () => {
  test("the values of every iterable", () => {
    expectTypeOf(Pact.concat(numbers, strings)).toEqualTypeOf<Items<number | string>>();
    expectTypeOf(Pact.concat(numbers, numbers)).toEqualTypeOf<Items<number>>();
    expectTypeOf(Pact.concat()).toEqualTypeOf<Items<never>>();
    expectTypeOf(pipe(Pact.concat(...[numbers, numbers]), Pact.toArray)).toEqualTypeOf<number[]>();
    expectTypeOf(Async.concat(numbers, asyncStrings, promises)).toEqualTypeOf<AsyncItems<number | string>>();
  });
});

describe("collectors", () => {
  test("toMap and toObject take tuples that are readonly or not", () => {
    expectTypeOf(pipe(numbers, Pact.map((n) => [String(n), n] as const), Pact.toMap)).toEqualTypeOf<Map<string, number>>();
    expectTypeOf(pipe(numbers, Pact.map((n): [string, number] => [String(n), n]), Pact.toMap)).toEqualTypeOf<Map<string, number>>();
    expectTypeOf(pipe(new Map([["a", 1]]), Pact.toObject)).toEqualTypeOf<Record<string, number>>();
    expectTypeOf(pipe(numbers, Pact.map((n) => [String(n), n] as const), Pact.toObject)).toEqualTypeOf<Record<string, number>>();
    expectTypeOf(pipe(numbers, Async.map((n) => [String(n), n] as const), Async.toMap)).toEqualTypeOf<Promise<Map<string, number>>>();
    expectTypeOf(pipe(numbers, Async.map((n) => [String(n), n] as const), Async.toObject)).toEqualTypeOf<Promise<Record<string, number>>>();
  });

  test("toObject takes any property key", () => {
    expectTypeOf(pipe(numbers, Pact.map((n) => [n, String(n)] as const), Pact.toObject)).toEqualTypeOf<Record<string, string>>();
    expectTypeOf(pipe([[Symbol.iterator, 1]] as [symbol, number][], Async.toObject)).toEqualTypeOf<Promise<Record<string, number>>>();
  });

  test("reduce", () => {
    expectTypeOf(pipe(numbers, Pact.reduce(add))).toEqualTypeOf<number>();
    expectTypeOf(pipe(numbers, Pact.reduce((text, n) => text + n, ""))).toEqualTypeOf<string>();
    expectTypeOf(pipe(asyncNumbers, Async.reduce(add))).toEqualTypeOf<Promise<number>>();
  });
});
