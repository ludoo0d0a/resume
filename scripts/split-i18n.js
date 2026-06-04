#!/usr/bin/env node
/**
 * Split resume.i18n.json → resume.<lang>.json (one file per meta.languages entry).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOCALE_BY_LANG } from './lib/lang-paths.js';
import { applyWorkEras } from './lib/work-eras.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nPath = path.join(root, 'resume.i18n.json');

function loadI18n() {
  if (!fs.existsSync(i18nPath)) {
    throw new Error(`Missing ${i18nPath}`);
  }
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));
  if (!data.meta?.languages) {
    throw new Error('resume.i18n.json: meta.languages is required (e.g. "en,fr")');
  }
  const languages = data.meta.languages.split(',').map((s) => s.trim()).filter(Boolean);
  if (!languages.length) {
    throw new Error('resume.i18n.json: meta.languages is empty');
  }
  return { data, languages };
}

function createLanguageVersion(data, language, languages) {
  const result = structuredClone(data);

  function processObject(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObject(obj[key]);
      }

      for (const lang of languages) {
        if (lang !== language && key.startsWith(`${lang}_`)) {
          delete obj[key];
        }
      }

      if (key.startsWith(`${language}_`)) {
        const baseKey = key.substring(language.length + 1);
        obj[baseKey] = obj[key];
        delete obj[key];
      }
    }
  }

  processObject(result);
  applyWorkEras(result);
  return result;
}

function localeForLang(lang, meta) {
  const key = `${lang}_locale`;
  if (meta?.[key]) return meta[key];
  return LOCALE_BY_LANG[lang] || `${lang}-${lang.toUpperCase()}`;
}

function main() {
  const { data, languages } = loadI18n();
  console.log(`Splitting resume.i18n.json → [${languages.join(', ')}]`);

  for (const lang of languages) {
    const version = createLanguageVersion(data, lang, languages);
    version.meta = version.meta || {};
    version.meta.locale = localeForLang(lang, data.meta);
    const out = path.join(root, `resume.${lang}.json`);
    fs.writeFileSync(out, `${JSON.stringify(version, null, 2)}\n`);
    console.log(`  wrote resume.${lang}.json (${version.meta.locale})`);
  }
}

main();
