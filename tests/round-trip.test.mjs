// Round trip tests for the translation export and import (scripts/translation-export.mjs, scripts/translation-import.mjs).
//
// Run:  GLOSSARY=/path/to/Multilingual glossary.md IP_PYTHON=/path/to/python-with-pyyaml npm test
// Every generated file lives in an OS temp folder made with mkdtemp. Nothing is written into the repository: the import is
// always called with --out-root. The sheet reader and writer below are this test's own, not the scripts' library.
// Banned terms are read from the glossary at run time and are never written in this file.
//
// Without GLOSSARY the glossary-note and banned-list checks are skipped. Without a Python that has PyYAML (IP_PYTHON) the
// content gate check is skipped.

import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { importTs } from './_lib/ts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GLOSSARY = process.env.GLOSSARY || '';
const PY = process.env.IP_PYTHON || 'python3';
const LOCALES = ['de', 'fr', 'pl'];
const REJECT_LOCALE = 'de';
const HEADER = ['file', 'key', 'English', 'Translation', 'Note'];

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'round-trip-test-'));
after(() => fs.rmSync(work, { recursive: true, force: true }));
let counter = 0;
const fresh = (name) => {
  const dir = path.join(work, `${name}-${counter++}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

// ---------------------------------------------------------------------------------------------------------------------------
// A small RFC 4180 reader and writer

function readCsv(text, delim = ',') {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\r' || c === '\n') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function writeCsv(rows, { delim = ',', eol = '\r\n', bom = true } = {}) {
  const q = (s) => (/["\r\n]/.test(s) || s.includes(delim) ? `"${s.replace(/"/g, '""')}"` : s);
  return (bom ? '﻿' : '') + rows.map((r) => r.map(q).join(delim)).join(eol) + eol;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Running the scripts

function run(script, args, extra = {}) {
  const r = spawnSync('node', [path.join('scripts', script), ...args], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...extra } });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}`, stdout: r.stdout, stderr: r.stderr };
}

const exportCache = new Map();
function exportSheet(locale, { delimiter = 'comma', glossary = true } = {}) {
  const keyName = `${locale}/${delimiter}/${glossary}`;
  if (exportCache.has(keyName)) return exportCache.get(keyName);
  const dir = fresh(`export-${locale}`);
  const args = ['--locale', locale, '--out', dir, '--delimiter', delimiter];
  if (glossary && GLOSSARY) args.push('--glossary', GLOSSARY);
  const r = run('translation-export.mjs', args);
  assert.equal(r.status, 0, `export ${locale} failed:\n${r.out}`);
  const delim = { comma: ',', semicolon: ';', tab: '\t' }[delimiter];
  const csvPath = path.join(dir, `translation-${locale}.csv`);
  const text = fs.readFileSync(csvPath, 'utf8');
  const table = readCsv(text, delim);
  const result = { dir, csvPath, text, table, header: table[0], rows: table.slice(1), brief: fs.readFileSync(path.join(dir, 'README-brief.md'), 'utf8'), delim };
  exportCache.set(keyName, result);
  return result;
}

function filled(rows) {
  return rows.map((r) => [r[0], r[1], r[2], r[2], r[4]]);
}

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else out.push(path.relative(dir, p));
    }
  };
  walk(dir);
  return out.sort();
}

function runImport(locale, sheetText) {
  const dir = fresh(`import-${locale}`);
  const sheet = path.join(dir, 'sheet.csv');
  fs.writeFileSync(sheet, sheetText);
  const outRoot = path.join(dir, 'out');
  fs.mkdirSync(outRoot);
  const r = run('translation-import.mjs', ['--locale', locale, '--sheet', sheet, '--out-root', outRoot]);
  return { ...r, outRoot, files: listFiles(outRoot) };
}

function hasEmphasisTag() {
  return exportSheet(REJECT_LOCALE).rows.some((r) => /<(strong|span)/.test(r[2]));
}

const sheetOf = (rows, opts) => writeCsv([HEADER, ...rows], opts);

// A copy of the filled rows with one change. `find` is a regex on the English cell (or a function); the change gets the row.
function pick(rows, find, label) {
  const test = typeof find === 'function' ? find : (r) => find.test(r[2]);
  const i = rows.findIndex(test);
  assert.notEqual(i, -1, `no row found for: ${label || find}`);
  return i;
}

function rejected(res, ...mentions) {
  assert.equal(res.status, 1, `expected exit 1, got ${res.status}:\n${res.out}`);
  for (const m of mentions) assert.ok(res.out.includes(m), `output should name "${m}":\n${res.out}`);
  assert.deepEqual(res.files, [], 'a refused sheet must leave no output file');
}

// ---------------------------------------------------------------------------------------------------------------------------
// Module comparison

const normal = (v) => {
  if (typeof v === 'function') return { __fn: v.toString() };
  if (Array.isArray(v)) return v.map(normal);
  if (v && typeof v === 'object') return Object.keys(v).map((k) => [k, normal(v[k])]);
  return v;
};

async function loadFile(file) {
  return importTs(`${pathToFileURL(file).href}?v=${counter++}`);
}

function copyExport(mod, ignore) {
  const names = Object.keys(mod).filter((n) => !ignore.test(n));
  assert.equal(names.length, 1, `expected one export with the copy, found ${names.join(', ')}`);
  return mod[names[0]];
}

const UNITS = {
  home: 'src/data/stories/home.ts',
  'home-contact': 'src/data/stories/home-contact.ts',
  'fr-standalone': 'src/data/stories/fr-standalone.ts',
  de: 'src/data/stories/de.ts',
  be: 'src/data/stories/be.ts',
};
const unitFiles = (unit, locale) =>
  unit === 'dictionary'
    ? { en: path.join(ROOT, 'src/i18n/dictionaries/en.ts'), out: `src/i18n/dictionaries/${locale}.ts` }
    : { en: path.join(ROOT, UNITS[unit]), out: `src/data/stories/${locale}/${path.basename(UNITS[unit])}` };

const sha12 = (s) => createHash('sha1').update(s, 'utf8').digest('hex').slice(0, 12);

// ---------------------------------------------------------------------------------------------------------------------------
// The glossary, read for this run

function glossaryTables(text) {
  const cellsOf = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const lines = text.split('\n');
  const banStart = lines.findIndex((l) => /^## The banned list/.test(l));
  const banEnd = lines.findIndex((l, i) => i > banStart && /^## /.test(l));
  const firstTable = [];
  for (let i = 0; i < banStart; i++) if (lines[i].startsWith('|')) firstTable.push(cellsOf(lines[i]));
  const banned = {};
  let section = '';
  for (let i = banStart; i < (banEnd === -1 ? lines.length : banEnd); i++) {
    const h = /^\*\*([^*]+)\*\*/.exec(lines[i]);
    if (h) section = h[1].replace(/\(.*\)/, '').trim();
    if (lines[i].startsWith('|') && !/^\|\s*(Banned|-)/.test(lines[i])) (banned[section] ||= []).push(cellsOf(lines[i])[0]);
  }
  return { firstTable, banned };
}

// Split at a separator outside brackets and quotes.
function splitTop(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === ',' || ch === ';')) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

const STOP = /^(any|as|the|and|used|outside|of a|in|ordinary)\b/i;
function bannedTermsOf(cell) {
  const terms = [];
  const add = (t) => {
    t = t.replace(/\(.*?\)/g, '').replace(/["“”]/g, '').replace(/\.\.\.$/, '').trim();
    if (t.length < 4 || /[\/*]/.test(t) || STOP.test(t) || /\band the like\b/.test(t)) return;
    terms.push(t);
  };
  for (const part of splitTop(cell)) add(part);
  // the lists inside brackets, for example the transaction codes
  for (const m of cell.matchAll(/\(([^()]*)\)/g)) if (/,/.test(m[1])) for (const p of m[1].split(',')) add(p);
  return terms;
}

const glossary = GLOSSARY && fs.existsSync(GLOSSARY) ? glossaryTables(fs.readFileSync(GLOSSARY, 'utf8')) : null;
// A cell that says "outside" the allowed line is a banned term with a stated exception, so it is left out of the plain check.
const allBanned = glossary
  ? [...new Set(Object.values(glossary.banned).flat().filter((c) => !/\boutside\b/.test(c)).flatMap(bannedTermsOf))]
  : [];

function contains(text, term) {
  const t = term.toLowerCase();
  const hay = text.toLowerCase();
  if (term.length >= 7) return hay.includes(t);
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}_])${esc}(?![\\p{L}\\p{N}_])`, 'u').test(hay);
}

// The English terms of the glossary's first table (parentheses removed), for the note check.
function englishGlossaryTerms() {
  if (!glossary) return [];
  const terms = [];
  for (const cells of glossary.firstTable.slice(2)) {
    if (!cells[0] || /^\*\*/.test(cells[0]) || !cells[1]) continue;
    for (const p of splitTop(cells[0])) {
      const t = p.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/"/g, '').trim();
      if (t.length >= 3) terms.push(t);
    }
  }
  return terms;
}

// ---------------------------------------------------------------------------------------------------------------------------
// 1. Identity round trip

for (const locale of LOCALES) {
  test(`identity round trip, ${locale}: the produced files equal the English ones and pass parity-check`, async () => {
    const ex = exportSheet(locale);
    assert.deepEqual(ex.header, HEADER);
    const res = runImport(locale, writeCsv([HEADER, ...filled(ex.rows)]));
    assert.equal(res.status, 0, res.out);
    assert.ok(res.files.length > 1);
    assert.ok(res.files.every((f) => !/\.import-\d+$/.test(f)), 'no half-written temp file left behind');

    const units = [...new Set(ex.rows.map((r) => r[0]))];
    const expectedFiles = units.map((u) => unitFiles(u, locale).out).sort();
    assert.deepEqual(res.files, expectedFiles);

    for (const unit of units) {
      const f = unitFiles(unit, locale);
      const made = path.join(res.outRoot, f.out);
      const en = await loadFile(f.en);
      const tr = await loadFile(made);
      const enCopy = copyExport(en, /^(from|[a-z]+(Bodies|BodyKeys))$/);
      const trCopy = copyExport(tr, /^from$/);
      assert.deepEqual(normal(trCopy), normal(enCopy), `${f.out} differs from the English`);
      assert.equal(JSON.stringify(normal(trCopy)), JSON.stringify(normal(enCopy)), `${f.out}: key order differs`);

      // the hashes: one per row of the unit, the hash of the English text
      const rowsOfUnit = ex.rows.filter((r) => r[0] === unit);
      assert.ok(tr.from, `${f.out} has no "from" hashes`);
      assert.deepEqual(Object.keys(tr.from).sort(), rowsOfUnit.map((r) => r[1]).sort(), `${f.out}: hashes are not one per row`);
      for (const r of rowsOfUnit) assert.equal(tr.from[r[1]], sha12(r[2]), `${f.out} ${r[1]}: wrong hash`);

      const pc = run('parity-check.mjs', [f.en, made]);
      assert.equal(pc.status, 0, `${f.out}: parity-check\n${pc.out}`);
      assert.match(pc.stderr, /\b0 problem\(s\), 0 warning\(s\)/, `${f.out}: ${pc.stderr}`);
    }
    console.log(`# ${locale}: ${ex.rows.length} rows, ${units.length} files round-tripped`);
  });
}

// ---------------------------------------------------------------------------------------------------------------------------
// 2. Rejections

const base = () => filled(exportSheet(REJECT_LOCALE).rows);
const importRows = (rows, locale = REJECT_LOCALE, opts) => runImport(locale, sheetOf(rows, opts));

test('altered placeholder: {since} renamed is refused with the key named', () => {
  const rows = base();
  const i = pick(rows, /\{since\}/, '{since} placeholder in the de pack');
  rows[i][3] = rows[i][3].replace('{since}', '{sinse}');
  rejected(importRows(rows), rows[i][1], rows[i][0]);
});

test('altered placeholder in the Polish pack too', () => {
  const rows = filled(exportSheet('pl').rows);
  const i = pick(rows, /\{[a-zA-Z@0-9-]+\}/, 'a placeholder in the pl pack');
  rows[i][3] = rows[i][3].replace(/\{([a-zA-Z@0-9-]+)\}/, '{x$1}');
  rejected(importRows(rows, 'pl'), rows[i][1]);
});

test('dropped row: refused, the key named as missing', () => {
  const rows = base();
  const [gone] = rows.splice(20, 1);
  rejected(importRows(rows), gone[1], 'missing');
});

test('extra row: refused, the key named', () => {
  const rows = base();
  rows.push([rows[0][0], 'zz.extra.key', 'An English text', 'A text', '']);
  rejected(importRows(rows), 'zz.extra.key');
});

test('unknown key: a renamed key is refused, the new key named', () => {
  const rows = base();
  rows[5][1] = 'bogus.unknown.key';
  rejected(importRows(rows), 'bogus.unknown.key');
});

test('changed English column (a stale sheet) is refused, the key named', () => {
  const rows = base();
  rows[7][2] = `${rows[7][2]} And more.`;
  rejected(importRows(rows), rows[7][1], 'English');
});

test('empty Translation cell is refused, the key named', () => {
  const rows = base();
  rows[9][3] = '';
  rejected(importRows(rows), rows[9][1], 'empty');
});

test('a typed number in a text without one is refused, the key named', () => {
  const rows = base();
  const i = pick(rows, (r) => !/\d/.test(r[2]) && r[2].length > 20 && !/[{<]/.test(r[2]), 'a plain text without digits');
  rows[i][3] = `${rows[i][3]} 27`;
  rejected(importRows(rows), rows[i][1]);
});

test('a changed number in a text that has one is refused, the key named', () => {
  const rows = base();
  const i = pick(rows, (r) => /\b\d{4}\b/.test(r[2]) && !/[{<]/.test(r[2]), 'a plain text with a year');
  rows[i][3] = rows[i][3].replace(/\b(\d{4})\b/, '1999');
  rejected(importRows(rows), rows[i][1]);
});

test('a dropped closing tag is refused, the key named', () => {
  const rows = base();
  const i = pick(rows, /<\/a>/, 'a row with a closing tag');
  rows[i][3] = rows[i][3].replace('</a>', '');
  rejected(importRows(rows), rows[i][1]);
});

test('a dropped opening tag (the whole link) is refused, the key named', () => {
  const rows = base();
  const i = pick(rows, /<a [^>]*>/, 'a row with a link');
  rows[i][3] = rows[i][3].replace(/<a [^>]*>/, '').replace('</a>', '');
  rejected(importRows(rows), rows[i][1]);
});

test('a dropped strong or span tag is refused, the key named', { skip: !hasEmphasisTag() }, () => {
  const rows = base();
  const i = pick(rows, /<(strong|span)/, 'a row with a strong or span tag');
  rows[i][3] = rows[i][3].replace(/<\/?(strong|span)[^>]*>/g, '');
  rejected(importRows(rows), rows[i][1]);
});

test('a changed link target is refused, the key named', () => {
  const rows = base();
  const i = pick(rows, /<a [^>]*href/, 'a row with a link');
  rows[i][3] = rows[i][3].replace(/href=(['"])[^'"]*\1/, "href='https://example.invalid/elsewhere/'");
  rejected(importRows(rows), rows[i][1]);
});

test('a row with the wrong file name is refused, key and file named', () => {
  const rows = base();
  const i = pick(rows, (r) => r[0] === 'de', 'a row of file de');
  const wrong = 'not-a-file';
  rows[i][0] = wrong;
  rejected(importRows(rows), rows[i][1], wrong);
});

test('a duplicated row is refused, the key named', () => {
  const rows = base();
  rows.splice(11, 0, [...rows[11]]);
  rejected(importRows(rows), rows[11][1], 'more than once');
});

test('wrong columns are refused', () => {
  const res = runImport(REJECT_LOCALE, writeCsv([['file', 'key', 'English', 'Text', 'Note'], ...base()]));
  rejected(res, 'columns');
});

test('a semicolon sheet works (made by the export, and re-saved by this test)', async () => {
  const ex = exportSheet('pl', { delimiter: 'semicolon' });
  assert.equal(ex.header.length, 5, 'the semicolon export must have five columns');
  const a = runImport('pl', writeCsv([HEADER, ...filled(ex.rows)], { delim: ';' }));
  assert.equal(a.status, 0, a.out);
  const plain = exportSheet('pl');
  const b = runImport('pl', writeCsv([HEADER, ...filled(plain.rows)], { delim: ';', eol: '\n', bom: false }));
  assert.equal(b.status, 0, b.out);
  assert.deepEqual(b.files, a.files);
  for (const f of a.files) assert.equal(fs.readFileSync(path.join(b.outRoot, f), 'utf8'), fs.readFileSync(path.join(a.outRoot, f), 'utf8'));
});

test('a tab sheet works (made by the export, and re-saved by this test)', () => {
  const ex = exportSheet('pl', { delimiter: 'tab' });
  assert.equal(ex.header.length, 5);
  const a = runImport('pl', writeCsv([HEADER, ...filled(ex.rows)], { delim: '\t' }));
  assert.equal(a.status, 0, a.out);
  const b = runImport('pl', writeCsv([HEADER, ...filled(exportSheet('pl').rows)], { delim: '\t', eol: '\n', bom: false }));
  assert.equal(b.status, 0, b.out);
});

test('a semicolon sheet with a dropped row is still refused, key named', () => {
  const rows = filled(exportSheet('pl').rows);
  const [gone] = rows.splice(3, 1);
  rejected(runImport('pl', sheetOf(rows, { delim: ';' })), gone[1]);
});

test('CRLF line endings with a byte order mark work; so do bare LF and no mark', () => {
  const rows = filled(exportSheet('pl').rows);
  for (const opts of [{ eol: '\r\n', bom: true }, { eol: '\n', bom: false }, { eol: '\r\n', bom: false }, { eol: '\n', bom: true }]) {
    const res = runImport('pl', sheetOf(rows, opts));
    assert.equal(res.status, 0, `${JSON.stringify(opts)}\n${res.out}`);
  }
});

test('a line break inside a cell, saved with CRLF by a spreadsheet, still matches the English', () => {
  // Excel writes a line break inside a cell as CRLF. No English text has one today, so this joins two sentences with one
  // in both columns and checks that LF in the English against CRLF in the sheet is not a mismatch.
  const ex = exportSheet('pl');
  const rows = filled(ex.rows);
  if (!rows.some((r) => r[2].includes('\n'))) return;
  const fix = rows.map((r) => [r[0], r[1], r[2].replace(/\n/g, '\r\n'), r[3].replace(/\n/g, '\r\n'), r[4]]);
  const res = runImport('pl', sheetOf(fix));
  assert.equal(res.status, 0, res.out);
});

test('a spreadsheet that rewrote a date-like English cell: refused as stale, and the message says what happened', () => {
  const rows = base();
  const i = pick(rows, (r) => /^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(r[2]), 'a row that is only a date such as "2 Sep 2026"');
  const original = rows[i][2];
  rows[i][2] = '02.09.2026';
  rows[i][3] = '02.09.2026';
  const res = importRows(rows);
  rejected(res, rows[i][1], rows[i][0]);
  const line = res.out.split('\n').find((l) => l.includes(rows[i][1])) || '';
  assert.match(line, /rewrote|rewritten/i, `message must say a program rewrote the text: ${line}`);
  assert.match(line, /English/, `message must mention the English column: ${line}`);
  console.log(`# date rewrite ("${original}" to "02.09.2026") message: ${line}`);
});

// ---------------------------------------------------------------------------------------------------------------------------
// 3. Export content

test('the sheet columns are exactly file,key,English,Translation,Note and the Translation column is empty', () => {
  for (const locale of LOCALES) {
    const ex = exportSheet(locale);
    assert.equal(ex.text.split('\r\n')[0].replace(/^﻿/, ''), 'file,key,English,Translation,Note');
    assert.deepEqual(ex.header, HEADER);
    assert.ok(ex.rows.every((r) => r.length === 5), `${locale}: a row without five columns`);
    assert.ok(ex.rows.every((r) => r[3] === ''), `${locale}: Translation must be empty`);
    assert.ok(ex.rows.every((r) => r[2].trim() !== ''), `${locale}: English must never be empty`);
    const ids = ex.rows.map((r) => `${r[0]} ${r[1]}`);
    assert.equal(new Set(ids).size, ids.length, `${locale}: duplicated row`);
  }
});

test('row counts per locale', () => {
  const counts = Object.fromEntries(LOCALES.map((l) => [l, exportSheet(l).rows.length]));
  console.log(`# row counts: ${JSON.stringify(counts)}`);
  assert.deepEqual(counts, { de: 150, fr: 280, pl: 61 });
});

test('every row of every pack is a real English text of its file', async () => {
  for (const locale of LOCALES) {
    const ex = exportSheet(locale);
    const leaves = new Map();
    for (const unit of new Set(ex.rows.map((r) => r[0]))) {
      const mod = await loadFile(unitFiles(unit, locale).en);
      const copy = copyExport(mod, /^[a-z]+(Bodies|BodyKeys)$/);
      const set = new Set();
      const walk = (v) => {
        if (typeof v === 'string') set.add(v.replace(/\r\n?/g, '\n'));
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') Object.values(v).forEach(walk);
      };
      walk(copy);
      leaves.set(unit, set);
    }
    for (const r of ex.rows) {
      // a date switch or conditional passage shows as two versions in one row; accept a row whose pieces are all leaves
      const set = leaves.get(r[0]);
      const ok = set.has(r[2]) || [...set].some((s) => r[2].includes(s)) || [...set].some((s) => s.includes(r[2]));
      assert.ok(ok, `${locale} ${r[0]} ${r[1]}: English is not a text of the English file`);
    }
  }
});

test('fixed values are not rows', () => {
  for (const locale of LOCALES) {
    for (const r of exportSheet(locale).rows) {
      const segs = r[1].split('.');
      assert.ok(!segs.includes('ifNone'), `${locale} ${r[0]} ${r[1]}: ifNone is fixed`);
      const parent = segs[segs.length - 2];
      assert.ok(parent !== 'grid' && parent !== 'person', `${locale} ${r[0]} ${r[1]}: grid and person values are fixed`);
      assert.ok(!/^[\d\s.,:\/-]+$/.test(r[2]), `${locale} ${r[0]} ${r[1]}: a bare number or date is fixed: ${r[2]}`);
      assert.ok(!/^(true|false)$/.test(r[2]), `${locale} ${r[0]} ${r[1]}: true or false is fixed`);
      assert.ok(!/^https?:\/\/\S+$/.test(r[2]), `${locale} ${r[0]} ${r[1]}: a bare link is fixed`);
    }
  }
});

test('the Note column is filled on every string with a placeholder, a tag or a link', () => {
  const missing = [];
  for (const locale of LOCALES) {
    for (const r of exportSheet(locale).rows) {
      const needs = [];
      if (/\{[^{}]*\}/.test(r[2])) needs.push('placeholder');
      if (/<\/?[a-zA-Z]/.test(r[2])) needs.push('tag');
      if (/href\s*=|https?:\/\//.test(r[2])) needs.push('link');
      if (needs.length && r[4].trim() === '') missing.push(`${locale} ${r[0]} ${r[1]} (${needs.join(', ')})`);
    }
  }
  assert.deepEqual(missing, [], `rows with no note:\n${missing.join('\n')}`);
});

test('the Note column is filled on every string with a glossary term', { skip: !glossary }, () => {
  const terms = englishGlossaryTerms();
  assert.ok(terms.length > 20, 'the glossary reading found too few English terms');
  const missing = [];
  for (const locale of LOCALES) {
    for (const r of exportSheet(locale).rows) {
      const hit = terms.find((t) => contains(r[2], t));
      if (hit && r[4].trim() === '') missing.push(`${locale} ${r[0]} ${r[1]} (glossary term "${hit}")`);
    }
  }
  assert.deepEqual(missing, [], `rows with no note:\n${missing.join('\n')}`);
});

test('the Note names the placeholders, the tags and the links to keep', () => {
  for (const locale of LOCALES) {
    for (const r of exportSheet(locale).rows) {
      for (const ph of r[2].match(/\{[^{}]*\}/g) || []) assert.ok(r[4].includes(ph.replace(/@.*\}$/, '')) || r[4].includes(ph), `${locale} ${r[0]} ${r[1]}: note does not mention ${ph}`);
    }
  }
});

test('with the glossary, a note carries the term of the sheet language; without it there is no word list', { skip: !GLOSSARY }, () => {
  const withG = exportSheet('de', { glossary: true });
  const noG = exportSheet('de', { glossary: false });
  assert.ok(withG.rows.some((r) => /Word list/.test(r[4])));
  assert.ok(!noG.rows.some((r) => /Word list/.test(r[4])));
  assert.ok(withG.rows.some((r) => r[4].includes('Rechnungsabwicklung')));
  const pl = exportSheet('pl', { glossary: true });
  assert.ok(pl.rows.some((r) => r[4].includes('fakturowania')));
});

test('the banned list of the glossary never appears in a sheet or a brief', { skip: !glossary }, () => {
  assert.ok(allBanned.length > 100, `banned list reading found only ${allBanned.length} terms`);
  const hits = [];
  const seen = [];
  for (const locale of LOCALES) {
    for (const delimiter of ['comma', 'semicolon', 'tab']) {
      const ex = exportSheet(locale, { delimiter });
      seen.push(ex.csvPath);
      for (const term of allBanned) {
        if (contains(ex.text, term)) hits.push(`${locale}/${delimiter} sheet: "${term}"`);
        if (delimiter === 'comma' && contains(ex.brief, term)) hits.push(`${locale} brief: "${term}"`);
      }
    }
  }
  console.log(`# banned terms checked: ${allBanned.length}, files: ${seen.length} sheets and ${LOCALES.length} briefs`);
  assert.deepEqual(hits, [], `banned terms in output:\n${hits.join('\n')}`);
});

test('the brief has no em dash, and the sheets have none either', () => {
  for (const locale of LOCALES) {
    const ex = exportSheet(locale);
    assert.ok(!ex.brief.includes('\u2014'), `${locale} brief has an em dash`);
    assert.ok(!ex.text.includes('\u2014'), `${locale} sheet has an em dash`);
    assert.ok(ex.brief.includes(locale === 'de' ? 'German' : locale === 'fr' ? 'French' : 'Polish'));
    assert.ok(ex.brief.includes('{since}') || ex.brief.includes('{name}'), 'the brief should show a placeholder example');
  }
});

test('the export writes only its two files into --out and nothing into the repository', () => {
  const before = fs.readdirSync(path.join(ROOT, 'src/data/stories')).sort();
  const ex = exportSheet('pl');
  assert.deepEqual(listFiles(ex.dir), ['README-brief.md', 'translation-pl.csv']);
  assert.deepEqual(fs.readdirSync(path.join(ROOT, 'src/data/stories')).sort(), before);
});

// ---------------------------------------------------------------------------------------------------------------------------
// 5. The content gate: a banned name or an authority claim typed into a Translation

function bannedExample(section, pattern) {
  const cell = (glossary.banned[section] || []).find((c) => pattern.test(c));
  assert.ok(cell, `no banned cell matching ${pattern} in ${section}`);
  return bannedTermsOf(cell).find((t) => pattern.test(t));
}

const havePyYaml = (() => {
  if (!glossary) return false;
  const r = spawnSync(PY, ['-c', 'import yaml'], { encoding: 'utf8' });
  return r.status === 0;
})();

function scanScratch(outRoot, rels) {
  const dir = fresh('scan');
  fs.cpSync(path.join(ROOT, '.github', 'scripts'), path.join(dir, '.github', 'scripts'), { recursive: true });
  fs.cpSync(path.join(ROOT, '.github', 'ip-protection'), path.join(dir, '.github', 'ip-protection'), { recursive: true });
  for (const rel of rels) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.copyFileSync(path.join(outRoot, rel), path.join(dir, rel));
  }
  const env = { ...process.env };
  delete env.IP_GATE_PRIVATE_PATTERNS;
  const r = spawnSync(PY, ['.github/scripts/ip_scanner.py', '--list'], { cwd: dir, env, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
}

test('clean imported files pass the scanner in a scratch repo', { skip: !havePyYaml }, () => {
  const ex = exportSheet('pl');
  const res = runImport('pl', writeCsv([HEADER, ...filled(ex.rows)]));
  assert.equal(res.status, 0, res.out);
  const scan = scanScratch(res.outRoot, res.files);
  assert.equal(scan.status, 0, scan.out);
});

for (const [label, section, pattern] of [
  ['an internal product name', 'English', /^Vi/],
  ['an authority-claim wording', 'English', /^guar/i],
]) {
  test(`content gate: ${label} typed into a Translation is stopped (by the import or by the scanner after it)`, { skip: !havePyYaml }, () => {
    const term = bannedExample(section, pattern);
    const rows = filled(exportSheet('pl').rows);
    const i = pick(rows, (r) => !/[{<]/.test(r[2]) && r[2].length > 30, 'a plain text row');
    rows[i][3] = `${rows[i][3]} ${term}`;
    const res = runImport('pl', sheetOf(rows));
    const stoppedByImport = res.status !== 0 && res.files.length === 0;
    let stoppedByScanner = false;
    if (res.status === 0) {
      const scan = scanScratch(res.outRoot, res.files);
      stoppedByScanner = scan.status !== 0;
      assert.ok(!stoppedByScanner || scan.out.includes('IP-'), `scanner failed without a rule id:\n${scan.out}`);
    }
    console.log(`# content gate (${label}): import ${stoppedByImport ? 'stopped it' : 'let it through'}, scanner after import ${stoppedByScanner ? 'stopped it' : 'did not stop it'}`);
    assert.ok(stoppedByImport || stoppedByScanner, 'neither the import nor the scanner stopped a banned term in a Translation');
  });
}
