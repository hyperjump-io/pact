const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { pipeline, map, filter, reduce } = require(".");


Given("a pipeline", () => {
  let subject;

  before(() => {
    subject = pipeline([
      filter(async (a) => await a > 111),
      map(async (a) => await a * 2),
      reduce(async (sum, a) => sum + await a, 0)
    ]);
  });

  When("passed an array of promises", () => {
    let doc;

    before(async () => {
      doc = [
        Promise.resolve(333),
        Promise.resolve(222),
        Promise.resolve(111)
      ];
    });

    Then("it should return the expected result", async () => {
      expect(await subject(doc)).to.equal(1110);
    });
  });
});
