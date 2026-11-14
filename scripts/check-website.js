// Runs every typescript example in website/ against src/. A statement with a
// `// value` comment after it, on its line or the next, is checked against
// that value, and what an example prints is checked against the `text`
// block after it. Every example is type-checked against src/'s declarations.
// Examples that show v1 code (`// v1`) are skipped. Node runs the examples,
// stripping their types, and TypeScript's API, which is unstable in
// TypeScript 7, parses and type-checks them.
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { API } from "typescript/unstable/sync";
import { isExpressionStatement } from "typescript/unstable/ast/is";

const repo = resolve(import.meta.dirname, "..");
const out = await mkdtemp(join(tmpdir(), "pact-website-"));
let problems = 0;
let checks = 0;
const examples = new Map();

// An example that doesn't end, like an infinite source without a `take`,
// is a problem, and doesn't hang the check
const timeout = 10_000;

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

// Every example is written out first, because TypeScript parses them as
// one project
const blocksByFile = new Map();
for (const file of await readdir(join(repo, "website"))) {
  const markdown = await readFile(join(repo, "website", file), "utf8");
  const blocks = [...markdown.matchAll(/```(\w+)[^\n]*\n([\s\S]*?)```/g)];
  blocksByFile.set(file, blocks);

  for (const [index, { 1: language, 2: code, index: offset }] of blocks.entries()) {
    if (language !== "typescript" || code.includes("// v1")) {
      continue;
    }

    const typed = join(out, `${file}-${index}.ts`);
    await writeFile(typed, code);
    examples.set(typed, { file, index, code, line: markdown.slice(0, offset).split("\n").length + 1 });
  }
}

const tsconfig = join(out, "tsconfig.json");
await writeFile(tsconfig, JSON.stringify({
  files: [...examples.keys()],
  compilerOptions: {
    strict: true,
    noEmit: true,
    target: "esnext",
    module: "esnext",
    moduleResolution: "bundler",
    moduleDetection: "force",
    types: ["node"],
    typeRoots: [join(repo, "node_modules/@types")],
    paths: {
      "@hyperjump/pact": [join(repo, "src/index.d.ts")],
      "@hyperjump/pact/async": [join(repo, "src/async.d.ts")]
    }
  }
}));

const api = new API({ cwd: repo });
const snapshot = api.updateSnapshot({ openProjects: [tsconfig] });
const project = snapshot.getProject(tsconfig);
if (!project) {
  throw Error(`TypeScript didn't open ${tsconfig}`);
}
const program = project.program;

for (const [typed, { file, index, code }] of examples) {
  const source = program.getSourceFile(typed);
  if (!source) {
    throw Error(`TypeScript didn't parse ${typed}`);
  }
  const edits = [];
  for (const statement of source.statements) {
    const comment = code.slice(statement.end).match(/^[ \t]*\n?[ \t]*\/\/ (.+)/);
    if (!isExpressionStatement(statement) || !comment) {
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

  const path = join(out, `${file}-${index}.mts`);
  await writeFile(path, prelude + example);
  const result = spawnSync("node", [path], { encoding: "utf8", timeout });

  const blocks = blocksByFile.get(file);
  const printed = blocks[index + 1]?.[1] === "text" ? blocks[index + 1][2] : undefined;
  if (result.error) {
    problems++;
    const reason = /** @type NodeJS.ErrnoException */ (result.error).code === "ETIMEDOUT"
      ? `didn't finish in ${timeout / 1000} seconds`
      : result.error.message;
    console.log(`website/${file}, example ${index + 1} ${reason}\n`);
  } else if (result.status !== 0 || result.stderr.trim()) {
    problems++;
    console.log(`website/${file}, example ${index + 1}:\n${result.stderr.trim() || `exited with ${result.signal ?? result.status}`}\n`);
  } else if (printed !== undefined && result.stdout.trim() !== printed.trim()) {
    problems++;
    console.log(`website/${file}, example ${index + 1} printed:\n${result.stdout}\nnot:\n${printed}`);
  }
}

/** @type (diagnostic: import("typescript/unstable/sync").Diagnostic, indent?: string) => string */
const messageText = (diagnostic, indent = "") => [
  indent + diagnostic.text,
  ...(diagnostic.messageChain ?? []).map((chained) => messageText(chained, indent + "  "))
].join("\n");

const diagnostics = [
  ...program.getConfigFileParsingDiagnostics(),
  ...program.getProgramDiagnostics(),
  ...program.getGlobalDiagnostics(),
  ...program.getSyntacticDiagnostics(),
  ...program.getSemanticDiagnostics()
];
for (const diagnostic of diagnostics) {
  problems++;
  const message = messageText(diagnostic);
  const example = diagnostic.fileName && examples.get(diagnostic.fileName);
  if (example) {
    const line = example.code.slice(0, diagnostic.pos).split("\n").length - 1;
    console.log(`website/${example.file}:${example.line + line}, example ${example.index + 1}:\n${message}\n`);
  } else {
    console.log(`${message}\n`);
  }
}

api.close();
await rm(out, { recursive: true });
console.log(`${checks} values checked, ${problems} problems`);
process.exitCode = problems > 0 ? 1 : 0;
