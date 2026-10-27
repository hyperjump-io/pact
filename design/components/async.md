# Async

Async functions accept sync iterables as well as async ones, as in v1.

- A sync source is adapted to the async protocol by a small iterator, not
  an async generator. v1 wrapped it with `asyncMap`, which added a whole
  async generator to every pipeline that started from an array.
- Functions that take a callback await what it returns, so a callback can
  be sync or async.

## Why

Most of the cost of an async pipeline is being async: one promise per item
per step. On the same data, sync was about 20 times faster than v1's async
generators (see [Generators](../benchmarks/generators.md)). Hand-written
async iterators help (about 1.7 times faster), but the bigger saving is not
using the async functions on data that's sync. The docs say so.

## Rejected

- **Requiring async sources**, with an explicit `toAsync` to adapt a sync
  one. It makes the cost visible, but it's churn for every caller, and an
  adapter that's cheap removes most of the reason.
