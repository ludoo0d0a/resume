const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const action = getArgument('action', 'split');
const theme = getArgument('theme', 'ludoo');

console.log('action=' + action);
console.log('theme=' + theme);

const resumeData = JSON.parse(fs.readFileSync('resume.i18n.json', 'utf8'));
const LANGUAGES = resumeData.meta.languages.split(',');
const LOCALE_BY_LANG = { en: 'en-US', fr: 'fr-FR' };

console.log('languages=' + LANGUAGES);

function getArgument(name, defaultValue) {
  const prefix = `--${name}=`;
  const foundArg = args.find((arg) => arg.startsWith(prefix));
  if (!foundArg) {
    console.log('defaultValue for ' + name + '=' + defaultValue);
    return defaultValue;
  }
  return foundArg.split(prefix)[1];
}

function createLanguageVersion(data, language) {
  const result = JSON.parse(JSON.stringify(data));

  function processObject(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObject(obj[key]);
      }

      LANGUAGES.forEach((lang) => {
        if (lang !== language && key.startsWith(lang + '_')) {
          delete obj[key];
        }
      });

      if (key.startsWith(language + '_')) {
        const baseKey = key.substring(language.length + 1);
        obj[baseKey] = obj[key];
        delete obj[key];
      }
    }
  }

  processObject(result);
  return result;
}

function localeForLang(lang) {
  const key = `${lang}_locale`;
  if (resumeData.meta && resumeData.meta[key]) {
    return resumeData.meta[key];
  }
  return LOCALE_BY_LANG[lang] || `${lang}-${lang.toUpperCase()}`;
}

function splitLanguages() {
  LANGUAGES.forEach((lang) => {
    const version = createLanguageVersion(resumeData, lang);
    version.meta = version.meta || {};
    version.meta.locale = localeForLang(lang);
    fs.writeFileSync(`resume.${lang}.json`, JSON.stringify(version, null, 2));
    console.log(`Created file: resume.${lang}.json`);
  });
}

function generateResumes() {
  fs.mkdirSync('public', { recursive: true });
  LANGUAGES.forEach((lang) => {
    execSync(
      `resume export public/index-${lang}.html --theme ${theme} --resume resume.${lang}.json`,
    );
    console.log(`Created HTML file: public/index-${lang}.html`);
    execSync(
      `export RESUME_PUPPETEER_NO_SANDBOX=1; resume export pdf/resume-${lang}.pdf --format pdf --theme ${theme} --resume resume.${lang}.json`,
    );
    console.log(`Created PDF file: pdf/resume-${lang}.pdf`);
  });
}

if (action === 'split') {
  splitLanguages();
} else if (action === 'generate') {
  generateResumes();
}
