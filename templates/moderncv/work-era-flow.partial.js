/** @type {string} Handlebars partial: employer era rows (used inside experience-flow) */
export default `
{{#each experience.groups}}
{{#if isYearMarker}}
<li class="timeline-flow__year" id="{{anchorId}}">
  <span class="timeline-flow__year-node" aria-hidden="true"></span>
  <span class="timeline-flow__year-label">{{year}}</span>
</li>
{{else}}
  {{#if isEra}}
  <li class="timeline-flow__item timeline-flow__item--era{{#if era.isCurrent}} timeline-flow__item--current{{/if}}" id="{{era.anchorId}}">
    <span class="timeline-flow__connector" aria-hidden="true"></span>
    <article class="timeline-flow__card work-era">
      <header class="timeline-flow__head work-era__head">
        <div class="timeline-flow__identity">
          {{> companyLogo logoUrl=era.employerLogo size=40 className="company-logo--era"}}
          <div>
          <h3 class="timeline-flow__title">
            {{#if era.employerUrl}}<a href="{{era.employerUrl}}" rel="noopener noreferrer">{{era.employer}}</a>{{else}}{{era.employer}}{{/if}}
          </h3>
          {{#if era.tagline}}<p class="work-era__tagline">{{era.tagline}}</p>{{/if}}
          {{#if era.location}}<p class="timeline-flow__meta">{{era.location}}</p>{{/if}}
          </div>
        </div>
        <div class="timeline-flow__dates">
          <time>{{era.dateRange}}</time>
          {{#if era.duration}}<span class="timeline-flow__duration">{{era.duration}}</span>{{/if}}
        </div>
      </header>
      {{#if era.boolSummary}}<p class="prose timeline-flow__text work-era__overview">{{{era.summary}}}</p>{{/if}}

      {{#if era.boolInternal}}
      <section class="work-era__section">
        <h4 class="work-era__section-title">{{../titles.eraInternal}}</h4>
        <ul class="work-era__roles">
          {{#each era.internal}}
          <li class="work-era__role">
            <div class="work-era__role-head">
              <span class="work-era__role-title">{{position}}</span>
              <time class="work-era__role-dates">{{dateRange}}</time>
            </div>
            {{#if summary}}<p class="prose work-era__role-text">{{{summary}}}</p>{{/if}}
            {{#if boolHighlights}}
            <ul class="tags tags--compact">
              {{#each highlights}}<li class="tags__item">{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </li>
          {{/each}}
        </ul>
      </section>
      {{/if}}

      {{#if era.boolMissions}}
      <section class="work-era__section">
        <h4 class="work-era__section-title">{{../titles.eraMissions}}</h4>
        <ul class="work-era__missions">
          {{#each era.missions}}
          <li class="work-era__mission">
            <details class="work-era__mission-details"{{#if isCurrent}} open{{/if}}>
              <summary class="work-era__mission-summary">
                {{> companyLogo logoUrl=clientLogo size=24 className="company-logo--mission"}}
                <time class="work-era__mission-dates">{{dateRange}}</time>
                <span class="work-era__mission-client">
                  {{#if clientUrl}}<a href="{{clientUrl}}" rel="noopener noreferrer">{{clientName}}</a>{{else}}{{clientName}}{{/if}}
                </span>
                <span class="work-era__mission-role">{{position}}</span>
              </summary>
              <div class="work-era__mission-body">
                {{#if location}}<p class="work-era__mission-loc">{{location}}</p>{{/if}}
                {{#if summary}}<p class="prose work-era__mission-text">{{{summary}}}</p>{{/if}}
                {{#if boolHighlights}}
                <ul class="tags tags--compact">
                  {{#each highlights}}<li class="tags__item">{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
            </details>
          </li>
          {{/each}}
        </ul>
        {{#if era.boolHiddenMissions}}
        <details class="work-era__more">
          <summary class="work-era__more-summary">{{era.hiddenMissionsLabel}}</summary>
          <ul class="work-era__missions work-era__missions--collapsed">
            {{#each era.hiddenMissions}}
            <li class="work-era__mission">
              <details class="work-era__mission-details">
                <summary class="work-era__mission-summary">
                  {{> companyLogo logoUrl=clientLogo size=24 className="company-logo--mission"}}
                  <time class="work-era__mission-dates">{{dateRange}}</time>
                  <span class="work-era__mission-client">
                    {{#if clientUrl}}<a href="{{clientUrl}}" rel="noopener noreferrer">{{clientName}}</a>{{else}}{{clientName}}{{/if}}
                  </span>
                  <span class="work-era__mission-role">{{position}}</span>
                </summary>
                <div class="work-era__mission-body">
                  {{#if location}}<p class="work-era__mission-loc">{{location}}</p>{{/if}}
                  {{#if summary}}<p class="prose work-era__mission-text">{{{summary}}}</p>{{/if}}
                  {{#if boolHighlights}}
                  <ul class="tags tags--compact">
                    {{#each highlights}}<li class="tags__item">{{this}}</li>{{/each}}
                  </ul>
                  {{/if}}
                </div>
              </details>
            </li>
            {{/each}}
          </ul>
        </details>
        {{/if}}
      </section>
      {{/if}}
    </article>
  </li>
  {{else}}
  <li class="timeline-flow__item{{#if entry.isCurrent}} timeline-flow__item--current{{/if}}">
    <span class="timeline-flow__connector" aria-hidden="true"></span>
    <article class="timeline-flow__card">
      <header class="timeline-flow__head">
        <div class="timeline-flow__identity">
          {{> companyLogo logoUrl=entry.logoUrl size=36 className="company-logo--work"}}
          <div>
          {{#if entry.position}}
          <h3 class="timeline-flow__title">{{entry.position}}</h3>
          <p class="timeline-flow__meta">
            {{#if entry.url}}<a href="{{entry.url}}" rel="noopener noreferrer">{{entry.name}}</a>{{else}}{{entry.name}}{{/if}}
            {{#if entry.location}} · {{entry.location}}{{/if}}
          </p>
          {{else}}
          <h3 class="timeline-flow__title">{{entry.name}}</h3>
          {{/if}}
          </div>
        </div>
        {{#if entry.dateRange}}
        <div class="timeline-flow__dates">
          <time>{{entry.dateRange}}</time>
          {{#if entry.duration}}<span class="timeline-flow__duration">{{entry.duration}}</span>{{/if}}
        </div>
        {{/if}}
      </header>
      {{#if entry.summary}}<p class="prose timeline-flow__text">{{{entry.summary}}}</p>{{/if}}
      {{#if entry.boolHighlights}}
      <ul class="tags">
        {{#each entry.highlights}}<li class="tags__item">{{this}}</li>{{/each}}
      </ul>
      {{/if}}
    </article>
  </li>
  {{/if}}
{{/if}}
{{/each}}`;
