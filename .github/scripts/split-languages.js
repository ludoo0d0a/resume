const fs = require('fs');
const { execSync } = require('child_process');

// Parse command line arguments for --langs parameter
const args = process.argv.slice(2);
const langsArg = args.find(arg => arg.startsWith('--langs='));
let LANGUAGES = ['en', 'fr']; // default fallback

if (langsArg) {
    console.log('parameters :', langsArg);
    try {
        // Extract the array string after --langs= and parse it
        const langsStr = langsArg.split('--langs=')[1];
        // Parse the array string, replacing single quotes with double quotes for valid JSON
        LANGUAGES = JSON.parse(langsStr.replace(/'/g, '"'));
    } catch (error) {
        console.log('Invalid langs parameter format. Using default languages:', LANGUAGES);
        throw new Error('Invalid langs parameter format.');
    }
}

// Read input file
const resumeData = JSON.parse(fs.readFileSync('resume.i18n.json', 'utf8'));

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

