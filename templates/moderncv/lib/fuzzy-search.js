/**
 * Lightweight fuzzy search: accent-normalized substring, ordered subsequence,
 * and limited edit distance on sliding windows. No dependencies.
 */

const ACCENT_GROUPS = {
  a: 'aàáâãäå',
  e: 'eèéêë',
  i: 'iìíîï',
  o: 'oòóôõö',
  u: 'uùúûü',
  c: 'cç',
  n: 'nñ',
  y: 'yýÿ',
  s: 'sśşš',
};

const DEFAULT_THRESHOLD = 0.55;
const MIN_FUZZY_LEN = 2;

export function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function escapeRegex(ch) {
  return /[\\^$.*+?()[\]{}|]/.test(ch) ? `\\${ch}` : ch;
}

function accentPattern(ch) {
  const lower = ch.toLowerCase();
  const group = ACCENT_GROUPS[lower];
  if (group) return `[${group}${group.toUpperCase()}]`;
  if (ch === lower) return `[${lower}${ch.toUpperCase()}]`;
  return escapeRegex(ch);
}

/** Accent-insensitive RegExp for exact highlighting (capture group). */
export function highlightRegex(query) {
  const parts = normalize(query).split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  const body = parts
    .map((word) => word.split('').map(accentPattern).join(''))
    .join('\\s+');
  return new RegExp(`(${body})`, 'gi');
}

function buildNormMap(original) {
  const normChars = [];
  const origIndices = [];
  for (let i = 0; i < original.length; i += 1) {
    const folded = normalize(original[i]);
    for (let j = 0; j < folded.length; j += 1) {
      normChars.push(folded[j]);
      origIndices.push(i);
    }
  }
  return { norm: normChars.join(''), origIndices };
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length];
}

function subsequenceScore(token, haystack) {
  let qi = 0;
  let first = -1;
  let last = -1;
  let gaps = 0;
  let prev = -1;
  for (let i = 0; i < haystack.length && qi < token.length; i += 1) {
    if (haystack[i] === token[qi]) {
      if (qi === 0) first = i;
      if (prev >= 0) gaps += i - prev - 1;
      prev = i;
      last = i;
      qi += 1;
    }
  }
  if (qi < token.length) return 0;
  const span = last - first + 1;
  const density = token.length / span;
  const gapRatio = gaps / Math.max(haystack.length, 1);
  return density * (1 - gapRatio * 0.35);
}

function typoScore(token, haystack) {
  const len = token.length;
  if (len < 4) return 0;
  const maxDist = len >= 8 ? 2 : 1;
  let best = 0;
  for (let size = len - 1; size <= len + 1; size += 1) {
    if (size < 1) continue;
    for (let i = 0; i <= haystack.length - size; i += 1) {
      const window = haystack.slice(i, i + size);
      const dist = levenshtein(token, window);
      if (dist <= maxDist) {
        const s = 1 - dist / (maxDist + 1);
        if (s > best) best = s;
      }
    }
  }
  return best * 0.9;
}

function tokenScore(token, haystack) {
  if (!token) return 1;
  if (haystack.includes(token)) return 1;
  const sub = subsequenceScore(token, haystack);
  if (sub >= 0.72) return sub;
  const typo = typoScore(token, haystack);
  return Math.max(sub, typo);
}

function bestTokenScore(token, haystack, normHaystack) {
  let best = tokenScore(token, normHaystack);
  for (const match of haystack.matchAll(wordPattern())) {
    best = Math.max(best, tokenScore(token, normalize(match[0])));
  }
  return best;
}

/** Score in [0, 1]; 0 means no match. */
export function score(query, haystack) {
  const q = normalize(query).trim();
  if (!q) return 1;
  const h = normalize(haystack);
  if (!h) return 0;
  if (h.includes(q)) return 1;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return 1;
  let total = 0;
  for (const token of tokens) {
    const s = bestTokenScore(token, haystack, h);
    if (s <= 0) return 0;
    total += s;
  }
  return total / tokens.length;
}

export function matches(query, haystack, options = {}) {
  const q = normalize(query).trim();
  if (!q) return true;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  if (q.length < (options.minLength ?? MIN_FUZZY_LEN)) {
    return normalize(haystack).includes(q);
  }
  return score(query, haystack) >= threshold;
}

function minimalSubsequenceSpan(norm, token) {
  if (!token.length) return null;
  let start = -1;
  let qi = 0;
  for (let i = 0; i < norm.length && qi < token.length; i += 1) {
    if (norm[i] !== token[qi]) continue;
    if (qi === 0) start = i;
    qi += 1;
  }
  if (qi < token.length) return null;
  let end = start;
  qi = token.length - 1;
  for (let i = norm.length - 1; i >= start; i -= 1) {
    if (norm[i] !== token[qi]) continue;
    end = i + 1;
    qi -= 1;
    if (qi < 0) break;
  }
  return { start, end };
}

function typoSpan(norm, origIndices, token) {
  const len = token.length;
  if (len < 4) return null;
  const maxDist = len >= 8 ? 2 : 1;
  let best = null;
  let bestDist = maxDist + 1;
  for (let size = len - 1; size <= len + 1; size += 1) {
    if (size < 1) continue;
    for (let i = 0; i <= norm.length - size; i += 1) {
      const window = norm.slice(i, i + size);
      const dist = levenshtein(token, window);
      if (dist <= maxDist && dist < bestDist) {
        bestDist = dist;
        best = { start: i, end: i + size };
      }
    }
  }
  if (!best) return null;
  return {
    start: origIndices[best.start],
    end: origIndices[best.end - 1] + 1,
  };
}

function wordPattern() {
  return /[\p{L}\p{N}][\p{L}\p{N}+.#-]*/gu;
}

function normSpanToOrig(origIndices, span) {
  return {
    start: origIndices[span.start],
    end: origIndices[span.end - 1] + 1,
  };
}

function bestWordSpan(original, token) {
  const re = wordPattern();
  let best = null;
  let bestScore = 0;
  for (const match of original.matchAll(re)) {
    const word = match[0];
    const s = tokenScore(token, normalize(word));
    if (s > bestScore) {
      bestScore = s;
      best = { start: match.index, end: match.index + word.length };
    }
  }
  return bestScore > 0 ? best : null;
}

function tokenHighlightSpan(original, norm, origIndices, token) {
  if (!token) return null;
  const wordHit = bestWordSpan(original, token);
  if (wordHit && tokenScore(token, normalize(original.slice(wordHit.start, wordHit.end))) >= 0.55) {
    return wordHit;
  }
  if (norm.includes(token)) {
    const idx = norm.indexOf(token);
    return normSpanToOrig(origIndices, { start: idx, end: idx + token.length });
  }
  const sub = minimalSubsequenceSpan(norm, token);
  if (sub && sub.end - sub.start <= token.length * 2) {
    return normSpanToOrig(origIndices, sub);
  }
  const typo = typoSpan(norm, origIndices, token);
  if (typo) return typo;
  return wordHit;
}

function spansFromRegex(original, regex) {
  const spans = [];
  let match;
  regex.lastIndex = 0;
  while ((match = regex.exec(original)) !== null) {
    spans.push({ start: match.index, end: match.index + match[0].length });
    if (match[0].length === 0) regex.lastIndex += 1;
  }
  return spans;
}

function mergeSpans(spans) {
  if (!spans.length) return [];
  const sorted = spans.slice().sort((a, b) => a.start - b.start);
  const out = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const last = out[out.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end + 1) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push(cur);
    }
  }
  return out;
}

/** Character offsets in original text for <mark> wrapping. */
export function findHighlightSpans(original, query) {
  const q = normalize(query).trim();
  if (!q || !original) return [];
  const { norm, origIndices } = buildNormMap(original);
  if (norm.includes(q)) {
    const regex = highlightRegex(q);
    if (regex) return spansFromRegex(original, regex);
  }
  const tokens = q.split(/\s+/).filter(Boolean);
  const spans = [];
  for (const token of tokens) {
    const span = tokenHighlightSpan(original, norm, origIndices, token);
    if (span) spans.push(span);
  }
  return mergeSpans(spans);
}
