#!/usr/bin/env node
/**
 * parity-check.mjs - compare a translated story file or dictionary with its English original, without a build
 *
 * Usage:  node scripts/parity-check.mjs <english-file> <translated-file>
 *   e.g.  node scripts/parity-check.mjs src/data/stories/de.ts src/data/stories/de/de.ts
 *         node scripts/parity-check.mjs src/i18n/dictionaries/en.ts src/i18n/dictionaries/de.ts
 *
 * Prints one line per problem ("problem: <key path>: <what is wrong>") and one per warning ("warning: ..."), then a summary on
 * stderr. Exit 0 when there is no problem (warnings do not fail), 1 on any problem, 2 on bad use or a file that cannot be
 * read. The checks are src/i18n/parity.ts, the same ones the build runs; its header comment says what they are and what the
 * hash format is. A path with /dictionaries/ in it is compared as a dictionary (its export is named for its language).
 *
 * Needs a Node that runs .ts files (Node 22.18 or later, 25 here), like the tests.
 */
import { existsSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// The site writes imports without the .ts ending (a placeholder dictionary imports './en'); this adds it.
const hooks = `
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export async function resolve(specifier, context, next) {
  if (/^\\.\\.?\\//.test(specifier) && !/\\.[a-z]+$/i.test(specifier) && context.parentURL) {
    const url = new URL(specifier + '.ts', context.parentURL);
    if (existsSync(fileURLToPath(url))) return next(url.href, context);
  }
  return next(specifier, context);
}
`;
register(`data:text/javascript,${encodeURIComponent(hooks)}`);

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node scripts/parity-check.mjs <english-file> <translated-file>');
  process.exit(2);
}
const [englishFile, translatedFile] = args.map((a) => path.resolve(a));
for (const f of [englishFile, translatedFile]) {
  if (!existsSync(f)) {
    console.error(`File not found: ${f}`);
    process.exit(2);
  }
}

const { compareModules } = await import(new URL('../src/i18n/parity.ts', import.meta.url).href);
const english = await import(pathToFileURL(englishFile).href);
const translated = await import(pathToFileURL(translatedFile).href);
const dictionary = englishFile.split(path.sep).includes('dictionaries');

let result;
try {
  result = compareModules(english, translated, { dictionary });
} catch (err) {
  console.error(err.message);
  process.exit(2);
}
for (const p of result.problems) console.log(`problem: ${p}`);
for (const w of result.warnings) console.log(`warning: ${w}`);
console.error(`${result.problems.length} problem(s), ${result.warnings.length} warning(s)`);
process.exit(result.problems.length ? 1 : 0);
