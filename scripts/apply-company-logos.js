#!/usr/bin/env node
/**
 * Resolve employerLogo / clientLogo / logoUrl in resume.i18n.json from company domains.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  domainForCompany,
  domainForEmployer,
  faviconLogo,
  normalizeCompanyKey,
  shouldReplaceClientUrl,
  websiteForDomain,
} from './lib/company-logo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nPath = path.join(root, 'resume.i18n.json');

function applyMission(mission) {
  const clientName = mission.en_client || mission.fr_client || '';
  const domain = domainForCompany(clientName, mission.clientUrl);
  if (!domain) return { domain: '', updated: false };

  mission.clientLogo = faviconLogo(domain);
  let updated = false;
  if (shouldReplaceClientUrl(mission.clientUrl, domain)) {
    mission.clientUrl = websiteForDomain(domain);
    updated = true;
  }
  return { domain, updated };
}

function applyEra(era) {
  const domain = domainForEmployer(era.employer, era.employerWebsite);
  if (domain) {
    era.employerLogo = faviconLogo(domain);
    if (!era.employerWebsite) {
      era.employerWebsite = websiteForDomain(domain);
    }
  }
  let missionCount = 0;
  let urlFixes = 0;
  for (const mission of era.missions || []) {
    const { domain: md, updated } = applyMission(mission);
    if (md) missionCount += 1;
    if (updated) urlFixes += 1;
  }
  return { domain, missionCount, urlFixes };
}

function applyWorkEntry(entry) {
  const domain = domainForCompany(entry.name, entry.url);
  if (domain) {
    entry.logoUrl = faviconLogo(domain);
    if (!entry.url) entry.url = websiteForDomain(domain);
  }
  return domain;
}

function main() {
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));
  const stats = { eras: 0, missions: 0, urlFixes: 0, work: 0 };

  for (const era of data.workEras || []) {
    const r = applyEra(era);
    if (r.domain) stats.eras += 1;
    stats.missions += r.missionCount;
    stats.urlFixes += r.urlFixes;
  }

  for (const entry of data.work || []) {
    if (applyWorkEntry(entry)) stats.work += 1;
  }

  fs.writeFileSync(i18nPath, `${JSON.stringify(data, null, 2)}\n`);

  console.log(
    `Updated ${i18nPath}: ${stats.eras} employers, ${stats.missions} missions with logos, ${stats.urlFixes} clientUrl fixes, ${stats.work} standalone work.`,
  );
}

main();
