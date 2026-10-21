// hreflang, canonical, html lang and the sitemap alternates on a test build with every language ready.
// The expected groups are typed from "The URL map" in the plan.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE, attrs, buildTest, fileFor, htmlLang, pathOfFile, snapshot, tags, withBuildLock } from './_lib/site.mjs';

// Pages that are the same page in several languages.
const GROUPS = [
  { en: '/', de: '/de/', fr: '/fr/', pl: '/pl/' },
  { en: '/germany/', de: '/de/deutschland/' },
  { en: '/france/', fr: '/fr/france/' },
  { en: '/belgium/', fr: '/fr/belgique/' },
];
const LANG_OF_PATH = {
  '/': 'en', '/de/': 'de', '/fr/': 'fr', '/pl/': 'pl',
  '/germany/': 'en', '/france/': 'en', '/belgium/': 'en', '/legal/': 'en', '/privacy/': 'en', '/404.html': 'en',
  '/de/deutschland/': 'de', '/fr/france/': 'fr', '/fr/belgique/': 'fr',
};
const OG_PREFIX = { en: 'en_', de: 'de_', fr: 'fr_', pl: 'pl_' };

let site;
const pages = new Map(); // site path -> { html, alternates: Map(hreflang -> href), canonical }

test('setup: test build with every language ready', async () => {
  const result = await withBuildLock(() => {
    const build = buildTest('tests/fixtures/registry-all-ready.json');
    return { build, site: build.status === 0 && build.dir ? snapshot(build.dir) : null };
  });
  assert.equal(result.build.status, 0, `test build failed:\n${result.build.output.slice(-1500)}`);
  site = result.site;
  for (const [file, html] of site.text) {
    if (!file.endsWith('.html')) continue;
    const links = tags(html, 'link');
    const alternates = new Map();
    const duplicates = [];
    for (const l of links) {
      if (l.rel !== 'alternate' || l.hreflang === undefined) continue;
      if (alternates.has(l.hreflang)) duplicates.push(l.hreflang);
      alternates.set(l.hreflang, l.href);
    }
    const canon = links.filter((l) => l.rel === 'canonical').map((l) => l.href);
    pages.set(pathOfFile(file), { html, alternates, canonical: canon, duplicates });
  }
});

test('every page has exactly one canonical equal to its own absolute URL', () => {
  for (const [p, page] of pages) {
    if (p === '/404.html') continue;
    assert.deepEqual(page.canonical, [`${SITE}${p}`], `${p}`);
  }
});

test('html lang is correct on every page', () => {
  for (const [p, page] of pages) {
    assert.equal(htmlLang(page.html), LANG_OF_PATH[p], `${p} has lang=${htmlLang(page.html)}`);
  }
});

test('og:locale matches the page language on pages with alternates, and is absent elsewhere', () => {
  for (const [p, page] of pages) {
    const metas = tags(page.html, 'meta');
    const og = metas.filter((m) => m.property === 'og:locale').map((m) => m.content);
    if (page.alternates.size === 0) {
      assert.equal(og.length, 0, `${p} is English only and must stay as it was`);
      continue;
    }
    assert.equal(og.length, 1, `${p} has ${og.length} og:locale`);
    assert.ok(og[0].startsWith(OG_PREFIX[LANG_OF_PATH[p]]), `${p} og:locale ${og[0]}`);
  }
});

test('the alternates of each page are exactly its group, plus x-default on English', () => {
  for (const group of GROUPS) {
    const expected = new Map(Object.entries(group).map(([lang, p]) => [lang, `${SITE}${p}`]));
    expected.set('x-default', `${SITE}${group.en}`);
    for (const p of Object.values(group)) {
      const page = pages.get(p);
      assert.ok(page, `${p} was not built`);
      assert.deepEqual(page.duplicates, [], `${p} repeats an hreflang`);
      assert.deepEqual([...page.alternates].sort(), [...expected].sort(), `${p}`);
    }
  }
});

test('pages with one language carry no alternates', () => {
  for (const p of ['/legal/', '/privacy/', '/404.html']) {
    assert.equal(pages.get(p).alternates.size, 0, `${p} has alternates`);
  }
});

test('x-default points to the English URL on every page that has alternates', () => {
  for (const [p, page] of pages) {
    if (page.alternates.size === 0) continue;
    assert.equal(page.alternates.get('x-default'), page.alternates.get('en'), `${p}`);
    assert.ok(!/\/(de|fr|pl)\//.test(page.alternates.get('x-default')), `${p} x-default is not English`);
  }
});

test('hreflang pairs are reciprocal: if A names B, B names A', () => {
  const siteOf = (url) => url.replace(SITE, '');
  for (const [p, page] of pages) {
    for (const [lang, href] of page.alternates) {
      if (lang === 'x-default') continue;
      assert.ok(href.startsWith(SITE), `${p}: ${href} is not absolute`);
      const target = pages.get(siteOf(href));
      assert.ok(target, `${p} names ${href} which was not built`);
      assert.equal(htmlLang(target.html), lang, `${p} calls ${href} "${lang}" but it is lang=${htmlLang(target.html)}`);
      const back = [...target.alternates].filter(([, h]) => h === `${SITE}${p}`).map(([l]) => l);
      assert.ok(back.length > 0, `${p} names ${href} but ${siteOf(href)} does not name ${p} back`);
      assert.equal(target.alternates.get(LANG_OF_PATH[p]), `${SITE}${p}`, `${siteOf(href)} names a different page for ${LANG_OF_PATH[p]}`);
    }
    if (page.alternates.size) {
      assert.equal(page.alternates.get(LANG_OF_PATH[p]), `${SITE}${p}`, `${p} does not list itself`);
    }
  }
});

test('sitemap alternates match the head alternates one for one', () => {
  const xml = site.text.get('sitemap.xml');
  assert.ok(xml, 'no sitemap.xml');
  const entries = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]*)<\/loc>/.exec(m[1])[1];
    assert.ok(!entries.has(loc), `sitemap lists ${loc} twice`);
    const alts = new Map();
    for (const l of m[1].matchAll(/<xhtml:link\b([^>]*?)\/?>/g)) {
      const a = attrs(l[1]);
      assert.equal(a.rel, 'alternate');
      assert.ok(!alts.has(a.hreflang), `${loc} repeats ${a.hreflang}`);
      alts.set(a.hreflang, a.href);
    }
    entries.set(loc, alts);
  }
  // Every built page except the 404 is listed, and nothing else.
  const expectedLocs = [...pages.keys()].filter((p) => p !== '/404.html').map((p) => `${SITE}${p}`).sort();
  assert.deepEqual([...entries.keys()].sort(), expectedLocs);
  for (const [p, page] of pages) {
    if (p === '/404.html') continue;
    assert.deepEqual([...entries.get(`${SITE}${p}`)].sort(), [...page.alternates].sort(), `sitemap and head differ for ${p}`);
  }
  assert.ok(/xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/.test(xml), 'sitemap does not declare the xhtml namespace');
});

test('sanity: the page set is the one the URL map names', () => {
  const expected = Object.keys(LANG_OF_PATH).sort();
  assert.deepEqual([...pages.keys()].sort(), expected);
  for (const p of expected) assert.ok(site.text.has(fileFor(p)));
});
