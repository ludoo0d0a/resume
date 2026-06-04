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
    <div class="ep-header-top">
      <div class="ep-brand-block">
        <div class="ep-brand">EUROPASS</div>
        <div class="ep-subtitle">{{resume.titles.cv}}</div>
      </div>
      {{#if resume.photoUrl}}
      <img class="ep-photo" src="{{resume.photoUrl}}" alt=""/>
      {{/if}}
    </div>
    <div class="ep-identity">
      <div class="ep-name">{{resume.basics.name}}</div>
      {{#if resume.basics.label}}<div class="ep-label">{{resume.basics.label}}</div>{{/if}}
    </div>
  </header>

  {{#if resume.contactBool}}
  <section class="ep-section ep-contact">
    <h2 class="ep-section-title">{{resume.titles.personal}}</h2>
    <p class="ep-contact-line">
      {{#if resume.basics.email}}<span>{{resume.basics.email}}</span>{{/if}}
      {{#if resume.basics.phone}}<span>{{resume.basics.phone}}</span>{{/if}}
      {{#if resume.basics.url}}<span>{{resume.basics.url}}</span>{{/if}}
      {{#if resume.basics.locationLine}}<span>{{resume.basics.locationLine}}</span>{{/if}}
    </p>
    {{#if resume.basics.profileLinks}}
    <p class="ep-contact-line ep-profile-links">
      {{#each resume.basics.profileLinks}}
      <span><a href="{{url}}">{{network}}{{#if username}} — {{username}}{{/if}}</a></span>
      {{/each}}
    </p>
    {{/if}}
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
      {{#if boolSummary}}<p class="ep-entry-body">{{{summary}}}</p>{{/if}}
    </div>
    {{/each}}
  </section>
  {{/if}}

  {{#if resume.languagesBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.languages}}</h2>
    {{#if motherBool}}
    <h3 class="ep-subsection-title">{{resume.titles.motherTongue}}</h3>
    <ul class="ep-languages-list">
      {{#each mother}}<li><strong>{{language}}</strong></li>{{/each}}
    </ul>
    {{/if}}
    {{#if foreignBool}}
    <h3 class="ep-subsection-title">{{resume.titles.foreignLanguages}}</h3>
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
          {{#each cefColumns}}<th>{{label}}</th>{{/each}}
        </tr>
      </thead>
      <tbody>
        {{#each foreign}}
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

  {{#if resume.skillGroupsBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.skills}}</h2>
    {{#if resume.skillGroups.jobRelated.length}}
    <h3 class="ep-subsection-title">{{resume.titles.jobRelated}}</h3>
    <ul class="ep-skills-list">
      {{#each resume.skillGroups.jobRelated}}<li>{{this}}</li>{{/each}}
    </ul>
    {{/if}}
    {{#if resume.skillGroups.computer.length}}
    <h3 class="ep-subsection-title">{{resume.titles.skills}}</h3>
    <ul class="ep-skills-list">
      {{#each resume.skillGroups.computer}}<li>{{this}}</li>{{/each}}
    </ul>
    {{/if}}
    {{#if resume.skillGroups.communication.length}}
    <h3 class="ep-subsection-title">{{resume.titles.communication}}</h3>
    <p class="ep-skill-text">{{resume.skillGroups.communication}}</p>
    {{/if}}
    {{#if resume.skillGroups.organisational.length}}
    <h3 class="ep-subsection-title">{{resume.titles.organisational}}</h3>
    <p class="ep-skill-text">{{resume.skillGroups.organisational}}</p>
    {{/if}}
    {{#if resume.skillGroups.driving.length}}
    <h3 class="ep-subsection-title">{{resume.titles.driving}}</h3>
    <p class="ep-skill-text">{{resume.skillGroups.driving}}</p>
    {{/if}}
    {{#if resume.skillGroups.other.length}}
    <h3 class="ep-subsection-title">{{resume.titles.interests}}</h3>
    <ul class="ep-skills-list">
      {{#each resume.skillGroups.other}}<li>{{this}}</li>{{/each}}
    </ul>
    {{/if}}
  </section>
  {{/if}}

  {{#if resume.projectsBool}}
  <section class="ep-section">
    <h2 class="ep-section-title">{{resume.titles.projects}}</h2>
    {{#each resume.projects}}
    <div class="ep-entry">
      <div class="ep-entry-head">
        <div class="ep-entry-main">
          <div class="ep-entry-title">{{name}}</div>
          {{#if url}}<div class="ep-entry-meta"><a href="{{url}}">{{url}}</a></div>{{/if}}
        </div>
        <div class="ep-entry-dates">{{startDateText}} — {{endDateText}}</div>
      </div>
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
      <div class="ep-entry-title">{{name}}</div>
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
      <div class="ep-entry-title">{{name}}</div>
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
      <div class="ep-entry-title">{{name}}</div>
      <p class="ep-entry-body">{{reference}}</p>
    </div>
    {{/each}}
  </section>
  {{/if}}
</body>
</html>`;
