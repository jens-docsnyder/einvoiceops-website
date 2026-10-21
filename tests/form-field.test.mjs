// The contact form: the English pages are as they were (no new field, the same form service address), and the pages in
// another language carry a hidden `language` field with the page's own language and its own address. These tests read built
// HTML only. Nothing here sends anything to the form service.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { ROOT, attrs, buildReal, buildTest, pathOfFile, snapshot, withBuildLock } from './_lib/site.mjs';

const ORIGINAL = '3720675';
const originalForm = (() => {
  const run = spawnSync('git', ['show', `${ORIGINAL}:src/components/site/ContactForm.astro`], { cwd: ROOT, encoding: 'utf8' });
  return run.status === 0 ? run.stdout : null;
})();
const skip = originalForm ? false : `commit ${ORIGINAL} is not in this clone`;

// What the original form sent to, and which hidden fields it carried, read from the original source.
const ENDPOINT = originalForm ? /fetch\('([^']+)'/.exec(originalForm)[1] : '';
const ORIGINAL_HIDDEN = originalForm ? [...originalForm.matchAll(/<input type="hidden" name="(\w+)"/g)].map((m) => m[1]) : [];

const hiddenInputs = (html) => [...html.matchAll(/<input\b[^>]*type="hidden"[^>]*>/g)].map((m) => attrs(m[0]));
const formPages = (snap) => [...snap.text.entries()].filter(([, html]) => html.includes('id="cf-form"'));
const fetches = (html) => [...html.matchAll(/fetch\(\s*(['"`])([^'"`]*)\1/g)].map((m) => m[2]);
const localeOf = (file) => (/^(de|fr|pl)\//.test(file) ? file.split('/')[0] : 'en');

test('the address the form posts to is the one in the original source', { skip }, () => {
  assert.equal(ENDPOINT, 'https://formspree.io/f/xnjwvnvb');
  assert.deepEqual(ORIGINAL_HIDDEN, ['page', 'segment', 'country', 'lead', 'link']);
});

test('real build: every English form has the original hidden fields only, and posts to the original address', { skip }, async () => {
  const { build, snap } = await withBuildLock(() => {
    const build = buildReal();
    return { build, snap: build.status === 0 ? snapshot(`${ROOT}/dist`) : null };
  });
  assert.equal(build.status, 0, build.output.slice(-800));
  const pages = formPages(snap);
  assert.ok(pages.length >= 4, `expected the home page and three country pages to carry the form, found ${pages.length}`);
  for (const [file, html] of pages) {
    assert.deepEqual(hiddenInputs(html).map((i) => i.name), ORIGINAL_HIDDEN, `${file}: hidden fields`);
    assert.ok(!/name="language"/.test(html), `${file}: has a language field`);
    assert.ok(!/language:\s*f\[/.test(html), `${file}: the script sends a language`);
    assert.deepEqual(fetches(html), [ENDPOINT], `${file}: addresses posted to`);
    assert.equal((html.match(/formspree/g) ?? []).length, 1, `${file}: the form service address appears once`);
  }
});

test('test build: pages in another language carry a language field equal to their locale and their own address', { skip }, async () => {
  const { build, snap } = await withBuildLock(() => {
    const build = buildTest('tests/fixtures/registry-all-ready.json');
    return { build, snap: build.status === 0 ? snapshot(build.dir) : null };
  });
  assert.equal(build.status, 0, build.output.slice(-800));
  const pages = formPages(snap);
  const seen = { en: 0, de: 0, fr: 0, pl: 0 };
  for (const [file, html] of pages) {
    const locale = localeOf(file);
    seen[locale] += 1;
    const inputs = hiddenInputs(html);
    const names = inputs.map((i) => i.name);
    if (locale === 'en') {
      assert.deepEqual(names, ORIGINAL_HIDDEN, `${file}: an English page changed its fields`);
      continue;
    }
    assert.equal(names.filter((n) => n === 'language').length, 1, `${file}: exactly one language field`);
    assert.equal(inputs.find((i) => i.name === 'language').value, locale, `${file}: language value`);
    assert.equal(inputs.find((i) => i.name === 'page').value, pathOfFile(file), `${file}: page value is its own address`);
    assert.deepEqual(names, ['page', 'segment', 'country', 'language', 'lead', 'link'], `${file}: field order`);
    assert.match(html, /language:\s*f\['language'\]\.value/, `${file}: the script sends the language`);
    assert.deepEqual(fetches(html), [ENDPOINT], `${file}: addresses posted to`);
  }
  assert.equal(seen.de, 2, 'German pages with the form: home and Germany');
  assert.equal(seen.fr, 3, 'French pages with the form: home, France and Belgium');
  assert.equal(seen.pl, 1, 'Polish pages with the form: home');
  assert.ok(seen.en >= 4, 'English pages with the form');
});
