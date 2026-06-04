#!/usr/bin/env node
/**
 * One-shot: resume.i18n.json work[] → workEras (SFEIR, SOGETI) + standalone work[].
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nPath = path.join(root, 'resume.i18n.json');

const SFEIR_RE = /^sfeir$/i;
const SOGETI_RE = /^sogeti/i;
const UMBRELLA_RE = /see details above|voir les détails ci-dessus/i;

function extractClientFromSummary(entry) {
  const text = entry.en_summary || entry.fr_summary || '';
  const patterns = [
    /^at\s+(.+?)(?:\n|$)/im,
    /^à\s+(.+?)(?:\n|$)/im,
    /^au\s+(.+?)(?:\n|$)/im,
    /^pour\s+(.+?)(?:,|\n|$)/im,
    /^for\s+(.+?)(?:,|\n|$)/im,
    /^Client\s*:\s*(.+?)(?:\n|\\n|$)/im,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim().replace(/\\n/g, '');
  }
  return '';
}

function stripMission(entry) {
  const m = {
    position: entry.position,
    startDate: entry.startDate,
    endDate: entry.endDate,
    highlights: entry.highlights,
    en_highlights: entry.en_highlights,
    fr_highlights: entry.fr_highlights,
    en_summary: entry.en_summary,
    fr_summary: entry.fr_summary,
    location: entry.location,
    clientUrl: entry.url,
  };
  if (entry.en_name || entry.fr_name) {
    m.en_client = entry.en_name || entry.fr_name;
    m.fr_client = entry.fr_name || entry.en_name;
  } else if (entry.name && !SFEIR_RE.test(entry.name) && !SOGETI_RE.test(entry.name)) {
    m.en_client = entry.name;
    m.fr_client = entry.fr_name || entry.name;
  } else {
    const parsed = extractClientFromSummary(entry);
    if (parsed) {
      m.en_client = parsed;
      m.fr_client = parsed;
    }
  }
  return m;
}

const SFEIR_ERA_START = '2017-08-01';

function isSfeirMission(entry) {
  return (entry.startDate || '') >= SFEIR_ERA_START;
}

function stripInternal(entry) {
  return {
    position: entry.position,
    startDate: entry.startDate,
    endDate: entry.endDate,
    highlights: entry.highlights,
    en_highlights: entry.en_highlights,
    fr_highlights: entry.fr_highlights,
    en_summary: entry.en_summary,
    fr_summary: entry.fr_summary,
    location: entry.location,
    url: entry.url,
  };
}

function main() {
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));
  const work = data.work || [];

  const sfeirInternal = [];
  const sfeirMissions = [];
  const sogetiMissions = [];
  let sogetiEraSummary = null;
  const standalone = [];

  for (const entry of work) {
    const name = entry.name || '';

    if (/quaternove/i.test(name)) {
      standalone.push(entry);
      continue;
    }

    if (SFEIR_RE.test(name)) {
      sfeirInternal.push(stripInternal(entry));
      continue;
    }

    if (SOGETI_RE.test(name) || /sogeti/i.test(entry.url || '')) {
      const summary = `${entry.en_summary || ''} ${entry.fr_summary || ''}`;
      if (UMBRELLA_RE.test(summary)) {
        sogetiEraSummary = {
          en_summary: entry.en_summary,
          fr_summary: entry.fr_summary,
        };
        continue;
      }
      sogetiMissions.push(stripMission({ ...entry, name: undefined }));
      continue;
    }

    if (isSfeirMission(entry)) {
      sfeirMissions.push(stripMission(entry));
      continue;
    }

    if (/sogeti/i.test(entry.url || '') || SOGETI_RE.test(name)) {
      sogetiMissions.push(stripMission({ ...entry, name: undefined }));
      continue;
    }

    standalone.push(entry);
  }

  data.workEras = [
    {
      employer: 'SFEIR',
      employerUrl: 'https://www.linkedin.com/company/sfeir/',
      location: 'Luxembourg',
      startDate: '2017-08-31',
      en_tagline: 'IT services · software development & architecture',
      fr_tagline: 'ESN · développement et architecture logicielle',
      internal: sfeirInternal,
      missions: sfeirMissions,
    },
    {
      employer: 'SOGETI Luxembourg',
      employerUrl: 'https://www.linkedin.com/company/sogeti-luxembourg/',
      location: 'Bertrange, Luxembourg',
      startDate: '2001-06-30',
      endDate: '2017-08-31',
      en_tagline: 'IT services · European and national institutions',
      fr_tagline: 'ESN · institutions européennes et nationales',
      ...(sogetiEraSummary || {}),
      missions: sogetiMissions,
    },
  ];

  data.work = standalone;
  fs.writeFileSync(i18nPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    `workEras: SFEIR (${sfeirInternal.length} internal, ${sfeirMissions.length} missions), SOGETI (${sogetiMissions.length} missions), work: ${standalone.length} standalone`,
  );
}

main();
