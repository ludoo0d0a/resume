#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { validateEuropassXml } from './lib/europass-validate.js';
import { SUPPORTED_LANGS, normalizeLang } from './lib/lang-paths.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function parseArgs(argv) {
  const langs = [];
  let help = false;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--lang' || arg === '--locale') && argv[i + 1]) langs.push(argv[++i]);
    else if (arg === '--help' || arg === '-h') help = true;
  }
  return {
    langs: langs.length ? langs.map(normalizeLang) : [...SUPPORTED_LANGS],
    help,
  };
}

function main() {
  const { langs, help } = parseArgs(process.argv);
  if (help) {
    console.log(`Usage: npm run validate -- [--lang en|fr]

Validates public/resume-<lang>-europass.xml against schemas/europass/v3.4.0/EuropassSchema.xsd
(requires xmllint).
`);
    return;
  }

  if (!validateEuropassXml(root, langs)) {
    process.exit(1);
  }
}

main();
