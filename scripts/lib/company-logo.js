/**
 * Company logo URLs (Google favicon service) and domain resolution for employers/clients.
 */

const FAVICON_SZ = 64;

/** @type {Record<string, string>} normalized client label → registrable domain */
export const CLIENT_DOMAINS = {
  quaternove: 'quaternove.com',
  'banque internationale a luxembourg': 'bil.com',
  statec: 'statec.lu',
  'societe generale': 'societegenerale.com',
  'societe generale bank & trust': 'sgbdt.com',
  temenos: 'temenos.com',
  foyer: 'foyer.lu',
  fundsquare: 'fundsquare.lu',
  'luxembourg stock exchange': 'luxse.com',
  'bourse de luxembourg': 'luxse.com',
  'european parliament': 'europarl.europa.eu',
  'parlement europeen': 'europarl.europa.eu',
  'bnl - bibliotheque nationale du luxembourg': 'bnl.lu',
  'editus luxembourg': 'editus.lu',
  'european court of justice': 'curia.europa.eu',
  'cour de justice europeenne': 'curia.europa.eu',
};

/** @type {Record<string, string>} LinkedIn company slug → domain */
export const LINKEDIN_SLUG_DOMAINS = {
  'bil-luxembourg': 'bil.com',
  'societe-generale': 'societegenerale.com',
  temenos: 'temenos.com',
  'foyer-assurances': 'foyer.lu',
  fundsquare: 'fundsquare.lu',
  'luxembourg-stock-exchange': 'luxse.com',
  sfeir: 'sfeir.com',
  'sogeti-luxembourg': 'sogeti.com',
  sogeti: 'sogeti.com',
};

/** @type {Record<string, string>} normalized employer → domain */
export const EMPLOYER_DOMAINS = {
  sfeir: 'sfeir.com',
  'sogeti luxembourg': 'sogeti.com',
};

/** @type {Record<string, string>} domain → canonical company website */
export const WEBSITE_BY_DOMAIN = {
  'bil.com': 'https://www.bil.com',
  'statec.lu': 'https://www.statec.lu',
  'societegenerale.com': 'https://www.societegenerale.com',
  'sgbdt.com': 'https://www.sgbdt.com',
  'temenos.com': 'https://www.temenos.com',
  'foyer.lu': 'https://www.foyer.lu',
  'fundsquare.lu': 'https://www.fundsquare.lu',
  'luxse.com': 'https://www.luxse.com',
  'europarl.europa.eu': 'https://www.europarl.europa.eu',
  'bnl.lu': 'https://www.bnl.lu',
  'editus.lu': 'https://www.editus.lu',
  'curia.europa.eu': 'https://curia.europa.eu',
  'sfeir.com': 'https://www.sfeir.com',
  'sogeti.com': 'https://www.sogeti.com',
  'quaternove.com': 'https://www.quaternove.com',
  'thalesgroup.com': 'https://www.thalesgroup.com',
};

const SOCIAL_HOSTS = ['linkedin.com', 'facebook.com', 'twitter.com', 'x.com'];

/**
 * @param {string} [name]
 */
export function normalizeCompanyKey(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} domain
 */
export function faviconLogo(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${FAVICON_SZ}`;
}

/**
 * @param {string} [url]
 */
export function linkedinCompanySlug(url) {
  if (!url) return '';
  const match = String(url).match(/linkedin\.com\/company\/([^/?#]+)/i);
  return match ? match[1].toLowerCase() : '';
}

/**
 * @param {string} [url]
 */
function domainFromWebsiteUrl(url) {
  if (!url) return '';
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (SOCIAL_HOSTS.some((h) => host.includes(h))) return '';
    return host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * @param {string} [clientName]
 * @param {string} [linkUrl]
 */
export function domainForCompany(clientName, linkUrl) {
  const key = normalizeCompanyKey(clientName);
  if (key && CLIENT_DOMAINS[key]) return CLIENT_DOMAINS[key];

  const slug = linkedinCompanySlug(linkUrl);
  if (slug && LINKEDIN_SLUG_DOMAINS[slug]) return LINKEDIN_SLUG_DOMAINS[slug];

  return domainFromWebsiteUrl(linkUrl);
}

/**
 * @param {string} [employer]
 */
export function domainForEmployer(employer, employerWebsite) {
  const fromSite = domainFromWebsiteUrl(employerWebsite);
  if (fromSite) return fromSite;
  const key = normalizeCompanyKey(employer);
  return EMPLOYER_DOMAINS[key] || '';
}

/**
 * @param {string} domain
 */
export function websiteForDomain(domain) {
  return WEBSITE_BY_DOMAIN[domain] || (domain ? `https://www.${domain}` : '');
}

/**
 * True when linkUrl points at LinkedIn/social or at the ESN while the mission client is different.
 * @param {string} [linkUrl]
 * @param {string} [clientDomain]
 */
export function shouldReplaceClientUrl(linkUrl, clientDomain) {
  if (!clientDomain) return false;
  if (!linkUrl) return true;
  try {
    const host = new URL(linkUrl).hostname.toLowerCase();
    if (SOCIAL_HOSTS.some((h) => host.includes(h))) return true;
    const linkDomain = host.replace(/^www\./, '');
    if (
      (linkDomain === 'sogeti.com' || linkDomain.endsWith('.sogeti.com')) &&
      clientDomain !== 'sogeti.com'
    ) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

/**
 * Resolve a company logo image URL: explicit logo, mapped domain, or favicon from a direct site URL.
 * @param {string} [explicit]
 * @param {string} [linkUrl]
 * @param {string} [clientName]
 */
export function resolveCompanyLogo(explicit, linkUrl, companyName) {
  if (explicit) return explicit;
  const domain =
    domainForCompany(companyName, linkUrl) || domainForEmployer(companyName, linkUrl);
  if (domain) return faviconLogo(domain);
  return '';
}
