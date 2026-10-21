// Every language is not ready in the real registry, so the real build is the English site and nothing more.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, buildReal, snapshot, withBuildLock } from './_lib/site.mjs';

let site;
let buildResult;
let refusal;
let directRefusal;

test('setup: real build', async () => {
  await withBuildLock(() => {
    buildResult = buildReal();
    if (buildResult.status === 0) site = snapshot(path.join(ROOT, 'dist'));
    // The test hook must be refused by the real build, whatever the registry file holds.
    const run = spawnSync('npm', ['run', 'build'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, I18N_TEST_REGISTRY: path.join(ROOT, 'tests', 'fixtures', 'registry-all-ready.json') },
    });
    refusal = { status: run.status, output: `${run.stdout}\n${run.stderr}` };
    // The same, started without npm: astro itself, into dist/, the folder the deploy publishes.
    const direct = spawnSync(path.join(ROOT, 'node_modules', '.bin', 'astro'), ['build'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, I18N_TEST_REGISTRY: path.join(ROOT, 'tests', 'fixtures', 'registry-all-ready.json') },
    });
    directRefusal = { status: direct.status, output: `${direct.stdout}\n${direct.stderr}` };
    // Leave dist as the real build makes it.
    buildReal();
  });
  assert.equal(buildResult.status, 0, `npm run build failed:\n${buildResult.output.slice(-1500)}`);
});

test('no /de/, /fr/ or /pl/ path exists in dist', () => {
  for (const lang of ['de', 'fr', 'pl']) {
    const hits = site.files.filter((f) => f === lang || f.startsWith(`${lang}/`));
    assert.deepEqual(hits, [], `paths under /${lang}/ exist in dist`);
  }
});

test('no language selector markup in any built page', () => {
  for (const [file, html] of site.text) {
    if (!file.endsWith('.html')) continue;
    assert.ok(!/langnav|aria-label="Language"|aria-label='Language'/i.test(html), `${file} has language selector markup`);
    assert.ok(!/<[^>]+\blang="(de|fr|pl)"/.test(html), `${file} has an element in another language`);
  }
});

test('no hreflang string in any built html or the sitemap', () => {
  for (const [file, text] of site.text) {
    assert.ok(!/hreflang/i.test(text), `${file} contains hreflang`);
  }
  assert.ok(site.text.has('sitemap.xml'), 'sitemap.xml is missing');
});

test('sitemap has no alternate links', () => {
  const sitemap = site.text.get('sitemap.xml');
  assert.ok(!/xhtml:link/.test(sitemap), 'sitemap has xhtml:link');
  assert.ok(!/xmlns:xhtml/.test(sitemap), 'sitemap declares the xhtml namespace');
  assert.ok(!/rel="alternate"/.test(sitemap), 'sitemap has rel=alternate');
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs.sort(), [
    'https://einvoiceops.eu/', 'https://einvoiceops.eu/belgium/', 'https://einvoiceops.eu/france/',
    'https://einvoiceops.eu/germany/', 'https://einvoiceops.eu/legal/', 'https://einvoiceops.eu/privacy/',
  ].sort());
});

test('every page is English with no alternate links in the head', () => {
  for (const [file, html] of site.text) {
    if (!file.endsWith('.html')) continue;
    assert.ok(/<html lang="en">/.test(html), `${file} is not lang="en"`);
    assert.ok(!/rel="alternate"/.test(html), `${file} has rel=alternate`);
    assert.ok(!/og:locale/.test(html), `${file} has og:locale`);
  }
});

test('npm run build refuses the test registry variable', () => {
  assert.notEqual(refusal.status, 0, 'a real build with I18N_TEST_REGISTRY set succeeded');
});

test('astro build into dist/ refuses the test registry variable, however it is started', () => {
  assert.notEqual(directRefusal.status, 0, 'astro build with I18N_TEST_REGISTRY set wrote to dist/');
  assert.match(directRefusal.output, /I18N_TEST_REGISTRY is set .* would write to dist\//);
});

// Site.astro loads the registry with import() because a static import there moved the home page's form styles ahead of
// the site stylesheet: the English output changed and the cascade with it. This holds the order without a baseline.
test('the site stylesheet comes first in the head of every page', () => {
  for (const [file, html] of site.text) {
    if (!file.endsWith('.html')) continue;
    const head = html.split('</head>')[0];
    const first = /<link rel="stylesheet" href="([^"]+)"|<style\b/.exec(head);
    assert.ok(first && /^\/_astro\/Site\.[^/]+\.css$/.test(first[1] || ''),
      `${file}: the first style in the head is ${first ? first[1] || 'an inline <style>' : 'missing'}, not the site stylesheet. ` +
      'An import added to Site.astro or a page component changed the order in which the build writes styles; see the comment at the registry import in Site.astro.');
  }
});

test('the real build never reads tests/fixtures', () => {
  // Nothing the real build loads may name the fixtures folder or the test script.
  const files = ['astro.config.mjs', 'package.json'];
  for (const f of files) {
    const text = readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/fixtures/.test(text), `${f} mentions fixtures`);
    if (f === 'package.json') {
      const scripts = JSON.parse(text).scripts;
      assert.ok(!/I18N_TEST_REGISTRY|test-build/.test(scripts.build + scripts.dev + scripts.preview), 'a build script uses the test hook');
    }
  }
  const grep = spawnSync('grep', ['-rIl', 'tests/fixtures', 'src', 'public', '.github', 'astro.config.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(grep.stdout.trim(), '', `source names the fixtures folder:\n${grep.stdout}`);
});
