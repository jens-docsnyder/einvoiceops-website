// The part of the page chrome that Node can check from built HTML: the page language, the selector as real links a keyboard
// can reach, and the language field of the contact form. (The phone-width look is checked in Chrome by chrome-phone.test.mjs.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { anchors, attrs, between, buildTest, htmlLang, pathOfFile, snapshot, withBuildLock } from './_lib/site.mjs';

const localeOf = (file) => (/^(de|fr|pl)\//.test(file) ? file.split('/')[0] : 'en');
const pages = (snap) => [...snap.text.entries()].filter(([file]) => file.endsWith('.html'));

let cached;
const testBuild = () =>
  (cached ??= withBuildLock(() => {
    const build = buildTest('tests/fixtures/registry-all-ready.json');
    return { build, snap: build.status === 0 ? snapshot(build.dir) : null };
  }));

test('every page says its language in <html lang>', async () => {
  const { build, snap } = await testBuild();
  assert.equal(build.status, 0, build.output.slice(-800));
  const list = pages(snap).filter(([file]) => file !== '404.html');
  assert.ok(list.length >= 12, `expected the 12 pages, found ${list.length}`);
  for (const [file, html] of list) {
    assert.equal(htmlLang(html), localeOf(file), `${file}: <html lang>`);
  }
  const lang404 = htmlLang(snap.text.get('404.html') ?? '');
  assert.ok(lang404, '404.html has a lang');
});

test('the selector is a nav of real links with no negative tabindex, on every page that offers a choice', async () => {
  const { snap } = await testBuild();
  let withSelector = 0;
  for (const [file, html] of pages(snap)) {
    const nav = between(html, /<nav\b[^>]*class="langnav"/, '</nav>');
    if (!nav) continue;
    withSelector += 1;
    const open = /<nav\b([^>]*)>/.exec(nav)[1];
    const a = attrs(open);
    assert.ok(a['aria-label'], `${file}: the selector nav has a label`);
    assert.ok(a.tabindex === undefined || Number(a.tabindex) >= 0, `${file}: the nav itself is not reachable`);
    const links = anchors(nav);
    assert.ok(links.length >= 2, `${file}: the selector offers at least two languages`);
    assert.equal(nav.split('<a ').length - 1, links.length, `${file}: every language is an <a>`);
    for (const l of links) {
      assert.ok(l.href && l.href.startsWith('/'), `${file}: ${l.text} has a real href`);
      assert.ok(!/^javascript:/i.test(l.href), `${file}: ${l.text} href`);
      assert.ok(l.tabindex === undefined || Number(l.tabindex) >= 0, `${file}: ${l.text} has a negative tabindex`);
      assert.ok(l.text.length > 0, `${file}: a language link with no name`);
    }
    assert.ok(!/<(button|select)\b/.test(nav), `${file}: the selector holds a control that is not a link`);
    assert.equal(links.filter((l) => l['aria-current']).length, 1, `${file}: exactly one current language`);
    assert.equal(links.find((l) => l['aria-current']).hreflang, localeOf(file), `${file}: the current language is its own`);
  }
  assert.ok(withSelector >= 10, `the selector is on the pages that have another language (${withSelector})`);
  for (const home of ['index.html', 'de/index.html', 'fr/index.html', 'pl/index.html']) {
    assert.ok(snap.text.get(home).includes('class="langnav"'), `${home}: no selector`);
  }
});

test('the contact form on every translated page has the language field, set to the page language', async () => {
  const { snap } = await testBuild();
  const translated = pages(snap).filter(([file]) => localeOf(file) !== 'en' && file !== '404.html');
  assert.equal(translated.length, 6);
  for (const [file, html] of translated) {
    const m = /<input\b[^>]*name="language"[^>]*>/.exec(html);
    assert.ok(m, `${file}: no language field`);
    assert.equal(attrs(m[0]).value, localeOf(file), `${file}: ${pathOfFile(file)} language value`);
  }
});
