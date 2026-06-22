export default `<!DOCTYPE html>
<html lang="{{resume.lang}}">
<head>
  <meta charset="utf-8"/>
  <title>{{resume.titles.cv}} — {{resume.basics.name}}</title>
  <style>{{{css}}}</style>
  <style media="print">{{{printcss}}}</style>
</head>
<body>
  <header class="ep-header">
    <div class="ep-header-main">
      <div class="ep-identity">
        <div class="ep-name">{{resume.basics.name}}</div>
        {{#if resume.personalInfoBool}}
        <p class="ep-personal-line">
          {{#each resume.personalInfo}}
          <span class="ep-personal-item"><span class="ep-personal-label">{{label}}:</span> {{value}}{{#if suffix}} ({{suffix}}){{/if}}</span>
          {{/each}}
        </p>
        {{/if}}
      </div>
      {{#if resume.photoUrl}}
      <img class="ep-photo" src="{{resume.photoUrl}}" alt=""/>
      {{/if}}
    </div>
  </header>

  {{#if resume.basics.summary}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.about}}</h2>
    <p class="ep-summary">{{{resume.basics.summary}}}</p>
  </section>
  {{/if}}

  {{#if resume.workBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.work}}</h2>
    {{#each resume.work}}
    <div class="ep-entry">
      <div class="ep-entry-period">{{dateLocationLine}}</div>
      <div class="ep-entry-heading">{{titleLine}}</div>
      {{#if summary}}<p class="ep-entry-body">{{{summary}}}</p>{{/if}}
      {{#if boolHighlights}}
      <ul class="ep-highlights">
        {{#each highlights}}<li>{{this}}</li>{{/each}}
      </ul>
      {{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.educationBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.education}}</h2>
    {{#each resume.education}}
    <div class="ep-entry">
      <div class="ep-entry-period">{{dateLocationLine}}</div>
      <div class="ep-entry-heading">{{titleLine}}</div>
      {{#if boolSummary}}<p class="ep-entry-body">{{{summary}}}</p>{{/if}}
      {{#if url}}<div class="ep-entry-meta">{{../resume.titles.website}}: <a href="{{url}}">{{url}}</a></div>{{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.languagesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.languages}}</h2>
    {{#if resume.motherBool}}
    <p class="ep-languages-inline">{{resume.titles.motherTongue}}: {{resume.motherTongueLine}}</p>
    {{/if}}
    {{#if resume.foreignBool}}
    <table class="ep-cefr-table">
      <thead>
        <tr>
          <th></th>
          <th colspan="2">{{resume.titles.cefUnderstanding}}</th>
          <th colspan="2">{{resume.titles.cefSpeaking}}</th>
          <th>{{resume.titles.cefWriting}}</th>
        </tr>
        <tr>
          <th></th>
          {{#each resume.cefColumns}}<th>{{label}}</th>{{/each}}
        </tr>
      </thead>
      <tbody>
        {{#each resume.foreign}}
        <tr>
          <td class="ep-lang-name">{{language}}</td>
          {{#each cefCells}}<td>{{level}}</td>{{/each}}
        </tr>
        {{/each}}
      </tbody>
    </table>
    {{/if}}
  </section>
  {{/if}}

  {{#if resume.skillsFlatBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.skills}}</h2>
    <p class="ep-skills-flat">
      {{#each resume.skillsFlat}}<span class="ep-skill-item">{{this}}</span>{{/each}}
    </p>
  </section>
  {{/if}}

  {{#if resume.projectsBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.projects}}</h2>
    {{#each resume.projects}}
    <div class="ep-entry">
      <div class="ep-entry-period">{{dateLocationLine}}</div>
      <div class="ep-entry-heading">{{name}}</div>
      {{#if description}}<p class="ep-entry-body">{{{description}}}</p>{{/if}}
      {{#if boolHighlights}}
      <ul class="ep-highlights">
        {{#each highlights}}<li>{{this}}</li>{{/each}}
      </ul>
      {{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.publicationsBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.publications}}</h2>
    {{#each resume.publications}}
    <div class="ep-entry">
      <div class="ep-entry-heading">{{name}}</div>
      {{#if summary}}<p class="ep-entry-body">{{{summary}}}</p>{{/if}}
      {{#if url}}<div class="ep-entry-meta"><a href="{{url}}">{{url}}</a></div>{{/if}}
      {{#if releaseDate}}<div class="ep-entry-meta">{{releaseDate}}</div>{{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.certificatesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.certificates}}</h2>
    {{#each resume.certificates}}
    <div class="ep-entry">
      <div class="ep-entry-heading">{{name}}</div>
      {{#if issuer}}<div class="ep-entry-meta">{{issuer}}</div>{{/if}}
      {{#if date}}<div class="ep-entry-meta">{{date}}</div>{{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.referencesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.references}}</h2>
    {{#each resume.references}}
    <div class="ep-entry ep-reference">
      <div class="ep-entry-heading">{{name}}</div>
      <p class="ep-entry-body">{{reference}}</p>
    </div>
    {{/each}}
  </section>
  {{/if}}
</body>
</html>`;
