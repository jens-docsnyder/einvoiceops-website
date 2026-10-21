/**
 * translation-lib.mjs - what translation-export.mjs and translation-import.mjs share
 *
 * Not run on its own. It loads the English story files and dictionaries (Node strips the types, like parity-check.mjs does),
 * lists the translatable texts of a language pack, reads the glossary table, and reads and writes the sheet (CSV).
 *
 * A language pack is every file the pages of that locale are made from, in reading order: the story files of each page the
 * registry defines in that locale (src/i18n/gate.ts says which story files a page uses), then the dictionary. The sheet's
 * `file` column names a story file by its name without ending ("home", "de") and the dictionary as "dictionary".
 * A row is one translatable text: a non-empty text that src/i18n/parity.ts does not call fixed.
 */
import { existsSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOCALES = ['de', 'fr', 'pl'];
export const LANGUAGE_NAMES = { de: 'German', fr: 'French', pl: 'Polish' };
export const COLUMNS = ['file', 'key', 'English', 'Translation', 'Note'];

// The site writes imports without the .ts ending; this adds it, as scripts/parity-check.mjs does.
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

const src = (rel) => new URL(`../src/${rel}`, import.meta.url).href;
export const loadParity = () => import(src('i18n/parity.ts'));
export const loadModule = (file) => import(pathToFileURL(file).href);

// ---------------------------------------------------------------------------------------------------------------------------
// The pack of a locale

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isDated = (v) => isObject(v) && typeof v.from === 'string' && 'coming' in v && 'here' in v;
const isCond = (v) => isObject(v) && 'ifNone' in v && 'then' in v && 'otherwise' in v;
const join = (p, k) => (p ? `${p}.${k}` : String(k));

// Every translatable text of an English object, in reading order, with the passage it belongs to when that is a date switch
// or a conditional passage. The keys are exactly parity.ts translatableKeys(); this is checked, so the two cannot drift.
function textsOf(english, parity) {
  const out = [];
  const visit = (v, p, passage) => {
    if (typeof v === 'string') {
      if (v !== '' && !parity.isFixed(p.split('.'))) out.push({ key: p, text: v, passage });
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => visit(x, join(p, i), null));
    } else if (isObject(v)) {
      const here = isDated(v) ? { kind: 'date', parent: v } : isCond(v) ? { kind: 'cond', parent: v } : null;
      for (const [k, x] of Object.entries(v)) {
        visit(x, join(p, k), here && (k === 'coming' || k === 'here' || k === 'then' || k === 'otherwise') ? here : null);
      }
    }
  };
  visit(english, '', null);
  const want = [...parity.translatableKeys(english).keys()].sort().join('\n');
  if (out.map((r) => r.key).sort().join('\n') !== want) throw new Error('translation-lib: the text list and parity.ts disagree.');
  return out;
}

// The files of a locale's pack: [{ file, kind, englishPath, exportName, english (the module), object, rows }].
export async function packFor(locale) {
  const parity = await loadParity();
  const registry = await import(src('i18n/registry.ts'));
  const gate = await import(src('i18n/gate.ts'));
  const storyNames = [];
  for (const page of registry.pagesDefinedIn(locale)) {
    for (const f of gate.PAGE_STORIES[page] || []) if (!storyNames.includes(f)) storyNames.push(f);
  }
  const units = [];
  for (const f of storyNames) {
    const englishPath = path.join(ROOT, 'src', 'data', 'stories', `${f}.ts`);
    units.push({ file: f, kind: 'story', englishPath, relOut: path.join('src', 'data', 'stories', locale, `${f}.ts`) });
  }
  units.push({
    file: 'dictionary',
    kind: 'dictionary',
    englishPath: path.join(ROOT, 'src', 'i18n', 'dictionaries', 'en.ts'),
    relOut: path.join('src', 'i18n', 'dictionaries', `${locale}.ts`),
  });
  for (const u of units) {
    if (!existsSync(u.englishPath)) throw new Error(`The English file is missing: ${u.englishPath}`);
    u.module = await loadModule(u.englishPath);
    u.exportName = parity.storyExportName(u.module);
    if (!u.exportName) throw new Error(`${u.englishPath} must have exactly one export that holds the copy.`);
    u.object = u.module[u.exportName];
    u.rows = textsOf(u.object, parity);
  }
  return units;
}

// ---------------------------------------------------------------------------------------------------------------------------
// The glossary: the first table with an English column, one row per term, read for one locale

const COLUMN_START = { de: 'deutsch', fr: 'fran', pl: 'polski' };

const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

// Split at a separator that is not inside brackets.
function splitTop(s, sep) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (!depth && s.startsWith(sep, i)) {
      out.push(cur);
      cur = '';
      i += sep.length - 1;
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

const normalise = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const words = (s) => s.split(/\s+/).filter(Boolean).length;

// The terms of one glossary row as [{ term, use }]. "a / b" pairs the two sides when both have as many parts; a comma list
// of short terms does the same; otherwise each English term gets the whole target cell. Only the first table is read, and
// only up to its end: nothing below it (the banned lists) is ever read.
export function parseGlossary(text, locale) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^\|\s*English\s*\|/.test(l));
  if (start === -1) throw new Error('The glossary has no table with an English column.');
  const header = cells(lines[start]);
  const col = header.findIndex((h, i) => i > 0 && h.toLowerCase().startsWith(COLUMN_START[locale]));
  if (col === -1) throw new Error(`The glossary table has no column for ${locale}.`);
  const terms = [];
  for (let i = start + 1; i < lines.length && lines[i].trim().startsWith('|'); i++) {
    if (/^\|[\s:|-]+\|?$/.test(lines[i].trim())) continue;
    const row = cells(lines[i]);
    const english = (row[0] || '').replace(/\*\*/g, '').trim();
    const target = (row[col] || '').replace(/\*\*/g, '').trim();
    if (!english || !target) continue;
    const pairs = [];
    const alts = splitTop(english, ' / ');
    const targets = splitTop(target, ' / ');
    alts.forEach((alt, i) => pairs.push([alt, alts.length === targets.length ? targets[i] : target]));
    for (const [alt, use] of pairs) {
      const parts = splitTop(alt, ', ');
      const uses = splitTop(use, ', ');
      if (parts.length > 1 && parts.length === uses.length && parts.every((p) => words(p) <= 3)) {
        parts.forEach((p, j) => terms.push({ term: p, use: uses[j] }));
      } else {
        terms.push({ term: alt, use });
      }
    }
  }
  return terms
    .map(({ term, use }) => ({ term: term.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(), use }))
    .filter(({ term }) => term.length >= 3)
    .map((t) => ({ ...t, re: termPattern(t.term) }));
}

// "[country]" stands for any name; {placeholders} are literal. A term with a capital after its first letter (KSeF, ERP) is
// matched in that case; the others in any case. Plurals (-s, -es) match.
function termPattern(term) {
  const bits = normalise(term).split(/(\[[^\]]*\])/).map((b) => (/^\[/.test(b) ? "\\S+(?: \\S+)?" : b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const caseSensitive = /[A-Z]/.test(term.slice(1));
  return new RegExp(`(?<![\\p{L}\\p{N}])${bits.join('')}(?:e?s)?(?![\\p{L}\\p{N}])`, caseSensitive ? 'u' : 'iu');
}

export function glossaryHits(glossary, text) {
  const seen = new Set();
  const hits = [];
  const plain = normalise(text.replace(/<[^>]*>/g, ' '));
  for (const g of glossary) {
    if (g.re.test(plain)) {
      const k = `${g.term}\u0000${g.use}`;
      if (!seen.has(k)) {
        seen.add(k);
        hits.push(g);
      }
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Notes

const unique = (a) => [...new Set(a)];

// The note for one text: what the translator must keep and why. Empty when there is nothing to say.
export function noteFor(row, glossary) {
  const notes = [];
  const text = row.text;
  const ph = unique(text.match(/\{[^{}]*\}/g) || []);
  if (ph.length) {
    const list = ph.length === 1 ? ph[0] : `${ph.slice(0, -1).join(', ')} and ${ph[ph.length - 1]}`;
    notes.push(`Keep ${list} exactly; the page fills ${ph.length === 1 ? 'it' : 'them'} in.`);
  }
  const tags = text.match(/<\/?[a-zA-Z][^>]*>/g) || [];
  const plainTags = unique(tags.filter((t) => !t.startsWith('</') && !/^<a[\s>]/i.test(t)));
  if (plainTags.length) notes.push(`Keep the tags ${plainTags.join(' ')} (and their closing tags) around the matching words.`);
  if (tags.some((t) => /^<a[\s>]/i.test(t))) {
    notes.push('Contains a link: keep the <a> tag and its address exactly, around the matching words; translate only the words between the tags.');
  }
  if (row.passage?.kind === 'date') {
    notes.push(`One of two versions of this passage: the page shows "coming" before ${row.passage.parent.from} and "here" from that date. Translate both versions and keep their order.`);
  } else if (row.passage?.kind === 'cond') {
    notes.push('One of two versions of this passage: the page shows "then" or "otherwise" depending on a count. Translate both versions and keep their order.');
  }
  if (/\p{Nd}/u.test(text.replace(/\{[^{}]*\}/g, '').replace(/<[^>]*>/g, ''))) {
    notes.push('Numbers stay as digits and are the same numbers as in the English.');
  }
  if (text !== text.trim()) notes.push('The English starts or ends with a space; keep that space.');
  if (glossary.length) {
    const hits = glossaryHits(glossary, text);
    if (hits.length) notes.push(`Word list: ${hits.map((h) => `"${h.term}", use: ${h.use}`).join('; ')}.`);
  }
  return notes.join(' ');
}

// ---------------------------------------------------------------------------------------------------------------------------
// CSV (RFC 4180: fields with a separator, quote or line break in double quotes, a quote doubled; lines end in CRLF)

export const DELIMITERS = { comma: ',', semicolon: ';', tab: '\t' };

export function toCsv(rows, delimiter = ',') {
  const field = (v) => {
    const s = String(v);
    return /["\r\n]/.test(s) || s.includes(delimiter) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + rows.map((r) => r.map(field).join(delimiter)).join('\r\n') + '\r\n';
}

// Rows of fields. The separator is taken from the header line (comma, semicolon or tab), because a spreadsheet program in a
// language that writes decimal commas saves with semicolons. A blank line is skipped.
export function parseCsv(text) {
  const body = text.replace(/^﻿/, '');
  const head = body.split(/\r?\n/, 1)[0];
  const count = (c) => head.split(c).length - 1;
  const delimiter = [',', ';', '\t'].sort((a, b) => count(b) - count(a))[0];
  const rows = [];
  let row = [];
  let cur = '';
  let quoted = false;
  let wasQuoted = false;
  const endField = () => {
    row.push(cur);
    cur = '';
    wasQuoted = false;
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quoted) {
      if (ch === '"' && body[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"' && cur === '') {
      quoted = true;
      wasQuoted = true;
    } else if (ch === delimiter) {
      endField();
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && body[i + 1] === '\n') i++;
      endField();
      if (!(row.length === 1 && row[0] === '' && !wasQuoted)) rows.push(row);
      row = [];
    } else {
      cur += ch;
    }
  }
  if (quoted) throw new Error('The sheet has a quote that is never closed.');
  if (cur !== '' || row.length) {
    endField();
    rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Writing a translated file: the English object with only the translatable texts replaced

const IDENT = /^[A-Za-z_$][\w$]*$/;
const keyLit = (k) => (IDENT.test(k) ? k : `'${k.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`);
const textLit = (s) =>
  '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + '`';

// `translations` maps a dotted key to the translated text. Everything else (fixed values, empty texts, numbers, true and false,
// the order of keys and list entries) is the English value as it stands.
export function emitObject(english, translations, parity) {
  const emit = (v, p, indent) => {
    if (typeof v === 'string') {
      if (v !== '' && !parity.isFixed(p.split('.'))) {
        if (!Object.hasOwn(translations, p)) throw new Error(`No translation for ${p}`);
        return textLit(translations[p]);
      }
      return textLit(v);
    }
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v === null) return 'null';
    const pad = '  '.repeat(indent + 1);
    const close = '  '.repeat(indent);
    if (Array.isArray(v)) {
      if (!v.length) return '[]';
      const items = v.map((x, i) => emit(x, join(p, i), indent + 1));
      const flat = `[${items.join(', ')}]`;
      if (v.every((x) => typeof x !== 'object' || x === null) && flat.length + indent * 2 <= 110 && !flat.includes('\n')) return flat;
      return `[\n${items.map((x) => pad + x + ',').join('\n')}\n${close}]`;
    }
    const entries = Object.entries(v);
    if (!entries.length) return '{}';
    return `{\n${entries.map(([k, x]) => `${pad}${keyLit(k)}: ${emit(x, join(p, k), indent + 1)},`).join('\n')}\n${close}}`;
  };
  return emit(english, '', 0);
}

export function emitHashes(rows, hashOf) {
  return `{\n${rows.map((r) => `  '${r.key}': '${hashOf(r.text)}',`).join('\n')}\n}`;
}

export const wordCount = (text) => words(text.replace(/\{[^{}]*\}/g, ' ').replace(/<[^>]*>/g, ' '));
