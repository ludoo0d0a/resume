import fs from 'fs';
import path from 'path';
import { jsonResumeToEuropassXml } from './europass-xml.js';
import { fetchPhotoFromUrl } from './europass-photo.js';
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

/** Named output bundles (expand to --target values). */
const BUILD_PRESETS = {
  site: {
    targets: ['html', 'pdf'],
  },
  europass: {
    targets: ['europass-xml', 'europass-html', 'europass-pdf'],
  },
  'europass-xml': {
    targets: ['europass-xml'],
    validate: true,
  },
  public: {
    targets: ['html', 'pdf', 'europass-xml', 'europass-html', 'europass-pdf'],
    validate: true,
  },
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
  const { render } = await import('../../index.js');
  return render;
}

async function resolveEuropassPhotoData(resume, options = {}) {
  if (options.photoData !== undefined) return options.photoData;
  if (options.fetchPhoto === false) return null;
  const url = resume.basics && resume.basics.image;
  if (!url) return null;
  const photoData = await fetchPhotoFromUrl(url, options);
  if (!photoData) {
    console.warn(`Europass photo: could not fetch ${url}`);
  }
  return photoData;
}

async function buildEuropassXml(resume, paths, options = {}) {
  const photoData = await resolveEuropassPhotoData(resume, options);
  return jsonResumeToEuropassXml(resume, {
    language: paths.lang,
    locale: paths.locale,
    xmlLocale: paths.xmlLocale,
    photoData,
    signatureData: options.signatureData,
    printingPreferences: options.printingPreferences,
    printingFields: options.printingFields,
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
  const europassXml = xml || (await buildEuropassXml(resume, paths, options));

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

  exportPdf(root, resumePath, outputPath, './templates/europass');
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
    writeFile(path.join(root, paths.indexHtml), html);
    console.log(`Wrote theme HTML (${lang}): ${paths.indexHtml}`);
  }

  if (targets.has('europass-xml')) {
    europassXml = await buildEuropassXml(resume, paths, options);
    writeFile(path.join(root, paths.europassXml), europassXml);
    console.log(`Wrote Europass XML (${lang}): ${paths.europassXml}`);
  }

  if (targets.has('pdf')) {
    const pdfPath = path.join(root, paths.pdf);
    exportPdf(root, resumePath, pdfPath, '.');
    console.log(`Wrote PDF (${lang}): ${paths.pdf}`);
    const sitePdf = path.join(root, paths.sitePdf);
    ensureParentDir(sitePdf);
    fs.copyFileSync(pdfPath, sitePdf);
    console.log(`Copied PDF (${lang}): ${paths.sitePdf}`);
  }

  if (targets.has('europass-html')) {
    exportWithResumeCli(root, {
      resumePath,
      outputPath: path.join(root, paths.europassHtml),
      format: 'html',
      theme: './templates/europass',
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

  if (targets.has('html') && langs.includes('en')) {
    const paths = pathsForLang('en');
    fs.copyFileSync(
      path.join(root, paths.indexHtml),
      path.join(root, paths.homepage),
    );
    console.log(`Wrote ${paths.homepage} from ${paths.indexHtml}`);
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

function normalizePreset(value) {
  const key = String(value).trim().toLowerCase();
  if (key === 'europassxml') return 'europass-xml';
  if (!BUILD_PRESETS[key]) {
    throw new Error(`Unknown preset "${value}". Use: ${Object.keys(BUILD_PRESETS).join(', ')}`);
  }
  return key;
}

function applyPreset(options) {
  const preset = BUILD_PRESETS[options.preset];
  for (const target of preset.targets) {
    options.targets.add(target);
  }
  if (preset.validate) {
    options.validate = true;
  }
}

function parseBuildArgs(argv) {
  const options = {
    langs: [],
    targets: new Set(),
    preset: null,
    validate: false,
    withPdf: false,
    useApi: process.env.EUROPASS_USE_API === '1',
    restUrl: process.env.EUROPASS_REST_URL || DEFAULT_REST_URL,
    help: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--lang' || arg === '--locale') && argv[i + 1]) {
      options.langs.push(argv[++i]);
    } else if ((arg === '--preset' || arg === '--mode') && argv[i + 1]) {
      options.preset = normalizePreset(argv[++i]);
    } else if (arg === '--target' && argv[i + 1]) {
      options.targets.add(normalizeTarget(argv[++i]));
    } else if (arg === '--validate') {
      options.validate = true;
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

  if (options.preset) {
    applyPreset(options);
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
  BUILD_PRESETS,
  loadResume,
  loadThemeRender,
  buildEuropassXml,
  buildForLang,
  buildAll,
  parseBuildArgs,
  resolveTargets,
};
