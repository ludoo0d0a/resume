import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function resolveResumeCli() {
  if (process.env.RESUME_CLI) return process.env.RESUME_CLI;
  try {
    execSync('command -v resume', { stdio: 'ignore' });
    return 'resume';
  } catch {
    return 'npx --yes resume-cli';
  }
}

/**
 * @param {string} projectRoot
 * @param {{ resumePath: string, outputPath: string, format: 'html'|'pdf', theme: string }} options
 */
function exportWithResumeCli(projectRoot, options) {
  const resumePath = path.resolve(options.resumePath);
  const outputPath = path.resolve(options.outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const cmd = [
    resolveResumeCli(),
    'export',
    outputPath,
    '--format',
    options.format,
    '--theme',
    options.theme,
    '--resume',
    resumePath,
  ].join(' ');

  execSync(cmd, { stdio: 'inherit', cwd: projectRoot, shell: true });
}

export { resolveResumeCli, exportWithResumeCli };
