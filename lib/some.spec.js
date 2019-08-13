const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { some } = require(".");


Given("an array of promises", () => {
  let doc;
  let someGreaterThanTwo;
  let someGreaterThanFour;

  before(async () => {
    doc = [
      Promise.resolve(1),
      Promise.resolve(3),
      Promise.resolve(1)
    ];
    someGreaterThanTwo = some(async (n) => await n > 2);
    someGreaterThanFour = some(async (n) => await n > 4);
  });

  When("calling some the array", () => {
    Then("it should be true for the someGreaterThanTwo function", async () => {
      const subject = await someGreaterThanTwo(doc);
      expect(subject).to.eql(true);
    });

    Then("it should be false for the someGreaterThanFour function", async () => {
      const subject = await someGreaterThanFour(doc);
      expect(subject).to.eql(false);
    });
  });
});
