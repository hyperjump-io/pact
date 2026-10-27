import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";

describe("entry points", () => {
  test("the sync and async entry points have the same functions", () => {
    expect(Object.keys(Async).toSorted()).to.eql(Object.keys(Pact).toSorted());
  });

  test("pipe, compose, and range are the same in both", () => {
    expect(Async.pipe).to.equal(Pact.pipe);
    expect(Async.compose).to.equal(Pact.compose);
    expect(Async.range).to.equal(Pact.range);
  });
});
