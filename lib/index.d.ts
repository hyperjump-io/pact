export const map: (
  <A, B>(fn: Mapper<A, B>, iterator: Iterable<A>) => Generator<B>
) & (
  <A, B>(fn: Mapper<A, B>) => (iterator: Iterable<A>) => Generator<B>
);
export type Mapper<A, B> = (item: A) => B;

export const asyncMap: (
  <A, B>(fn: AsyncMapper<A, B>, iterator: AsyncIterable<A>) => AsyncGenerator<B>
) & (
  <A, B>(fn: AsyncMapper<A, B>) => (iterator: AsyncIterable<A>) => AsyncGenerator<B>
);
export type AsyncMapper<A, B> = (item: A) => Promise<B> | B;

export const filter: (
  <A>(fn: Predicate<A>, iterator: Iterable<A>) => Generator<A>
) & (
  <A>(fn: Predicate<A>) => (iterator: Iterable<A>) => Generator<A>
);
export type Predicate<A> = (item: A) => boolean;

export const asyncFilter: (
  <A>(fn: AsyncPredicate<A>, iterator: AsyncIterable<A>) => AsyncGenerator<A>
) & (
  <A>(fn: AsyncPredicate<A>) => (iterator: AsyncIterable<A>) => AsyncGenerator<A>
);
export type AsyncPredicate<A> = (item: A) => Promise<boolean> | boolean;

export const flatten: <A>(iterator: NestedIterable<A>, depth?: number) => Generator<A | NestedIterable<A>>;
export type NestedIterable<A> = Iterable<A | NestedIterable<A>>;

export const asyncFlatten: <A>(iterator: NestedAsyncIterable<A>, depth?: number) => AsyncGenerator<A | NestedIterable<A> | NestedAsyncIterable<A>>;
export type NestedAsyncIterable<A> = AsyncIterable<A | NestedAsyncIterable<A> | NestedIterable<A>>;

export const drop: (
  <A>(count: number, iterator: Iterable<A>) => Generator<A>
) & (
  <A>(count: number) => (iterator: Iterable<A>) => Generator<A>
);

export const asyncDrop: (
  <A>(count: number, iterator: AsyncIterable<A>) => AsyncGenerator<A>
) & (
  <A>(count: number) => (iterator: AsyncIterable<A>) => AsyncGenerator<A>
);

export const take: (
  <A>(count: number, iterator: Iterable<A>) => Generator<A>
) & (
  <A>(count: number) => (iterator: Iterable<A>) => Generator<A>
);

export const asyncTake: (
  <A>(count: number, iterator: AsyncIterable<A>) => AsyncGenerator<A>
) & (
  <A>(count: number) => (iterator: AsyncIterable<A>) => AsyncGenerator<A>
);

export const range: (from: number, to?: number) => Generator<number>;

export const zip: <A, B>(iter1: Iterable<A>, iter2: Iterable<B>) => Generator<[A, B]>;
export const asyncZip: <A, B>(iter1: AsyncIterable<A>, iter2: AsyncIterable<B>) => AsyncGenerator<[A, B]>;

export const reduce: (
  <A, B>(fn: Reducer<A, B>, acc: B, iter: Iterable<A>) => B
) & (
  <A, B>(fn: Reducer<A, B>, acc: B) => (iter: Iterable<A>) => B
);
export type Reducer<A, B> = (acc: B, item: A) => B;

export const asyncReduce: (
  <A, B>(fn: AsyncReducer<A, B>, acc: B, iter: AsyncIterable<A>) => Promise<B>
) & (
  <A, B>(fn: AsyncReducer<A, B>, acc: B) => (iter: AsyncIterable<A>) => Promise<B>
);
export type AsyncReducer<A, B> = (acc: B, item: A) => Promise<B> | B;

export const every: (
  <A>(fn: Predicate<A>, iterator: Iterable<A>) => boolean
) & (
  <A>(fn: Predicate<A>) => (iterator: Iterable<A>) => boolean
);

export const asyncEvery: (
  <A>(fn: AsyncPredicate<A>, iterator: AsyncIterable<A>) => Promise<boolean>
) & (
  <A>(fn: AsyncPredicate<A>) => (iterator: AsyncIterable<A>) => Promise<boolean>
);

export const some: (
  <A>(fn: Predicate<A>, iterator: Iterable<A>) => boolean
) & (
  <A>(fn: Predicate<A>) => (iterator: Iterable<A>) => boolean
);

export const asyncSome: (
  <A>(fn: AsyncPredicate<A>, iterator: AsyncIterable<A>) => Promise<boolean>
) & (
  <A>(fn: AsyncPredicate<A>) => (iterator: AsyncIterable<A>) => Promise<boolean>
);

export const collectArray: <A>(fn: Iterable<A>) => A[];
export const asyncCollectArray: <A>(fn: AsyncIterable<A>) => Promise<A[]>;

export const collectSet: <A>(fn: Iterable<A>) => Set<A>;
export const asyncCollectSet: <A>(fn: AsyncIterable<A>) => Promise<Set<A>>;

export const collectMap: <A, B>(fn: Iterable<[A, B]>) => Map<A, B>;
export const asyncCollectMap: <A, B>(fn: AsyncIterable<[A, B]>) => Promise<Map<A, B>>;

export const collectObject: <A>(fn: Iterable<[string, A]>) => Record<string, A>;
export const asyncCollectObject: <A>(fn: AsyncIterable<[string, A]>) => Promise<Record<string, A>>;

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export const pipe: <A>(iterator: Iterable<any> | AsyncIterable<any>, ...fns: Function[]) => A;
