const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { all } = require(".");


Given("an array of promises", () => {
  let doc;

  before(async () => {
    doc = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ];
  });

  When("calling all on the array", () => {
    let subject;

    before(async () => {
      subject = await all(doc);
    });

    Then("it should return an array with all promises resolved", () => {
      expect(subject).to.eql([1, 2, 3]);
    });
  });
});
