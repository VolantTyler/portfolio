# Running TODO

Open items across **both** repos — `VolantTyler/portfolio` and `VolantTyler/resume-system`.
Milestone work itself lives in [resume-portfolio-sync-plan.md](resume-portfolio-sync-plan.md);
this file tracks everything else plus anything that surfaces along the way.

Last updated 2026-08-18.

---

## Bugs

- [ ] **Committed merge-conflict markers in the judge log** — `resume-system/docs/judge-log.md`
      lines 45–52 contain literal `<<<<<<< HEAD`, `=======`, and `>>>>>>> f7ba62f...`. Someone
      resolved a merge and committed the markers. Nothing parses the file so the build is fine, but
      it is corrupt data in an append-only record. Clean by hand.

- [ ] **Cognitive Bridge renders twice on the live site** — `portfolio/index.html` shows it as the
      large featured block *and* again as a card titled "Human-to-AI Personality Alignment." Same
      image, same live link, both labelled "Project 05." Delete the card, keep the featured block.
      *Scheduled: Milestone 2 prep.*

- [ ] **`sync-agents-md.mjs` does not exist** — `portfolio/README.md` tells you to regenerate
      `agents.md` with `node scripts/sync-agents-md.mjs`, but there is no `scripts/` directory at
      all. That command has never worked, so `agents.md` is hand-maintained and almost certainly
      out of sync with `agents.json`. *Scheduled: Milestone 2.*

- [x] **Skills export was empty** — fixed in Milestone 1. The filter matched `skill.target_roles`
      against the target id `portfolio-focused`, which no skill listed, so zero skills exported.
      Now 50 skills export across five facets.

- [ ] **Hardcoded "Project 01–05" kickers** — once the generator numbers cards itself, the
      hand-written Agent-Ready Portfolio card wedged among them makes the numbering wrong.
      *Scheduled: Milestone 2 prep.*

---

## Housekeeping

- [ ] **Publicis tailoring run is uncommitted** — in `resume-system`, six untracked files
      (`docs/job-descriptions/publicis-groupe-full-stack-developer-nyc.md`, one `output/judge-runs/`
      entry, four in `output/resumes/tailored/`) plus a `judge-log.md` line. Decide whether this run
      gets committed or discarded.

- [ ] **Regeneration log entries are entangled with the above** — the 2026-08-14 `npm run generate`
      added nine `output/judge-runs/` files and nine `judge-log.md` rows. These were deliberately
      left out of PR #18 so the Publicis work stays yours. Commit them together with a decision on
      the item above, and clean the conflict markers in the same pass.

---

## Open questions

- [ ] **Is the judge meant to run in stub mode?** Every entry in `judge-log.md` reads
      "Stub judge: pass — no revision directives," so the 7/10 and 9/10 scores are placeholders, not
      real evaluations. Either no API key is configured in this environment, or stub is the intended
      local default. Job-fit scoring is a headline feature, so worth confirming.

- [ ] **Filter low-confidence claims out of the public export?** `openclaw-multi-agent-ecosystem`
      carries a "~15% profit lift" outcome the source data itself tags *medium/low confidence*.
      Defensible on a résumé read in context; more exposed as a standing public claim.
      *Deferred by Tyler — revisit before Milestone 3 ships.*

- [ ] **Enrich `skills.yaml` for the DevOps facet?** It holds three skills (Docker, CI/CD, GitHub
      Actions) against sixteen for Applied AI, so that chip will look sparse. Projects already
      demonstrate Vercel, Firebase Cloud Functions, and OpenTelemetry that never made it into the
      skills corpus. Enrich rather than pad.

- [ ] **How should `agents.json` merge?** It currently holds a *better* public headline and summary
      than the generated export, plus project fields with no schema source (`status`, `liveUrl`,
      `screenshots`, `keyFocus`, `buildNarrative`) and site-owned blocks (`privacy`, `documents`,
      `publicContact`). Naive regeneration degrades it. *Decide during Milestone 2.*

---

## Content and assets needed

- [ ] **Screenshot for Development Knowledge Vault** — it is the one genuinely new card and has no
      image in `portfolio/assets/`. Without one it falls back to the generic
      `project-previews.png` placeholder. Suggested filename:
      `assets/development-knowledge-vault.png`.

- [ ] **Confirm the remaining project images still match** — `alchemia-dashboard.png` (OpenClaw),
      `insummery-dashboard.png` (InSummery), `cognitive-bridge-light.png` (Cognitive Bridge),
      `agentos-capability-map.png` (AgentOS).

---

## Documentation

- [ ] **`resume-system/docs/portfolio-integration.md` is stale** — it names build-time fetch as
      "the current recommendation" and still lists site-side wiring as out of scope, both of which
      contradict the agreed consumer-pull design. *Scheduled: Milestone 3.*

- [ ] **Keep the two plan copies identical** — `docs/resume-portfolio-sync-plan.md` is mirrored
      byte-for-byte in both repos. Edit one, copy it across.

---

## Deferred follow-up work

Things worth doing that are deliberately *not* part of any milestone. Parked here so they don't
get lost.

- [ ] **Fix the 0×0 browser viewport so generated pages can be inspected** — the in-app browser
      pane reports `innerWidth: 0, innerHeight: 0`, and a `resize_window` call does not correct it.
      Consequences seen while building Milestone 2:
      screenshots come back uniformly blank; the page measured 57,735px tall with zero-width grid
      columns (a collapse artifact, not a layout bug); and computed styles went stale, reporting a
      chip background that contradicted the CSS variable it reads.
      JavaScript execution and DOM queries *do* work, so structure and behaviour can still be
      verified — but nothing visual can. Tyler's expectation is that generated pages are
      inspectable, so this is worth fixing rather than working around. **Not urgent.**

- [ ] **Write the knowledge-vault pattern** — this project embodies a reusable pattern the vault
      does not yet cover: *a one-directional generated-content contract between two repos*
      (consumer-side pull with no shared credential, marker-based partial generation of a static
      site, and validation guards for silent-drop failures). Closest existing neighbour is
      `yaml-knowledge-systems.md`.
      **How to add it:** the Knowledge Vault MCP exposes only `list_patterns` and `get_pattern` —
      it is read-only, so it cannot be updated from a chat session. The new pattern must be
      committed as a markdown file to the `development-knowledge-vault` repo, which is what the
      MCP server serves. Draft the markdown here, commit it there.

- [ ] **Extract a `milestone-pr-review` skill** — the same review shape has now run twice (M0, M1)
      and caught a real defect both times that the diff did not show: fetch the branch, run
      `validate` + the full test suite, verify the *generated output* against the plan's acceptance
      criteria, probe any new guard in **both** directions, then report. Worth making repeatable.

- [ ] **Extract a `cloud-agent-handoff` skill** — the kickoff-prompt shape used for Milestones 0
      and 1: target branch, an explicit scope fence ("this milestone only, do not touch the other
      repo"), numbered tasks with real file paths, known values spelled out, an explicit VERIFY
      block, and "commit and open a PR, do not merge."

- [ ] **Add `tsc --noEmit` to the test pipeline** — adding a value to the `PortfolioFacet` union
      without a matching `STUB_KEYWORDS` entry is a compile error that nothing caught, because
      `tsx` strips types at runtime and no step type-checks. It surfaced as four confusing test
      failures instead of one clear error.

- [ ] **Exclude stray worktrees from vitest** — the runner collects
      `.claude/worktrees/self-verifying-ai-skill-1aed9f/tests/generation.test.ts`, adding ~18s of
      duplicate PDF generation to every run. Unrelated work leaking into the suite.

- [ ] **Live URL for Development Knowledge Vault** — it is a Vercel-hosted MCP server per its own
      YAML entry, and it is the one genuinely new card, but no URL is recorded so it ships with no
      links. Add one to `portfolio_links`.

- [ ] **Possible skill redundancy** — `Stakeholder collaboration` and `Cross-department
      collaboration` now sit side by side in the collaboration facet. Collapse into one if they
      read as duplicates on the site.

- [ ] **Revisit `Release support`** — it lives in the Collaboration category but is explicitly
      faceted `devops`, which keeps that chip at 4 instead of 3. Defensible, but it is the one
      skill whose facet disagrees with its category.

---

## Milestones

Detail in [resume-portfolio-sync-plan.md](resume-portfolio-sync-plan.md).

- [x] **0 — Reconcile the data** · `resume-system` · [PR #18](https://github.com/VolantTyler/resume-system/pull/18)
- [x] **1 — Extend the schema for presentation** · `resume-system` · [PR #20](https://github.com/VolantTyler/resume-system/pull/20)
- [ ] **2 — Add the render step** · `portfolio` · **in progress**
- [ ] **3 — Automate the pull** · `portfolio`
- [ ] **4 — Prove it with Stack Overlord** · both · run locally, needs a Vercel preview

---

## Recently resolved

- [x] Milestone 1: `portfolio_` presentation fields, skill facets, and a `classify-skills` script
      with an offline stub for when no API key is configured.
- [x] Added a fifth `collaboration` facet so "Deep listening" and "Stakeholder collaboration" stop
      appearing under the Front-End and Back-End chips, plus two new skills — Consensus-building
      and Cross-department collaboration. `Agile` is now `Agile / Scrum`.
- [x] Restored five project links that would have silently disappeared once Milestone 2 generates
      the cards: InSummery's Kaggle writeup and live demo, and the technical brief on OpenClaw,
      AgentOS, and Cognitive Bridge.
- [x] Loosened the link schema to accept site-relative paths like `docs/Tyler-Technical-Briefs.pdf`;
      it previously demanded an absolute URL.

- [x] Volant 2024 stint retired from the record; 2017 stint restored to all nine résumé versions
      with its accomplishment so it no longer renders as an empty section.
- [x] Charity Navigator metrics corrected to 11M+ annual users and 50,000+ clients, with provenance
      recorded in `source_notes`.
- [x] Public headline no longer leaks the internal version label
      ("Portfolio-Focused Software Engineer").
- [x] Validation guard added for the silent-failure case where a project is `portfolio_visible: true`
      but missing from `portfolio-v1.project_ids`.
