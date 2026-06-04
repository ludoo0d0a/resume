/** Inline SVG icons for mobile section nav (24×24, stroke). */
const SVG_ATTRS =
  'class="section-nav__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

const NAV_ICONS = {
  about: `<svg ${SVG_ATTRS}><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0112 0v1"/></svg>`,
  experience: `<svg ${SVG_ATTRS}><path d="M10 6V4h4v2"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 12h8M8 16h5"/></svg>`,
  education: `<svg ${SVG_ATTRS}><path d="M22 10l-10 5L2 10l10-5 10 5z"/><path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5"/></svg>`,
  skills: `<svg ${SVG_ATTRS}><path d="M14.7 6.3a4 4 0 105.4 5.4L12 20l-8.1-8.1a4 4 0 105.4-5.4L12 4l2.7 2.3z"/></svg>`,
  languages: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`,
  projects: `<svg ${SVG_ATTRS}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  publications: `<svg ${SVG_ATTRS}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  references: `<svg ${SVG_ATTRS}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  interests: `<svg ${SVG_ATTRS}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 7.78l-1.06 1.06-1.06-1.06a5.5 5.5 0 007.78-7.78l1.06-1.06 1.06 1.06z"/></svg>`,
};

export function navIcon(id) {
  return NAV_ICONS[id] || NAV_ICONS.about;
}
