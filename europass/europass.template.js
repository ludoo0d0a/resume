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
    {{#resume.basics.label}}<div class="ep-label">{{resume.basics.label}}</div>{{/resume.basics.label}}
  </header>

  <section class="ep-section ep-contact">
    <h2 class="ep-section-title">{{resume.titles.personal}}</h2>
    {{#resume.basics.email}}<p>{{resume.basics.email}}</p>{{/resume.basics.email}}
    {{#resume.basics.phone}}<p>{{resume.basics.phone}}</p>{{/resume.basics.phone}}
    {{#resume.basics.url}}<p>{{resume.basics.url}}</p>{{/resume.basics.url}}
    {{#resume.basics.location}}
    <p>{{#city}}{{city}}{{#countryCode}}, {{/countryCode}}{{/city}}{{#countryCode}}{{countryCode}}{{/countryCode}}</p>
    {{/resume.basics.location}}
  </section>

  {{#resume.basics.summary}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.about}}</h2>
    <p class="ep-summary">{{{resume.basics.summary}}}</p>
  </section>
  {{/resume.basics.summary}}

  {{#resume.workBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.work}}</h2>
    {{#resume.work}}
    <div class="ep-entry">
      <div class="ep-entry-dates">{{startDateText}} — {{endDateText}}</div>
      <div class="ep-entry-title">{{position}}</div>
      <div class="ep-entry-meta">{{name}}{{#location}} · {{location}}{{/location}}</div>
      {{#summary}}<p>{{{summary}}}</p>{{/summary}}
      {{#boolHighlights}}
      <ul class="ep-highlights">
        {{#highlights}}<li>{{.}}</li>{{/highlights}}
      </ul>
      {{/boolHighlights}}
      <div class="ep-clear"></div>
    </div>
    {{/resume.work}}
  </section>
  {{/resume.workBool}}

  {{#resume.educationBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.education}}</h2>
    {{#resume.education}}
    <div class="ep-entry">
      <div class="ep-entry-dates">{{startDateText}} — {{endDateText}}</div>
      <div class="ep-entry-title">{{institution}}</div>
      <div class="ep-entry-meta">{{educationDetail}}</div>
      <div class="ep-clear"></div>
    </div>
    {{/resume.education}}
  </section>
  {{/resume.educationBool}}

  {{#resume.languagesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.languages}}</h2>
    <ul class="ep-languages-list">
      {{#resume.languages}}
      <li><strong>{{language}}</strong>{{#fluency}} — {{fluency}}{{/fluency}}</li>
      {{/resume.languages}}
    </ul>
  </section>
  {{/resume.languagesBool}}

  {{#resume.skillsBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.skills}}</h2>
    <ul class="ep-skills-list">
      {{#resume.skills}}
      <li>{{name}}{{#level}} ({{level}}){{/level}}</li>
      {{/resume.skills}}
    </ul>
  </section>
  {{/resume.skillsBool}}

  {{#resume.certificatesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.certificates}}</h2>
    {{#resume.certificates}}
    <div class="ep-entry">
      <div class="ep-entry-title">{{name}}</div>
      {{#issuer}}<div class="ep-entry-meta">{{issuer}}</div>{{/issuer}}
      {{#date}}<div class="ep-entry-meta">{{date}}</div>{{/date}}
    </div>
    {{/resume.certificates}}
  </section>
  {{/resume.certificatesBool}}
</body>
</html>`;
