/**
 * Optional workEras → standard JSON Resume work[] (Employer - Client prefix for missions).
 * workEras remains on the resume object for moderncv grouping; Europass / resume-cli use work only.
 */

import { resolveCompanyLogo } from './company-logo.js';

const EMPLOYER_CLIENT_SEP = ' - ';

function parseDate(value) {
  if (!value) return null;
  const parts = String(value).split('-');
  return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
}

function startTimestamp(entry) {
  const d = parseDate(entry.startDate);
  return d ? d.getTime() : 0;
}

function sortByStartDesc(entries) {
  return [...entries].sort((a, b) => startTimestamp(b) - startTimestamp(a));
}

function pickEntryFields(entry, fields) {
  const out = {};
  for (const key of fields) {
    if (entry[key] !== undefined && entry[key] !== null && entry[key] !== '') {
      out[key] = entry[key];
    }
  }
  return out;
}

const WORK_ENTRY_FIELDS = [
  'position',
  'startDate',
  'endDate',
  'summary',
  'highlights',
  'location',
  'url',
];

function missionClientName(mission) {
  return mission.client || mission.en_client || mission.fr_client || mission.name || '';
}

function flattenInternalRole(era, role) {
  const employer = era.employer || '';
  return {
    ...pickEntryFields(role, WORK_ENTRY_FIELDS),
    name: employer,
    url: role.url || era.employerUrl,
    location: role.location || era.location,
  };
}

function flattenMission(era, mission) {
  const employer = era.employer || '';
  const client = missionClientName(mission);
  const name = client ? `${employer}${EMPLOYER_CLIENT_SEP}${client}` : employer;
  return {
    ...pickEntryFields(mission, WORK_ENTRY_FIELDS),
    name,
    url: mission.clientUrl || mission.url || era.employerUrl,
    location: mission.location || era.location,
  };
}

/**
 * @param {object[]} workEras
 * @returns {object[]}
 */
export function flattenWorkErasToWork(workEras) {
  if (!workEras || !workEras.length) return [];

  const flat = [];
  for (const era of workEras) {
    for (const role of era.internal || []) {
      flat.push(flattenInternalRole(era, role));
    }
    for (const mission of era.missions || []) {
      flat.push(flattenMission(era, mission));
    }
  }
  return flat;
}

/**
 * Merge optional workEras + legacy work[], newest first.
 * @param {{ work?: object[], workEras?: object[] }} data
 */
export function buildStandardWork(data) {
  const legacy = data.work || [];
  const fromEras = flattenWorkErasToWork(data.workEras);
  return sortByStartDesc([...fromEras, ...legacy]);
}

/**
 * After i18n split: set standard work[], keep resolved workEras for theme.
 * @param {object} data resume for one language
 */
export function applyWorkEras(data) {
  if (!data.workEras || !data.workEras.length) {
    return;
  }
  data.work = buildStandardWork(data);
}

function eraActivityTimestamp(era) {
  const stamps = [startTimestamp(era)];
  for (const item of [...(era.internal || []), ...(era.missions || [])]) {
    stamps.push(startTimestamp(item));
  }
  return Math.max(...stamps);
}

/**
 * Prepare workEras for moderncv (formatted entries, optional mission collapse).
 * @param {object[]} workEras
 * @param {(entry: object) => void} formatSection
 * @param {{ present: string, missionsVisible?: number }} options
 */
export function prepareWorkErasForDisplay(workEras, formatSection, options = {}) {
  const missionsVisible = options.missionsVisible ?? 5;

  return sortByStartDesc(workEras).map((era, eraIndex) => {
    const sortKey = eraActivityTimestamp(era);
    const internal = sortByStartDesc(era.internal || []).map((role) => {
      const entry = { ...role, name: era.employer };
      formatSection(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
      entry.isCurrent = !entry.endDate;
      return entry;
    });

    const eraHeader = { ...era };
    formatSection(eraHeader);
    if (!eraHeader.endDate) eraHeader.isCurrent = true;

    const allMissions = sortByStartDesc(era.missions || []).map((mission) => {
      const entry = {
        ...mission,
        clientName: mission.client || '',
        clientLogo: resolveCompanyLogo(
          mission.clientLogo,
          mission.clientUrl,
          mission.client || mission.en_client || mission.fr_client,
        ),
      };
      formatSection(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
      entry.isCurrent = !entry.endDate;
      return entry;
    });

    const visibleMissions = allMissions.slice(0, missionsVisible);
    const hiddenMissions = allMissions.slice(missionsVisible);
    const hiddenCount = hiddenMissions.length;

    return {
      eraIndex,
      sortKey,
      anchorId: `era-${eraIndex}`,
      employer: era.employer,
      employerUrl: era.employerUrl,
      employerLogo: resolveCompanyLogo(era.employerLogo, era.employerWebsite, era.employer),
      location: era.location,
      startDate: era.startDate,
      endDate: era.endDate,
      tagline: era.tagline || '',
      dateRange: eraHeader.dateRange,
      duration: eraHeader.duration,
      isCurrent: eraHeader.isCurrent,
      boolSummary: !!era.summary,
      summary: era.summary || '',
      internal,
      boolInternal: internal.length > 0,
      missions: visibleMissions,
      boolMissions: allMissions.length > 0,
      hiddenMissions,
      hiddenCount,
      boolHiddenMissions: hiddenCount > 0,
      hiddenMissionsLabel:
        options.hiddenMissionsLabel?.(hiddenCount) ||
        `${hiddenCount} earlier client missions`,
    };
  });
}

/**
 * Mixed experience timeline: eras + standalone work entries, newest first.
 */
export function buildExperienceTimeline(resume, formatSection, i18n) {
  const eras = resume.workEras?.length
    ? prepareWorkErasForDisplay(resume.workEras, formatSection, {
        present: i18n.present,
        hiddenMissionsLabel: (n) =>
          resume.lang === 'fr'
            ? `${n} missions client antérieures`
            : `${n} earlier client missions`,
      })
    : [];

  const eraEmployers = new Set(
    (resume.workEras || []).map((e) => String(e.employer || '').toLowerCase()),
  );

  const standalone = sortByStartDesc(resume.work || []).filter((entry) => {
    const n = String(entry.name || '').toLowerCase();
    if (!n) return true;
    if (n.includes(EMPLOYER_CLIENT_SEP.toLowerCase())) return false;
    return !eraEmployers.has(n);
  });

  standalone.forEach((entry) => {
    formatSection(entry);
    entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
    entry.isCurrent = !entry.endDate;
    entry.isStandalone = true;
    entry.logoUrl = resolveCompanyLogo(entry.logoUrl, entry.url, entry.name);
  });

  const blocks = [
    ...eras.map((era) => ({
      type: 'era',
      sortKey: era.sortKey,
      era,
    })),
    ...standalone.map((entry) => ({
      type: 'work',
      sortKey: startTimestamp(entry),
      entry,
    })),
  ];

  blocks.sort((a, b) => b.sortKey - a.sortKey);

  const yearsInOrder = [];
  const seenYears = new Set();
  const MAJOR_YEAR_GAP = 2;
  const MAJOR_YEAR_MAX = 12;

  function thinMajorYears(years) {
    if (years.length <= MAJOR_YEAR_MAX) return [...years];
    const sorted = [...years].sort((a, b) => b - a);
    const kept = [sorted[0]];
    for (let i = 1; i < sorted.length - 1; i += 1) {
      const y = sorted[i];
      const prev = kept[kept.length - 1];
      if (prev - y >= MAJOR_YEAR_GAP) kept.push(y);
    }
    const oldest = sorted[sorted.length - 1];
    if (kept[kept.length - 1] !== oldest) kept.push(oldest);
    const keptSet = new Set(kept);
    keptSet.add(sorted[0]);
    keptSet.add(years[0]);
    return years.filter((y) => keptSet.has(y));
  }

  for (const block of blocks) {
    const year =
      block.type === 'era' ? parseDate(block.era.startDate) : parseDate(block.entry.startDate);
    const y = year ? year.getFullYear() : null;
    if (y !== null && !seenYears.has(y)) {
      seenYears.add(y);
      yearsInOrder.push(y);
    }
  }

  const majorList = thinMajorYears(yearsInOrder);
  const majorSet = new Set(majorList);
  const markedYears = new Set();
  const flowGroups = [];

  for (const block of blocks) {
    const year =
      block.type === 'era' ? parseDate(block.era.startDate) : parseDate(block.entry.startDate);
    const y = year ? year.getFullYear() : null;
    if (y !== null && majorSet.has(y) && !markedYears.has(y)) {
      markedYears.add(y);
      flowGroups.push({
        isYearMarker: true,
        year: y,
        anchorId: `work-y-${y}`,
      });
    }
    if (block.type === 'era') {
      flowGroups.push({ isEra: true, era: block.era });
    } else {
      flowGroups.push({ isEra: false, entry: block.entry });
    }
  }

  const majorYears = majorList.map((year) => ({
    year,
    anchorId: `work-y-${year}`,
  }));

  return { groups: flowGroups, majorYears };
}

export { EMPLOYER_CLIENT_SEP };
