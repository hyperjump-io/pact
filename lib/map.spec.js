const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { map } = require(".");


Given("an array of promises", () => {
  let doc;
  let double;

  before(async () => {
    doc = [
      Promise.resolve(333),
      Promise.resolve(111)
    ];
    double = map(async (item) => await item * 2);
  });

  When("mapping over the array", () => {
    let subject;

    before(async () => {
      subject = await double(doc);
    });

    Then("it should apply the function to every item in the array", async () => {
      expect(await Promise.all(subject)).to.eql([666, 222]);
    });
  });
});
