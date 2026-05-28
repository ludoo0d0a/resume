const SUPPORTED_LANGS = ['en', 'fr'];

const LOCALE_BY_LANG = {
  en: 'en-US',
  fr: 'fr-FR',
};

const LANG_REQUIRED = `--lang <${SUPPORTED_LANGS.join('|')}> is required`;

/**
 * @param {string} value
 * @returns {'en'|'fr'}
 */
function normalizeLang(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(LANG_REQUIRED);
  }
  const code = String(value)
    .trim()
    .split('-')[0]
    .toLowerCase();
  if (!SUPPORTED_LANGS.includes(code)) {
    throw new Error(`Unsupported lang "${value}". Use: ${SUPPORTED_LANGS.join(', ')}`);
  }
  return code;
}

/**
 * Default input/output paths for a language code.
 * @param {string} lang
 */
function pathsForLang(lang) {
  const code = normalizeLang(lang);
  const locale = LOCALE_BY_LANG[code];
  return {
    lang: code,
    locale,
    /** SkillsPassport @locale — XSD pattern is 2 letters or 2+3 (e.g. en, sr-lat). */
    xmlLocale: code,
    resume: `resume.${code}.json`,
    /** Published site root is /public (GitHub Pages). */
    indexHtml: `public/index-${code}.html`,
    homepage: 'public/index.html',
    /** JSON Resume PDF (repo); copied to public/pdf/ for GitHub Pages. */
    pdf: `pdf/resume-${code}.pdf`,
    sitePdf: `public/pdf/resume-${code}.pdf`,
    europassXml: `public/resume-${code}-europass.xml`,
    europassHtml: `public/resume-${code}-europass.html`,
    /** Europass PDF (GitHub Pages: public/pdf/). */
    europassPdf: `public/pdf/resume-${code}-europass.pdf`,
  };
}

/**
 * Parse --lang / --locale and optional path overrides from argv.
 * @param {string[]} argv
 * @param {{ resume?: string, output?: string, xmlOutput?: string }} [defaults]
 */
function parseLangArgs(argv, defaults = {}) {
  const options = {
    lang: process.env.RESUME_LANG,
    resume: defaults.resume,
    output: defaults.output,
    xmlOutput: defaults.xmlOutput,
    help: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--lang' || arg === '--locale') && argv[i + 1]) {
      options.lang = normalizeLang(argv[++i]);
    } else if (arg === '--resume' && argv[i + 1]) options.resume = argv[++i];
    else if (arg === '--output' && argv[i + 1]) options.output = argv[++i];
    else if (arg === '--xml-output' && argv[i + 1]) options.xmlOutput = argv[++i];
    else if (arg === '--help' || arg === '-h') options.help = true;
  }

  if (!options.help && !options.lang) {
    throw new Error(LANG_REQUIRED);
  }

  if (options.lang) {
    const paths = pathsForLang(options.lang);
    options.locale = paths.locale;
    options.resume = options.resume || paths.resume;
    options.paths = paths;
  }

  return options;
}

export {
  SUPPORTED_LANGS,
  LOCALE_BY_LANG,
  LANG_REQUIRED,
  normalizeLang,
  pathsForLang,
  parseLangArgs,
};
