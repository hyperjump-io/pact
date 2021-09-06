import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { allValues } from "./index";


async () => {
  const a: Record<string, number> = await allValues({ a: 1 });
  const b: Record<string, number> = await allValues(Promise.resolve({ a: 1 }));
  const c: Record<string, number> = await allValues({ a: Promise.resolve(1) });
  const d: Record<string, number> = await allValues(Promise.resolve({ a: Promise.resolve(1) }));
  console.log(a, b, c, d);
};

Given("an object whose values are promises", () => {
  let doc: Record<string, Promise<number>>;

  before(async () => {
    doc = {
      "aaa": Promise.resolve(1),
      "bbb": Promise.resolve(2),
      "ccc": Promise.resolve(3)
    };
  });

  When("calling allValues on the object", () => {
    let subject: Record<string, number>;

    before(async () => {
      subject = await allValues(doc);
    });

    Then("it should return an object with all promises resolved", () => {
      expect(subject).to.eql({
        aaa: 1,
        bbb: 2,
        ccc: 3
      });
    });
  });
});
