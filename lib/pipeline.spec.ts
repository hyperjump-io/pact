import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec";
import { pipeline, Pipeline, map, filter, reduce, ArraySubject } from ".";


async () => {
  const a: number = await pipeline([reduce((sum, n) => sum + n, 0)], [1]);
  const b: number = await pipeline([reduce((sum, n) => sum + n, 0)], Promise.resolve([1]));
  const c: number = await pipeline([reduce(async (sum, n) => sum + await n, 0)], [Promise.resolve(1)]);
  const d: number = await pipeline([reduce(async (sum, n) => sum + await n, 0)], Promise.resolve([Promise.resolve(1)]));
  console.log(a, b, c, d);

  const e = pipeline([reduce((sum, n: number) => sum + n, 0)]);
  const f: number = await e([1]);
  const g: number = await e(Promise.resolve([1]));
  console.log(f, g);

  const h = pipeline([reduce(async (sum, n: Promise<number>) => sum + await n, 0)]);
  const i: number = await h([Promise.resolve(1)]);
  const j: number = await h(Promise.resolve([Promise.resolve(1)]));
  console.log(i, j);
};

Given("a pipeline", () => {
  let subject: Pipeline<
    ArraySubject<Promise<number>>,
    Promise<number>
  >;

  before(() => {
    subject = pipeline([
      filter(async (a: Promise<number>) => await a > 111),
      map(async (a: Promise<number>) => await a * 2),
      reduce(async (sum, a: Promise<number>) => sum + await a, 0)
    ]);
  });

  When("passed an array of promises", () => {
    let doc: Promise<number>[];

    before(async () => {
      doc = [
        Promise.resolve(333),
        Promise.resolve(222),
        Promise.resolve(111)
      ];
    });

    Then("it should return the expected result", () => {
      subject(doc)
        .then((subject) => {
          expect(subject).to.equal(1110);
        });
    });
  });
});
