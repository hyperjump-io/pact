import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { filter, Filter } from "./index";


async () => {
  const a: number[] = await filter((item) => item > 0, [1]);
  const b: number[] = await filter((item) => item > 0, Promise.resolve([1]));
  const c: number[] = await filter((item) => Promise.resolve(item > 0), [1]);
  const d: number[] = await filter((item) => Promise.resolve(item > 0), Promise.resolve([1]));
  const e: Promise<number>[] = await filter(async (item) => await item > 0, [Promise.resolve(1)]);
  const f: Promise<number>[] = await filter(async (item) => await item > 0, Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d, e, f);

  const g = filter((n: number) => n > 2);
  const h: number[] = await g([1]);
  const i: number[] = await g(Promise.resolve([1]));
  console.log(h, i);

  const j = filter(async (n: Promise<number>) => await n > 2);
  const k: Promise<number>[] = await j([Promise.resolve(1)]);
  const l: Promise<number>[] = await j(Promise.resolve([Promise.resolve(1)]));
  console.log(k, l);
};

Given("an array of promises", () => {
  let doc: Promise<number>[];
  let positiveNumbersOf: Filter<Promise<number>>;

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
    let subject: Promise<number>[];

    before(async () => {
      subject = await positiveNumbersOf(doc);
    });

    Then("it should return only the positive numbers", () => {
      Promise.all(subject)
        .then((subject) => {
          expect(subject).to.eql([333, 222]);
        });
    });
  });
});
