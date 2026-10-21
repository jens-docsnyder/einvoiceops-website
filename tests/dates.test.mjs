// Dates are formatted by hand from the ISO string, per language. format.ts has no runtime imports, so node reads it as is.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MONTHS, dayText, longDate, shortDate, pluralForm } from '../src/components/site/format.ts';

const EXPECT_LONG = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  pl: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
};
const DAY_PREFIX = { en: '21', de: '21.', fr: '21', pl: '21' };

test('every language has 12 long and 12 short month names, all different within a list', () => {
  for (const locale of ['en', 'de', 'fr', 'pl']) {
    assert.equal(MONTHS[locale].long.length, 12, locale);
    assert.equal(MONTHS[locale].short.length, 12, locale);
    assert.equal(new Set(MONTHS[locale].long).size, 12, locale);
    assert.equal(new Set(MONTHS[locale].short).size, 12, locale);
  }
});

test('long dates: all 12 months in all 4 languages', () => {
  for (const locale of ['en', 'de', 'fr', 'pl']) {
    EXPECT_LONG[locale].forEach((name, i) => {
      const mm = String(i + 1).padStart(2, '0');
      assert.equal(longDate(`2026-${mm}-21`, locale), `${DAY_PREFIX[locale]} ${name} 2026`, `${locale} ${mm}`);
    });
  }
});

test('short dates, with and without a day', () => {
  for (const locale of ['en', 'de', 'fr', 'pl']) {
    MONTHS[locale].short.forEach((name, i) => {
      const mm = String(i + 1).padStart(2, '0');
      assert.equal(shortDate(`2026-${mm}-21`, locale), `${DAY_PREFIX[locale]} ${name} 2026`, `${locale} ${mm}`);
      assert.equal(shortDate(`2026-${mm}`, locale), `${name} 2026`, `${locale} ${mm} month only`);
    });
  }
});

test('English output is what it always was', () => {
  assert.equal(longDate('2026-10-21'), '21 October 2026');
  assert.equal(longDate('2024-01-01'), '1 January 2024');
  assert.equal(shortDate('2026-03-05'), '5 Mar 2026');
  assert.equal(shortDate('2026-03'), 'Mar 2026');
});

test('the named examples', () => {
  assert.equal(longDate('2026-10-21', 'de'), '21. Oktober 2026');
  assert.equal(longDate('2026-10-21', 'fr'), '21 octobre 2026');
  assert.equal(longDate('2026-10-21', 'pl'), '21 października 2026');
  assert.equal(longDate('2024-01-01', 'fr'), '1er janvier 2024');
  assert.equal(dayText('fr', 11), '11');
});

test('plural forms', () => {
  assert.deepEqual([0, 1, 2, 5].map((n) => pluralForm('en', n)), ['many', 'one', 'many', 'many']);
  assert.deepEqual([0, 1, 2].map((n) => pluralForm('fr', n)), ['one', 'one', 'many']);
  assert.deepEqual([1, 2, 4, 5, 12, 14, 22, 112].map((n) => pluralForm('pl', n)), ['one', 'few', 'few', 'many', 'many', 'many', 'few', 'many']);
});

test('format.ts never goes through Date', () => {
  const code = readFileSync(new URL('../src/components/site/format.ts', import.meta.url), 'utf8')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.ok(!/\bnew Date\b|\bDate\.|Intl\.|toLocale/.test(code));
});
