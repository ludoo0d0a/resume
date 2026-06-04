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
  achievementTypeLabel,
  websiteUseForNetwork,
  instantMessagingUseForNetwork,
  europassSkillBucket,
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

function localized(entry, field, localeLang) {
  if (!entry) return '';
  const prefixed = entry[`${localeLang}_${field}`];
  if (prefixed) return prefixed;
  return entry[field] || '';
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

function addressContactInner(location, localeLang) {
  const loc = location || {};
  const city = loc.city || '';
  const countryCode = loc.countryCode || '';
  const inner = [
    loc.address ? el('AddressLine', esc(loc.address)) : '',
    loc.addressLine2 ? el('AddressLine2', esc(loc.addressLine2)) : '',
    loc.postalCode ? el('PostalCode', esc(loc.postalCode)) : '',
    city ? el('Municipality', esc(city)) : '',
    countryXml(countryCode, localeLang),
  ]
    .filter(Boolean)
    .join('');

  return inner;
}

function addressContactXml(location, localeLang) {
  const inner = addressContactInner(location, localeLang);
  if (!inner) return '';
  return ['<Address>', '<Contact>', inner, '</Contact>', '</Address>'].join('');
}

function useCodeXml(code, label) {
  const display = label || code;
  return ['<Use>', labelType(code, display), '</Use>'].join('');
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
    location,
    phone: basics.phone || '',
    email: basics.email || '',
    website: basics.url || '',
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

function personNameXml(fullName, europassMeta) {
  const { first, last } = splitName(fullName);
  const title = europassMeta && europassMeta.title;
  return [
    '<PersonName>',
    title ? ['<Title>', labelType(title.code, title.label), '</Title>'].join('') : '',
    first ? el('FirstName', esc(first)) : '',
    last ? el('Surname', esc(last)) : '',
    '</PersonName>',
  ].join('');
}

function websiteXml(url, useCode) {
  return [
    '<Website>',
    el('Contact', esc(url)),
    useCodeXml(useCode, useCode),
    '</Website>',
  ].join('');
}

function instantMessagingXml(contact, useCode) {
  return [
    '<InstantMessaging>',
    el('Contact', esc(contact)),
    useCodeXml(useCode, useCode),
    '</InstantMessaging>',
  ].join('');
}

function contactInfoXml(metadata, resume) {
  const parts = [];
  const location = metadata.location || {};

  if (addressContactInner(location, metadata.language_code)) {
    parts.push(addressContactXml(location, metadata.language_code));
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

  const websites = [];
  const instant = [];
  const profiles = (resume.basics && resume.basics.profiles) || [];

  for (const profile of profiles) {
    const network = String(profile.network || '').toLowerCase();
    const url = profile.url || '';
    const username = profile.username || '';
    if (!url && !username) continue;
    if (['pdf', 'europass', 'translation'].some((n) => network.includes(n))) continue;
    if (network.startsWith('translation::')) continue;

    const imUse = instantMessagingUseForNetwork(network);
    if (imUse) {
      instant.push(instantMessagingXml(username || url, imUse));
      continue;
    }
    if (url) websites.push(websiteXml(url, websiteUseForNetwork(network)));
  }

  const mainSite = metadata.website;
  if (mainSite && !websites.some((w) => w.includes(esc(mainSite)))) {
    websites.push(websiteXml(mainSite, 'personal'));
  }

  if (websites.length) {
    parts.push(`<WebsiteList>${websites.join('')}</WebsiteList>`);
  }
  if (instant.length) {
    parts.push(`<InstantMessagingList>${instant.join('')}</InstantMessagingList>`);
  }

  if (!parts.length) return '';
  return `<ContactInfo>${parts.join('')}</ContactInfo>`;
}

function demographicsXml(resume) {
  const ep = (resume.meta && resume.meta.europass) || {};
  const demo = ep.demographics || {};
  const basics = resume.basics || {};
  const birthdate = demo.birthdate || demo.birthDate || basics.birthDate;
  const gender = demo.gender || basics.gender;
  const nationalities = demo.nationalities || demo.nationalityList || [];

  const parts = [];
  if (birthdate) parts.push(dateElement('Birthdate', birthdate));
  if (gender) {
    const code = String(gender).toUpperCase().startsWith('F') ? 'F' : 'M';
    const label = demo.genderLabel || (code === 'F' ? 'Female' : 'Male');
    parts.push(['<Gender>', labelType(code, label), '</Gender>'].join(''));
  }

  const natList = Array.isArray(nationalities) ? nationalities : nationalities ? [nationalities] : [];
  if (natList.length) {
    const entries = natList
      .map((nat) => {
        const code = typeof nat === 'string' ? normalizeCountryCode(nat) : normalizeCountryCode(nat.code);
        const label =
          typeof nat === 'string' ? countryLabel(code, 'en') : nat.label || countryLabel(code, 'en');
        if (!code) return '';
        return ['<Nationality>', labelType(code, label), '</Nationality>'].join('');
      })
      .filter(Boolean)
      .join('');
    if (entries) parts.push(`<NationalityList>${entries}</NationalityList>`);
  }

  if (!parts.length) return '';
  return `<Demographics>${parts.join('')}</Demographics>`;
}

function photoXml(photoData) {
  if (!photoData || !photoData.base64 || !photoData.mimeType) return '';
  return [
    '<Photo>',
    el('MimeType', esc(photoData.mimeType)),
    el('Data', photoData.base64),
    '</Photo>',
  ].join('');
}

function signatureXml(signatureData) {
  if (!signatureData || !signatureData.base64 || !signatureData.mimeType) return '';
  return [
    '<Signature>',
    el('MimeType', esc(signatureData.mimeType)),
    el('Data', signatureData.base64),
    '</Signature>',
  ].join('');
}

function identificationXml(resume, metadata, options) {
  const basics = resume.basics || {};
  const ep = (resume.meta && resume.meta.europass) || {};
  return [
    '<Identification>',
    personNameXml(basics.name || '', ep),
    contactInfoXml(metadata, resume),
    demographicsXml(resume),
    photoXml(options.photoData),
    signatureXml(options.signatureData),
    '</Identification>',
  ].join('');
}

function headlineXml(type, description, localeLang) {
  if (!description) return '';
  const typeLabels = {
    personal_statement: {
      fr: { code: 'personal_statement', label: 'Déclaration personnelle' },
      en: { code: 'personal_statement', label: 'Personal statement' },
    },
    position: {
      fr: { code: 'position', label: 'Poste occupé' },
      en: { code: 'position', label: 'Position' },
    },
    preferred_job: {
      fr: { code: 'preferred_job', label: 'Emploi souhaité' },
      en: { code: 'preferred_job', label: 'Preferred job' },
    },
  };
  const typeSet = typeLabels[type] || typeLabels.personal_statement;
  const typeInfo = typeSet[localeLang] || typeSet.en;

  return [
    '<Headline>',
    ['<Type>', labelType(typeInfo.code, typeInfo.label), '</Type>'].join(''),
    ['<Description>', el('Label', esc(description)), '</Description>'].join(''),
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

function organisationContactXml(entry, metadata) {
  const city = extractCity(entry.location) || metadata.city;
  const loc = { city, countryCode: metadata.country_code };
  const address = addressContactXml(loc, metadata.language_code);
  const website = entry.url
    ? ['<Website>', el('Contact', esc(entry.url)), '<Use>', el('Code', 'business'), '</Use>', '</Website>'].join('')
    : '';

  if (!address && !website) return '';
  return ['<ContactInfo>', address, website, '</ContactInfo>'].join('');
}

function employerXml(entry, metadata) {
  return [
    '<Employer>',
    el('Name', esc(entry.name || '')),
    organisationContactXml(entry, metadata),
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
      ? ['<Organisation>', el('Name', esc(entry.institution)), organisationContactXml(entry, metadata), '</Organisation>'].join('')
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

function genericSkillXml(tag, description) {
  if (!description) return '';
  return [`<${tag}>`, el('Description', esc(description)), `</${tag}>`].join('');
}

function ictLevelXml(levels) {
  const fields = ['Information', 'Communication', 'ContentCreation', 'Safety', 'ProblemSolving'];
  const inner = fields
    .filter((field) => levels[field])
    .map((field) => el(field, esc(levels[field])))
    .join('');
  if (!inner) return '';
  return ['<ProficiencyLevel>', inner, '</ProficiencyLevel>'].join('');
}

function computerSkillsXml(resume) {
  const ep = (resume.meta && resume.meta.europass) || {};
  const skills = resume.skills || [];
  const names = skills.map((s) => (s.name || '').trim()).filter(Boolean);
  const keywordLines = skills
    .map((s) => {
      const kw = (s.keywords || []).filter(Boolean);
      if (!kw.length) return '';
      return `${s.name}: ${kw.join(', ')}`;
    })
    .filter(Boolean);

  const description = keywordLines.length ? keywordLines.join('\n') : names.join('; ');
  if (!description && !ep.ict) return '';

  const parts = ['<Computer>'];
  if (description) parts.push(el('Description', esc(description)));
  const ict = ictLevelXml(ep.ict || {});
  if (ict) parts.push(ict);
  parts.push('</Computer>');
  return parts.join('');
}

function drivingSkillXml(resume) {
  const ep = (resume.meta && resume.meta.europass) || {};
  const licences = ep.driving || ep.drivingLicences || [];
  const list = Array.isArray(licences) ? licences : [licences];
  const codes = list.map((l) => String(l).trim().toUpperCase()).filter(Boolean);
  if (!codes.length) return '';

  const licenceXml = codes.map((code) => el('Licence', esc(code))).join('');

  return ['<Driving>', '<Description>', licenceXml, '</Description>', '</Driving>'].join('');
}

function collectGenericSkillText(resume, bucket) {
  const ep = (resume.meta && resume.meta.europass) || {};
  const explicit = ep[bucket];
  if (explicit) return String(explicit).trim();

  const lines = [];
  for (const skill of resume.skills || []) {
    if (europassSkillBucket(skill.name) !== bucket) continue;
    const kw = (skill.keywords || []).filter(Boolean).join(', ');
    const line = kw ? `${skill.name}: ${kw}` : skill.name;
    if (line) lines.push(line);
  }
  return lines.join('\n');
}

function otherSkillXml(resume, localeLang) {
  const ep = (resume.meta && resume.meta.europass) || {};
  if (ep.other) return genericSkillXml('Other', ep.other);

  const interests = resume.interests || [];
  const lines = interests
    .map((item) => {
      const kw = (item.keywords || []).filter(Boolean).join(', ');
      return kw ? `${item.name}: ${kw}` : item.name;
    })
    .filter(Boolean);

  if (!lines.length) return '';
  const heading = localeLang === 'fr' ? 'Centres d\'intérêt' : 'Interests';
  return genericSkillXml('Other', `${heading}\n${lines.join('\n')}`);
}

function skillsXml(resume, localeLang) {
  const linguistic = linguisticSkillsXml(resume, localeLang);
  const computer = computerSkillsXml(resume);
  const communication = genericSkillXml('Communication', collectGenericSkillText(resume, 'communication'));
  const organisational = genericSkillXml('Organisational', collectGenericSkillText(resume, 'organisational'));
  const jobRelated = genericSkillXml('JobRelated', collectGenericSkillText(resume, 'jobRelated'));
  const driving = drivingSkillXml(resume);
  const other = otherSkillXml(resume, localeLang);

  if (!linguistic && !computer && !communication && !organisational && !jobRelated && !driving && !other) {
    return '';
  }

  return [
    '<Skills>',
    linguistic,
    communication,
    organisational,
    jobRelated,
    computer,
    driving,
    other,
    '</Skills>',
  ].join('');
}

function achievementXml(code, description, localeLang) {
  if (!description) return '';
  const label = achievementTypeLabel(code, localeLang);
  return [
    '<Achievement>',
    ['<Title>', labelType(code, label), '</Title>'].join(''),
    el('Description', esc(description)),
    '</Achievement>',
  ].join('');
}

function formatCertificate(cert, localeLang) {
  return [localized(cert, 'name', localeLang) || cert.name, cert.issuer, cert.date]
    .filter(Boolean)
    .join(' — ');
}

function formatPublication(pub, localeLang) {
  const name = localized(pub, 'name', localeLang) || pub.name || '';
  const summary = localized(pub, 'summary', localeLang) || pub.summary || '';
  const date = pub.releaseDate || pub.date || '';
  const url = pub.url || '';
  return [name, summary, date, url].filter(Boolean).join(' — ');
}

function formatProject(project, localeLang) {
  const name = project.name || '';
  const description = localized(project, 'description', localeLang) || project.description || '';
  const period = [project.startDate, project.endDate].filter(Boolean).join(' – ');
  const url = project.url || '';
  const highlights = (project.highlights || []).filter(Boolean);
  const parts = [name, period, description, url];
  if (highlights.length) parts.push(highlights.map((h) => `• ${h}`).join('\n'));
  return parts.filter(Boolean).join('\n');
}

function formatAward(award, localeLang) {
  return [localized(award, 'title', localeLang) || award.title, award.awarder, award.date, award.summary]
    .filter(Boolean)
    .join(' — ');
}

function formatVolunteer(entry, localeLang) {
  const summary = localized(entry, 'summary', localeLang) || entry.summary || '';
  const highlights = (entry.highlights || []).filter(Boolean);
  const parts = [
    entry.position,
    entry.organization,
    [entry.startDate, entry.endDate].filter(Boolean).join(' – '),
    summary,
  ];
  if (highlights.length) parts.push(highlights.map((h) => `• ${h}`).join('\n'));
  return parts.filter(Boolean).join('\n');
}

function formatReference(ref) {
  return `${ref.name}: ${ref.reference || ''}`.trim();
}

function achievementListXml(resume, localeLang) {
  const entries = [];

  for (const cert of resume.certificates || []) {
    const description = formatCertificate(cert, localeLang);
    const xml = achievementXml('certifications', description, localeLang);
    if (xml) entries.push(xml);
  }

  for (const pub of resume.publications || []) {
    const xml = achievementXml('publications', formatPublication(pub, localeLang), localeLang);
    if (xml) entries.push(xml);
  }

  for (const project of resume.projects || []) {
    const xml = achievementXml('projects', formatProject(project, localeLang), localeLang);
    if (xml) entries.push(xml);
  }

  for (const award of resume.awards || []) {
    const xml = achievementXml('honors_awards', formatAward(award, localeLang), localeLang);
    if (xml) entries.push(xml);
  }

  for (const vol of resume.volunteer || []) {
    const xml = achievementXml('courses', formatVolunteer(vol, localeLang), localeLang);
    if (xml) entries.push(xml);
  }

  for (const ref of resume.references || []) {
    const xml = achievementXml('references', formatReference(ref), localeLang);
    if (xml) entries.push(xml);
  }

  const ep = (resume.meta && resume.meta.europass) || {};
  const extra = ep.achievements || [];
  for (const item of extra) {
    const xml = achievementXml(item.code || 'projects', item.description || item.text, localeLang);
    if (xml) entries.push(xml);
  }

  for (const doc of ep.externalDocumentation || []) {
    if (!doc) continue;
    const description = [doc.description, doc.href].filter(Boolean).join(' — ');
    const xml = achievementXml('publications', description, localeLang);
    if (xml) entries.push(xml);
  }

  if (!entries.length) return '';
  return `<AchievementList>${entries.join('')}</AchievementList>`;
}

function combinedHeadlineText(basics) {
  const label = basics.label || '';
  const summary = basics.summary || '';
  if (label && summary) return `${label}\n\n${summary}`;
  return label || summary;
}

function learnerInfoXml(resume, metadata, options) {
  const localeLang = metadata.language_code;
  const basics = resume.basics || {};
  const headlineText = combinedHeadlineText(basics);
  const headline = headlineText
    ? headlineXml(basics.label && !basics.summary ? 'position' : 'personal_statement', headlineText, localeLang)
    : '';

  return [
    '<LearnerInfo>',
    identificationXml(resume, metadata, options),
    headline,
    workExperienceListXml(resume, metadata),
    educationListXml(resume, metadata),
    skillsXml(resume, localeLang),
    achievementListXml(resume, localeLang),
    '</LearnerInfo>',
  ].join('');
}

/**
 * Convert a JSON Resume document to Europass SkillsPassport XML v3.4.0.
 * Pass `options.photoData` from fetchPhotoFromUrl() for embedded Photo.
 * @param {object} resume
 * @param {{ language?: string, locale?: string, metadata?: object, pretty?: boolean, photoData?: { mimeType: string, base64: string } | null, signatureData?: object }} [options]
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
    learnerInfoXml(resume, metadata, options),
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
