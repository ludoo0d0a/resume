/**
 * Fetch a profile image from a URL for Europass <Photo> (base64 + MIME).
 */

const IMAGE_MIME = new Set(['image/jpeg', 'image/pjpeg', 'image/png', 'image/x-png']);
const DEFAULT_TIMEOUT_MS = 15_000;

function normalizeMimeType(contentType, buffer) {
  const raw = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (IMAGE_MIME.has(raw)) {
    return raw === 'image/pjpeg' ? 'image/jpeg' : raw === 'image/x-png' ? 'image/png' : raw;
  }
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
  }
  return null;
}

/**
 * @param {string} url
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ mimeType: string, base64: string } | null>}
 */
async function fetchPhotoFromUrl(url, options = {}) {
  const href = String(url || '').trim();
  if (!href || !/^https?:\/\//i.test(href)) return null;

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(href, {
      signal: controller.signal,
      headers: {
        Accept: 'image/*',
        'User-Agent': 'jsonresume-theme-ludoo-europass/1.0',
      },
      redirect: 'follow',
    });
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = normalizeMimeType(response.headers.get('content-type'), buffer);
    if (!mimeType || !buffer.length) return null;

    return { mimeType, base64: buffer.toString('base64') };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export { fetchPhotoFromUrl, normalizeMimeType };
