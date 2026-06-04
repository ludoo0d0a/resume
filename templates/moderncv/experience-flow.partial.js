/** @type {string} Handlebars partial: experience with optional work eras */
export default `
<div class="timeline-flow">
  {{#if experience.majorYears.length}}
  <nav class="timeline-rail" aria-label="{{experience.railLabel}}">
    <div class="timeline-rail__track" aria-hidden="true"></div>
    <ol class="timeline-rail__years">
      {{#each experience.majorYears}}
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
      {{> workEraFlow experience=experience titles=titles}}
    </ol>
  </div>
</div>`;
