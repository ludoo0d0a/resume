/**
 * Pretty-print XML with consistent 2-space indentation.
 * @param {string} xml
 * @returns {string}
 */
function formatXml(xml) {
  const compact = String(xml).replace(/>\s+</g, '><').trim();
  let formatted = '';
  let pad = 0;
  const parts = compact.replace(/></g, '>\n<').split('\n');

  for (const raw of parts) {
    const line = raw.trim();
    if (!line) continue;

    if (/^<\/.+>/.test(line)) {
      pad = Math.max(pad - 1, 0);
    }

    formatted += `${'  '.repeat(pad)}${line}\n`;

    if (
      /^<[^!?/][^>]*[^/]>$/.test(line) &&
      !/^<.*\/>$/.test(line) &&
      !/^<\?/.test(line)
    ) {
      pad += 1;
    }
  }

  return `${formatted.trim()}\n`;
}

export { formatXml };
