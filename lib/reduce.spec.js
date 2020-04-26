const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { reduce } = require(".");


Given("a reducing function", () => {
  let sumOf;

  before(async () => {
    sumOf = reduce(async (sum, item) => sum + await item, 0);
  });

  When("noe of the items are rejected", () => {
    let subject;

    before(async () => {
      subject = await sumOf([
        Promise.resolve(333),
        Promise.resolve(222),
        Promise.resolve(111)
      ]);
    });

    Then("it should result in the sum of the numbers in the array", async () => {
      expect(subject).to.eql(666);
    });
  });

  When("one of the items is rejected", () => {
    Then("it should throw an error", async () => {
      try {
        await sumOf([
          Promise.resolve(333),
          Promise.reject(Error("222")),
          Promise.resolve(111)
        ]);
        expect.fail();
      } catch (e) {
        expect(e).to.be.an("error");
      }
    });
  });

  When("two of the items are rejected", () => {
    Then("it should throw an error", async () => {
      try {
        await sumOf([
          Promise.reject(Error("333")),
          Promise.reject(Error("222")),
          Promise.resolve(111)
        ]);
        expect.fail();
      } catch (e) {
        expect(e).to.be.an("error");
      }
    });
  });
});
