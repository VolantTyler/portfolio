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
- `agents.json` - structured agent-readable profile (source of truth)
- `agents.md` - plain-text agent-readable profile (generated from `agents.json`)

Regenerate Markdown after JSON edits:

```bash
node scripts/sync-agents-md.mjs
```

## Local Preview

Open `index.html` directly in a browser, or serve this folder with any static web server.
