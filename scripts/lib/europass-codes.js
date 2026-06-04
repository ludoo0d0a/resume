/** Europass-adjusted ISO 3166-1 alpha-2. */
const COUNTRY_ALIASES = {
  GB: 'UK',
  GR: 'EL',
};

const COUNTRY_LABELS = {
  AT: 'Austria',
  BE: 'Belgium',
  BG: 'Bulgaria',
  CH: 'Switzerland',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  DK: 'Denmark',
  EE: 'Estonia',
  EL: 'Greece',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  HR: 'Croatia',
  HU: 'Hungary',
  IE: 'Ireland',
  IT: 'Italy',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LV: 'Latvia',
  MT: 'Malta',
  NL: 'Netherlands',
  NO: 'Norway',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SE: 'Sweden',
  SI: 'Slovenia',
  SK: 'Slovakia',
  UK: 'United Kingdom',
  US: 'United States',
};

/**
 * ISO 639-1 codes with Europass display labels (EN / FR).
 * Keys: aliases in lowercase for name resolution.
 */
const ISO_LANGUAGES = {
  fr: { code: 'fr', en: 'French', fr: 'Français' },
  en: { code: 'en', en: 'English', fr: 'Anglais' },
  de: { code: 'de', en: 'German', fr: 'Allemand' },
  es: { code: 'es', en: 'Spanish', fr: 'Espagnol' },
  it: { code: 'it', en: 'Italian', fr: 'Italien' },
  pt: { code: 'pt', en: 'Portuguese', fr: 'Portugais' },
  nl: { code: 'nl', en: 'Dutch', fr: 'Néerlandais' },
  lb: { code: 'lb', en: 'Luxembourgish', fr: 'Luxembourgeois' },
  pl: { code: 'pl', en: 'Polish', fr: 'Polonais' },
  ro: { code: 'ro', en: 'Romanian', fr: 'Roumain' },
  ru: { code: 'ru', en: 'Russian', fr: 'Russe' },
  zh: { code: 'zh', en: 'Chinese', fr: 'Chinois' },
  ja: { code: 'ja', en: 'Japanese', fr: 'Japonais' },
  ar: { code: 'ar', en: 'Arabic', fr: 'Arabe' },
};

const LANGUAGE_ALIASES = {
  french: 'fr',
  français: 'fr',
  francais: 'fr',
  english: 'en',
  anglais: 'en',
  german: 'de',
  allemand: 'de',
  spanish: 'es',
  espagnol: 'es',
  italian: 'it',
  italien: 'it',
  portuguese: 'pt',
  portugais: 'pt',
  dutch: 'nl',
  néerlandais: 'nl',
  neerlandais: 'nl',
  nederlands: 'nl',
  luxembourgish: 'lb',
  luxembourgeois: 'lb',
  letzebuergesch: 'lb',
  polish: 'pl',
  polonais: 'pl',
  romanian: 'ro',
  roumain: 'ro',
  russian: 'ru',
  russe: 'ru',
  chinese: 'zh',
  chinois: 'zh',
  japanese: 'ja',
  japonais: 'ja',
  arabic: 'ar',
  arabe: 'ar',
};

const CEF_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const CEF_SKILLS = ['Listening', 'Reading', 'SpokenInteraction', 'SpokenProduction', 'Writing'];

/** Default ECV printing preferences (matches Europass_CV_V3.4.0_Example.xml). */
const DEFAULT_ECV_PRINTING_FIELDS = [
  {
    name: 'LearnerInfo',
    show: 'true',
    order: 'Identification Headline WorkExperience Education Skills Achievement ReferenceTo',
  },
  {
    name: 'LearnerInfo.Identification.PersonName',
    show: 'true',
    order: 'FirstName Surname',
  },
  {
    name: 'LearnerInfo.Identification.Demographics.Birthdate',
    show: 'false',
    format: 'text/short',
  },
  {
    name: 'LearnerInfo.WorkExperience[0].Period',
    show: 'true',
    format: 'text/short',
  },
  {
    name: 'LearnerInfo.Education[0].Period',
    show: 'true',
    format: 'text/short',
  },
];

const WEBSITE_USE_BY_NETWORK = {
  linkedin: 'portfolio',
  github: 'portfolio',
  twitter: 'personal',
  x: 'personal',
  blog: 'blog',
  portfolio: 'portfolio',
};

const INSTANT_MESSAGING_BY_NETWORK = {
  skype: 'skype',
  gtalk: 'gtalk',
  icq: 'icq',
  aim: 'aim',
  msn: 'msn',
  yahoo: 'yahoo',
};

const ACHIEVEMENT_TYPE_LABELS = {
  en: {
    honors_awards: 'Honours and awards',
    presentations: 'Presentations',
    publications: 'Publications',
    projects: 'Projects',
    citations: 'Citations',
    memberships: 'Memberships',
    conferences: 'Conferences',
    seminars: 'Seminars',
    workshops: 'Workshops',
    references: 'References',
    courses: 'Courses',
    certifications: 'Certificates',
  },
  fr: {
    honors_awards: 'Distinctions',
    presentations: 'Présentations',
    publications: 'Publications',
    projects: 'Projets',
    citations: 'Citations',
    memberships: 'Adhésions',
    conferences: 'Conférences',
    seminars: 'Séminaires',
    workshops: 'Ateliers',
    references: 'Références',
    courses: 'Cours',
    certifications: 'Certificats',
  },
};

const SKILL_CATEGORY_TO_EUROPASS = {
  frontend: 'jobRelated',
  backend: 'jobRelated',
  cloud: 'jobRelated',
  'ci/cd': 'jobRelated',
  mobile: 'jobRelated',
  communication: 'communication',
  organisational: 'organisational',
  organization: 'organisational',
  driving: 'driving',
  other: 'other',
};

function normalizeCountryCode(code) {
  const upper = String(code || '').toUpperCase();
  return COUNTRY_ALIASES[upper] || upper;
}

function countryLabel(code, localeLang) {
  const normalized = normalizeCountryCode(code);
  return COUNTRY_LABELS[normalized] || normalized;
}

function resolveIsoLanguage(lang, localeLang) {
  const explicit = lang.languageCode || lang.iso || lang.code;
  if (explicit) {
    const code = String(explicit).toLowerCase();
    if (ISO_LANGUAGES[code]) return toLanguageEntry(code, localeLang);
  }

  const name = String(lang.language || lang.name || '').trim();
  if (!name) return null;

  const lower = name.toLowerCase();
  if (LANGUAGE_ALIASES[lower]) {
    return toLanguageEntry(LANGUAGE_ALIASES[lower], localeLang);
  }

  if (/^[a-z]{2,3}$/i.test(name)) {
    const code = name.slice(0, 2).toLowerCase();
    if (ISO_LANGUAGES[code]) return toLanguageEntry(code, localeLang);
  }

  return null;
}

function toLanguageEntry(code, localeLang) {
  const entry = ISO_LANGUAGES[code];
  if (!entry) return { code, label: code };
  const label = localeLang === 'fr' ? entry.fr : entry.en;
  return { code: entry.code, label };
}

function normalizeCefLevel(value) {
  const match = String(value || '')
    .toUpperCase()
    .match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  return match ? match[1] : null;
}

function mapFluencyToCef(fluency) {
  const f = String(fluency || '').toLowerCase();
  const direct = normalizeCefLevel(fluency);
  if (direct) return direct;

  if (/native|maternel|mother|langue maternelle|bilingual|bilingue|expert/i.test(f)) return 'C2';
  if (/fluent|courant|full|professional|professionnel|proficient/i.test(f)) return 'C1';
  if (/advanced|avancé|avance|upper intermediate/i.test(f)) return 'B2';
  if (/intermediate|intermédiaire|intermediaire|conversational/i.test(f)) return 'B1';
  if (/elementary|élémentaire|elementaire|basic|notions|pre-intermediate/i.test(f)) return 'A2';
  if (/beginner|débutant|debutant|starter/i.test(f)) return 'A1';
  return 'B2';
}

/**
 * Build CEFR proficiency map for a language entry.
 * Supports JSON Resume extensions: cefr, cefrLevel, cefrListening, …
 * @returns {Record<string, string>}
 */
function buildCefProfile(lang) {
  const profile = {};
  const global = normalizeCefLevel(lang.cefr || lang.cefrLevel);
  if (global) {
    for (const skill of CEF_SKILLS) profile[skill] = global;
    return profile;
  }

  const skillKeys = {
    Listening: ['cefrListening', 'listening'],
    Reading: ['cefrReading', 'reading'],
    SpokenInteraction: ['cefrSpokenInteraction', 'spokenInteraction'],
    SpokenProduction: ['cefrSpokenProduction', 'spokenProduction'],
    Writing: ['cefrWriting', 'writing'],
  };

  let hasSkill = false;
  for (const [skill, keys] of Object.entries(skillKeys)) {
    for (const key of keys) {
      const level = normalizeCefLevel(lang[key]);
      if (level) {
        profile[skill] = level;
        hasSkill = true;
        break;
      }
    }
  }
  if (hasSkill) return profile;

  const fallback = mapFluencyToCef(lang.fluency);
  for (const skill of CEF_SKILLS) profile[skill] = fallback;
  return profile;
}

function isMotherTongue(lang, localeLang) {
  if (lang.motherTongue === true || lang.native === true) return true;
  const fluency = String(lang.fluency || '').toLowerCase();
  if (/maternel|native|mother|langue maternelle/i.test(fluency)) return true;
  const entry = resolveIsoLanguage(lang, localeLang);
  return entry && entry.code === localeLang;
}

function printingPreferencesEnabled(resume, options) {
  const meta = (resume.meta && resume.meta.europass) || {};
  if (options.printingPreferences === false || meta.printingPreferences === false) return false;
  if (options.printingPreferences === true || meta.printingPreferences === true) return true;
  return true;
}

function resolvePrintingFields(resume, options) {
  const meta = (resume.meta && resume.meta.europass) || {};
  const custom = options.printingFields || meta.printingFields;
  if (Array.isArray(custom) && custom.length) return custom;

  const fields = DEFAULT_ECV_PRINTING_FIELDS.map((f) => ({ ...f }));
  const addressFormat = options.addressFormat || meta.addressFormat;
  const dateFormat = options.dateFormat || meta.dateFormat;

  if (addressFormat) {
    const addr = fields.find((f) => f.name === 'LearnerInfo.Identification.ContactInfo.Address');
    if (addr) addr.format = addressFormat;
  }
  if (dateFormat) {
    for (const name of ['LearnerInfo.WorkExperienceList', 'LearnerInfo.EducationList']) {
      const field = fields.find((f) => f.name === name);
      if (field) field.format = dateFormat;
    }
  }

  return fields;
}

function achievementTypeLabel(code, localeLang) {
  const labels = ACHIEVEMENT_TYPE_LABELS[localeLang] || ACHIEVEMENT_TYPE_LABELS.en;
  return labels[code] || code;
}

function websiteUseForNetwork(network) {
  const key = String(network || '').toLowerCase();
  return WEBSITE_USE_BY_NETWORK[key] || 'personal';
}

function instantMessagingUseForNetwork(network) {
  const key = String(network || '').toLowerCase();
  return INSTANT_MESSAGING_BY_NETWORK[key] || null;
}

function europassSkillBucket(skillName) {
  const key = String(skillName || '').toLowerCase();
  return SKILL_CATEGORY_TO_EUROPASS[key] || 'jobRelated';
}

export {
  CEF_SKILLS,
  CEF_LEVELS,
  COUNTRY_ALIASES,
  COUNTRY_LABELS,
  ISO_LANGUAGES,
  DEFAULT_ECV_PRINTING_FIELDS,
  ACHIEVEMENT_TYPE_LABELS,
  WEBSITE_USE_BY_NETWORK,
  SKILL_CATEGORY_TO_EUROPASS,
  normalizeCountryCode,
  countryLabel,
  resolveIsoLanguage,
  normalizeCefLevel,
  mapFluencyToCef,
  buildCefProfile,
  isMotherTongue,
  printingPreferencesEnabled,
  resolvePrintingFields,
  achievementTypeLabel,
  websiteUseForNetwork,
  instantMessagingUseForNetwork,
  europassSkillBucket,
};
