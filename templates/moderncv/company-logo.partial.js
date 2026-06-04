/** @type {string} Handlebars partial: small company logo from logoUrl */
export default `{{#if logoUrl}}<img class="company-logo{{#if className}} {{className}}{{/if}}" src="{{logoUrl}}" alt="" width="{{#if size}}{{size}}{{else}}32{{/if}}" height="{{#if size}}{{size}}{{else}}32{{/if}}" loading="lazy" decoding="async"/>{{/if}}`;
