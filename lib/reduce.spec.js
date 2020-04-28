const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { reduce } = require(".");


Given("an array of promises", () => {
  let doc;
  let sumOf;

  before(async () => {
    doc = [
      Promise.resolve(333),
      Promise.resolve(222),
      Promise.resolve(111)
    ];
    sumOf = reduce(async (sum, item) => sum + await item, 0);
  });

  When("reducing the array", () => {
    let subject;

    before(async () => {
      subject = await sumOf(doc);
    });

    Then("it should result in the sum of the numbers in the array", async () => {
      expect(subject).to.eql(666);
    });
  });
});
