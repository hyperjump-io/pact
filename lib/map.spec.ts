import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { map, Mapper } from ".";


async () => {
  const a: string[] = await map((n) => n.toString(), [1]);
  const b: string[] = await map((n) => n.toString(), Promise.resolve([1]));
  const c: Promise<string>[] = await map((n) => Promise.resolve(n.toString()), [1]);
  const d: Promise<string>[] = await map((n) => Promise.resolve(n.toString()), Promise.resolve([1]));
  const e: Promise<string>[] = await map(async (n) => (await n).toString(), [Promise.resolve(1)]);
  const f: Promise<string>[] = await map(async (n) => (await n).toString(), Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d, e, f);

  const g = map((n: number) => n.toString());
  const h: string[] = await g([1]);
  const i: string[] = await g(Promise.resolve([1]));
  console.log(h, i);

  const j = map(async (n: Promise<number>) => (await n).toString());
  const k: Promise<string>[] = await j([Promise.resolve(1)]);
  const l: Promise<string>[] = await j(Promise.resolve([Promise.resolve(1)]));
  console.log(k, l);
};

Given("an array of promises", () => {
  let doc: Promise<number>[];
  let double: Mapper<Promise<number>, Promise<number>>;

  before(async () => {
    doc = [
      Promise.resolve(333),
      Promise.resolve(111)
    ];
    double = map(async (item) => await item * 2);
  });

  When("mapping over the array", () => {
    let subject: Promise<number>[];

    before(async () => {
      subject = await double(doc);
    });

    Then("it should apply the function to every item in the array", () => {
      Promise.all(subject)
        .then((subject) => {
          expect(subject).to.eql([666, 222]);
        });
    });
  });
});
