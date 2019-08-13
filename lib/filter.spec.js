const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { filter } = require(".");


Given("an array of promises", () => {
  let doc;
  let positiveNumbersOf;

  before(async () => {
    doc = [
      Promise.resolve(333),
      Promise.resolve(-222),
      Promise.resolve(222),
      Promise.resolve(-111)
    ];
    positiveNumbersOf = filter(async (item) => await item > 0);
  });

  When("filtering a the array", () => {
    let subject;

    before(async () => {
      subject = await positiveNumbersOf(doc);
    });

    Then("it should return only the positive numbers", async () => {
      expect(await Promise.all(subject)).to.eql([await doc[0], await doc[2]]);
    });
  });
});
