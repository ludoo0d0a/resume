# AGENTS.md

## Pipeline (single flow)

```text
resume.i18n.json
       │  npm run split  (scripts/split-i18n.js)
       ▼
resume.en.json  resume.fr.json
       │  npm run build:public
       ├─ build:site   → public/index-*.html, pdf/*.pdf, public/pdf/*
       ├─ build:europass → public/*.europass.*
       └─ validate     → XSD (xmllint)
       ▼
public/  (+ pdf/ in repo)  →  GitHub Pages (publish_dir: public)
```

**Local:** `npm ci` then `npm run build:all` (split + build + validate).

**CI:** [.github/workflows/build.yml](.github/workflows/build.yml) runs the same npm scripts, commits `resume.*.json`, `public/`, `pdf/`, deploys `public/` to `gh-pages`.

## npm scripts

| Script | Action |
|--------|--------|
| `npm run split` | `resume.i18n.json` → `resume.en.json`, `resume.fr.json` |
| `npm run build:site` | HTML in `public/`, PDF in `pdf/` + copy to `public/pdf/` |
| `npm run build:europass` | Europass XML/HTML/PDF in `public/` |
| `npm run build:public` | `build:site` + `build:europass` + `validate` |
| `npm run build:all` | `split` + `build:public` |
| `npm run validate` | Europass XML vs vendored XSD |
| `npm run xsd` | Refresh `schemas/europass/v3.4.0/` |

Requires global or npx **`resume-cli`** for PDF export. Requires **`xmllint`** for validate.

## Source of truth

- Edit **`resume.i18n.json`** only (i18n keys: `en_summary`, `fr_summary`, …).
- Do not hand-edit `en_*` / `fr_*` in `resume.en.json` / `resume.fr.json`.

## Output paths (`scripts/lib/lang-paths.js`)

| Artifact | Path |
|----------|------|
| Per-lang JSON | `resume.{lang}.json` (repo root) |
| Homepage | `public/index.html` ← copy of `public/index-en.html` |
| HTML | `public/index-en.html`, `public/index-fr.html` |
| PDF (repo) | `pdf/resume-en.pdf`, `pdf/resume-fr.pdf` |
| PDF (Pages) | `public/pdf/resume-*.pdf` |
| Europass | `public/resume.{lang}.europass.{xml,html,pdf}` |

Profile URLs in JSON are relative to the **site root** (`pdf/resume-en.pdf`, `index-fr.html`).

## Layout

| Path | Role |
|------|------|
| `scripts/split-i18n.js` | i18n split |
| `scripts/build.js` | Build CLI |
| `scripts/lib/build-resume.js` | Render/export orchestration |
| `scripts/lib/europass-xml.js` | JSON Resume → Europass XML |
| `index.js` | Re-exports `jsonresume-theme-ludoo` |
| `europass/` | Europass HTML/PDF theme for resume-cli |

## Boundaries

- Secrets: `GIST_ID`, `GIST_TOKEN` in Actions only.
- CI uses `git add -f public/` if needed; do not add `/public/` to `.gitignore`.
