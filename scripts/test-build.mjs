#!/usr/bin/env node
/**
 * test-build.mjs - build the site with a test language registry, for tests only
 *
 * Usage:  node scripts/test-build.mjs <path-to-test-registry.json> [--out <folder>]
 *   e.g.  node scripts/test-build.mjs tests/fixtures/registry-all-ready.json
 *
 * The test registry is a JSON file of the form {"ready": {"de": true, "fr": true, "pl": true}}. The build then makes the
 * pages of those languages, with the English text on each (identity copy), so the routing, the language selector and
 * the alternates can be checked from the built HTML.
 *
 * How the real build is kept out of this:
 *  - The registry module (src/i18n/registry.ts) reads a test file only when the variable I18N_TEST_REGISTRY is set.
 *    Only this script sets it, from the path given on the command line. Nothing in package.json, the workflows or the
 *    config sets it, and if it is set during `npm run build` the registry stops the build instead of reading it.
 *  - The output goes to its own folder (default .astro/i18n-test-dist/<name of the registry file>), never to dist/.
 *    The script refuses dist/ and any non-empty folder that it did not make itself (it leaves a marker file beside its own), and it passes the folder to
 *    astro as --outDir, so `npm run build` and the deploy never see it.
 *  - Without a path argument the script does nothing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
let out = '';
const outAt = args.indexOf('--out');
if (outAt !== -1) {
  out = args[outAt + 1] || '';
  args.splice(outAt, 2);
}
const registryArg = args[0];
if (!registryArg || args.length !== 1) {
  console.error('Usage: node scripts/test-build.mjs <path-to-test-registry.json> [--out <folder>]');
  process.exit(2);
}
const registry = path.resolve(registryArg);
if (!existsSync(registry)) {
  console.error(`Test registry not found: ${registry}`);
  process.exit(2);
}

const outDir = path.resolve(out || path.join(ROOT, '.astro', 'i18n-test-dist', path.basename(registry, '.json')));
const dist = path.join(ROOT, 'dist');
if (outDir === ROOT || outDir === dist || outDir.startsWith(dist + path.sep) || ROOT.startsWith(outDir + path.sep)) {
  console.error(`Refusing to build into ${outDir}: the test build never writes to dist/ or above the repository.`);
  process.exit(2);
}
// The marker sits beside the output folder, because astro empties the folder itself at the start of a build.
const marker = `${outDir}.made-by-test-build`;
if (existsSync(outDir) && readdirSync(outDir).length > 0 && !existsSync(marker)) {
  console.error(`Refusing to build into ${outDir}: it is not empty and was not made by this script.`);
  process.exit(2);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(marker, 'Made by scripts/test-build.mjs. A test build, never deployed.\n');

const astro = path.join(ROOT, 'node_modules', '.bin', 'astro');
const run = spawnSync(astro, ['build', '--outDir', outDir], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, I18N_TEST_REGISTRY: registry },
});
if (run.status !== 0) process.exit(run.status ?? 1);
console.log(`Test build written to ${outDir}`);
