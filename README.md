# Resume of Ludovic Valente

Using JsonResume standard, I host my own version in 2 languages
It produces a HTML themed-version in 2 languages: EN,FR

https://ludoo0d0a.github.io/resume/

# i18n support 

Thanks to IA code generation (Sourcegraph Cody), I created in a few hours a github action to translate my resume in 2 languages.

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

# Deployment / Hosting github.io

Added a github action to deploy into github pages to display resume in different languages

 - EN: https://ludoo0d0a.github.io/resume/
 - FR: https://ludoo0d0a.github.io/resume/index-fr.html

# Sync with jsonresume through gist

Added a github action to deploy to gist and sync with jsonresume

 - https://registry.jsonresume.org/ludoo0d0a
