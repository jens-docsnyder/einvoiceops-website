#!/usr/bin/env node
/**
 * translation-import.mjs - read a filled translation sheet back into the translated story files and dictionary
 *
 * Usage:  node scripts/translation-import.mjs --locale <de|fr|pl> --sheet <csv> [--out-root <dir>]
 *   e.g.  node scripts/translation-import.mjs --locale de --sheet ~/packs/de/translation-de.csv
 *
 * Writes, under --out-root (default: the repository root):
 *   src/data/stories/<locale>/<same file name as the English>.ts   one per story file of the language's pack
 *   src/i18n/dictionaries/<locale>.ts                              the dictionary
 * Each file is the English object with only the translatable texts replaced by the sheet's Translation column: same keys,
 * order, fixed values (numbers, links, ids, switch dates, conditions) and date-switch and conditional structure. It also
 * carries `export const from`, the hash of the English text each translation came from (hashOf in src/i18n/parity.ts), so a
 * later edit of the English marks the translation stale. A translated story file does not repeat the English-only lists.
 * Which pages are in the pack is the registry's (see translation-export.mjs); the sheet must have exactly the rows the
 * export wrote.
 *
 * The sheet is refused, with every problem listed and the key named, when: the columns are not file, key, English,
 * Translation, Note; a row is dropped, repeated or not one of the pack's rows (unknown key); the English column is not the
 * current English (a stale sheet, or a program that rewrote a text); or a Translation cell is empty (there is no fallback to
 * English: to keep the English, write it in the cell). It then runs the parity gate (src/i18n/parity.ts, the same checks as
 * the build) on the result: an altered placeholder, tag, link or number, a changed switch, and so on exit 1 with every
 * problem printed. Files are written to a scratch folder first and moved into place only when the gate passes, so a refused
 * sheet leaves nothing behind. Warnings (a missing or stale hash) are printed and do not fail.
 *
 * A Note cell that holds "not sure" (the translator's question) is listed at the end; it does not fail anything.
 * After a real dictionary replaces the placeholder copy, take the language off the placeholders list in
 * src/i18n/dictionaries/index.ts. The language still builds only when its `ready` flag in src/i18n/registry.ts is true.
 *
 * Needs a Node that runs .ts files (Node 22.18 or later, 25 here), like the tests.
 */
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  COLUMNS, LANGUAGE_NAMES, LOCALES, ROOT, emitHashes, emitObject, loadModule, loadParity, packFor, parseCsv,
} from './translation-lib.mjs';

const USAGE = 'Usage: node scripts/translation-import.mjs --locale <de|fr|pl> --sheet <csv> [--out-root <dir>]';

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    if (!['--locale', '--sheet', '--out-root'].includes(flag) || argv[i + 1] === undefined) {
      console.error(`Unknown or incomplete option: ${flag}\n${USAGE}`);
      process.exit(2);
    }
    opts[flag.slice(2)] = argv[i + 1];
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!LOCALES.includes(opts.locale) || !opts.sheet) {
  console.error(USAGE);
  process.exit(2);
}
const locale = opts.locale;
const outRoot = path.resolve(opts['out-root'] || ROOT);
const sheetPath = path.resolve(opts.sheet);
if (!existsSync(sheetPath)) {
  console.error(`File not found: ${sheetPath}`);
  process.exit(2);
}

let stage = null;
const fail = (problems) => {
  if (stage) rmSync(stage, { recursive: true, force: true });
  for (const p of problems) console.log(`problem: ${p}`);
  console.error(`${problems.length} problem(s). Nothing was written.`);
  process.exit(1);
};

// 1. Read the sheet.
let table;
try {
  table = parseCsv(readFileSync(sheetPath, 'utf8'));
} catch (err) {
  fail([`sheet: ${err.message}`]);
}
const head = (table[0] || []).map((h) => h.trim());
if (head.length !== COLUMNS.length || head.some((h, i) => h !== COLUMNS[i])) {
  fail([`sheet: the columns must be ${COLUMNS.join(', ')} in this order, found ${head.join(', ') || 'nothing'}`]);
}
const nl = (s) => s.replace(/\r\n?/g, '\n');
const sheetRows = new Map();
const problems = [];
table.slice(1).forEach((r, i) => {
  if (r.length !== COLUMNS.length) {
    problems.push(`line ${i + 2}: ${r.length} columns, expected ${COLUMNS.length} (${r[0] || ''} ${r[1] || ''})`.trim());
    return;
  }
  const id = `${r[0]} ${r[1]}`;
  if (sheetRows.has(id)) problems.push(`${id}: the row is there more than once`);
  else sheetRows.set(id, { file: r[0], key: r[1], english: nl(r[2]), translation: nl(r[3]), note: r[4] });
});

// 2. Compare it with the pack of the language.
const units = await packFor(locale);
const expected = new Set();
for (const u of units) {
  for (const r of u.rows) {
    const id = `${u.file} ${r.key}`;
    expected.add(id);
    const row = sheetRows.get(id);
    if (!row) problems.push(`${id}: the row is missing (dropped from the sheet)`);
    else if (row.english !== nl(r.text)) problems.push(`${id}: the English in the sheet is not the current English (stale sheet, or a program rewrote the text)`);
    else if (row.translation.trim() === '') problems.push(`${id}: the Translation cell is empty`);
  }
}
for (const id of sheetRows.keys()) if (!expected.has(id)) problems.push(`${id}: not a row of the ${locale} pack (unknown key or an extra row)`);
if (problems.length) fail(problems);

// 3. Write the files into a scratch folder.
const parity = await loadParity();
stage = mkdtempSync(path.join(os.tmpdir(), 'translation-import-'));
try {
  const staged = [];
  for (const u of units) {
    const translations = Object.fromEntries(u.rows.map((r) => [r.key, sheetRows.get(`${u.file} ${r.key}`).translation]));
    const body = emitObject(u.object, translations, parity);
    const hashes = emitHashes(u.rows, parity.hashOf);
    const language = LANGUAGE_NAMES[locale];
    let text;
    if (u.kind === 'dictionary') {
      text = `// ${language} component text, written by scripts/translation-import.mjs from a filled translation sheet.\n` +
        `// The same keys as English (en.ts); \`from\` holds the hash of the English text each value was translated from.\n` +
        `import type { Dictionary } from './types';\n\n` +
        `export const ${locale}: Dictionary = ${body};\n\nexport const from = ${hashes};\n`;
    } else {
      text = `// ${language} copy of src/data/stories/${u.file}.ts, written by scripts/translation-import.mjs from a filled translation sheet.\n` +
        `// The same keys and structure as the English file; \`from\` holds the hash of the English text each value was translated from.\n` +
        `export const ${u.exportName} = ${body};\n\nexport const from = ${hashes};\n`;
    }
    const file = path.join(stage, u.relOut);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text, 'utf8');
    staged.push({ unit: u, file, text });
  }

  // 4. The parity gate on the written files, the same checks the build runs.
  const gateProblems = [];
  const warnings = [];
  for (const { unit, file } of staged) {
    let mod;
    try {
      mod = await loadModule(file);
    } catch (err) {
      gateProblems.push(`${unit.relOut}: the written file does not load: ${err.message}`);
      continue;
    }
    const r = parity.compareModules(unit.module, mod, { dictionary: unit.kind === 'dictionary' });
    gateProblems.push(...r.problems.map((p) => `${unit.relOut}: ${p}`));
    warnings.push(...r.warnings.map((w) => `${unit.relOut}: ${w}`));
  }
  for (const w of warnings) console.log(`warning: ${w}`);
  if (gateProblems.length) fail(gateProblems);

  // 5. Move them into place: copy beside the target first, then rename, so a failure part way leaves no half-written file.
  const temps = [];
  try {
    for (const { unit, file } of staged) {
      const target = path.join(outRoot, unit.relOut);
      mkdirSync(path.dirname(target), { recursive: true });
      const temp = `${target}.import-${process.pid}`;
      copyFileSync(file, temp);
      temps.push([temp, target]);
    }
  } catch (err) {
    for (const [temp] of temps) rmSync(temp, { force: true });
    throw err;
  }
  for (const [temp, target] of temps) renameSync(temp, target);
  for (const [, target] of temps) console.log(`wrote ${target}`);
  console.error(`Parity gate passed for ${staged.length} file(s), ${warnings.length} warning(s).`);

  const unsure = [...sheetRows.values()].filter((r) => /not sure/i.test(r.note));
  if (unsure.length) {
    console.error(`${unsure.length} row(s) with a "not sure" note, for the native speaker:`);
    for (const r of unsure) console.error(`  ${r.file} ${r.key}`);
  }
} finally {
  rmSync(stage, { recursive: true, force: true });
}
