import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { all } from "./index";


async () => {
  const a: number[] = await all([1]);
  const b: number[] = await all(Promise.resolve([1]));
  const c: number[] = await all([Promise.resolve(1)]);
  const d: number[] = await all(Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d);
};

Given("an array of promises", () => {
  let doc: Promise<number>[];

  before(async () => {
    doc = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ];
  });

  When("calling all on the array", () => {
    let subject: number[];

    before(async () => {
      subject = await all(doc);
    });

    Then("it should return an array with all promises resolved", () => {
      expect(subject).to.eql([1, 2, 3]);
    });
  });
});
