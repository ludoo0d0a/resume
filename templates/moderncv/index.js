import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import theme from './template.js';
import searchScriptSource from './resume-search.js';
import timelineFlowPartial from './timeline-flow.partial.js';
import experienceFlowPartial from './experience-flow.partial.js';
import workEraFlowPartial from './work-era-flow.partial.js';
import companyLogoPartial from './company-logo.partial.js';
import { buildExperienceTimeline } from '../../scripts/lib/work-eras.js';
import { resolveCompanyLogo } from '../../scripts/lib/company-logo.js';
import { navIcon } from './nav-icons.js';
import { profileLinkIcon } from './profile-icons.js';

Handlebars.registerPartial('timelineFlow', timelineFlowPartial);
Handlebars.registerPartial('experienceFlow', experienceFlowPartial);
Handlebars.registerPartial('workEraFlow', workEraFlowPartial);
Handlebars.registerPartial('companyLogo', companyLogoPartial);

const MAJOR_YEAR_GAP = 2;
const MAJOR_YEAR_MAX = 12;

function navItem(id, i18n, labelKey) {
  return {
    id,
    label: i18n[labelKey],
    icon: navIcon(id),
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const styleCSS = fs.readFileSync(path.join(__dirname, 'moderncv.css'), 'utf8');

function bundleFuzzySearchForBrowser() {
  const filePath = path.join(__dirname, 'lib/fuzzy-search.js');
  let src = fs.readFileSync(filePath, 'utf8');
  src = src.replace(/^export function /gm, 'function ');
  src = src.replace(/^export const /gm, 'const ');
  return `${src}\nwindow.ResumeFuzzy = { normalize, highlightRegex, score, matches, findHighlightSpans, DEFAULT_THRESHOLD, MIN_FUZZY_LEN };\n`;
}

const searchScript = bundleFuzzySearchForBrowser() + searchScriptSource;

const I18N = {
  'en-US': {
    present: 'Present',
    download: 'Download PDF',
    switchLang: 'Français',
    nav: 'On this page',
    about: 'About',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    projects: 'Projects',
    publications: 'Publications',
    references: 'References',
    interests: 'Interests',
    certificates: 'Certificates',
    awards: 'Awards',
    contact: 'Contact',
    europass: 'Europass PDF',
    search: 'Search CV',
    searchPlaceholder: 'Search…',
    searchEmpty: 'No matches',
    searchMatches: '{n} matches',
    timelineYears: 'Years',
    eraInternal: 'At the company',
    eraMissions: 'Client missions',
  },
  'fr-FR': {
    present: "Aujourd'hui",
    download: 'Télécharger le PDF',
    switchLang: 'English',
    nav: 'Sur cette page',
    about: 'À propos',
    experience: 'Expérience',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    projects: 'Projets',
    publications: 'Publications',
    references: 'Références',
    interests: "Centres d'intérêt",
    certificates: 'Certificats',
    awards: 'Distinctions',
    contact: 'Contact',
    europass: 'PDF Europass',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher…',
    searchEmpty: 'Aucun résultat',
    searchMatches: '{n} résultats',
    timelineYears: 'Années',
    eraInternal: "Au sein de l'ESN",
    eraMissions: 'Missions client',
  },
};

const UI_BY_LANG = {
  en: {
    indexHtml: 'index-en.html',
    otherHtml: 'index-fr.html',
    pdf: 'pdf/resume-en.pdf',
    europassPdf: 'pdf/resume-en-europass.pdf',
    langCode: 'en',
    otherLangCode: 'fr',
  },
  fr: {
    indexHtml: 'index-fr.html',
    otherHtml: 'index-en.html',
    pdf: 'pdf/resume-fr.pdf',
    europassPdf: 'pdf/resume-fr-europass.pdf',
    langCode: 'fr',
    otherLangCode: 'en',
  },
};

function isFirst(items, field) {
  return items && items.length > 0 && items.some((item) => item[field]);
}

function locationLine(location) {
  if (!location) return '';
  const parts = [];
  if (location.address) parts.push(location.address);
  if (location.postalCode) parts.push(location.postalCode);
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.countryCode) parts.push(location.countryCode);
  return parts.join(', ');
}

function educationDetail(entry) {
  const parts = [];
  if (entry.studyType) parts.push(entry.studyType);
  if (entry.area) parts.push(entry.area);
  return parts.join(' — ');
}

function keywordsText(keywords) {
  if (!keywords || !keywords.length) return '';
  return keywords.join(', ');
}

function parseDate(value) {
  if (!value) return null;
  const parts = String(value).split('-');
  return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
}

function formatDate(value, locale) {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short' });
}

function formatDuration(startDate, endDate, locale, presentLabel) {
  const start = parseDate(startDate);
  if (!start) return '';
  const end = endDate ? parseDate(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts = [];
  const yearWord = locale.startsWith('fr') ? 'an' : 'year';
  const yearsWord = locale.startsWith('fr') ? 'ans' : 'years';
  const monthWord = locale.startsWith('fr') ? 'mois' : 'month';
  const monthsWord = locale.startsWith('fr') ? 'mois' : 'months';
  if (years) parts.push(`${years} ${years > 1 ? yearsWord : yearWord}`);
  if (rem) parts.push(`${rem} ${rem > 1 ? monthsWord : monthWord}`);
  return parts.join(' ') || presentLabel;
}

function startYearFromEntry(entry) {
  const date = parseDate(entry.startDate);
  return date ? date.getFullYear() : null;
}

/**
 * Unique start years in list order; thinned for the side rail (Photos-style scrubber).
 * @param {number[]} yearsInOrder newest-first encounter order
 */
function thinMajorYears(yearsInOrder) {
  if (yearsInOrder.length <= MAJOR_YEAR_MAX) return [...yearsInOrder];
  const sorted = [...yearsInOrder].sort((a, b) => b - a);
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
  keptSet.add(yearsInOrder[0]);
  return yearsInOrder.filter((y) => keptSet.has(y));
}

/**
 * @param {object[]} entries
 * @param {string} anchorPrefix e.g. work, education, projects
 * @param {string} railLabel
 */
function buildTimelineFlow(entries, anchorPrefix, railLabel) {
  if (!entries || !entries.length) {
    return { groups: [], majorYears: [], railLabel };
  }

  const seenYears = new Set();
  const yearsInOrder = [];
  const groups = [];

  for (const entry of entries) {
    const year = entry.startYear ?? startYearFromEntry(entry);
    if (year !== null && !seenYears.has(year)) {
      seenYears.add(year);
      yearsInOrder.push(year);
    }
  }

  const majorList = thinMajorYears(yearsInOrder);
  const majorSet = new Set(majorList);
  const markedYears = new Set();

  for (const entry of entries) {
    const year = entry.startYear ?? startYearFromEntry(entry);
    if (year !== null && majorSet.has(year) && !markedYears.has(year)) {
      markedYears.add(year);
      groups.push({
        isYearMarker: true,
        year,
        anchorId: `${anchorPrefix}-y-${year}`,
      });
    }
    groups.push(entry);
  }

  const majorYears = majorList.map((year) => ({
    year,
    anchorId: `${anchorPrefix}-y-${year}`,
  }));

  return { groups, majorYears, railLabel };
}

function render(resume) {
  const locale = (resume.meta && resume.meta.locale) || 'en-US';
  const lang = locale.split('-')[0] || 'en';
  const i18n = I18N[locale] || I18N['en-US'];
  const uiPaths = UI_BY_LANG[lang] || UI_BY_LANG.en;

  resume.lang = lang;
  resume.titles = i18n;
  resume.photoUrl = (resume.basics && resume.basics.image) || '';
  resume.ui = {
    ...uiPaths,
    isEn: lang === 'en',
    isFr: lang === 'fr',
    switchLabel: i18n.switchLang,
    downloadLabel: i18n.download,
    europassLabel: i18n.europass,
    searchLabel: i18n.search,
    searchPlaceholder: i18n.searchPlaceholder,
    searchEmpty: i18n.searchEmpty,
    searchMatches: i18n.searchMatches,
  };

  function formatSection(entry) {
    entry.startYear = startYearFromEntry(entry);
    if (entry.startDate) entry.startDateText = formatDate(entry.startDate, locale);
    entry.endDateText = entry.endDate ? formatDate(entry.endDate, locale) : i18n.present;
    entry.dateRange = entry.startDateText
      ? `${entry.startDateText} — ${entry.endDateText}`
      : entry.endDateText;
    entry.duration = formatDuration(entry.startDate, entry.endDate, locale, i18n.present);
  }

  if (resume.basics) {
    resume.basics.locationLine = locationLine(resume.basics.location);
    const profiles = (resume.basics.profiles || []).filter((p) => {
      const n = String(p.network || '').toLowerCase();
      return p.url && !n.includes('translation') && n !== 'pdf' && n !== 'europass';
    });
    resume.basics.profileLinks = profiles.map((p) => {
      const iconMeta = profileLinkIcon(p.network, p.username);
      return { ...p, ...iconMeta, icon: iconMeta.iconKey };
    });
  }

  if (resume.work) {
    resume.work.forEach((entry) => {
      formatSection(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
      entry.isCurrent = !entry.endDate;
      entry.logoUrl = resolveCompanyLogo(entry.logoUrl, entry.url, entry.name);
    });
  }

  if (resume.education) {
    resume.education.forEach((entry) => {
      formatSection(entry);
      entry.educationDetail = educationDetail(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
      entry.boolSummary = !!entry.summary;
    });
  }

  if (resume.projects) {
    resume.projects.forEach((entry) => {
      formatSection(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
    });
  }

  if (resume.volunteer) {
    resume.volunteer.forEach((entry) => {
      formatSection(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
    });
  }

  if (resume.awards) {
    resume.awards.forEach((entry) => {
      if (entry.date) entry.dateText = formatDate(entry.date, locale);
    });
  }

  if (resume.skills) {
    resume.skills.forEach((skill) => {
      skill.keywordsText = keywordsText(skill.keywords);
      skill.boolKeywords = !!(skill.keywords && skill.keywords.length);
    });
  }

  if (resume.languages) {
    resume.languages.forEach((langEntry) => {
      langEntry.boolFluency = !!langEntry.fluency;
    });
  }

  if (resume.interests) {
    resume.interests.forEach((interest) => {
      interest.keywordsText = keywordsText(interest.keywords);
    });
  }

  resume.workBool = isFirst(resume.work, 'name');
  resume.educationBool = isFirst(resume.education, 'institution');
  resume.skillsBool = isFirst(resume.skills, 'name');
  resume.languagesBool = isFirst(resume.languages, 'language');
  resume.certificatesBool = isFirst(resume.certificates, 'name');
  resume.projectsBool = isFirst(resume.projects, 'name');
  resume.publicationsBool = isFirst(resume.publications, 'name');
  resume.referencesBool = isFirst(resume.references, 'name');
  resume.interestsBool = isFirst(resume.interests, 'name');
  resume.awardsBool = isFirst(resume.awards, 'title');
  resume.volunteerBool = isFirst(resume.volunteer, 'organization');
  resume.contactBool = !!(
    resume.basics &&
    (resume.basics.email ||
      resume.basics.phone ||
      resume.basics.url ||
      resume.basics.locationLine ||
      (resume.basics.profileLinks && resume.basics.profileLinks.length))
  );

  const nav = [];
  if (resume.basics && resume.basics.summary) {
    nav.push(navItem('about', i18n, 'about'));
  }
  if (resume.workBool) nav.push(navItem('experience', i18n, 'experience'));
  if (resume.educationBool) nav.push(navItem('education', i18n, 'education'));
  if (resume.skillsBool) nav.push(navItem('skills', i18n, 'skills'));
  if (resume.projectsBool) nav.push(navItem('projects', i18n, 'projects'));
  if (resume.languagesBool) nav.push(navItem('languages', i18n, 'languages'));
  if (resume.interestsBool) nav.push(navItem('interests', i18n, 'interests'));
  if (resume.publicationsBool) nav.push(navItem('publications', i18n, 'publications'));
  if (resume.referencesBool) nav.push(navItem('references', i18n, 'references'));
  resume.nav = nav;
  resume.navBool = nav.length > 1;

  resume.workErasBool = !!(resume.workEras && resume.workEras.length);

  if (resume.workErasBool) {
    const { groups, majorYears } = buildExperienceTimeline(resume, formatSection, i18n);
    resume.experienceTimeline = {
      groups,
      majorYears,
      railLabel: i18n.timelineYears,
    };
  } else if (resume.workBool) {
    resume.workTimeline = buildTimelineFlow(resume.work, 'work', i18n.timelineYears);
  }
  if (resume.educationBool) {
    resume.educationTimeline = buildTimelineFlow(
      resume.education,
      'education',
      i18n.timelineYears,
    );
  }
  if (resume.projectsBool) {
    resume.projectsTimeline = buildTimelineFlow(resume.projects, 'projects', i18n.timelineYears);
  }

  return Handlebars.compile(theme)({
    css: styleCSS,
    printcss: styleCSS,
    searchScript: searchScript,
    resume,
  });
}

export { render };
export default { render };
