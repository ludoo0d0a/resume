import { faviconLogo } from '../../scripts/lib/company-logo.js';

const SVG_ATTRS =
  'class="hero__profile-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"';

/** @type {Record<string, string>} network key → domain for favicon logo */
const PROFILE_FAVICON_DOMAINS = {
  scorawatch: 'scorawatch.com',
};

/** @type {Record<string, string>} */
const PROFILE_SVG = {
  linkedin: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.042 2.042 0 01-2.063-2.065 2.042 2.042 0 012.063-2.063 2.043 2.043 0 012.064 2.063 2.042 2.042 0 01-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  github: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
  twitter: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  gitlab: `<svg ${SVG_ATTRS} fill="currentColor"><path d="m23.6 9.6-.034-.087L20.4 2.4a.8.8 0 00-1.49 0L16.434 9.5H7.566L5.09 2.4a.8.8 0 00-1.49 0L.434 9.513.4 9.6a.8.8 0 00-.29.885l3.4 10.4a.8.8 0 00.766.535h14.448a.8.8 0 00.766-.535l3.4-10.4a.8.8 0 00-.29-.885z"/></svg>`,
  stackoverflow: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644zm-3.865 3.46l-.905 1.94 9.027 4.212.904-1.94zm-1.85 4.17l-.44 2.093 9.56 2.015.44-2.092zM1.166 15.2V24h21.668V15.2z"/></svg>`,
  mastodon: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M21.258 3.99c1.116-1.467 2.01-2.756 2.01-4.99H18.86c0 1.662-.933 3.246-2.086 4.512C15.498 5.192 13.55 6 11.5 6S7.502 5.192 6.226 3.512C5.073 2.246 4.14.662 4.14-1H1.742c0 2.234.894 3.523 2.01 4.99C5.03 10.138 8.248 12 11.5 12s6.47-1.862 7.758-8.01zM11.5 14c-4.694 0-8.5 1.79-8.5 4v6h17v-6c0-2.21-3.806-4-8.5-4z"/></svg>`,
  youtube: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>`,
  facebook: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  instagram: `<svg ${SVG_ATTRS} fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  link: `<svg ${SVG_ATTRS} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
};

const NETWORK_ALIASES = {
  linkedin: 'linkedin',
  github: 'github',
  git: 'github',
  twitter: 'twitter',
  x: 'twitter',
  gitlab: 'gitlab',
  stackoverflow: 'stackoverflow',
  'stack overflow': 'stackoverflow',
  mastodon: 'mastodon',
  youtube: 'youtube',
  facebook: 'facebook',
  instagram: 'instagram',
  scorawatch: 'scorawatch',
};

export function normalizeProfileNetwork(network) {
  const key = String(network || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  return NETWORK_ALIASES[key] || key || 'link';
}

/**
 * @param {string} network
 * @param {string} [username]
 */
function faviconProfileIcon(domain) {
  const src = faviconLogo(domain);
  return `<img class="hero__profile-icon hero__profile-icon--img" src="${src}" width="20" height="20" alt="" aria-hidden="true" decoding="async" />`;
}

export function profileLinkIcon(network, username) {
  const iconKey = normalizeProfileNetwork(network);
  const faviconDomain = PROFILE_FAVICON_DOMAINS[iconKey];
  const iconSvg = faviconDomain
    ? faviconProfileIcon(faviconDomain)
    : PROFILE_SVG[iconKey] || PROFILE_SVG.link;
  const ariaLabel = username ? `${network} (${username})` : network;
  return { iconKey, iconSvg, ariaLabel };
}
