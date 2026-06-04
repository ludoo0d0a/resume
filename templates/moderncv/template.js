export default `<!DOCTYPE html>
<html lang="{{resume.lang}}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{{resume.basics.name}} — CV</title>
  <style>{{{css}}}</style>
  <style media="print">{{{printcss}}}</style>
</head>
<body>
  <header class="site-header">
    <nav class="toolbar" aria-label="Resume actions">
      <div class="toolbar__inner">
        <div class="toolbar__lang" role="group" aria-label="Language">
          <a class="toolbar__lang-btn{{#if resume.ui.isEn}} is-active{{/if}}" href="index-en.html" hreflang="en" lang="en">EN</a>
          <a class="toolbar__lang-btn{{#if resume.ui.isFr}} is-active{{/if}}" href="index-fr.html" hreflang="fr" lang="fr">FR</a>
        </div>
        <div class="toolbar__actions">
          <a class="toolbar__btn toolbar__btn--ghost" href="{{resume.ui.europassPdf}}">{{resume.ui.europassLabel}}</a>
          <a class="toolbar__btn toolbar__btn--primary" href="{{resume.ui.pdf}}" download>{{resume.ui.downloadLabel}}</a>
        </div>
      </div>
    </nav>
    {{#if resume.navBool}}
    <nav class="section-nav" aria-label="{{resume.titles.nav}}">
      <div class="section-nav__inner">
        <span class="section-nav__label">{{resume.titles.nav}}</span>
        <ul class="section-nav__list">
          {{#each resume.nav}}
          <li class="section-nav__item">
            <a class="section-nav__link" href="#{{id}}">{{label}}</a>
          </li>
          {{/each}}
        </ul>
      </div>
    </nav>
    {{/if}}
  </header>

  <div class="page-layout">
  {{#if resume.navBool}}
  <aside class="section-nav section-nav--side" aria-label="{{resume.titles.nav}}">
    <p class="section-nav__label">{{resume.titles.nav}}</p>
    <ul class="section-nav__list section-nav__list--vertical">
      {{#each resume.nav}}
      <li class="section-nav__item">
        <a class="section-nav__link" href="#{{id}}">{{label}}</a>
      </li>
      {{/each}}
    </ul>
  </aside>
  {{/if}}
  <div class="page">
    <header class="hero">
      <div class="hero__main">
        {{#if resume.photoUrl}}
        <img class="hero__photo" src="{{resume.photoUrl}}" alt="" width="96" height="96"/>
        {{/if}}
        <div class="hero__identity">
          <h1 class="hero__name">{{resume.basics.name}}</h1>
          {{#if resume.basics.label}}<p class="hero__label">{{resume.basics.label}}</p>{{/if}}
          {{#if resume.contactBool}}
          <ul class="hero__contact">
            {{#if resume.basics.email}}<li><a href="mailto:{{resume.basics.email}}">{{resume.basics.email}}</a></li>{{/if}}
            {{#if resume.basics.phone}}<li><a href="tel:{{resume.basics.phone}}">{{resume.basics.phone}}</a></li>{{/if}}
            {{#if resume.basics.url}}<li><a href="{{resume.basics.url}}" rel="noopener noreferrer">{{resume.basics.url}}</a></li>{{/if}}
            {{#if resume.basics.locationLine}}<li>{{resume.basics.locationLine}}</li>{{/if}}
          </ul>
          {{/if}}
          {{#if resume.basics.profileLinks}}
          <ul class="hero__profiles">
            {{#each resume.basics.profileLinks}}
            <li><a href="{{url}}" rel="noopener noreferrer" data-network="{{icon}}">{{network}}{{#if username}} · {{username}}{{/if}}</a></li>
            {{/each}}
          </ul>
          {{/if}}
        </div>
      </div>
      {{#if resume.basics.summary}}
      <section class="hero__about" id="about">
        <h2 class="section-title">{{resume.titles.about}}</h2>
        <p class="prose">{{{resume.basics.summary}}}</p>
      </section>
      {{/if}}
    </header>

    <main class="content">
      {{#if resume.workBool}}
      <section class="section" id="experience">
        <h2 class="section-title">{{resume.titles.experience}}</h2>
        {{> timelineFlow timeline=resume.workTimeline}}
      </section>
      {{/if}}

      {{#if resume.educationBool}}
      <section class="section" id="education">
        <h2 class="section-title">{{resume.titles.education}}</h2>
        {{> timelineFlow timeline=resume.educationTimeline}}
      </section>
      {{/if}}

      {{#if resume.skillsBool}}
      <section class="section" id="skills">
        <h2 class="section-title">{{resume.titles.skills}}</h2>
        <div class="skills-grid">
          {{#each resume.skills}}
          <article class="skill-card">
            <header class="skill-card__head">
              <h3 class="skill-card__name">{{name}}</h3>
              {{#if level}}<span class="skill-card__level">{{level}}</span>{{/if}}
            </header>
            {{#if boolKeywords}}
            <ul class="tags tags--wrap">
              {{#each keywords}}<li class="tags__item">{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </article>
          {{/each}}
        </div>
      </section>
      {{/if}}

      {{#if resume.projectsBool}}
      <section class="section" id="projects">
        <h2 class="section-title">{{resume.titles.projects}}</h2>
        {{> timelineFlow timeline=resume.projectsTimeline}}
      </section>
      {{/if}}

      <div class="section-row">
        {{#if resume.languagesBool}}
        <section class="section section--compact" id="languages">
          <h2 class="section-title">{{resume.titles.languages}}</h2>
          <ul class="lang-list">
            {{#each resume.languages}}
            <li class="lang-list__item">
              <span class="lang-list__name">{{language}}</span>
              {{#if boolFluency}}<span class="lang-list__level">{{fluency}}</span>{{/if}}
            </li>
            {{/each}}
          </ul>
        </section>
        {{/if}}

        {{#if resume.interestsBool}}
        <section class="section section--compact" id="interests">
          <h2 class="section-title">{{resume.titles.interests}}</h2>
          <ul class="interest-list">
            {{#each resume.interests}}
            <li class="interest-list__item">
              <strong>{{name}}</strong>{{#if keywordsText}} — {{keywordsText}}{{/if}}
            </li>
            {{/each}}
          </ul>
        </section>
        {{/if}}
      </div>

      {{#if resume.publicationsBool}}
      <section class="section" id="publications">
        <h2 class="section-title">{{resume.titles.publications}}</h2>
        <ul class="card-list">
          {{#each resume.publications}}
          <li class="card-list__item">
            <h3 class="card-list__title">{{#if url}}<a href="{{url}}" rel="noopener noreferrer">{{name}}</a>{{else}}{{name}}{{/if}}</h3>
            {{#if releaseDate}}<p class="card-list__meta">{{releaseDate}}</p>{{/if}}
            {{#if summary}}<p class="prose">{{{summary}}}</p>{{/if}}
          </li>
          {{/each}}
        </ul>
      </section>
      {{/if}}

      {{#if resume.referencesBool}}
      <section class="section" id="references">
        <h2 class="section-title">{{resume.titles.references}}</h2>
        <div class="refs-grid">
          {{#each resume.references}}
          <blockquote class="ref-card">
            <p class="ref-card__quote">{{reference}}</p>
            <footer class="ref-card__author">— {{name}}</footer>
          </blockquote>
          {{/each}}
        </div>
      </section>
      {{/if}}
    </main>
  </div>
  </div>
</body>
</html>`;
