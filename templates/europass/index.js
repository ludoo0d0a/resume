import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import theme from './europass.template.js';
import {
  buildCefProfile,
  countryLabel,
  normalizeCountryCode,
  resolveIsoLanguage,
  isMotherTongue,
} from '../../scripts/lib/europass-codes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const styleCSS = fs.readFileSync(path.join(__dirname, 'europass.css'), 'utf8');

const I18N = {
  'en-US': {
    present: 'CURRENT',
    cv: 'Curriculum Vitae',
    about: 'About myself',
    work: 'Work experience',
    education: 'Education & training',
    skills: 'Skills',
    languages: 'Language skills',
    certificates: 'Certificates',
    projects: 'Projects',
    publications: 'Publications',
    references: 'References',
    motherTongue: 'Mother tongue(s)',
    cefUnderstanding: 'Understanding',
    cefSpeaking: 'Speaking',
    cefWriting: 'Writing',
    cefListening: 'Listening',
    cefReading: 'Reading',
    cefInteraction: 'Spoken interaction',
    cefProduction: 'Spoken production',
    birthDate: 'Date of birth',
    nationality: 'Nationality',
    gender: 'Gender',
    phone: 'Phone',
    phoneMobile: 'Mobile',
    email: 'Email address',
    address: 'Address',
    website: 'Website',
    male: 'Male',
    female: 'Female',
  },
  'fr-FR': {
    present: "AUJOURD'HUI",
    cv: 'Curriculum Vitae',
    about: 'À propos de moi',
    work: 'Expérience professionnelle',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Compétences linguistiques',
    certificates: 'Certificats',
    projects: 'Projets',
    publications: 'Publications',
    references: 'Références',
    motherTongue: 'Langue(s) maternelle(s)',
    cefUnderstanding: 'Compréhension',
    cefSpeaking: 'Expression orale',
    cefWriting: 'Expression écrite',
    cefListening: 'Écoute',
    cefReading: 'Lecture',
    cefInteraction: 'Interaction orale',
    cefProduction: 'Production orale',
    birthDate: 'Date de naissance',
    nationality: 'Nationalité',
    gender: 'Genre',
    phone: 'Téléphone',
    phoneMobile: 'Mobile',
    email: 'Adresse e-mail',
    address: 'Adresse',
    website: 'Site web',
    male: 'Homme',
    female: 'Femme',
  },
};

const CEF_COLUMNS = [
  { key: 'Listening', labelKey: 'cefListening' },
  { key: 'Reading', labelKey: 'cefReading' },
  { key: 'SpokenProduction', labelKey: 'cefProduction' },
  { key: 'SpokenInteraction', labelKey: 'cefInteraction' },
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

function parseDate(value) {
  if (!value) return null;
  const parts = String(value).split('-');
  return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
}

function formatDateEuropass(value) {
  const date = parseDate(value);
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatEndDate(value, presentLabel) {
  return value ? formatDateEuropass(value) : presentLabel;
}

function formatDateLocationLine(startDate, endDate, location, presentLabel) {
  const start = formatDateEuropass(startDate);
  if (!start) return '';
  const end = formatEndDate(endDate, presentLabel);
  const place = String(location || '').trim().toUpperCase();
  return place ? `${start} - ${end} - ${place}` : `${start} - ${end}`;
}

function buildEducationTitle(entry) {
  const studyType = entry.studyType || '';
  const area = entry.area || '';
  if (studyType && area) return `${studyType} ${area}`;
  return studyType || area || '';
}

function flattenSkills(resume) {
  const items = [];
  const seen = new Set();

  for (const skill of resume.skills || []) {
    for (const value of [skill.name, ...(skill.keywords || [])]) {
      const text = String(value || '').trim();
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(text);
    }
  }

  const ep = (resume.meta && resume.meta.europass) || {};
  for (const extra of [ep.jobRelated, ep.communication, ep.organisational]) {
    const text = String(extra || '').trim();
    if (!text) continue;
    for (const part of text.split(/[,;]\s*/)) {
      const item = part.trim();
      if (!item) continue;
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }

  for (const interest of resume.interests || []) {
    const name = String(interest.name || '').trim();
    if (name) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push(name);
      }
    }
    for (const kw of interest.keywords || []) {
      const text = String(kw || '').trim();
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(text);
    }
  }

  return items;
}

function preparePersonalInfo(resume, localeLang, titles) {
  const items = [];
  const basics = resume.basics || {};
  const ep = (resume.meta && resume.meta.europass) || {};
  const demo = ep.demographics || {};

  const birthdate = demo.birthdate || demo.birthDate || basics.birthDate;
  if (birthdate) {
    items.push({ label: titles.birthDate, value: formatDateEuropass(birthdate) });
  }

  const nationalities = demo.nationalities || demo.nationalityList || [];
  const natList = Array.isArray(nationalities) ? nationalities : nationalities ? [nationalities] : [];
  if (natList.length) {
    const labels = natList
      .map((nat) => {
        if (typeof nat === 'string') return countryLabel(normalizeCountryCode(nat), localeLang);
        return nat.label || countryLabel(normalizeCountryCode(nat.code), localeLang);
      })
      .filter(Boolean);
    if (labels.length) {
      items.push({ label: titles.nationality, value: labels.join(', ') });
    }
  }

  const gender = demo.gender || basics.gender;
  if (gender) {
    const code = String(gender).toUpperCase().startsWith('F') ? 'F' : 'M';
    const label = demo.genderLabel || (code === 'F' ? titles.female : titles.male);
    items.push({ label: titles.gender, value: label });
  }

  if (basics.phone) {
    items.push({ label: titles.phone, value: basics.phone, suffix: titles.phoneMobile });
  }

  if (basics.email) {
    items.push({ label: titles.email, value: basics.email });
  }

  const address = locationLine(basics.location);
  if (address) {
    items.push({ label: titles.address, value: address });
  }

  return items;
}

function prepareLanguages(resume, localeLang, titles) {
  const mother = [];
  const foreign = [];

  for (const lang of resume.languages || []) {
    const entry = resolveIsoLanguage(lang, localeLang);
    if (!entry) continue;
    const row = {
      language: entry.label.toUpperCase(),
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
    motherTongueLine: mother.map((row) => row.language).join(', '),
    cefColumns: CEF_COLUMNS.map((col) => ({ label: titles[col.labelKey] })),
  };
}

function prepareWorkEntries(work, presentLabel) {
  for (const entry of work || []) {
    entry.dateLocationLine = formatDateLocationLine(
      entry.startDate,
      entry.endDate,
      entry.location,
      presentLabel,
    );
    const position = String(entry.position || '').trim();
    const employer = String(entry.name || '').trim();
    entry.titleLine = [position, employer].filter(Boolean).join(' ').toUpperCase();
    entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
  }
}

function prepareEducationEntries(education, presentLabel) {
  for (const entry of education || []) {
    const location = entry.location || '';
    entry.dateLocationLine = formatDateLocationLine(
      entry.startDate,
      entry.endDate,
      location,
      presentLabel,
    );
    const title = buildEducationTitle(entry);
    const institution = String(entry.institution || '').trim();
    entry.titleLine = institution
      ? `${title}${title ? '- ' : ''}${institution}`.toUpperCase()
      : title.toUpperCase();
    entry.boolSummary = !!entry.summary;
  }
}

function prepareProjectEntries(projects, presentLabel) {
  for (const entry of projects || []) {
    entry.dateLocationLine = formatDateLocationLine(
      entry.startDate,
      entry.endDate,
      entry.location || '',
      presentLabel,
    );
    entry.boolHighlights = !!(entry.highlights && entry.highlights.length);
  }
}

function render(resume) {
  const locale = (resume.meta && resume.meta.locale) || 'en-US';
  const lang = locale.split('-')[0] || 'en';
  const i18n = I18N[locale] || I18N['en-US'];

  resume.lang = lang;
  resume.titles = i18n;
  resume.photoUrl = (resume.basics && resume.basics.image) || '';

  if (resume.basics) {
    resume.basics.locationLine = locationLine(resume.basics.location);
  }

  resume.personalInfo = preparePersonalInfo(resume, lang, i18n);
  resume.personalInfoBool = resume.personalInfo.length > 0;

  prepareWorkEntries(resume.work, i18n.present);
  prepareEducationEntries(resume.education, i18n.present);
  prepareProjectEntries(resume.projects, i18n.present);

  const langBlocks = prepareLanguages(resume, lang, i18n);
  Object.assign(resume, langBlocks);

  resume.skillsFlat = flattenSkills(resume);
  resume.skillsFlatBool = resume.skillsFlat.length > 0;

  resume.workBool = isFirst(resume.work, 'name');
  resume.educationBool = isFirst(resume.education, 'institution');
  resume.languagesBool = resume.motherBool || resume.foreignBool;
  resume.certificatesBool = isFirst(resume.certificates, 'name');
  resume.projectsBool = isFirst(resume.projects, 'name');
  resume.publicationsBool = isFirst(resume.publications, 'name');
  resume.referencesBool = isFirst(resume.references, 'name');

  return Handlebars.compile(theme)({
    css: styleCSS,
    printcss: styleCSS,
    resume,
  });
}

export { render };
export default { render };
