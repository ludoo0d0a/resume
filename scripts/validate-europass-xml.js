#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTED_LANGS, pathsForLang } from './lib/lang-paths.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const schema = path.join(root, 'schemas/europass/v3.4.0/EuropassSchema.xsd');

function parseArgs(argv) {
  const langs = [];
  let help = false;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--lang' || arg === '--locale') && argv[i + 1]) langs.push(argv[++i]);
    else if (arg === '--help' || arg === '-h') help = true;
  }
  return { langs: langs.length ? langs : [...SUPPORTED_LANGS], help };
}

function validateFile(xmlPath) {
  execSync(`xmllint --noout --schema "${schema}" "${xmlPath}"`, {
    stdio: 'pipe',
    encoding: 'utf8',
  });
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

  if (!fs.existsSync(schema)) {
    throw new Error(`Schema not found: ${schema}. Run: npm run xsd`);
  }

  let failed = false;
  for (const lang of langs) {
    const xmlPath = path.join(root, pathsForLang(lang).europassXml);
    if (!fs.existsSync(xmlPath)) {
      console.error(`Missing: ${xmlPath} (run npm run build:europass-xml)`);
      failed = true;
      continue;
    }
    try {
      validateFile(xmlPath);
      console.log(`Valid (${lang}): ${xmlPath}`);
    } catch (error) {
      failed = true;
      console.error(`Invalid (${lang}): ${xmlPath}`);
      console.error(error.stdout || error.message);
    }
  }

  if (failed) process.exit(1);
}

main();
