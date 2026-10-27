/**
 * An iterable over `items` that records whether its iterator was closed.
 * `closed` is also true when the iterator finishes, so a test that checks
 * closing stops before the last item.
 *
 * @type <A>(items: A[]) => Iterable<A> & { closed: boolean }
 */
export const closable = (items) => {
  const iterable = {
    closed: false,
    * [Symbol.iterator]() {
      try {
        yield* items;
      } finally {
        iterable.closed = true;
      }
    }
  };
  return iterable;
};

/**
 * Same as `closable`, but async.
 *
 * @type <A>(items: A[]) => AsyncIterable<A> & { closed: boolean }
 */
export const asyncClosable = (items) => {
  const iterable = {
    closed: false,
    async* [Symbol.asyncIterator]() {
      try {
        yield* items;
      } finally {
        iterable.closed = true;
      }
    }
  };
  return iterable;
};
