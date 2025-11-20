#!/usr/bin/env node

/**
 * Oppdaterer versjonsstrengen brukt av service worker og data-cache.
 * Kjør manuelt ved behov: `node scripts/update-version.js` eller med egen versjon `node scripts/update-version.js 2024-09-01+abc123`.
 * Standard versjon inkluderer sekunder: YYYY-MM-DD+HHMMSS-<hash> (for enklere dev-bump).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function formatVersion(input) {
  if (input && typeof input === 'string' && input.trim()) {
    return input.trim();
  }
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  let hash = 'local';
  try {
    hash = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (e) {
    // Ignorer hvis vi ikke er i et git-repo
  }
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}+${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${hash}`;
}

function replaceInFile(filePath, regex, replacement) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (!regex.test(source)) {
    throw new Error(`Fant ikke mønster i ${filePath}`);
  }
  const updated = source.replace(regex, replacement);
  fs.writeFileSync(filePath, updated, 'utf8');
}

const repoRoot = path.resolve(__dirname, '..');
const version = formatVersion(process.argv[2]);

const versionFile = path.join(repoRoot, 'assets/js/version.js');
const swFile = path.join(repoRoot, 'service-worker.js');

try {
  replaceInFile(versionFile, /export const APP_VERSION = '[^']+';/, `export const APP_VERSION = '${version}';`);
  replaceInFile(swFile, /const CACHE_VERSION = '[^']+';/, `const CACHE_VERSION = '${version}';`);
  console.log(`Oppdatert versjon til ${version}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
