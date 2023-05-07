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

export const pipeline: <A>(iterator: Iterable<any> | AsyncIterable<any>, ...fns: Function[]) => A;

export const compose: (...fns: Function[]) => <A>(iterator: Iterable<any> | AsyncIterable<any>) => A;
