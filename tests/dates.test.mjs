// Dates are formatted by hand from the ISO string, per language. The expected words below are written out here from the
// standard calendar, not read from format.ts, so a swapped or misspelled month fails.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './_lib/site.mjs';
import { importTs } from './_lib/ts.mjs';

const FORMAT = path.join(ROOT, 'src', 'components', 'site', 'format.ts');
const { longDate, shortDate, dayText, pluralForm } = await importTs(new URL(`file://${FORMAT}`).href);

const LONG = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  pl: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
};
const SHORT = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  pl: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
};
// The day as it is written before the month. German puts a full stop after it, French writes the first of the month as 1er.
const day = (locale, d) => (locale === 'de' ? `${d}.` : locale === 'fr' && d === 1 ? '1er' : String(d));
const mm = (i) => String(i + 1).padStart(2, '0');
const LOCALES = ['en', 'de', 'fr', 'pl'];

test('long form: all 12 months, every language, a day in the middle of the month', () => {
  for (const locale of LOCALES) {
    LONG[locale].forEach((name, i) => {
      assert.equal(longDate(`2026-${mm(i)}-17`, locale), `${day(locale, 17)} ${name} 2026`, `${locale} month ${i + 1}`);
    });
  }
});

test('short form: all 12 months, every language, with a day and with the month alone', () => {
  for (const locale of LOCALES) {
    SHORT[locale].forEach((name, i) => {
      assert.equal(shortDate(`2026-${mm(i)}-17`, locale), `${day(locale, 17)} ${name} 2026`, `${locale} month ${i + 1}`);
      assert.equal(shortDate(`2026-${mm(i)}`, locale), `${name} 2026`, `${locale} month ${i + 1}, month only`);
    });
  }
});

test('every short name is the start of its long name, so no two months are mixed up', () => {
  for (const locale of LOCALES) {
    SHORT[locale].forEach((s, i) => {
      const stem = s.replace(/\.$/, '').toLowerCase();
      assert.ok(LONG[locale][i].toLowerCase().startsWith(stem), `${locale}: ${s} against ${LONG[locale][i]}`);
    });
  }
});

test('English is what it always was, with and without the language argument', () => {
  assert.equal(longDate('2026-10-21'), '21 October 2026');
  assert.equal(longDate('2026-10-21', 'en'), '21 October 2026');
  assert.equal(shortDate('2026-03-05'), '5 Mar 2026');
  assert.equal(shortDate('2026-03'), 'Mar 2026');
});

test('edge days: 1 January, 31 December, a leap day, single-digit days', () => {
  assert.equal(longDate('2027-01-01', 'en'), '1 January 2027');
  assert.equal(longDate('2027-01-01', 'de'), '1. Januar 2027');
  assert.equal(longDate('2027-01-01', 'fr'), '1er janvier 2027');
  assert.equal(longDate('2027-01-01', 'pl'), '1 stycznia 2027');
  assert.equal(longDate('2026-12-31', 'en'), '31 December 2026');
  assert.equal(longDate('2026-12-31', 'de'), '31. Dezember 2026');
  assert.equal(longDate('2026-12-31', 'fr'), '31 décembre 2026');
  assert.equal(longDate('2026-12-31', 'pl'), '31 grudnia 2026');
  assert.equal(longDate('2028-02-29', 'en'), '29 February 2028');
  assert.equal(longDate('2028-02-29', 'de'), '29. Februar 2028');
  assert.equal(longDate('2028-02-29', 'fr'), '29 février 2028');
  assert.equal(longDate('2028-02-29', 'pl'), '29 lutego 2028');
  assert.equal(shortDate('2028-02-29', 'fr'), '29 févr. 2028');
  assert.equal(longDate('2026-09-02', 'de'), '2. September 2026');
  assert.equal(longDate('2026-09-02', 'fr'), '2 septembre 2026');
  assert.equal(longDate('2026-09-09', 'pl'), '9 września 2026');
  assert.equal(shortDate('2026-07-05', 'de'), '5. Juli 2026');
  assert.equal(shortDate('2026-07-05', 'pl'), '5 lip 2026');
  assert.equal(dayText('fr', 1), '1er');
  assert.equal(dayText('fr', 11), '11');
  assert.equal(dayText('de', 3), '3.');
});

test('the Polish long form is the genitive, as in a full date', () => {
  assert.equal(longDate('2026-10-21', 'pl'), '21 października 2026');
  assert.notEqual(longDate('2026-10-21', 'pl'), '21 październik 2026');
});

test('the unit word takes the right plural form', () => {
  assert.deepEqual([0, 1, 2, 5].map((n) => pluralForm('en', n)), ['many', 'one', 'many', 'many']);
  assert.deepEqual([0, 1, 2, 5].map((n) => pluralForm('de', n)), ['many', 'one', 'many', 'many']);
  assert.deepEqual([0, 1, 2].map((n) => pluralForm('fr', n)), ['one', 'one', 'many']);
  assert.deepEqual([1, 2, 4, 5, 12, 14, 22, 24, 112].map((n) => pluralForm('pl', n)), ['one', 'few', 'few', 'many', 'many', 'many', 'few', 'few', 'many']);
});

// The old English functions, from the commit before this run, with the types taken off. A malformed string has to behave
// exactly as it did there, so nothing that used to throw now prints and nothing that printed now throws.
const OLD = (() => {
  const src = spawnSync('git', ['show', '3720675:src/components/site/format.ts'], { cwd: ROOT, encoding: 'buffer' });
  return src.status === 0 ? src.stdout : null;
})();

test('a malformed ISO string behaves as the old English function did', { skip: OLD ? false : 'commit 3720675 is not in this clone' }, async () => {
  const dir = path.join(ROOT, '.astro', 'dates-old');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'format-old.ts'), OLD);
  const old = await importTs(new URL(`file://${path.join(dir, 'format-old.ts')}`).href);
  const run = (fn, ...args) => {
    try {
      return `ok:${fn(...args)}`;
    } catch (e) {
      return `throws:${e.constructor.name}`;
    }
  };
  const inputs = ['', 'garbage', '2026', '2026-', '2026-10-', '2026-13-01', '2026-00-05', '2026-1-5', '2026-10-21-extra', '20261021', 'ab-cd-ef', '2026-10-xx', '-10-21'];
  for (const iso of inputs) {
    assert.equal(run(longDate, iso), run(old.longDate, iso), `longDate(${JSON.stringify(iso)})`);
    assert.equal(run(shortDate, iso), run(old.shortDate, iso), `shortDate(${JSON.stringify(iso)})`);
    assert.equal(run(longDate, iso, 'en'), run(old.longDate, iso), `longDate(${JSON.stringify(iso)}, en)`);
  }
});

const TEXT = readFileSync(FORMAT);

test('format.ts never goes through Date, the clock or the platform locale', () => {
  const code = TEXT.toString('utf8').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
  for (const bad of [/\bnew\s+Date\b/, /\bDate\.(parse|UTC|now)\b/, /\btoLocale\w*/, /\bIntl\b/, /\bDateTimeFormat\b/]) {
    assert.ok(!bad.test(code), `format.ts contains ${bad}`);
  }
});

test('format.ts is plain text: no raw NUL byte (git would treat it as binary and show no diff)', () => {
  assert.equal(TEXT.indexOf(0), -1, 'format.ts holds a NUL byte; the original wrote the escape \\u0000 as text');
});
