#!/usr/bin/env node
/**
 * Renders the generated regions of the site from data/resume-content.json,
 * which is synced from VolantTyler/resume-system.
 *
 * Only the text between marker comments is replaced. Everything else in
 * index.html — hero, layout, the evidence matrix, the hand-written
 * Agent-Ready card — is authored by hand and left alone.
 *
 *   node scripts/build-site.mjs          write the generated regions
 *   node scripts/build-site.mjs --check  fail if anything would change
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

const FACET_LABELS = {
  "applied-ai": "Applied AI",
  "front-end": "Front-End",
  "back-end": "Back-End",
  devops: "DevOps",
  collaboration: "Collaboration",
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * The chip the page opens on. Applied AI leads because it is the work the site
 * is arguing for; "All" is one click away. Falls back to "all" if the facet ends
 * up with no skills.
 */
const DEFAULT_FACET = "applied-ai";

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "2026-02" -> "Feb 2026"; passes through "Present" and anything unrecognised. */
function formatDate(value) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(value ?? ""));
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(value ?? "");
}

/** Replace the text between `<!-- generated:NAME start -->` and its end marker. */
function writeRegion(html, name, body) {
  const start = `<!-- generated:${name} start -->`;
  const end = `<!-- generated:${name} end -->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a === -1 || b === -1 || b < a) {
    throw new Error(`index.html is missing a well-formed "generated:${name}" marker pair`);
  }
  const indent = " ".repeat(a - (html.lastIndexOf("\n", a) + 1));
  const rendered = body.trim()
    ? `\n${body.split("\n").map((l) => (l ? indent + l : l)).join("\n")}\n${indent}`
    : "\n" + indent;
  return html.slice(0, a + start.length) + rendered + html.slice(b);
}

function linkHtml(link, className) {
  const external = /^https?:\/\//.test(link.url);
  const attrs = [
    `class="${className}"`,
    `href="${esc(link.url)}"`,
    link.download ? "download" : null,
    external ? 'target="_blank" rel="noreferrer"' : null,
  ].filter(Boolean).join(" ");
  return `<a ${attrs}>${esc(link.label)}</a>`;
}

const techList = (tech, limit) =>
  (tech ?? []).slice(0, limit).map((t) => `  <li>${esc(t)}</li>`).join("\n");

/** The card headline may be a plain-English description; keep the product name as a subtitle. */
const subtitle = (p) =>
  p.portfolioHeadline && p.portfolioHeadline !== p.name
    ? `\n    <p class="project-subtitle">${esc(p.name)}</p>`
    : "";

/**
 * The kicker carries the project's origin rather than a sequence number. A
 * hand-written card sits alongside the generated ones, so any numbering the
 * generator produced would be wrong the moment the project count changed.
 */
const kicker = (p) => [p.organization, p.timeframe].filter(Boolean).join(" · ");

function renderFeatured(project) {
  if (!project) return "";
  const links = (project.portfolioLinks ?? []).map((l) => "    " + linkHtml(l, "text-link")).join("\n");
  return `<article class="feature-layout">
  <div class="project-media">
    <img src="assets/${esc(project.portfolioImage)}" alt="${esc(project.portfolioHeadline ?? project.name)}">
  </div>
  <div class="feature-copy">
    <p class="project-kicker">${esc(kicker(project))} / Featured</p>
    <h3>${esc(project.portfolioHeadline ?? project.name)}</h3>${subtitle(project)}
    <p>${esc(project.portfolioBlurb ?? project.solution ?? "")}</p>
    <ul class="tech-list" aria-label="Technology stack">
${techList(project.technologies, 4)}
    </ul>
${links ? `    <div class="inline-actions">\n${links}\n    </div>` : ""}
  </div>
</article>`;
}

function renderProjectCard(p) {
  const links = (p.portfolioLinks ?? []).map((l) => "      " + linkHtml(l, "text-link")).join("\n");
  const image = p.portfolioImage
    ? `assets/${esc(p.portfolioImage)}`
    : "assets/project-previews.png";
  return `<article class="project-card">
  <img src="${image}" alt="${esc(p.portfolioHeadline ?? p.name)}">
  <div class="project-card-body">
    <p class="project-kicker">${esc(kicker(p))}</p>
    <h3>${esc(p.portfolioHeadline ?? p.name)}</h3>${subtitle(p)}
    <p>${esc(p.portfolioBlurb ?? p.problem ?? "")}</p>
    <ul class="tech-list">
${techList(p.technologies, 3)}
    </ul>
${links ? `    <div class="card-actions">\n${links}\n    </div>` : ""}
  </div>
</article>`;
}

function renderExperience(roles) {
  return roles.map((r) => `<article class="timeline-item">
  <span class="timeline-date">${esc(formatDate(r.startDate))} - ${esc(formatDate(r.endDate))}</span>
  <h3>${esc(r.title)} / ${esc(r.company)}</h3>
  <p>${esc(r.summary || r.bullets?.[0] || "")}</p>
</article>`).join("\n");
}

/**
 * Every skill is rendered into the HTML unhidden, and the chips only toggle
 * visibility, so crawlers and no-JS visitors still see the complete list. The
 * default facet is applied by script.js on load rather than baked in here.
 */
function renderSkills(skills) {
  const order = Object.keys(FACET_LABELS);
  const present = order.filter((f) => skills.some((s) => s.facets.includes(f)));
  const active = present.includes(DEFAULT_FACET) ? DEFAULT_FACET : "all";
  const chip = (facet, label, count) => {
    const on = facet === active;
    return `  <button type="button" class="chip${on ? " is-active" : ""}" data-facet="${facet}" aria-pressed="${on}">${esc(label)} <span class="chip-count">${count}</span></button>`;
  };
  const chips = [
    chip("all", "All", skills.length),
    ...present.map((f) => chip(f, FACET_LABELS[f], skills.filter((s) => s.facets.includes(f)).length)),
  ].join("\n");
  const items = skills.map((s) =>
    `  <li class="skill-pill" data-facets="${esc(s.facets.join(" "))}">${esc(s.name)}</li>`).join("\n");
  return `<div class="chip-row" role="group" aria-label="Filter skills by area">
${chips}
</div>
<ul class="skill-list" data-skill-list>
${items}
</ul>`;
}

/* ------------------------------------------------------------------ agents */

/**
 * agents.json is merged, not overwritten. Site-owned blocks (privacy, documents,
 * publicContact, evidenceMatrix) and per-project fields the résumé schema has no
 * source for (status, keyFocus, buildNarrative) are carried across untouched.
 */
function buildAgentsJson(previous, data) {
  const priorByName = new Map((previous.projects ?? []).map((p) => [p.name, p]));
  const projects = data.featuredProjects.map((p) => {
    const title = p.portfolioHeadline ?? p.name;
    const prior = priorByName.get(title) ?? priorByName.get(p.name) ?? {};
    const liveUrl = (p.portfolioLinks ?? []).find((l) => /^https?:\/\//.test(l.url))?.url;
    return {
      name: title,
      status: prior.status ?? "documented",
      ...(liveUrl || prior.liveUrl ? { liveUrl: liveUrl ?? prior.liveUrl } : {}),
      ...(p.portfolioImage ? { screenshots: [`assets/${p.portfolioImage}`] } : {}),
      techStack: p.technologies ?? [],
      ...(prior.keyFocus ? { keyFocus: prior.keyFocus } : {}),
      buildNarrative: prior.buildNarrative ?? p.solution ?? "",
      evidence: p.outcomes ?? [],
    };
  });

  return {
    ...previous,
    lastUpdated: (data.generatedAt ?? "").slice(0, 10) || previous.lastUpdated,
    candidate: {
      ...previous.candidate,
      name: data.name,
      headline: data.headline,
      summary: data.summary,
    },
    coreCompetencies: data.skills.map((s) => s.name),
    projects,
    experience: data.experience.map((r) => ({
      organization: r.company,
      role: r.title,
      dates: `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
      evidence: r.bullets ?? [],
    })),
  };
}

function buildAgentsMd(a) {
  const lines = [
    `# ${a.candidate.name} — Agent Profile`,
    "",
    "<!-- Generated by scripts/build-site.mjs. Edit data/resume-content.json or agents.json instead. -->",
    "",
    `**${a.candidate.headline}**`,
    "",
    a.candidate.summary,
    "",
    `_${a.candidate.privacy}_`,
    "",
    `Last updated: ${a.lastUpdated}`,
    "",
    "## Contact",
    "",
    `- Email: ${a.candidate.publicContact.email}`,
    `- LinkedIn: ${a.candidate.publicContact.linkedin}`,
    "",
    "## Core competencies",
    "",
    a.coreCompetencies.join(", ") + ".",
    "",
    "## Projects",
    "",
  ];
  for (const p of a.projects) {
    lines.push(`### ${p.name}`, "");
    if (p.liveUrl) lines.push(`Live: ${p.liveUrl}`, "");
    lines.push(`Stack: ${p.techStack.join(", ")}`, "");
    if (p.buildNarrative) lines.push(p.buildNarrative, "");
    for (const e of p.evidence) lines.push(`- ${e}`);
    lines.push("");
  }
  lines.push("## Experience", "");
  for (const r of a.experience) {
    lines.push(`### ${r.role} — ${r.organization}`, "", `_${r.dates}_`, "");
    for (const e of r.evidence) lines.push(`- ${e}`);
    lines.push("");
  }
  lines.push("## Evidence matrix", "");
  for (const row of a.evidenceMatrix) {
    lines.push(`### ${row.claim}`, "", `- Supporting project: ${row.supportingProject}`,
      `- Stack: ${(row.techStack ?? []).join(", ")}`, `- Artifact: ${row.artifact}`);
    if (row.verificationNote) lines.push(`- Verification: ${row.verificationNote}`);
    lines.push("");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/* -------------------------------------------------------------------- main */

const data = JSON.parse(read("data/resume-content.json"));
const featured = data.featuredProjects.find((p) => p.portfolioFeatured === true);
const cards = data.featuredProjects.filter((p) => p !== featured);

let html = read("index.html");
html = writeRegion(html, "featured", renderFeatured(featured));
html = writeRegion(html, "projects", cards.map(renderProjectCard).join("\n"));
html = writeRegion(html, "experience", renderExperience(data.experience));
html = writeRegion(html, "skills", renderSkills(data.skills));

const agents = buildAgentsJson(JSON.parse(read("agents.json")), data);
const agentsJson = JSON.stringify(agents, null, 2) + "\n";
const agentsMd = buildAgentsMd(agents);

const outputs = [
  ["index.html", html],
  ["agents.json", agentsJson],
  ["agents.md", agentsMd],
];

const changed = outputs.filter(([file, next]) => read(file) !== next).map(([file]) => file);

if (CHECK) {
  if (changed.length) {
    console.error(`✗ generated output is stale: ${changed.join(", ")}`);
    console.error("  run `npm run build` and commit the result");
    process.exit(1);
  }
  console.log("✓ generated output is up to date");
} else {
  for (const [file, next] of outputs) writeFileSync(join(ROOT, file), next);
  console.log(
    changed.length
      ? `✓ wrote ${changed.join(", ")}`
      : "✓ already up to date — no changes written",
  );
  console.log(
    `  ${cards.length} cards + 1 featured · ${data.experience.length} roles · ${data.skills.length} skills`,
  );
}
