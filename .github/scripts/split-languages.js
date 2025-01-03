const fs = require('fs');
const { execSync } = require('child_process');

// Define supported languages
const LANGUAGES = ['en', 'fr'];

// Function to increment patch version
function incrementPatchVersion(version) {
    const cleanVersion = version.replace(/^v/, '');
    const [major, minor, patch] = cleanVersion.split('.');
    return `${version.startsWith('v') ? 'v' : ''}${major}.${minor}.${parseInt(patch) + 1}`;
}

// Read input file
const resumeData = JSON.parse(fs.readFileSync('resume.i18n.json', 'utf8'));

// Get incremented version for commit message only
const newVersion = incrementPatchVersion(resumeData.meta.version);

// Function to remove language-specific fields
function createLanguageVersion(data, language) {
    const result = JSON.parse(JSON.stringify(data));

    function processObject(obj) {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                processObject(obj[key]);
            }

            LANGUAGES.forEach(lang => {
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

// Generate files for each language
LANGUAGES.forEach(lang => {
    const version = createLanguageVersion(resumeData, lang);
    fs.writeFileSync(`resume.${lang}.json`, JSON.stringify(version, null, 2));
});

