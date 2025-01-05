const fs = require('fs');
const { execSync } = require('child_process');

// Parse command line arguments for --langs parameter
const args = process.argv.slice(2);
const DEFAULT_LANGUAGES = JSON.stringify(['en', 'fr']);
const langsStr = getArgument('langs', DEFAULT_LANGUAGES)
const action = getArgument('action', 'split')
const theme = getArgument('theme', 'ludoo')

function getArgument(name, defaultValue) {
    const prefix = `--${name}=`;
    const foundArg = args.find(arg => arg.startsWith(prefix));
    if (!foundArg) {
        return defaultValue;
    }
    return foundArg.split(prefix)[1];
}


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

function getLanguages(){
    // Parse the array string, replacing single quotes with double quotes for valid JSON
    return JSON.parse(langsStr.replace(/'/g, '"'));
}

function splitLanguages() {
    const resumeData = JSON.parse(fs.readFileSync('resume.i18n.json', 'utf8'));
    getLanguages().forEach(lang => {
        const version = createLanguageVersion(resumeData, lang);
        fs.writeFileSync(`resume.${lang}.json`, JSON.stringify(version, null, 2));
    });
}

function generateResumes(){
    getLanguages().forEach(lang => {
        const shellHtml = execSync(`resume export index-${lang}.html --theme ${theme} --resume resume.${lang}.json`);
        const shellPdf = execSync(`resume export pdf/resume-${lang}.pdf --format pdf --theme ${theme} --resume resume.${lang}.json`);
    });
}

if (action === 'split') {
    splitLanguages();
}else if (action === 'generate') {
   generateResumes();
}