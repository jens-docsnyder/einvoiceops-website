#!/usr/bin/env node
/**
 * translation-export.mjs - write the translation sheet of one language
 *
 * Usage:  node scripts/translation-export.mjs --locale <de|fr|pl> --out <dir> [--glossary <path>] [--delimiter <comma|semicolon|tab>]
 *   e.g.  node scripts/translation-export.mjs --locale de --out ~/packs/de --glossary ~/packs/glossary.md
 *
 * Writes two files into <dir> (made if it is missing; nothing is written inside the repository unless <dir> is there):
 *   translation-<locale>.csv   one row per translatable text of the language's pages, columns
 *                              file, key, English, Translation, Note. Translation is empty: the translator fills it.
 *   README-brief.md            the one-page brief for the translator.
 * The pack is every file the language's pages are made from, per the registry (src/i18n/registry.ts): the home page, the
 * country pages the registry defines in that language, and the dictionary of the shared page text. Rows are grouped by file in
 * reading order. Values that must not change (numbers, links, ids, function letters, switch dates, see isFixed in
 * src/i18n/parity.ts) are not rows; the import puts them back from the English.
 *
 * The Note column says what must stay as it is: placeholders ({since}, {name}), tags, links, passages with two versions (a
 * date switch or a conditional passage: translate both, keep their order), digits, a space at an end, and, with --glossary,
 * the glossary term to use in this language. Only the first table of the glossary (English, Deutsch, Francais, Polski) is
 * read. Nothing else of that note is read or copied, so its banned-term section never reaches a sheet.
 *
 * Why CSV: it needs no new dependency and every spreadsheet program opens it. The file is UTF-8 with a byte order mark (so
 * Excel reads accents and Polish letters correctly) and follows RFC 4180: a field with a comma, quote or line break is in
 * double quotes, a quote inside is doubled, lines end in CRLF. A program that expects semicolons (German or French settings)
 * opens a comma file in one column: write it with --delimiter semicolon. The import reads comma, semicolon or tab files.
 *
 * Needs a Node that runs .ts files (Node 22.18 or later, 25 here), like the tests.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  COLUMNS, DELIMITERS, LANGUAGE_NAMES, LOCALES, noteFor, packFor, parseGlossary, toCsv, wordCount,
} from './translation-lib.mjs';

const USAGE = 'Usage: node scripts/translation-export.mjs --locale <de|fr|pl> --out <dir> [--glossary <path>] [--delimiter <comma|semicolon|tab>]';

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    if (!['--locale', '--out', '--glossary', '--delimiter'].includes(flag) || argv[i + 1] === undefined) {
      console.error(`Unknown or incomplete option: ${flag}\n${USAGE}`);
      process.exit(2);
    }
    opts[flag.slice(2)] = argv[i + 1];
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!LOCALES.includes(opts.locale) || !opts.out) {
  console.error(USAGE);
  process.exit(2);
}
const delimiter = DELIMITERS[opts.delimiter || 'comma'];
if (!delimiter) {
  console.error(`--delimiter must be comma, semicolon or tab.\n${USAGE}`);
  process.exit(2);
}

let glossary = [];
if (opts.glossary) {
  try {
    glossary = parseGlossary(readFileSync(path.resolve(opts.glossary), 'utf8'), opts.locale);
  } catch (err) {
    console.error(`Glossary: ${err.message}`);
    process.exit(2);
  }
}

const units = await packFor(opts.locale);
const rows = [COLUMNS];
let total = 0;
for (const u of units) {
  let words = 0;
  for (const r of u.rows) {
    rows.push([u.file, r.key, r.text, '', noteFor(r, glossary)]);
    words += wordCount(r.text);
  }
  total += words;
  console.error(`${u.file}: ${u.rows.length} rows, about ${words} words`);
}

const out = path.resolve(opts.out);
mkdirSync(out, { recursive: true });
const sheet = path.join(out, `translation-${opts.locale}.csv`);
writeFileSync(sheet, toCsv(rows, delimiter), 'utf8');
writeFileSync(path.join(out, 'README-brief.md'), briefFor(opts.locale), 'utf8');
console.error(`${rows.length - 1} rows, about ${total} words${glossary.length ? `, ${glossary.length} glossary terms read` : ', no glossary'}`);
console.log(sheet);

function briefFor(locale) {
  const language = LANGUAGE_NAMES[locale];
  return `# Translating einvoiceops into ${language}: the brief

You are translating the text of a website that tells people in a company's invoicing teams when the rules for e-invoicing change in their country. Write for one of those people: someone in an invoicing function at a company, who reads quickly and wants plain words.

## What you have

- \`translation-${locale}.csv\`, the sheet. One row per text. Fill the Translation column and nothing else.
- The word list (glossary) sent with it. It decides, once, how each recurring term reads in ${language}. Where a row's Note column names a term from it ("use: ..."), use that.

## How to translate

1. Plain words. Write as a colleague in invoicing would say it. No legal-advice register: the site does not give legal or tax advice and must not sound as if it does.
2. Nothing added and nothing left out. Every claim in the English is in your text, and your text claims nothing more. Do not make a limit softer or harder.
3. Leave placeholders exactly as they are, for example {since} or {name}. The page fills them in with counts, dates and names.
4. Leave tags and links exactly as they are (<strong>, <span class='accent'>, <a href='...'>) and put them around the matching words in your sentence.
5. Numbers stay as digits, and only the numbers in the English. Do not type a count or a date of your own: the page works them out.
6. Some passages come in two versions (the Note says so). Translate both and keep them in the same order.
7. Where the English should stay as it is (a product name, a standard such as XRechnung), copy it into the Translation cell. An empty cell is an error.
8. If you are not sure about a row, write "not sure" and your question at the end of its Note. Translate it as best you can. The word list decides terms, and the question is answered later.

## The sheet

- Do not change the file, key, English or Note columns except to add to the end of the Note. A changed English column makes the sheet stale and it is refused.
- Do not add or delete rows.
- Open the file as plain text. In a spreadsheet program, import it as UTF-8 and turn off "convert text to numbers and dates", or a text like "2 Sep 2026" is rewritten as a date and the sheet is refused. Save as CSV in UTF-8 when you are done.

Send the saved sheet back. Each row is checked automatically against the English for placeholders, tags, links, numbers and the passages with two versions, and any problem is returned to you by row key.
`;
}
