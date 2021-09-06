import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { some, Some } from ".";


async () => {
  const a: boolean = await some((n: number) => n > 2, [1]);
  const b: boolean = await some((n: number) => n > 2, Promise.resolve([1]));
  const c: boolean = await some((n: number) => Promise.resolve(n > 2), [1]);
  const d: boolean = await some((n: number) => Promise.resolve(n > 2), Promise.resolve([1]));
  const e: boolean = await some(async (n: Promise<number>) => await n > 2, [Promise.resolve(1)]);
  const f: boolean = await some(async (n: Promise<number>) => await n > 2, Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d, e, f);

  const g = some((n: number) => n > 2);
  const h: boolean = await g([1]);
  const i: boolean = await g(Promise.resolve([1]));
  console.log(h, i);

  const j = some(async (n: Promise<number>) => (await n) > 2);
  const k: boolean = await j([Promise.resolve(1)]);
  const l: boolean = await j(Promise.resolve([Promise.resolve(1)]));
  console.log(k, l);
};

Given("an array of promises", () => {
  let doc: Promise<number>[];
  let someGreaterThanTwo: Some<Promise<number>>;
  let someGreaterThanFour: Some<Promise<number>>;

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
    Then("it should be true for the someGreaterThanTwo function", () => {
      someGreaterThanTwo(doc)
        .then((subject) => {
          expect(subject).to.eql(true);
        });
    });

    Then("it should be false for the someGreaterThanFour function", () => {
      someGreaterThanFour(doc)
        .then((subject) => {
          expect(subject).to.eql(false);
        });
    });
  });
});
