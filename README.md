# Portfolio Resume Site

Static, responsive portfolio resume website with a human-facing portfolio and agent-readable applicant profile.

## Asset Upload Targets

Use these filenames when adding final personal images and project screenshots:

- `docs/Tyler-Resume.pdf`
- `docs/Tyler-Technical-Briefs.pdf`
- `assets/headshot.jpg` or `assets/headshot.png`
- `assets/portrait-painted.jpg`
- `assets/portrait-cartoon.jpg`
- `assets/portrait-pencil.jpg`
- `assets/apple-touch-icon.png`
- `assets/icon-192.png`
- `assets/icon-512.png`
- `assets/alchemia-dashboard.png`
- `assets/cognitive-bridge-light.png`
- `assets/projects/project-01.png`
- `assets/projects/project-02.png`
- `assets/projects/project-03.png`
- `assets/projects/project-04.png`
- `assets/projects/project-05.png`

The remaining project cards use `assets/project-previews.png` as temporary artwork until real screenshots are available.

## Pages

- `index.html` - public portfolio resume
- `agents.html` - human-readable agent profile
- `agents.json` - structured agent-readable profile
- `agents.md` - plain-text agent-readable profile

## Generated Content

Project cards, the experience timeline, the skills filter, `agents.json`, and `agents.md` are
generated from `data/resume-content.json`, which is synced from
[`VolantTyler/resume-system`](https://github.com/VolantTyler/resume-system). That repo is the source
of truth for résumé data — add a project or skill there, not here.

```bash
npm run build
```

Only the regions between `<!-- generated:NAME start -->` and `<!-- generated:NAME end -->` markers
in `index.html` are rewritten. Hero copy, layout, the evidence matrix, and the hand-written
Agent-Ready Portfolio card are authored by hand and left alone. `agents.json` is *merged*, so its
`privacy`, `documents`, `publicContact`, and `evidenceMatrix` blocks survive regeneration.

```bash
npm run check
```

Fails if the committed output is stale — run it before pushing.

### How content updates reach this site

Edit a project, credential, or role in `resume-system`, then either:

- run the [**Sync résumé content**](.github/workflows/sync-resume.yml) workflow manually
  (Actions → Sync résumé content → Run workflow) to pull the change in right away, or
- wait for its weekly safety-net run, Mondays at 13:00 UTC.

Either way it pulls the published export, re-renders the generated regions, and opens a pull
request here for review — nothing is pushed straight to `main`. See
[docs/resume-portfolio-sync-plan.md](docs/resume-portfolio-sync-plan.md) for the full design.

## Local Preview

Open `index.html` directly in a browser, or serve this folder with any static web server.
