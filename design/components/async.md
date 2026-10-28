# Async

Async functions accept sync iterables as well as async ones, as in v1.

- A sync source is adapted to the async protocol by `FromSyncIterator`, a
  small iterator class (see [Iterators](iterators.md)). It answers with a
  resolved promise without waiting a turn unless the value is a promise,
  which it waits for, and it closes the source if one rejects. v1 wrapped
  it with `asyncMap`, which added a whole async generator to every
  pipeline that started from an array. A step reads an array by index
  instead, without `FromSyncIterator` (see
  [Iterators](iterators.md#array-sources)).
- A callback can be sync or async. What it returns is waited for if it's
  a promise.

## Why

Most of the cost of an async pipeline is being async: one promise per item
per step. On the same data, sync was about 20 times faster than v1's async
generators (see [Generators](../benchmarks/generators.md)). The iterator
classes are about 1.5 times faster than v1's async generators (see
[Pipelines](../benchmarks/pipelines.md#iterator-classes)), but the bigger
saving is not using the async functions on data that's sync. The docs say
so.

## Rejected

- **Requiring async sources**, with an explicit `toAsync` to adapt a sync
  one. It makes the cost visible, but it's churn for every caller, and an
  adapter that's cheap removes most of the reason.
