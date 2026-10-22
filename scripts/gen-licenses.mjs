// Collects the license notice of every production dependency into public/third-party-licenses.txt,
// as required by the MIT, BSD, ISC and Apache-2.0 licenses of the code shipped to visitors.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
// build-time / platform binaries that never reach the browser
const SKIP = /^(sharp|@img\/|@next\/swc-|@emnapi\/|typescript$|caniuse-lite$)/;

const seen = new Set();
const entries = [];
for (const [path, info] of Object.entries(lock.packages)) {
  if (!path || info.dev || info.devOptional) continue;
  const name = path.slice(path.lastIndexOf("node_modules/") + 13);
  if (SKIP.test(name)) continue;
  const dir = join(process.cwd(), path);
  if (!existsSync(join(dir, "package.json"))) continue;
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const id = `${pkg.name}@${pkg.version}`;
  if (seen.has(id)) continue;
  seen.add(id);
  const file = readdirSync(dir).find((f) => /^(licen[cs]e|copying)/i.test(f));
  const license = typeof pkg.license === "string" ? pkg.license : pkg.license?.type || "See repository";
  const repo = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url || pkg.homepage || "";
  entries.push({ id, license, repo, text: file ? readFileSync(join(dir, file), "utf8").trim() : `Licensed under ${license}.` });
}
entries.sort((a, b) => a.id.localeCompare(b.id));

const line = "=".repeat(78);
const out = [
  "Toolsivo — Third-party software notices",
  "",
  "Toolsivo includes the open-source software listed below. Each component is",
  "distributed under its own license, reproduced here as the license requires.",
  `Components: ${entries.length}`,
  "",
  ...entries.flatMap((e) => [line, `${e.id}  —  ${e.license}`, e.repo.replace(/^git\+/, ""), line, "", e.text, "", ""]),
].join("\n");

writeFileSync("public/third-party-licenses.txt", out);
console.log(`third-party-licenses.txt: ${entries.length} components`);
