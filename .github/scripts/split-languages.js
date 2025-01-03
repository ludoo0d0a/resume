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

// Function to commit and push changes
function commitAndPush(version) {
    try {
        execSync('git config --local user.email "action@github.com"');
        execSync('git config --local user.name "GitHub Action"');

        // Add only generated language files
        LANGUAGES.forEach(lang => {
            execSync(`git add resume.${lang}.json`);
        });

        execSync(`git commit -m "chore: update generated resume files to version ${version}"`);
        execSync('git push');
    } catch (error) {
        console.log('No changes to commit or push failed');
    }
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

// Commit and push only generated files
//commitAndPush(newVersion);
