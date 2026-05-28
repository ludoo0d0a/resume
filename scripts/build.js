#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import {
  BUILD_PRESETS,
  buildAll,
  parseBuildArgs,
  resolveTargets,
} from './lib/build-resume.js';
import { validateEuropassXml } from './lib/europass-validate.js';
import { SUPPORTED_LANGS } from './lib/lang-paths.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function printHelp() {
  const presetList = Object.keys(BUILD_PRESETS).join(' | ');
  console.log(`Usage: npm run build -- [options]

Pipeline: npm run split  →  resume.en.json / resume.fr.json  →  npm run build:all

Presets (bundle --target values):
  --preset <name>       ${presetList}
    site                Theme HTML + JSON Resume PDF
    europass            Europass XML + HTML + PDF
    europass-xml        Europass XML only (+ --validate)
    public              site + europass (+ --validate) — full GitHub Pages output

Languages (default: ${SUPPORTED_LANGS.join(', ')}):
  --lang <en|fr>        Repeat for one language

Outputs (default without preset: html + europass-xml):
  --target <name>       html | pdf | europass-xml | europass-pdf | europass-html
  --with-pdf            Also build pdf + europass-pdf (with default targets)
  --validate            XSD check via xmllint (after build)

Other:
  --use-api             Legacy Europass REST API for Europass PDF
  --rest-url <url>
  -h, --help

Examples:
  npm run build:all
  npm run build -- --preset public
  npm run build -- --preset site
  npm run build -- --preset europass-xml --lang fr
  npm run build -- --target pdf --lang en
  npm run build -- --with-pdf
  npm run validate
`);
}

async function main() {
  const options = parseBuildArgs(process.argv);
  if (options.help) {
    printHelp();
    return;
  }

  const targets = resolveTargets(options);
  if (targets.size > 0) {
    const targetList = [...targets].join(', ');
    console.log(`Building [${options.langs.join(', ')}]: ${targetList}`);
    await buildAll(root, options);
  } else if (!options.validate) {
    throw new Error('Nothing to build. Use --preset or --target, or --validate alone.');
  }

  if (options.validate) {
    if (!validateEuropassXml(root, options.langs)) {
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
