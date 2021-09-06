import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { reduce, Reducer } from ".";


async () => {
  const a: number = await reduce((sum, item: number) => sum + item, 0, [1]);
  const b: number = await reduce((sum, item: number) => sum + item, 0, Promise.resolve([1]));
  const c: number = await reduce((sum, item: number) => Promise.resolve(sum + item), 0, [1]);
  const d: number = await reduce((sum, item: number) => Promise.resolve(sum + item), 0, Promise.resolve([1]));
  const e: number = await reduce(async (sum, item: Promise<number>) => sum + await item, 0, [Promise.resolve(1)]);
  const f: number = await reduce(async (sum, item: Promise<number>) => sum + await item, 0, Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d, e, f);

  const g = reduce((sum, item: number) => sum + item, 0);
  const h: number = await g([1]);
  const i: number = await g(Promise.resolve([1]));
  console.log(h, i);

  const j = reduce(async (sum, item: Promise<number>) => sum + await item, 0);
  const k: number = await j([Promise.resolve(1)]);
  const l: number = await j(Promise.resolve([Promise.resolve(1)]));
  console.log(k, l);
};

Given("an array of promises", () => {
  let doc: Promise<number>[];
  let sumOf: Reducer<Promise<number>, number>;

  before(async () => {
    doc = [
      Promise.resolve(333),
      Promise.resolve(222),
      Promise.resolve(111)
    ];
    sumOf = reduce(async (sum, item) => sum + await item, 0);
  });

  When("reducing the array", () => {
    let subject: number;

    before(async () => {
      subject = await sumOf(doc);
    });

    Then("it should result in the sum of the numbers in the array", () => {
      expect(subject).to.eql(666);
    });
  });
});
