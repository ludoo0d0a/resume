import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathsForLang } from './lang-paths.js';

const SCHEMA_REL = 'schemas/europass/v3.4.0/EuropassSchema.xsd';

function schemaPath(root) {
  return path.join(root, SCHEMA_REL);
}

function validateFile(xmlPath, schema) {
  execSync(`xmllint --noout --schema "${schema}" "${xmlPath}"`, {
    stdio: 'pipe',
    encoding: 'utf8',
  });
}

/**
 * @param {string} root Repo root
 * @param {string[]} langs Language codes
 * @returns {boolean} true if all files valid
 */
function validateEuropassXml(root, langs) {
  const schema = schemaPath(root);
  if (!fs.existsSync(schema)) {
    throw new Error(`Schema not found: ${schema}. Run: npm run xsd`);
  }

  let failed = false;
  for (const lang of langs) {
    const xmlPath = path.join(root, pathsForLang(lang).europassXml);
    if (!fs.existsSync(xmlPath)) {
      console.error(`Missing: ${xmlPath} (run: npm run build -- --preset europass-xml)`);
      failed = true;
      continue;
    }
    try {
      validateFile(xmlPath, schema);
      console.log(`Valid (${lang}): ${xmlPath}`);
    } catch (error) {
      failed = true;
      console.error(`Invalid (${lang}): ${xmlPath}`);
      console.error(error.stdout || error.message);
    }
  }

  return !failed;
}

export { SCHEMA_REL, schemaPath, validateEuropassXml };
