import { entries } from "./index";


async () => {
  const a: [string, number][] = await entries({ a: 1 });
  const b: [string, number][] = await entries(Promise.resolve({ a: 1 }));
  const c: [string, number][] = await entries({ a: Promise.resolve(1) });
  const d: [string, number][] = await entries(Promise.resolve({ a: Promise.resolve(1) }));
  console.log(a, b, c, d);
};
