import fs from 'fs';
import path from 'path';
import { render as themeRender } from '../../index.js';
import { jsonResumeToEuropassXml } from './europass-xml.js';
import { SUPPORTED_LANGS, pathsForLang, normalizeLang } from './lang-paths.js';
import { exportWithResumeCli } from './resume-cli.js';

const DEFAULT_REST_URL = 'https://europass.cedefop.europa.eu/rest/v1/document/to/pdf-cv';

const TARGET_ALIASES = {
  html: 'html',
  pdf: 'pdf',
  'europass-xml': 'europass-xml',
  europassxml: 'europass-xml',
  'europass-pdf': 'europass-pdf',
  europasspdf: 'europass-pdf',
  'europass-html': 'europass-html',
  europasshtml: 'europass-html',
};

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
}

function loadResume(root, lang) {
  const resumePath = path.join(root, pathsForLang(lang).resume);
  if (!fs.existsSync(resumePath)) {
    throw new Error(`Resume file not found: ${resumePath}`);
  }
  return {
    resume: JSON.parse(fs.readFileSync(resumePath, 'utf8')),
    resumePath,
  };
}

async function loadThemeRender() {
  return themeRender;
}

function buildEuropassXml(resume, paths) {
  return jsonResumeToEuropassXml(resume, {
    language: paths.lang,
    locale: paths.locale,
    xmlLocale: paths.xmlLocale,
  });
}

function exportPdf(root, resumePath, outputPath, theme) {
  exportWithResumeCli(root, {
    resumePath,
    outputPath,
    format: 'pdf',
    theme,
  });
  console.log(`Wrote PDF: ${path.resolve(outputPath)}`);
}

async function requestEuropassPdf(xml, lang, restUrl) {
  const url = new URL(restUrl);
  url.searchParams.set('locale', lang);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      Accept: 'application/pdf, application/octet-stream, */*',
    },
    body: xml,
    redirect: 'follow',
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const preview = buffer.toString('utf8', 0, Math.min(buffer.length, 300));
    throw new Error(`REST API ${response.status}: ${preview}`);
  }

  if (!contentType.includes('pdf') && buffer.slice(0, 4).toString() !== '%PDF') {
    const preview = buffer.toString('utf8', 0, Math.min(buffer.length, 300));
    throw new Error(`REST API did not return PDF (${contentType}): ${preview}`);
  }

  return buffer;
}

async function writeEuropassPdf(root, lang, resume, resumePath, xml, options = {}) {
  const paths = pathsForLang(lang);
  const outputPath = path.join(root, paths.europassPdf);
  const europassXml = xml || buildEuropassXml(resume, paths);

  if (!xml && options.writeXml !== false) {
    const xmlOutputPath = path.join(root, paths.europassXml);
    writeFile(xmlOutputPath, europassXml);
    console.log(`Wrote Europass XML (${lang}): ${paths.europassXml}`);
  }

  const restUrl = options.restUrl || DEFAULT_REST_URL;
  if (options.useApi) {
    try {
      const pdfBuffer = await requestEuropassPdf(europassXml, lang, restUrl);
      ensureParentDir(outputPath);
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log(`Wrote Europass PDF via REST API (${lang}): ${outputPath}`);
      return;
    } catch (error) {
      console.warn(`REST API unavailable, using local Europass theme: ${error.message}`);
    }
  }

  exportPdf(root, resumePath, outputPath, './europass');
  console.log(`Wrote Europass-styled PDF (${lang}): ${outputPath}`);
}

function resolveTargets(options) {
  if (options.targets.size > 0) {
    return options.targets;
  }
  const targets = new Set(['html', 'europass-xml']);
  if (options.withPdf) {
    targets.add('pdf');
    targets.add('europass-pdf');
  }
  return targets;
}

function readEuropassXmlIfExists(root, paths) {
  const xmlPath = path.join(root, paths.europassXml);
  return fs.existsSync(xmlPath) ? fs.readFileSync(xmlPath, 'utf8') : null;
}

async function buildForLang(root, lang, options = {}, render) {
  const paths = pathsForLang(lang);
  const { resume, resumePath } = loadResume(root, lang);
  const targets = resolveTargets(options);
  let europassXml = null;

  if (targets.has('html')) {
    const themeRender = render || (await loadThemeRender());
    const html = themeRender(resume);
    const indexHtml = path.join(root, `public/index-${lang}.html`);
    writeFile(indexHtml, html);
    console.log(`Wrote theme HTML (${lang}): ${path.relative(root, indexHtml)}`);
    writeFile(path.join(root, paths.html), html);
    console.log(`Wrote theme HTML (${lang}): ${paths.html}`);
  }

  if (targets.has('europass-xml')) {
    europassXml = buildEuropassXml(resume, paths);
    writeFile(path.join(root, paths.europassXml), europassXml);
    console.log(`Wrote Europass XML (${lang}): ${paths.europassXml}`);
  }

  if (targets.has('pdf')) {
    exportPdf(root, resumePath, path.join(root, paths.pdf), '.');
    console.log(`Wrote PDF (${lang}): ${paths.pdf}`);
  }

  if (targets.has('europass-html')) {
    exportWithResumeCli(root, {
      resumePath,
      outputPath: path.join(root, paths.europassHtml),
      format: 'html',
      theme: './europass',
    });
    console.log(`Wrote Europass HTML (${lang}): ${paths.europassHtml}`);
  }

  if (targets.has('europass-pdf')) {
    const xml = europassXml || readEuropassXmlIfExists(root, paths);
    await writeEuropassPdf(root, lang, resume, resumePath, xml, {
      ...options,
      writeXml: !xml && !europassXml,
    });
  }

  return { lang, paths, resume, resumePath, europassXml };
}

async function buildAll(root, options = {}) {
  const langs = options.langs || SUPPORTED_LANGS;
  const targets = resolveTargets(options);
  const needsRender = targets.has('html');
  const render = needsRender ? await loadThemeRender() : null;

  for (const lang of langs) {
    await buildForLang(root, lang, options, render);
  }
}

function normalizeTarget(value) {
  const key = String(value).trim().toLowerCase();
  const target = TARGET_ALIASES[key];
  if (!target) {
    throw new Error(
      `Unknown target "${value}". Use: ${[...new Set(Object.values(TARGET_ALIASES))].join(', ')}`,
    );
  }
  return target;
}

function parseBuildArgs(argv) {
  const options = {
    langs: [],
    targets: new Set(),
    withPdf: false,
    useApi: process.env.EUROPASS_USE_API === '1',
    restUrl: process.env.EUROPASS_REST_URL || DEFAULT_REST_URL,
    help: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--lang' || arg === '--locale') && argv[i + 1]) {
      options.langs.push(argv[++i]);
    } else if (arg === '--target' && argv[i + 1]) {
      options.targets.add(normalizeTarget(argv[++i]));
    } else if (arg === '--with-pdf') {
      options.withPdf = true;
    } else if (arg === '--use-api') {
      options.useApi = true;
    } else if (arg === '--rest-url' && argv[i + 1]) {
      options.restUrl = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  if (!options.langs.length) {
    options.langs = [...SUPPORTED_LANGS];
  }
  options.langs = options.langs.map(normalizeLang);

  return options;
}

export {
  DEFAULT_REST_URL,
  TARGET_ALIASES,
  loadResume,
  loadThemeRender,
  buildEuropassXml,
  buildForLang,
  buildAll,
  parseBuildArgs,
  resolveTargets,
};
