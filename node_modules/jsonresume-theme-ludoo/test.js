const fs = require('fs');
const theme = require('./index.js');

function generate(lang){
    var resume = JSON.parse(fs.readFileSync(__dirname + `/resume.${lang}.json`, 'utf8'));
    var html = theme.render(resume);
    fs.writeFileSync(__dirname + `/public/resume.${lang}.html`, html);
}

function generateAll(){
    generate('en')
    generate('fr')
}
generateAll()