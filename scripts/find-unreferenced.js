/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(jsx?|tsx?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const files = walk(srcRoot);
const contentByFile = new Map(
  files.map((f) => [f, fs.readFileSync(f, "utf8")]),
);

const importRe =
  /\b(?:import\s+[^;]*?from\s+|import\s*\(\s*)(["'])([^"'\n]+)\1/g;
const exportFromRe =
  /\bexport\s+(?:\*\s*(?:as\s+\w+\s*)?|\{[^}]*\})\s*from\s*(["'])([^"'\n]+)\1/g;
const reqRe = /\brequire\(\s*(["'])([^"'\n]+)\1\s*\)/g;

function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null;

  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
  ];

  for (const candidate of candidates) {
    if (contentByFile.has(candidate)) return candidate;
  }

  return null;
}

const edges = new Map();
for (const file of files) {
  const text = contentByFile.get(file);
  const deps = new Set();

  for (const re of [importRe, exportFromRe, reqRe]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text))) {
      const spec = match[2];
      const resolved = resolveImport(file, spec);
      if (resolved) deps.add(resolved);
    }
  }

  edges.set(file, [...deps]);
}

const entry = path.join(srcRoot, "main.jsx");

const seen = new Set();
function dfs(file) {
  if (seen.has(file)) return;
  seen.add(file);
  for (const dep of edges.get(file) || []) dfs(dep);
}

dfs(entry);

const unreachable = files.filter((f) => !seen.has(f));
unreachable.sort((a, b) => a.localeCompare(b));

console.log("UNREACHABLE_FROM_MAIN", unreachable.length);
for (const file of unreachable) {
  console.log(path.relative(projectRoot, file).replace(/\\/g, "/"));
}
