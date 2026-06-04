import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import theme from './europass.template.js';
import { buildCefProfile, resolveIsoLanguage, isMotherTongue } from '../../scripts/lib/europass-codes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const styleCSS = fs.readFileSync(path.join(__dirname, 'europass.css'), 'utf8');

const I18N = {
  'en-US': {
    present: 'Present',
    cv: 'Curriculum Vitae',
    personal: 'Personal information',
    about: 'About me',
    work: 'Work experience',
    education: 'Education and training',
    skills: 'Digital skills',
    languages: 'Language skills',
    certificates: 'Certificates',
    projects: 'Projects',
    publications: 'Publications',
    references: 'References',
    interests: 'Interests',
    communication: 'Communication skills',
    organisational: 'Organisational / managerial skills',
    jobRelated: 'Job-related skills',
    other: 'Other skills',
    driving: 'Driving licence',
    motherTongue: 'Mother tongue(s)',
    foreignLanguages: 'Other language(s)',
    cefUnderstanding: 'Understanding',
    cefSpeaking: 'Speaking',
    cefWriting: 'Writing',
    cefListening: 'Listening',
    cefReading: 'Reading',
    cefInteraction: 'Spoken interaction',
    cefProduction: 'Spoken production',
  },
  'fr-FR': {
    present: "Aujourd'hui",
    cv: 'Curriculum Vitae',
    personal: 'Informations personnelles',
    about: 'À propos de moi',
    work: 'Expérience professionnelle',
    education: 'Formation',
    skills: 'Compétences numériques',
    languages: 'Compétences linguistiques',
    certificates: 'Certificats',
    projects: 'Projets',
    publications: 'Publications',
    references: 'Références',
    interests: "Centres d'intérêt",
    communication: 'Compétences en communication',
    organisational: 'Compétences organisationnelles / managériales',
    jobRelated: 'Compétences professionnelles',
    other: 'Autres compétences',
    driving: 'Permis de conduire',
    motherTongue: 'Langue(s) maternelle(s)',
    foreignLanguages: 'Autre(s) langue(s)',
    cefUnderstanding: 'Compréhension',
    cefSpeaking: 'Expression orale',
    cefWriting: 'Expression écrite',
    cefListening: 'Écoute',
    cefReading: 'Lecture',
    cefInteraction: 'Interaction orale',
    cefProduction: 'Production orale',
  },
};

const CEF_COLUMNS = [
  { key: 'Listening', labelKey: 'cefListening' },
  { key: 'Reading', labelKey: 'cefReading' },
  { key: 'SpokenInteraction', labelKey: 'cefInteraction' },
  { key: 'SpokenProduction', labelKey: 'cefProduction' },
  { key: 'Writing', labelKey: 'cefWriting' },
];

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
  if (years) parts.push(`${years} ${years > 1 ? 'years' : 'year'}`);
  if (rem) parts.push(`${rem} ${rem > 1 ? 'months' : 'month'}`);
  return parts.join(' ') || presentLabel;
}

function prepareLanguages(resume, localeLang, titles) {
  const mother = [];
  const foreign = [];

  for (const lang of resume.languages || []) {
    const entry = resolveIsoLanguage(lang, localeLang);
    if (!entry) continue;
    const row = {
      language: entry.label,
      fluency: lang.fluency || '',
      cef: buildCefProfile(lang),
      cefCells: CEF_COLUMNS.map((col) => ({
        level: buildCefProfile(lang)[col.key] || '',
      })),
    };
    if (isMotherTongue(lang, localeLang)) {
      mother.push(row);
    } else {
      foreign.push(row);
    }
  }

  return {
    mother,
    foreign,
    motherBool: mother.length > 0,
    foreignBool: foreign.length > 0,
    cefColumns: CEF_COLUMNS.map((col) => ({ label: titles[col.labelKey] })),
  };
}

function prepareSkillGroups(resume) {
  const groups = {
    communication: [],
    organisational: [],
    jobRelated: [],
    computer: [],
    driving: [],
    other: [],
  };

  for (const skill of resume.skills || []) {
    const name = (skill.name || '').toLowerCase();
    const text = keywordsText(skill.keywords) || skill.level || '';
    const line = text ? `${skill.name}: ${text}` : skill.name;
    if (['frontend', 'backend', 'cloud', 'ci/cd', 'mobile'].includes(name)) {
      groups.jobRelated.push(line);
    } else {
      groups.computer.push(line);
    }
  }

  const ep = (resume.meta && resume.meta.europass) || {};
  if (ep.communication) groups.communication.push(ep.communication);
  if (ep.organisational) groups.organisational.push(ep.organisational);
  if (ep.jobRelated) groups.jobRelated.push(ep.jobRelated);
  if (ep.driving) {
    const licences = Array.isArray(ep.driving) ? ep.driving : [ep.driving];
    groups.driving.push(licences.join(', '));
  }

  for (const interest of resume.interests || []) {
    const kw = keywordsText(interest.keywords);
    groups.other.push(kw ? `${interest.name}: ${kw}` : interest.name);
  }

  return {
    jobRelated: groups.jobRelated,
    computer: groups.computer,
    communication: groups.communication.join('\n'),
    organisational: groups.organisational.join('\n'),
    driving: groups.driving.join(', '),
    other: groups.other,
  };
}

function render(resume) {
  const locale = (resume.meta && resume.meta.locale) || 'en-US';
  const lang = locale.split('-')[0] || 'en';
  const i18n = I18N[locale] || I18N['en-US'];

  resume.lang = lang;
  resume.titles = i18n;
  resume.photoUrl = (resume.basics && resume.basics.image) || '';

  function formatSection(entry) {
    if (entry.startDate) entry.startDateText = formatDate(entry.startDate, locale);
    entry.endDateText = entry.endDate ? formatDate(entry.endDate, locale) : i18n.present;
    entry.duration = formatDuration(entry.startDate, entry.endDate, locale, i18n.present);
  }

  if (resume.basics) {
    resume.basics.locationLine = locationLine(resume.basics.location);
    const profiles = (resume.basics.profiles || []).filter((p) => {
      const n = String(p.network || '').toLowerCase();
      return p.url && !n.includes('translation') && n !== 'pdf' && n !== 'europass';
    });
    resume.basics.profileLinks = profiles;
  }

  if (resume.work) {
    resume.work.forEach((entry) => {
      formatSection(entry);
      entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
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

  if (resume.skills) {
    resume.skills.forEach((skill) => {
      skill.keywordsText = keywordsText(skill.keywords);
    });
  }

  const langBlocks = prepareLanguages(resume, lang, i18n);
  Object.assign(resume, langBlocks);

  resume.skillGroups = prepareSkillGroups(resume);
  resume.skillGroupsBool = Object.values(resume.skillGroups).some((g) => g.length > 0);

  resume.workBool = isFirst(resume.work, 'name');
  resume.educationBool = isFirst(resume.education, 'institution');
  resume.skillsBool = isFirst(resume.skills, 'name');
  resume.languagesBool = isFirst(resume.languages, 'language');
  resume.certificatesBool = isFirst(resume.certificates, 'name');
  resume.projectsBool = isFirst(resume.projects, 'name');
  resume.publicationsBool = isFirst(resume.publications, 'name');
  resume.referencesBool = isFirst(resume.references, 'name');
  resume.interestsBool = isFirst(resume.interests, 'name');
  resume.contactBool = !!(
    resume.basics &&
    (resume.basics.email ||
      resume.basics.phone ||
      resume.basics.url ||
      resume.basics.locationLine ||
      (resume.basics.profileLinks && resume.basics.profileLinks.length))
  );

  return Handlebars.compile(theme)({
    css: styleCSS,
    printcss: styleCSS,
    resume,
  });
}

export { render };
export default { render };
