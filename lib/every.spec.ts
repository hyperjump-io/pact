import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { every, Every } from "./index";


async () => {
  const a: boolean = await every((n) => n < 2, [1]);
  const b: boolean = await every((n) => Promise.resolve(n < 2), [1]);
  const c: boolean = await every((n) => n < 2, Promise.resolve([1]));
  const d: boolean = await every((n) => Promise.resolve(n < 2), Promise.resolve([1]));
  const e: boolean = await every(async (n) => await n < 2, [Promise.resolve(1)]);
  const f: boolean = await every(async (n) => await n < 2, Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d, e, f);

  const g = every((n: number) => n < 2);
  const h: boolean = await g([1]);
  const i: boolean = await g(Promise.resolve([1]));
  console.log(h, i);

  const j = every(async (n: Promise<number>) => await n < 2);
  const k: boolean = await j([Promise.resolve(1)]);
  const l: boolean = await j(Promise.resolve([Promise.resolve(1)]));
  console.log(k, l);
};

Given("an array of promises", () => {
  let doc: Promise<number>[];
  let everyLessThanTwo: Every<Promise<number>>;
  let everyLessThanFour: Every<Promise<number>>;

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
    Then("it should be false for the everyLessThanTwo function", () => {
      everyLessThanTwo(doc)
        .then((subject) => {
          expect(subject).to.eql(false);
        });
    });

    Then("it should be true for the everyLessThanFour function", () => {
      everyLessThanFour(doc)
        .then((subject) => {
          expect(subject).to.eql(true);
        });
    });
  });
});
