import { describe, expect, test } from "vitest";
import * as Pact from "./index.js";
import * as Async from "./async.js";

describe("async entry point", () => {
  test("exports every async function without its prefix", () => {
    const expected = Object.keys(Pact)
      .filter((name) => /^async[A-Z]/.test(name))
      .map((name) => name[5].toLowerCase() + name.slice(6));

    const missing = expected.filter((name) => !(name in Async));
    expect(missing).to.eql([]);
  });
});
