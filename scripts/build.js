#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { buildAll, parseBuildArgs, resolveTargets } from './lib/build-resume.js';
import { SUPPORTED_LANGS } from './lib/lang-paths.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function printHelp() {
  console.log(`Usage: npm run build -- [options]

Languages (default: ${SUPPORTED_LANGS.join(', ')}):
  --lang <en|fr>        Repeat for one language

Outputs (default: html + europass-xml):
  --target <name>       html | pdf | europass-xml | europass-pdf | europass-html
  --with-pdf            Also build pdf + europass-pdf

Other:
  --use-api             Legacy Europass REST API for Europass PDF
  --rest-url <url>
  -h, --help

Examples:
  npm run build
  npm run build:pdf
  npm run build:europass-xml
  npm run build:europass-xml -- --lang fr
  npm run build -- --lang fr
  npm run build -- --target pdf --lang en
  npm run build -- --target europass-xml --target europass-pdf --lang fr
`);
}

async function main() {
  const options = parseBuildArgs(process.argv);
  if (options.help) {
    printHelp();
    return;
  }

  const targets = [...resolveTargets(options)].join(', ');
  console.log(`Building [${options.langs.join(', ')}]: ${targets}`);

  await buildAll(root, options);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
