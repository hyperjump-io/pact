// Runs every javascript example in website/ against src/. A statement with a
// `// value` comment after it, on its line or the next, is checked against
// that value, and what an example prints is checked against the `text`
// block after it. Examples that show v1 code (`// v1`) are skipped.
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const repo = resolve(import.meta.dirname, "..");
const out = await mkdtemp(join(tmpdir(), "pact-website-"));
let problems = 0;
let checks = 0;

const prelude = `import { isDeepStrictEqual, inspect } from "node:util";
const __normalize = (v) => Array.isArray(v) ? v.map(__normalize)
  : v && typeof v === "object" && !(v instanceof Map) && !(v instanceof Set) && !(v instanceof Error) ? { ...v } : v;
const __check = async (label, run, expected) => {
  let actual;
  try { actual = await run(); } catch (error) { actual = error; }
  const want = (0, eval)("(" + expected + ")");
  const same = isDeepStrictEqual(__normalize(actual), __normalize(want)) || (Number.isNaN(want) && Number.isNaN(actual));
  if (!same) console.error("got  " + inspect(actual) + "\\nwant " + expected + "\\nfor  " + label);
};
`;

for (const file of await readdir(join(repo, "website"))) {
  const markdown = await readFile(join(repo, "website", file), "utf8");
  const blocks = [...markdown.matchAll(/```(\w+)[^\n]*\n([\s\S]*?)```/g)];

  for (const [index, [, language, code]] of blocks.entries()) {
    if (language !== "javascript" || code.includes("// v1")) {
      continue;
    }

    const source = ts.createSourceFile("example.js", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const edits = [];
    for (const statement of source.statements) {
      const comment = code.slice(statement.end).match(/^[ \t]*\n?[ \t]*\/\/ (.+)/);
      if (!ts.isExpressionStatement(statement) || !comment) {
        continue;
      }
      checks++;
      const expression = statement.expression.getText(source);
      const label = expression.replace(/\s+/g, " ");
      edits.push({
        start: statement.getStart(source),
        end: statement.end + comment[0].length,
        text: `await __check(${JSON.stringify(label)}, async () => (${expression}), ${JSON.stringify(comment[1])});`
      });
    }

    let example = code;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      example = example.slice(0, edit.start) + edit.text + example.slice(edit.end);
    }
    example = example
      .replaceAll("\"@hyperjump/pact/async\"", JSON.stringify(pathToFileURL(join(repo, "src/async.js")).href))
      .replaceAll("\"@hyperjump/pact\"", JSON.stringify(pathToFileURL(join(repo, "src/index.js")).href));

    const path = join(out, `${file}-${index}.mjs`);
    await writeFile(path, prelude + example);
    const result = spawnSync("node", [path], { encoding: "utf8" });

    const printed = blocks[index + 1]?.[1] === "text" ? blocks[index + 1][2] : undefined;
    if (result.stderr.trim()) {
      problems++;
      console.log(`website/${file}, example ${index + 1}:\n${result.stderr.trim()}\n`);
    } else if (printed !== undefined && result.stdout.trim() !== printed.trim()) {
      problems++;
      console.log(`website/${file}, example ${index + 1} printed:\n${result.stdout}\nnot:\n${printed}`);
    }
  }
}

await rm(out, { recursive: true });
console.log(`${checks} values checked, ${problems} problems`);
process.exitCode = problems > 0 ? 1 : 0;
