# Resume of Ludovic Valente

Using JsonResume standard, I host my own version in 2 languages
It produces a HTML and PDF themed-version in 2 languages: EN,FR

https://ludoo0d0a.github.io/resume/

## Features
- Internationalization
- HTML and PDF generation
- Github action to translate resume in 2 languages
- Hosted on github pages
- Synchronized with jsonresume.org
- Content versioning

## Prerequisites

In Settings / Secrets / Actions / Add a new secret
 - GIST_ID : Id of the gist resume.json
 - GIST_TOKEN: Personal Access Token to access the gist ; 
   - to create it, 
     - go to https://github.com/settings/personal-access-tokens
     - and select User permissions:
       - Read and Write access to gists
     Repository permissions
       - Read access to metadata
       - Read and Write access to workflows   

## i18n support 

Thanks to IA code generation (Sourcegraph Cody), I created in a few hours a stable first version of github action to translate my resume in 2 languages.

Idea is to have a single file `resume.i18n.json` having all translations node using the following format:

```json
{
  "name": "Scora",
  "releaseDate": "2024-09-03",
  "en_summary": "Tennis scoreboard for watch on Google Android WearOS",
  "fr_summary": "Tableau de score tennis pour montre Google Android WearOS",
  "url": "https://play.google.com/store/apps/details?id=fr.geoking.tennis.scoreboard.wear"
}
```

## Theming

Theming is done using [jsonresume-theme-ludoo](https://github.com/jsonresume/jsonresume-theme-ludoo) allowing to use 
a single jsonresume file to generate the resume in HTML and PD in all languages.

## Deployment / Hosting github.io

Added a github action to deploy into github pages to display resume in different languages

 - EN: https://ludoo0d0a.github.io/resume/
 - FR: https://ludoo0d0a.github.io/resume/index-fr.html

## Sync with jsonresume through gist

Added a github action to deploy to gist and sync with jsonresume

 - jsonResume: https://registry.jsonresume.org/ludoo0d0a
 - Gist : https://gist.github.com/ludoo0d0a/b7e4355cd0d2722f25002eca525ea262
