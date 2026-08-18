#!/usr/bin/env node
/**
 * Pulls the published résumé export from VolantTyler/resume-system into
 * data/resume-content.json.
 *
 * The coupling runs one way on purpose: resume-system publishes a contract and
 * knows nothing about this site, so nothing here needs a credential and nothing
 * there needs write access to this repo.
 *
 * Exits 0 with "unchanged" when the content already matches, so the workflow can
 * skip opening a pull request. `generatedAt` is ignored for that comparison —
 * every generation run stamps a new timestamp even when nothing else moved.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "data/resume-content.json");
const SOURCE =
  process.env.RESUME_CONTENT_URL ??
  "https://raw.githubusercontent.com/VolantTyler/resume-system/main/output/portfolio/resume-content.json";

/** Compare everything except the generation timestamp. */
function meaningful(json) {
  const { generatedAt, ...rest } = json;
  return JSON.stringify(rest, Object.keys(rest).sort());
}

const response = await fetch(SOURCE, { headers: { "cache-control": "no-cache" } });
if (!response.ok) {
  console.error(`✗ could not fetch ${SOURCE} — HTTP ${response.status}`);
  process.exit(1);
}

const text = await response.text();
let incoming;
try {
  incoming = JSON.parse(text);
} catch {
  console.error("✗ fetched content is not valid JSON — refusing to overwrite local data");
  process.exit(1);
}

for (const key of ["name", "featuredProjects", "experience", "skills"]) {
  if (incoming[key] === undefined) {
    console.error(`✗ fetched JSON is missing "${key}" — refusing to overwrite local data`);
    process.exit(1);
  }
}

const current = existsSync(TARGET) ? JSON.parse(readFileSync(TARGET, "utf8")) : null;
if (current && meaningful(current) === meaningful(incoming)) {
  console.log("unchanged");
  process.exit(0);
}

writeFileSync(TARGET, JSON.stringify(incoming, null, 2) + "\n");
console.log(
  `changed — ${incoming.featuredProjects.length} projects, ` +
    `${incoming.experience.length} roles, ${incoming.skills.length} skills`,
);
