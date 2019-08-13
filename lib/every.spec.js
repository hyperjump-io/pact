const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { every } = require(".");


Given("an array of promises", () => {
  let doc;
  let everyLessThanTwo;
  let everyLessThanFour;

  before(async () => {
    doc = [
      Promise.resolve(1),
      Promise.resolve(3),
      Promise.resolve(1)
    ];
    everyLessThanTwo = every(async (n) => await n < 2);
    everyLessThanFour = every(async (n) => await n < 4);
  });

  When("calling every over the array", () => {
    Then("it should be false for the everyLessThanTwo function", async () => {
      const subject = await everyLessThanTwo(doc);
      expect(subject).to.eql(false);
    });

    Then("it should be true for the everyLessThanFour function", async () => {
      const subject = await everyLessThanFour(doc);
      expect(subject).to.eql(true);
    });
  });
});
