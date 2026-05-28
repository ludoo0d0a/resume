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
    <div class="ep-brand">EUROPASS</div>
    <div class="ep-subtitle">{{resume.titles.cv}}</div>
    <div class="ep-name">{{resume.basics.name}}</div>
    {{#if resume.basics.label}}<div class="ep-label">{{resume.basics.label}}</div>{{/if}}
  </header>

  {{#if resume.contactBool}}
  <section class="ep-section ep-contact">
    <h2 class="ep-section-title">{{resume.titles.personal}}</h2>
    {{#if resume.basics.email}}<p>{{resume.basics.email}}</p>{{/if}}
    {{#if resume.basics.phone}}<p>{{resume.basics.phone}}</p>{{/if}}
    {{#if resume.basics.url}}<p>{{resume.basics.url}}</p>{{/if}}
    {{#if resume.basics.locationLine}}<p>{{resume.basics.locationLine}}</p>{{/if}}
  </section>
  {{/if}}

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
      <div class="ep-entry-head">
        <div class="ep-entry-main">
          <div class="ep-entry-title">{{position}}</div>
          <div class="ep-entry-meta">{{name}}{{#if location}} · {{location}}{{/if}}</div>
        </div>
        <div class="ep-entry-dates">{{startDateText}} — {{endDateText}}</div>
      </div>
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
      <div class="ep-entry-head">
        <div class="ep-entry-main">
          <div class="ep-entry-title">{{institution}}</div>
          {{#if educationDetail}}<div class="ep-entry-meta">{{educationDetail}}</div>{{/if}}
        </div>
        <div class="ep-entry-dates">{{startDateText}} — {{endDateText}}</div>
      </div>
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.languagesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.languages}}</h2>
    <ul class="ep-languages-list">
      {{#each resume.languages}}
      <li><strong>{{language}}</strong>{{#if fluency}} — {{fluency}}{{/if}}</li>
      {{/each}}
    </ul>
  </section>
  {{/if}}

  {{#if resume.skillsBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.skills}}</h2>
    <ul class="ep-skills-list">
      {{#each resume.skills}}
      <li>{{name}}{{#if keywordsText}} ({{keywordsText}}){{else}}{{#if level}} ({{level}}){{/if}}{{/if}}</li>
      {{/each}}
    </ul>
  </section>
  {{/if}}

  {{#if resume.certificatesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.certificates}}</h2>
    {{#each resume.certificates}}
    <div class="ep-entry">
      <div class="ep-entry-title">{{name}}</div>
      {{#if issuer}}<div class="ep-entry-meta">{{issuer}}</div>{{/if}}
      {{#if date}}<div class="ep-entry-meta">{{date}}</div>{{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}
</body>
</html>`;
