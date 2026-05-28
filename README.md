# Resume of Ludovic Valente

[![Build and deploy](https://github.com/ludoo0d0a/resume/actions/workflows/split-i18n.yml/badge.svg?branch=main)](https://github.com/ludoo0d0a/resume/actions/workflows/split-i18n.yml)
[![Live site](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&url=https%3A%2F%2Fludoo0d0a.github.io%2Fresume%2F)](https://ludoo0d0a.github.io/resume/)
[![JSON Resume](https://img.shields.io/badge/format-JSON%20Resume-1a2226)](https://jsonresume.org/)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20FR-blue)](#i18n-format)

JSON Resume CV in **EN** and **FR**, built from a single i18n source.

Live site: [ludoo0d0a.github.io/resume](https://ludoo0d0a.github.io/resume/)

## Quick start (local)

```bash
npm install -g resume-cli   # PDF export
npm ci
npm run build:all           # split → public/ + pdf/ + Europass + validate
```

Edit **`resume.i18n.json`**, then run `npm run build:all` again.

### npm scripts

| Command | What it does |
|---------|----------------|
| `npm run split` | `resume.i18n.json` → `resume.en.json`, `resume.fr.json` |
| `npm run build:site` | `public/` HTML + `pdf/` (+ mirror PDFs to `public/pdf/`) |
| `npm run build:europass` | Europass files in `public/` |
| `npm run build:public` | site + Europass + XSD validate |
| `npm run build:all` | split + build:public |

Needs **`xmllint`** for `npm run validate`. See [schemas/europass/README.md](schemas/europass/README.md) for `npm run xsd`.

## GitHub Actions

On push to `resume.i18n.json` (or build-related paths), CI runs the same pipeline:

1. `npm run split` → commit `resume.en.json` / `resume.fr.json`
2. `npm run build:public` → commit `public/` and `pdf/`
3. Deploy **`public/`** to GitHub Pages (`gh-pages`)

Optional gist sync: set `GIST_ID` and `GIST_TOKEN` in repository secrets.

## Published URLs

| Page | URL |
|------|-----|
| EN | https://ludoo0d0a.github.io/resume/ |
| FR | https://ludoo0d0a.github.io/resume/index-fr.html |
| Europass EN | https://ludoo0d0a.github.io/resume/resume.en.europass.html |

## i18n format

```json
{
  "en_summary": "English text",
  "fr_summary": "Texte français"
}
```

Languages come from `meta.languages` in `resume.i18n.json` (e.g. `"en,fr"`).

## Theming

[jsonresume-theme-ludoo](https://github.com/jsonresume/jsonresume-theme-ludoo) via root `index.js`; Europass layout in `europass/`.

Agent-oriented details: [AGENTS.md](AGENTS.md).
