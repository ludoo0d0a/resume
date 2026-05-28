import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import theme from './europass.template.js';

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
  },
};

function isFirst(items, field) {
  return items && items.length > 0 && items.some((item) => item[field]);
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

function render(resume) {
  const locale = (resume.meta && resume.meta.locale) || 'fr-FR';
  const lang = locale.split('-')[0] || 'fr';
  const i18n = I18N[locale] || I18N['fr-FR'];

  resume.lang = lang;
  resume.titles = i18n;

  function formatSection(entry) {
    if (entry.startDate) entry.startDateText = formatDate(entry.startDate, locale);
    entry.endDateText = entry.endDate ? formatDate(entry.endDate, locale) : i18n.present;
    entry.duration = formatDuration(entry.startDate, entry.endDate, locale, i18n.present);
  }

  if (resume.work) resume.work.forEach(formatSection);
  if (resume.education) resume.education.forEach(formatSection);

  resume.workBool = isFirst(resume.work, 'name');
  resume.educationBool = isFirst(resume.education, 'institution');
  resume.skillsBool = isFirst(resume.skills, 'name');
  resume.languagesBool = isFirst(resume.languages, 'language');
  resume.certificatesBool = isFirst(resume.certificates, 'name');

  return Handlebars.compile(theme)({
    css: styleCSS,
    printcss: styleCSS,
    resume,
  });
}

export { render };
export default { render };
