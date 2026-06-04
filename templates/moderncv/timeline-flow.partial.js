/** @type {string} Handlebars partial: fluid timeline with year rail */
export default `
<div class="timeline-flow">
  {{#if timeline.majorYears.length}}
  <nav class="timeline-rail" aria-label="{{timeline.railLabel}}">
    <div class="timeline-rail__track" aria-hidden="true"></div>
    <ol class="timeline-rail__years">
      {{#each timeline.majorYears}}
      <li class="timeline-rail__item">
        <a class="timeline-rail__chip" href="#{{anchorId}}">{{year}}</a>
      </li>
      {{/each}}
    </ol>
  </nav>
  {{/if}}
  <div class="timeline-flow__body">
    <div class="timeline-flow__spine" aria-hidden="true"></div>
    <ol class="timeline-flow__list">
      {{#each timeline.groups}}
      {{#if isYearMarker}}
      <li class="timeline-flow__year" id="{{anchorId}}">
        <span class="timeline-flow__year-node" aria-hidden="true"></span>
        <span class="timeline-flow__year-label">{{year}}</span>
      </li>
      {{else}}
      <li class="timeline-flow__item{{#if isCurrent}} timeline-flow__item--current{{/if}}">
        <span class="timeline-flow__connector" aria-hidden="true"></span>
        <article class="timeline-flow__card">
          <header class="timeline-flow__head">
            <div class="timeline-flow__identity">
              {{#if position}}{{> companyLogo logoUrl=logoUrl size=36 className="company-logo--work"}}{{/if}}
              <div>
              {{#if position}}
              <h3 class="timeline-flow__title">{{position}}</h3>
              <p class="timeline-flow__meta">
                {{#if url}}<a href="{{url}}" rel="noopener noreferrer">{{name}}</a>{{else}}{{name}}{{/if}}
                {{#if location}} · {{location}}{{/if}}
              </p>
              {{else}}
                {{#if institution}}
                <h3 class="timeline-flow__title">{{institution}}</h3>
                {{#if educationDetail}}<p class="timeline-flow__meta">{{educationDetail}}</p>{{/if}}
                {{else}}
                <h3 class="timeline-flow__title">{{name}}</h3>
                {{#if url}}<p class="timeline-flow__meta"><a href="{{url}}" rel="noopener noreferrer">{{url}}</a></p>{{/if}}
                {{/if}}
              {{/if}}
              </div>
            </div>
            {{#if dateRange}}
            <div class="timeline-flow__dates">
              <time>{{dateRange}}</time>
              {{#if duration}}<span class="timeline-flow__duration">{{duration}}</span>{{/if}}
            </div>
            {{/if}}
          </header>
          {{#if summary}}<p class="prose timeline-flow__text">{{{summary}}}</p>{{/if}}
          {{#if description}}<p class="prose timeline-flow__text">{{{description}}}</p>{{/if}}
          {{#if boolHighlights}}
          <ul class="tags">
            {{#each highlights}}<li class="tags__item">{{this}}</li>{{/each}}
          </ul>
          {{/if}}
        </article>
      </li>
      {{/if}}
      {{/each}}
    </ol>
  </div>
</div>`;
