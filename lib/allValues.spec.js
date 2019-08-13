const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const { allValues } = require(".");


Given("an object whose values are promises", () => {
  let doc;

  before(async () => {
    doc = {
      "aaa": Promise.resolve(1),
      "bbb": Promise.resolve(2),
      "ccc": Promise.resolve(3)
    };
  });

  When("calling allValues on the object", () => {
    let subject;

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
