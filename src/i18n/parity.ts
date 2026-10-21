// The parity gate: what a translated file has to share with the English one before a language can be built.
// Plain functions, no dependency but node:crypto, so the build hook (gate.ts), the command line check
// (scripts/parity-check.mjs) and the tests all run the same code.
//
// What is compared. A story file (src/data/stories/*.ts) has one object that holds the page's copy, plus lists the page code
// keeps in the English file (names ending in Bodies or BodyKeys: issuing bodies, not text). A dictionary
// (src/i18n/dictionaries/<locale>.ts) is one object. A translated file has the same object, under the same export name for a
// story file (the dictionary's export is named for its language) and nothing else but `from`. The page code reads the Bodies
// lists from the English file, so a translated file does not repeat them (it fails if it does).
//
// Problems (the build stops, the command exits 1). Each line starts with the key path, dotted, array positions as numbers
// ("market.cards.1.front.coming"):
//  - a key the English has and the translation lacks, or the reverse, at any level, array lengths included
//  - a value of another kind than the English (text, number, true or false, list, object)
//  - a placeholder ({published}, {body:law@2025-01-01}, {name}, ...) that is not in the other in the same number and form
//  - a tag (<strong>, <span class='accent'>, <a>, ...) that is not in the other in the same number and form, or tags that do
//    not close in order; attribute quotes do not matter, the attributes themselves do
//  - a link whose href is not in the other in the same number and target
//  - a conditional passage ({ ifNone, then, otherwise }) or a date switch ({ from, coming, here }) that is not there with the
//    same keys; the switch date `from` and everything under `ifNone` must be exactly the English value
//  - a number typed into a translated text that is not in the English text of the same key (the page computes its numbers).
//    Digits in placeholders, tags and entities do not count; "800,000", "800.000" and "800 000" are the same number
//  - a value that must stay as in English (see isFixed: switch dates, ids, grid letters, profile data, numbers, true and false)
//    and does not, and a text that is empty in one and not in the other
//
// Warnings (the build prints them, the command prints them and still exits 0), one line per key:
//  - no hash for a translatable key, a hash that is not the hash of the English text now (the English changed after the
//    translation), or a hash for a key the English does not have
//
// The hash format. The translated file carries, beside its object:
//     export const from = { 'meta.title': 'a1b2c3d4e5f6', 'opening.h1.coming': '0f9e8d7c6b5a', ... };
// One entry for every key whose English value is a non-empty text that is not fixed. The key is the same dotted path the
// problems use. The value is hashOf(english text): the first 12 hex digits of the SHA-1 of the English text as UTF-8, with no
// trimming. The import tool writes it from the English text the translator saw; the gate compares it with the English file now.
import { createHash } from 'node:crypto';

export function hashOf(englishValue: string): string {
  return createHash('sha1').update(englishValue, 'utf8').digest('hex').slice(0, 12);
}

// Exports of a story file that stay in the English file: the issuing bodies the page code reads (deBodies, beBodyKeys, ...).
export const ENGLISH_ONLY_EXPORT = /^[a-z]+(Bodies|BodyKeys)$/;

type Kind = 'text' | 'number' | 'true or false' | 'nothing' | 'list' | 'object';
function kindOf(v: unknown): Kind {
  if (typeof v === 'string') return 'text';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'true or false';
  if (v === null || v === undefined) return 'nothing';
  return Array.isArray(v) ? 'list' : 'object';
}

const isObject = (v: any) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isDated = (v: any) => isObject(v) && typeof v.from === 'string' && 'coming' in v && 'here' in v;
const isCond = (v: any) => isObject(v) && 'ifNone' in v && 'then' in v && 'otherwise' in v;

function describe(v: unknown): string {
  if (isDated(v)) return 'a date switch (from, coming, here)';
  if (isCond(v)) return 'a conditional passage (ifNone, then, otherwise)';
  const k = kindOf(v);
  return k === 'text' ? 'text' : k === 'object' ? 'an object' : k === 'list' ? 'a list' : k;
}

// Values the translator does not touch, from the shape of the story files: the switch date of a date switch (`from`), the
// condition of a conditional passage (everything under `ifNone`), ids, the letters of the function grid, the function letter,
// the page flow, the contact addresses and the profile data of the person. Numbers and true or false are always fixed.
const FIXED_KEYS = new Set(['flow', 'from', 'id', 'f', 'fn', 'mailto']);
export function isFixed(segments: string[]): boolean {
  const last = segments[segments.length - 1];
  if (segments.includes('ifNone')) return true;
  if (FIXED_KEYS.has(last)) return true;
  const parent = segments[segments.length - 2];
  return parent === 'grid' || parent === 'person';
}

function placeholdersOf(s: string): string[] {
  return (s.match(/\{[^{}]*\}/g) || []).sort();
}

const TAG = /<\/?[a-zA-Z][^>]*>/g;
const VOID = new Set(['br', 'hr', 'img', 'wbr']);

// A tag in a form that ignores quote style and attribute order and leaves out href (links are compared on their own).
function tagForm(tag: string): string {
  const closing = tag.startsWith('</');
  const name = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(tag)![1].toLowerCase();
  if (closing) return `</${name}>`;
  const attrs: string[] = [];
  for (const m of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const key = m[1].toLowerCase();
    if (key !== 'href') attrs.push(`${key}="${m[2] !== undefined ? m[2] : m[3]}"`);
  }
  return `<${name}${attrs.sort().map((a) => ' ' + a).join('')}>`;
}
function hrefsOf(s: string): string[] {
  const out: string[] = [];
  for (const tag of s.match(TAG) || []) {
    const m = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    if (m) out.push(m[1] !== undefined ? m[1] : m[2]);
  }
  return out.sort();
}
function tagsOf(s: string): string[] {
  return (s.match(TAG) || []).map(tagForm).sort();
}

// Opening and closing tags in order: every closing tag closes the latest open one, and none stays open.
function nestingProblem(s: string): string {
  const stack: string[] = [];
  for (const tag of s.match(TAG) || []) {
    const name = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(tag)![1].toLowerCase();
    if (VOID.has(name) || tag.endsWith('/>')) continue;
    if (tag.startsWith('</')) {
      if (stack.pop() !== name) return `</${name}> closes nothing that is open there`;
    } else {
      stack.push(name);
    }
  }
  return stack.length ? `<${stack[stack.length - 1]}> is never closed` : '';
}

// Numbers as digits, without placeholders, tags and entities; thousands groups are one number, leading zeros do not count.
function numbersOf(s: string): Set<string> {
  const bare = s.replace(/\{[^{}]*\}/g, ' ').replace(TAG, ' ').replace(/&#?\w+;/g, ' ');
  const out = new Set<string>();
  for (const m of bare.match(/\d+(?:[   .,]\d{3}(?!\d))*/g) || []) {
    out.add(m.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, ''));
  }
  return out;
}

// What differs between two sorted lists, as "missing X, extra Y" with counts.
function listDiff(en: string[], tr: string[]): string {
  const left = [...tr];
  const missing: string[] = [];
  for (const e of en) {
    const at = left.indexOf(e);
    if (at === -1) missing.push(e);
    else left.splice(at, 1);
  }
  const parts: string[] = [];
  if (missing.length) parts.push(`missing ${missing.join(' ')}`);
  if (left.length) parts.push(`extra ${left.join(' ')}`);
  return parts.join(', ');
}

function textProblems(path: string, en: string, tr: string): string[] {
  const out: string[] = [];
  if ((en === '') !== (tr === '')) {
    out.push(`${path}: ${en === '' ? 'must be empty as in the English' : 'is empty, the English has text'}`);
    return out;
  }
  const ph = listDiff(placeholdersOf(en), placeholdersOf(tr));
  if (ph) out.push(`${path}: placeholders differ from the English (${ph})`);
  const tg = listDiff(tagsOf(en), tagsOf(tr));
  if (tg) out.push(`${path}: tags differ from the English (${tg})`);
  const nest = nestingProblem(tr);
  if (nest) out.push(`${path}: tags do not nest: ${nest}`);
  const ln = listDiff(hrefsOf(en), hrefsOf(tr));
  if (ln) out.push(`${path}: links differ from the English (${ln})`);
  const allowed = numbersOf(en);
  const typed = [...numbersOf(tr)].filter((n) => !allowed.has(n));
  if (typed.length) out.push(`${path}: typed number ${typed.join(', ')} is not in the English text (the page computes its numbers)`);
  return out;
}

const join = (path: string, key: string | number) => (path ? `${path}.${key}` : String(key));

function walk(en: any, tr: any, path: string, out: string[]): void {
  const where = path || '(top)';
  const ke = kindOf(en);
  const kt = kindOf(tr);
  if (ke !== kt || (ke === 'object' && (isDated(en) !== isDated(tr) || isCond(en) !== isCond(tr)))) {
    out.push(`${where}: expected ${describe(en)}, found ${describe(tr)}`);
    return;
  }
  if (ke === 'list') {
    const n = Math.max(en.length, tr.length);
    for (let i = 0; i < n; i++) {
      if (i >= tr.length) out.push(`${join(path, i)}: missing (the English list has ${en.length} entries, the translation ${tr.length})`);
      else if (i >= en.length) out.push(`${join(path, i)}: extra (the English list has ${en.length} entries, the translation ${tr.length})`);
      else walk(en[i], tr[i], join(path, i), out);
    }
    return;
  }
  if (ke === 'object') {
    for (const k of Object.keys(en)) if (!(k in tr)) out.push(`${join(path, k)}: missing`);
    for (const k of Object.keys(tr)) if (!(k in en)) out.push(`${join(path, k)}: not in the English`);
    for (const k of Object.keys(en)) if (k in tr) walk(en[k], tr[k], join(path, k), out);
    return;
  }
  if (ke === 'text') {
    if (isFixed(path.split('.'))) {
      if (en !== tr) out.push(`${where}: must stay exactly as in the English (${JSON.stringify(en)})`);
    } else {
      out.push(...textProblems(where, en, tr));
    }
    return;
  }
  if (en !== tr) out.push(`${where}: must stay exactly as in the English (${String(en)})`);
}

// Problems of a translated object against the English one: one line each, the key path first. Empty when they agree.
export function problemsFor(english: unknown, translated: unknown): string[] {
  const out: string[] = [];
  walk(english, translated, '', out);
  return out;
}

// The keys that carry a hash: every non-empty text that is not fixed, by dotted path, with the English text.
export function translatableKeys(english: unknown): Map<string, string> {
  const out = new Map<string, string>();
  const visit = (v: any, path: string) => {
    if (typeof v === 'string') {
      if (v !== '' && !isFixed(path.split('.'))) out.set(path, v);
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => visit(x, join(path, i)));
    } else if (isObject(v)) {
      for (const [k, x] of Object.entries(v)) visit(x, join(path, k));
    }
  };
  visit(english, '');
  return out;
}

// Warnings about the hashes: a key with none, a stale one (the English text has changed since) and one for a key that is gone.
export function hashWarnings(english: unknown, from: unknown): string[] {
  const keys = translatableKeys(english);
  if (from === undefined || from === null || typeof from !== 'object' || Array.isArray(from)) {
    return [...keys.keys()].map((k) => `${k}: no hash of the English text (export const from is missing)`);
  }
  const have = from as Record<string, unknown>;
  const out: string[] = [];
  for (const [k, text] of keys) {
    if (!(k in have)) out.push(`${k}: no hash of the English text`);
    else if (have[k] !== hashOf(text)) out.push(`${k}: stale, the English text has changed since this was translated`);
  }
  for (const k of Object.keys(have)) if (!keys.has(k)) out.push(`${k}: hash for a key that is not a translatable key of the English`);
  return out;
}

export interface Result { problems: string[]; warnings: string[] }
export interface Options {
  // A dictionary is exported under its language's name, so the export names need not agree.
  dictionary?: boolean;
  // Identity copy (a test build): the hash warnings are left out, because nothing was translated.
  skipHashes?: boolean;
}

// The export that holds the copy: the only export that is neither `from` nor an English-only list.
export function storyExportName(mod: Record<string, unknown>): string | null {
  const names = Object.keys(mod).filter((k) => k !== 'from' && k !== 'default' && !ENGLISH_ONLY_EXPORT.test(k));
  return names.length === 1 ? names[0] : null;
}

// Compare two loaded files (the English module and the translated one).
export function compareModules(englishMod: Record<string, unknown>, translatedMod: Record<string, unknown>, opts: Options = {}): Result {
  const problems: string[] = [];
  const warnings: string[] = [];
  const enName = storyExportName(englishMod);
  if (!enName) throw new Error('The English file must have exactly one export that holds the copy.');
  for (const k of Object.keys(translatedMod)) {
    if (k !== 'from' && ENGLISH_ONLY_EXPORT.test(k)) problems.push(`export ${k}: stays in the English file, a translated file does not repeat it`);
    else if (k !== 'from' && k !== enName && !(opts.dictionary && k === storyExportName(translatedMod))) problems.push(`export ${k}: not in the English file`);
  }
  const trName = opts.dictionary ? storyExportName(translatedMod) : enName;
  if (!trName || !(trName in translatedMod)) {
    problems.push(`export ${trName || enName}: missing, the translated file must export the copy under this name`);
    return { problems, warnings };
  }
  problems.push(...problemsFor(englishMod[enName], translatedMod[trName]));
  if ('from' in translatedMod && (translatedMod.from === null || typeof translatedMod.from !== 'object' || Array.isArray(translatedMod.from))) {
    problems.push('export from: must be an object of key to hash');
  } else if (!opts.skipHashes) {
    warnings.push(...hashWarnings(englishMod[enName], translatedMod.from));
  }
  return { problems, warnings };
}
