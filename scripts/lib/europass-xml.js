import { formatXml } from './format-xml.js';
import {
  CEF_SKILLS,
  normalizeCountryCode,
  countryLabel,
  resolveIsoLanguage,
  buildCefProfile,
  isMotherTongue,
  printingPreferencesEnabled,
  resolvePrintingFields,
} from './europass-codes.js';

const NS = 'http://europass.cedefop.europa.eu/Europass';
const XSD_VERSION = 'V3.4';
const GENERATOR = 'jsonresume-theme-ludoo';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function el(name, content, attrs = {}) {
  const attrText = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');

  if (content === undefined || content === null || content === '') {
    return `<${name}${attrText}/>`;
  }
  return `<${name}${attrText}>${content}</${name}>`;
}

function labelType(code, label) {
  if (!code && !label) return '';
  return [code ? el('Code', esc(code)) : '', label ? el('Label', esc(label)) : ''].join('');
}

function splitName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

function parseDateParts(value) {
  if (!value) return null;
  const parts = String(value).split('-');
  const year = parts[0];
  if (!year) return null;
  const month = parts[1] ? `--${parts[1].padStart(2, '0')}` : undefined;
  const day = parts[2] ? `---${parts[2].padStart(2, '0')}` : undefined;
  return { year, month, day };
}

function dateElement(tag, value) {
  const parts = parseDateParts(value);
  if (!parts) return '';
  const attrs = { year: parts.year };
  if (parts.month) attrs.month = parts.month;
  if (parts.day) attrs.day = parts.day;
  return el(tag, '', attrs);
}

function periodXml(startDate, endDate) {
  const hasEnd = Boolean(endDate);
  const parts = ['<Period>'];
  if (startDate) parts.push(dateElement('From', startDate));
  if (hasEnd) parts.push(dateElement('To', endDate));
  parts.push(el('Current', hasEnd ? 'false' : 'true'));
  parts.push('</Period>');
  return parts.join('');
}

function cefProficiencyXml(profile) {
  return [
    '<ProficiencyLevel>',
    ...CEF_SKILLS.map((skill) => el(skill, esc(profile[skill] || 'B2'))),
    '</ProficiencyLevel>',
  ].join('');
}

function countryXml(code, localeLang) {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return '';
  return el('Country', labelType(normalized, countryLabel(normalized, localeLang)));
}

function addressContactXml(city, countryCode, localeLang) {
  const inner = [
    city ? el('Municipality', esc(city)) : '',
    countryXml(countryCode, localeLang),
  ]
    .filter(Boolean)
    .join('');

  if (!inner) return '';
  return ['<Address>', '<Contact>', inner, '</Contact>', '</Address>'].join('');
}

function useCodeXml(code) {
  return ['<Use>', labelType(code, code), '</Use>'].join('');
}

function metadataFromResume(resume, options = {}) {
  const basics = resume.basics || {};
  const location = basics.location || {};
  const locale = (resume.meta && resume.meta.locale) || options.locale || 'fr-FR';
  const languageCode = options.language || locale.split('-')[0] || 'fr';
  const xmlLocale = options.xmlLocale || languageCode;

  return {
    locale,
    xmlLocale,
    language_code: languageCode,
    country_code: normalizeCountryCode(location.countryCode || options.countryCode || ''),
    city: location.city || options.city || '',
    phone: basics.phone || '',
    email: basics.email || '',
    website: basics.url || (basics.profiles && basics.profiles[0] && basics.profiles[0].url) || '',
  };
}

function documentInfoXml() {
  const now = new Date().toISOString();
  return [
    '<DocumentInfo>',
    el('DocumentType', 'ECV'),
    el('CreationDate', now),
    el('LastUpdateDate', now),
    el('XSDVersion', XSD_VERSION),
    el('Generator', GENERATOR),
    el('EuropassLogo', 'true'),
    '</DocumentInfo>',
  ].join('');
}

function printingFieldXml(field) {
  const attrs = { name: field.name };
  if (field.show !== undefined) attrs.show = String(field.show);
  if (field.order) attrs.order = field.order;
  if (field.format) attrs.format = field.format;
  if (field.position) attrs.position = field.position;
  return el('Field', '', attrs);
}

function printingPreferencesXml(resume, options) {
  if (!printingPreferencesEnabled(resume, options)) return '';

  const fields = resolvePrintingFields(resume, options);
  const fieldXml = fields.map(printingFieldXml).join('');

  return [
    '<PrintingPreferences>',
    `<Document type="ECV">${fieldXml}</Document>`,
    '</PrintingPreferences>',
  ].join('');
}

function personNameXml(fullName) {
  const { first, last } = splitName(fullName);
  return [
    '<PersonName>',
    first ? el('FirstName', esc(first)) : '',
    last ? el('Surname', esc(last)) : '',
    '</PersonName>',
  ].join('');
}

function contactInfoXml(metadata) {
  const parts = [];

  if (metadata.city || metadata.country_code) {
    parts.push(addressContactXml(metadata.city, metadata.country_code, metadata.language_code));
  }

  if (metadata.email) {
    parts.push(['<Email>', el('Contact', esc(metadata.email)), '</Email>'].join(''));
  }

  if (metadata.phone) {
    parts.push([
      '<TelephoneList>',
      '<Telephone>',
      el('Contact', esc(metadata.phone)),
      useCodeXml('mobile'),
      '</Telephone>',
      '</TelephoneList>',
    ].join(''));
  }

  if (metadata.website) {
    parts.push([
      '<WebsiteList>',
      '<Website>',
      el('Contact', esc(metadata.website)),
      useCodeXml('personal'),
      '</Website>',
      '</WebsiteList>',
    ].join(''));
  }

  if (!parts.length) return '';
  return `<ContactInfo>${parts.join('')}</ContactInfo>`;
}

function identificationXml(resume, metadata) {
  const basics = resume.basics || {};
  return [
    '<Identification>',
    personNameXml(basics.name || ''),
    contactInfoXml(metadata),
    '</Identification>',
  ].join('');
}

function headlineXml(summary, localeLang) {
  if (!summary) return '';
  const typeLabels = {
    fr: { code: 'personal_statement', label: 'Déclaration personnelle' },
    en: { code: 'personal_statement', label: 'Personal statement' },
  };
  const type = typeLabels[localeLang] || typeLabels.en;

  return [
    '<Headline>',
    ['<Type>', labelType(type.code, type.label), '</Type>'].join(''),
    ['<Description>', el('Label', esc(summary)), '</Description>'].join(''),
    '</Headline>',
  ].join('');
}

function plainTextDescription(entry) {
  const summary = entry.summary || '';
  const highlights = (entry.highlights || []).filter(Boolean);
  const parts = [];
  if (summary) parts.push(summary);
  if (highlights.length) parts.push(highlights.map((h) => `• ${h}`).join('\n'));
  return parts.join('\n\n');
}

function employerXml(entry, metadata) {
  const city = extractCity(entry.location) || metadata.city;
  const contact = city || metadata.country_code
    ? [
        '<ContactInfo>',
        addressContactXml(city, metadata.country_code, metadata.language_code),
        '</ContactInfo>',
      ].join('')
    : '';

  return [
    '<Employer>',
    el('Name', esc(entry.name || '')),
    contact,
    '</Employer>',
  ].join('');
}

function extractCity(location) {
  const text = String(location || '').trim();
  if (!text) return '';
  return text.includes(',') ? text.split(',')[0].trim() : text;
}

function workExperienceXml(entry, metadata) {
  const activities = plainTextDescription(entry);
  return [
    '<WorkExperience>',
    periodXml(entry.startDate, entry.endDate),
    entry.position
      ? ['<Position>', el('Label', esc(entry.position)), '</Position>'].join('')
      : '',
    activities ? el('Activities', esc(activities)) : '',
    employerXml(entry, metadata),
    '</WorkExperience>',
  ].join('');
}

function workExperienceListXml(resume, metadata) {
  const work = resume.work || [];
  if (!work.length) return '';
  const entries = work.map((entry) => workExperienceXml(entry, metadata)).join('');
  return `<WorkExperienceList>${entries}</WorkExperienceList>`;
}

function mapEqfLevel(entry) {
  const studyType = String(entry.studyType || '').toLowerCase();
  if (studyType.includes('phd') || studyType.includes('doctorat')) return { code: '8', label: 'EQF 8' };
  if (studyType.includes('master')) return { code: '7', label: 'EQF 7' };
  if (studyType.includes('bachelor') || studyType.includes('licence')) return { code: '6', label: 'EQF 6' };
  if (studyType.includes('associate') || studyType.includes('bts') || studyType.includes('dut')) {
    return { code: '5', label: 'EQF 5' };
  }
  if (studyType.includes('high school') || studyType.includes('bac')) return { code: '4', label: 'EQF 4' };
  if (studyType) return { code: '3', label: 'EQF 3' };
  return null;
}

function buildEducationTitle(entry) {
  const studyType = entry.studyType || '';
  const area = entry.area || '';
  if (studyType && area) return `${studyType} — ${area}`;
  return studyType || area || '';
}

function educationXml(entry, metadata) {
  const title = buildEducationTitle(entry);
  const eqf = mapEqfLevel(entry);
  const activities = plainTextDescription(entry);

  return [
    '<Education>',
    periodXml(entry.startDate, entry.endDate),
    title ? el('Title', esc(title)) : '',
    activities ? el('Activities', esc(activities)) : '',
    entry.institution
      ? [
          '<Organisation>',
          el('Name', esc(entry.institution)),
          metadata.city || metadata.country_code
            ? [
                '<ContactInfo>',
                addressContactXml(metadata.city, metadata.country_code, metadata.language_code),
                '</ContactInfo>',
              ].join('')
            : '',
          '</Organisation>',
        ].join('')
      : '',
    eqf ? ['<Level>', labelType(eqf.code, eqf.label), '</Level>'].join('') : '',
    entry.area ? ['<Field>', el('Label', esc(entry.area)), '</Field>'].join('') : '',
    '</Education>',
  ].join('');
}

function educationListXml(resume, metadata) {
  const education = resume.education || [];
  if (!education.length) return '';
  const entries = education.map((entry) => educationXml(entry, metadata)).join('');
  return `<EducationList>${entries}</EducationList>`;
}

function motherTongueXml(entry) {
  return [
    '<MotherTongue>',
    ['<Description>', labelType(entry.code, entry.label), '</Description>'].join(''),
    '</MotherTongue>',
  ].join('');
}

function foreignLanguageXml(entry, lang) {
  return [
    '<ForeignLanguage>',
    ['<Description>', labelType(entry.code, entry.label), '</Description>'].join(''),
    cefProficiencyXml(buildCefProfile(lang)),
    '</ForeignLanguage>',
  ].join('');
}

function linguisticSkillsXml(resume, localeLang) {
  const languages = resume.languages || [];
  if (!languages.length) return '';

  const motherTongues = [];
  const foreignLanguages = [];

  for (const lang of languages) {
    const entry = resolveIsoLanguage(lang, localeLang);
    if (!entry) continue;
    if (isMotherTongue(lang, localeLang)) {
      motherTongues.push(motherTongueXml(entry));
    } else {
      foreignLanguages.push(foreignLanguageXml(entry, lang));
    }
  }

  const parts = ['<Linguistic>'];
  if (motherTongues.length) {
    parts.push(`<MotherTongueList>${motherTongues.join('')}</MotherTongueList>`);
  }
  if (foreignLanguages.length) {
    parts.push(`<ForeignLanguageList>${foreignLanguages.join('')}</ForeignLanguageList>`);
  }
  parts.push('</Linguistic>');

  if (!motherTongues.length && !foreignLanguages.length) return '';
  return parts.join('');
}

function computerSkillsXml(resume) {
  const skills = (resume.skills || [])
    .map((s) => (s.name || '').trim())
    .filter(Boolean);
  if (!skills.length) return '';

  return [
    '<Computer>',
    el('Description', esc(skills.join('; '))),
    '</Computer>',
  ].join('');
}

function skillsXml(resume, localeLang) {
  const linguistic = linguisticSkillsXml(resume, localeLang);
  const computer = computerSkillsXml(resume);
  if (!linguistic && !computer) return '';
  return `<Skills>${linguistic}${computer}</Skills>`;
}

function certificatesAsAchievementsXml(resume, localeLang) {
  const certificates = resume.certificates || [];
  if (!certificates.length) return '';

  const titleLabel =
    localeLang === 'fr'
      ? { code: 'certifications', label: 'Certificats' }
      : { code: 'certifications', label: 'Certificates' };

  const entries = certificates
    .map((cert) => {
      const description = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' — ');
      if (!description) return '';
      return [
        '<Achievement>',
        ['<Title>', labelType(titleLabel.code, titleLabel.label), '</Title>'].join(''),
        el('Description', esc(description)),
        '</Achievement>',
      ].join('');
    })
    .filter(Boolean)
    .join('');

  return entries ? `<AchievementList>${entries}</AchievementList>` : '';
}

function learnerInfoXml(resume, metadata) {
  const localeLang = metadata.language_code;
  return [
    '<LearnerInfo>',
    identificationXml(resume, metadata),
    headlineXml(resume.basics && resume.basics.summary, localeLang),
    workExperienceListXml(resume, metadata),
    educationListXml(resume, metadata),
    skillsXml(resume, localeLang),
    certificatesAsAchievementsXml(resume, localeLang),
    '</LearnerInfo>',
  ].join('');
}

/**
 * Convert a JSON Resume document to Europass SkillsPassport XML v3.4.0.
 * @param {object} resume
 * @param {{ language?: string, locale?: string, metadata?: object, pretty?: boolean }} [options]
 * @returns {string}
 */
function jsonResumeToEuropassXml(resume, options = {}) {
  const metadata = { ...metadataFromResume(resume, options), ...(options.metadata || {}) };
  const xmlLocale = metadata.xmlLocale || metadata.language_code || 'fr';

  const body = [
    `<SkillsPassport xmlns="${NS}" locale="${esc(xmlLocale)}"`,
    ` xsi:schemaLocation="${NS} http://europass.cedefop.europa.eu/xml/v3.4.0/EuropassSchema.xsd"`,
    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    documentInfoXml(),
    printingPreferencesXml(resume, options),
    learnerInfoXml(resume, metadata),
    '</SkillsPassport>',
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
  const pretty = options.pretty !== false;
  return pretty ? formatXml(xml) : xml;
}

export {
  jsonResumeToEuropassXml,
  metadataFromResume,
  printingPreferencesXml,
};
