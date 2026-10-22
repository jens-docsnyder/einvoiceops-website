// A test build with every language ready (English copied into each) must route links as the plan's table says.
// The expected values below are typed from "The URL map" and "Where each link goes" in the plan, not read from the code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { anchors, attrs, between, buildTest, fileFor, pathOnly, snapshot, withBuildLock } from './_lib/site.mjs';

// Where a visitor in each language lands when clicking each country. Poland has no page in this run.
const LANDS = {
  en: { france: '/france/', germany: '/germany/', belgium: '/belgium/' },
  de: { france: '/france/', germany: '/de/deutschland/', belgium: '/belgium/' },
  fr: { france: '/fr/france/', germany: '/germany/', belgium: '/fr/belgique/' },
  pl: { france: '/france/', germany: '/germany/', belgium: '/belgium/' },
};
const HOME = { en: '/', de: '/de/', fr: '/fr/', pl: '/pl/' };
const COUNTRY_OF = {
  '/france/': 'france', '/fr/france/': 'france',
  '/germany/': 'germany', '/de/deutschland/': 'germany',
  '/belgium/': 'belgium', '/fr/belgique/': 'belgium',
};
const HOMES = new Set(Object.values(HOME));
const PAGES = [
  ['/', 'en', 'home'], ['/de/', 'de', 'home'], ['/fr/', 'fr', 'home'], ['/pl/', 'pl', 'home'],
  ['/france/', 'en', 'country'], ['/germany/', 'en', 'country'], ['/belgium/', 'en', 'country'],
  ['/de/deutschland/', 'de', 'country'], ['/fr/france/', 'fr', 'country'], ['/fr/belgique/', 'fr', 'country'],
  ['/legal/', 'en', 'static'], ['/privacy/', 'en', 'static'],
];
const ORDER = ['france', 'germany', 'belgium'];
// What the selector offers on each page: [label, href, lang].
const FOUR_HOMES = [['English', '/', 'en'], ['Deutsch', '/de/', 'de'], ['Français', '/fr/', 'fr'], ['Polski', '/pl/', 'pl']];
const SELECTOR = {
  '/': FOUR_HOMES, '/de/': FOUR_HOMES, '/fr/': FOUR_HOMES, '/pl/': FOUR_HOMES,
  '/germany/': [['English', '/germany/', 'en'], ['Deutsch', '/de/deutschland/', 'de']],
  '/de/deutschland/': [['English', '/germany/', 'en'], ['Deutsch', '/de/deutschland/', 'de']],
  '/france/': [['English', '/france/', 'en'], ['Français', '/fr/france/', 'fr']],
  '/fr/france/': [['English', '/france/', 'en'], ['Français', '/fr/france/', 'fr']],
  '/belgium/': [['English', '/belgium/', 'en'], ['Français', '/fr/belgique/', 'fr']],
  '/fr/belgique/': [['English', '/belgium/', 'en'], ['Français', '/fr/belgique/', 'fr']],
  '/legal/': null, '/privacy/': null,
};

let site;

test('setup: test build with every language ready', async () => {
  const result = await withBuildLock(() => {
    const build = buildTest('tests/fixtures/registry-all-ready.json');
    return { build, site: build.status === 0 && build.dir ? snapshot(build.dir) : null };
  });
  assert.equal(result.build.status, 0, `test build failed:\n${result.build.output.slice(-1500)}`);
  assert.ok(result.build.dir, 'the test script did not report an output folder');
  site = result.site;
});

const html = (p) => site.text.get(fileFor(p));
const region = (p, open, close) => between(html(p), open, close);
const header = (p) => region(p, /<header class="topbar">/, '</header>');
const footer = (p) => region(p, /<footer class="site-foot">/, '</footer>');
const langnav = (p) => between(html(p), /<nav class="langnav"/, '</nav>');

test('the built pages are exactly the URL map', () => {
  const built = site.files.filter((f) => f.endsWith('.html')).sort();
  const expected = [...PAGES.map(([p]) => fileFor(p)), '404.html'].sort();
  assert.deepEqual(built, expected);
});

test('no Poland page exists and nothing links to one', () => {
  assert.ok(!site.files.some((f) => /poland|polska/.test(f)), 'a Poland file exists');
  for (const [file, text] of site.text) {
    assert.ok(!/href=["'](https:\/\/einvoiceops\.eu)?\/(poland|pl\/polska)\//.test(text), `${file} links to a Poland page`);
  }
});

for (const [p, locale, kind] of PAGES) {
  test(`links on ${p}`, async (t) => {
    const lands = LANDS[locale];

    await t.test('wordmark opens the home page in the page language', () => {
      const wm = anchors(header(p)).filter((a) => (a.class || '').split(/\s+/).includes('wordmark'));
      assert.equal(wm.length, 1);
      assert.equal(wm[0].href, HOME[locale]);
    });

    await t.test('top bar country links follow the link rule', () => {
      const nav = region(p, /<nav class="topnav topnav-cc"/, '</nav>');
      assert.deepEqual(anchors(nav).map((a) => a.href), ORDER.map((c) => lands[c]));
    });

    await t.test('footer country links follow the link rule', () => {
      const cc = between(footer(p), /<p class="foot-line foot-cc">/, '</p>');
      assert.deepEqual(anchors(cc).map((a) => a.href), ORDER.map((c) => lands[c]));
    });

    await t.test('legal and privacy open the English page', () => {
      const f = anchors(footer(p));
      assert.deepEqual(f.filter((a) => /^\/(legal|privacy)\//.test(a.href || '')).map((a) => a.href), ['/legal/', '/privacy/']);
      assert.deepEqual(f.filter((a) => /legal|privacy/i.test(a.href || '')).map((a) => a.href), ['/legal/', '/privacy/']);
    });

    if (kind === 'home') {
      await t.test('country cards follow the link rule', () => {
        const cards = anchors(html(p)).filter((a) => (a.class || '').split(/\s+/).includes('card-head')).map((a) => a.href);
        assert.deepEqual(cards.sort(), ORDER.map((c) => lands[c]).sort());
      });
    }

    // The plan's table row "Get in touch | home page in that language", made precise (review 2026-10-21): the button opens
    // the page's own form where the page has one, as the English country pages always have, and the form on the home page
    // in the visitor's language elsewhere. Either way the visitor stays in their language.
    await t.test('"Get in touch" opens the form on this page, or on the home page in the page language', () => {
      const git = anchors(header(p)).filter((a) => /get in touch/i.test(a.text));
      assert.equal(git.length, 1, 'no "Get in touch" link in the top bar');
      const href = git[0].href;
      const ownForm = /\bid="contact"/.test(html(p));
      assert.equal(ownForm, kind !== 'static', `${p}: the home and country pages have a form, legal and privacy do not`);
      if (ownForm) assert.equal(href, '#contact', `${p} has its own form but "Get in touch" goes to ${href}`);
      else assert.equal(href, `${HOME[locale]}#contact`, `${p} has no form and "Get in touch" goes to ${href}`);
    });

    await t.test('every other internal link follows the table', () => {
      const body = html(p).replace(/<nav class="langnav"[\s\S]*?<\/nav>/, '');
      for (const a of anchors(body)) {
        const href = a.href;
        if (!href || !href.startsWith('/')) continue;
        const only = pathOnly(href);
        if (COUNTRY_OF[only]) assert.equal(only, lands[COUNTRY_OF[only]], `${href} should be ${lands[COUNTRY_OF[only]]}`);
        else if (HOMES.has(only)) assert.equal(only, HOME[locale], `${href} should be ${HOME[locale]}`);
        else assert.ok(['/legal/', '/privacy/'].includes(only), `unexpected internal link ${href}`);
      }
    });

    await t.test('the language selector offers what the plan says', () => {
      const expected = SELECTOR[p];
      const nav = langnav(p);
      if (expected === null) {
        assert.equal(nav, '', 'a page with one language has a selector');
        return;
      }
      assert.ok(/aria-label="Language"/.test(nav), 'the selector is not a labelled nav');
      const items = anchors(nav);
      assert.deepEqual(items.map((a) => [a.text, a.href, a.lang]), expected);
      for (const a of items) {
        assert.equal(a.hreflang, a.lang, 'hreflang on the selector link differs from its lang');
        assert.ok(a.tabindex === undefined || Number(a.tabindex) >= 0, 'selector link is out of the tab order');
      }
      const current = items.filter((a) => a['aria-current'] === 'page').map((a) => a.lang);
      assert.deepEqual(current, [locale], 'aria-current must mark exactly the page language');
    });
  });
}

test('choosing a language on a country page lands on the same page in that language', () => {
  const same = { germany: { en: '/germany/', de: '/de/deutschland/' }, france: { en: '/france/', fr: '/fr/france/' }, belgium: { en: '/belgium/', fr: '/fr/belgique/' } };
  for (const [p] of PAGES.filter(([, , k]) => k === 'country')) {
    const country = COUNTRY_OF[p];
    for (const a of anchors(langnav(p))) assert.equal(a.href, same[country][a.lang], `${p}: ${a.lang} goes to ${a.href}`);
    // A language the page does not exist in is not offered, so no visitor is sent to a missing page or the wrong country.
    assert.deepEqual(anchors(langnav(p)).map((a) => a.lang).sort(), Object.keys(same[country]).sort());
  }
});

test('on a home page choosing a language lands on that home page', () => {
  for (const p of ['/', '/de/', '/fr/', '/pl/']) {
    for (const a of anchors(langnav(p))) assert.equal(a.href, HOME[a.lang]);
  }
});

// A translated page is built by its own route (src/i18n/locale-home.astro, locale-page.astro). If one route rendered
// every kind of page, each page would carry the styles of all of them, and a country page's global rules would restyle
// the home page (at phone width every button went full width). The same page must carry the same styles in every language.
test('a translated page carries the same stylesheets in the same order as its English page', () => {
  const english = { ...Object.fromEntries(Object.values(HOME).map((h) => [h, '/'])) };
  for (const [p, c] of Object.entries(COUNTRY_OF)) english[p] = LANDS.en[c];
  const styles = (page) => [...html(page).split('</head>')[0].matchAll(/<link rel="stylesheet" href="([^"]+)"|<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1] || m[2]);
  for (const [p, locale] of PAGES) {
    if (locale === 'en') continue;
    assert.deepEqual(styles(p), styles(english[p]), `${p} does not carry the styles of ${english[p]}`);
  }
});

test('every internal link of every built page has a trailing slash', () => {
  for (const [file, text] of site.text) {
    if (!file.endsWith('.html')) continue;
    for (const a of anchors(text)) {
      if (!a.href || !a.href.startsWith('/')) continue;
      assert.ok(!a.href.startsWith('//'), `${file}: protocol-relative link ${a.href}`);
      const only = pathOnly(a.href);
      assert.ok(only.endsWith('/'), `${file}: internal link without a trailing slash: ${a.href}`);
    }
  }
});

test('no dead internal link: every internal href resolves to a built file', () => {
  for (const [file, text] of site.text) {
    if (!file.endsWith('.html')) continue;
    const refs = [];
    for (const m of text.matchAll(/<(a|link|img|script|source|form)\b([^>]*)>/g)) {
      const at = attrs(m[2]);
      const ref = m[1] === 'form' ? at.action : m[1] === 'a' || m[1] === 'link' ? at.href : at.src;
      if (ref && ref.startsWith('/') && !ref.startsWith('//')) refs.push(ref);
    }
    for (const ref of refs) {
      const only = pathOnly(ref);
      const target = path.join(site.dir, fileFor(only));
      assert.ok(existsSync(target), `${file}: ${ref} does not exist in the build`);
    }
  }
});
