#!/usr/bin/env node

/**
 * Download Europass XML Schema v3.4.0 from europass/ewa-cedefop (GitHub).
 * Official europass.cedefop.europa.eu XSD URLs no longer return schema files.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = 'https://github.com/europass/ewa-cedefop.git';
const SCHEMA_PATH = 'services/core/src/main/resources/schema/v3.4.0';
const DEST = path.join(
  fileURLToPath(new URL('..', import.meta.url)),
  '..',
  'schemas',
  'europass',
  'v3.4.0',
);

const REMOTE_INCLUDE = 'https://europass.cedefop.europa.eu/xml/included/';
const REMOTE_IMPORT = 'https://europass.cedefop.europa.eu/xml/imported/';

function patchSchemaPaths(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) continue;
    if (!file.endsWith('.xsd')) continue;
    let text = fs.readFileSync(full, 'utf8');
    text = text.replaceAll(REMOTE_INCLUDE, 'included/');
    text = text.replaceAll(REMOTE_IMPORT, 'imported/');
    fs.writeFileSync(full, text);
  }
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ewa-cedefop-'));
  try {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse "${REPO}" "${tmp}"`,
      { stdio: 'inherit' },
    );
    execSync(`git -C "${tmp}" sparse-checkout set "${SCHEMA_PATH}"`, {
      stdio: 'inherit',
    });
    execSync(`git -C "${tmp}" checkout`, { stdio: 'inherit' });

    const src = path.join(tmp, SCHEMA_PATH);
    if (!fs.existsSync(path.join(src, 'EuropassSchema.xsd'))) {
      throw new Error(`Missing EuropassSchema.xsd under ${src}`);
    }

    const importedDir = path.join(DEST, 'imported');
    const importedBackup = fs.existsSync(importedDir)
      ? fs.mkdtempSync(path.join(os.tmpdir(), 'europass-imported-'))
      : null;
    if (importedBackup) {
      fs.cpSync(importedDir, importedBackup, { recursive: true });
    }

    fs.rmSync(DEST, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(DEST), { recursive: true });
    execSync(`rsync -a --exclude=documentation --exclude=examples "${src}/" "${DEST}/"`, {
      stdio: 'inherit',
    });
    patchSchemaPaths(DEST);

    if (importedBackup) {
      fs.cpSync(importedBackup, importedDir, { recursive: true });
      fs.rmSync(importedBackup, { recursive: true, force: true });
    }

    const count = fs
      .readdirSync(DEST, { recursive: true })
      .filter((f) => String(f).endsWith('.xsd')).length;
    console.log(`Saved ${count} XSD files to ${DEST}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main();
