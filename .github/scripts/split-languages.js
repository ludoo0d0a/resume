const fs = require('fs');
const { execSync } = require('child_process');

// Parse command line arguments for --langs parameter
const args = process.argv.slice(2);
const DEFAULT_LANGUAGES = JSON.stringify(["en", "fr"]);
const action = getArgument('action', 'split')
const theme = getArgument('theme', 'ludoo')

console.log("action="+action)
console.log("theme="+theme)

const resumeData = JSON.parse(fs.readFileSync('resume.i18n.json', 'utf8'));
const LANGUAGES = resumeData.meta.languages.split(',');

console.log("languages="+LANGUAGES)

function getArgument(name, defaultValue) {
    const prefix = `--${name}=`;
    const foundArg = args.find(arg => arg.startsWith(prefix));
    if (!foundArg) {
        console.log("defaultValue for "+name+'='+defaultValue)
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

function splitLanguages() {
    LANGUAGES.forEach(lang => {
        const version = createLanguageVersion(resumeData, lang);
        fs.writeFileSync(`resume.${lang}.json`, JSON.stringify(version, null, 2));
    });
}

function generateResumes(){
    LANGUAGES.forEach(lang => {
        const shellHtml = execSync(`resume export index-${lang}.html --theme ${theme} --resume resume.${lang}.json`);
        const shellPdf = execSync(`resume export pdf/resume-${lang}.pdf --format pdf --theme ${theme} --resume resume.${lang}.json`);
    });
}

if (action === 'split') {
    splitLanguages();
}else if (action === 'generate') {
   generateResumes();
}