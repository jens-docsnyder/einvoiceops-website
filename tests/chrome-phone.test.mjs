// The phone-width look of the translated pages, checked in a real Chrome. Chrome headless cannot lay a window out below
// about 500px, so each page is loaded in a 390px wide iframe, which gets its own viewport and media queries. Skipped, with
// the reason, when Chrome is not at the usual place (or at CHROME_BIN).
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { buildTest, snapshot, tags, withBuildLock } from './_lib/site.mjs';

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const skip = existsSync(CHROME) ? false : `Chrome not found at ${CHROME} (set CHROME_BIN to run the phone width checks)`;
const WIDTH = 390;

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

// Runs inside Chrome: loads each page into the iframe in turn and writes what it measured into <pre id="out">.
const wrapper = (pages) => `<!doctype html><meta charset="utf-8"><body style="margin:0">
<iframe id="f" width="${WIDTH}" height="800" style="border:0"></iframe><pre id="out">pending</pre>
<script>
const pages = ${JSON.stringify(pages)};
const results = {};
const f = document.getElementById('f');
function measure(page) {
  const d = f.contentDocument;
  const nav = d.querySelector('nav.langnav');
  const links = nav ? [...nav.querySelectorAll('a')].map((a) => {
    const r = a.getBoundingClientRect();
    const s = getComputedStyle(a);
    a.focus();
    return { text: a.textContent, left: r.left, right: r.right, width: r.width, height: r.height, tabIndex: a.tabIndex,
      shown: s.display !== 'none' && s.visibility !== 'hidden', focused: d.activeElement === a };
  }) : null;
  const nr = nav ? nav.getBoundingClientRect() : null;
  const grids = [...d.querySelectorAll('main *')].filter((e) => getComputedStyle(e).display === 'grid')
    .map((e) => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  results[page] = { inner: f.contentWindow.innerWidth, scroll: d.documentElement.scrollWidth, links, nav: nr && { left: nr.left, right: nr.right }, grids };
}
let i = 0;
function next() {
  if (i >= pages.length) { document.getElementById('out').textContent = JSON.stringify(results); return; }
  const page = pages[i++];
  f.onload = () => setTimeout(() => { measure(page); next(); }, 150);
  f.src = page;
}
next();
</script>`;

function serve(root, pages) {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/__phone__') {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      return res.end(wrapper(pages));
    }
    let p = path.join(root, decodeURIComponent(u.pathname));
    if (p.endsWith(path.sep)) p += 'index.html';
    if (!p.startsWith(root) || !existsSync(p)) {
      res.statusCode = 404;
      return res.end('not found');
    }
    res.setHeader('content-type', TYPES[path.extname(p)] || 'application/octet-stream');
    res.end(readFileSync(p));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Async on purpose: the page server above lives in this process and has to answer while Chrome runs.
function runChrome(extra) {
  return new Promise((resolve, reject) => {
    const args = ['--headless=new', '--disable-gpu', '--virtual-time-budget=60000', '--dump-dom', ...extra];
    const child = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => (stdout += c));
    child.stderr.on('data', (c) => (stderr += c));
    const timer = setTimeout(() => child.kill('SIGKILL'), 120000);
    child.on('error', reject);
    child.on('close', () => {
      clearTimeout(timer);
      resolve({ stdout, stderr });
    });
  });
}

let cached;
const measured = () =>
  (cached ??= (async () => {
    // The pages are served from a copy: other test files rebuild the same output folder while this one is in Chrome.
    const copy = mkdtempSync(path.join(os.tmpdir(), 'phone-site-'));
    const built = await withBuildLock(() => {
      const build = buildTest('tests/fixtures/registry-all-ready.json');
      if (build.status !== 0) return { build, snap: null };
      cpSync(build.dir, copy, { recursive: true });
      return { build, snap: snapshot(copy) };
    });
    assert.equal(built.build.status, 0, built.build.output.slice(-800));
    const pages = [...built.snap.text.keys()].filter((f) => f.endsWith('.html') && f !== '404.html')
      .map((f) => (f === 'index.html' ? '/' : '/' + f.replace(/index\.html$/, '')));
    const server = await serve(built.snap.dir, pages);
    const profile = mkdtempSync(path.join(os.tmpdir(), 'phone-chrome-'));
    try {
      const run = await runChrome([`--user-data-dir=${profile}`, `http://127.0.0.1:${server.address().port}/__phone__`]);
      const m = /<pre id="out">([\s\S]*?)<\/pre>/.exec(run.stdout);
      assert.ok(m && m[1] !== 'pending', `Chrome gave no measurements: ${run.stderr.slice(-400)}`);
      const text = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      return { results: JSON.parse(text), snap: built.snap, pages };
    } finally {
      server.close();
      rmSync(profile, { recursive: true, force: true });
      rmSync(copy, { recursive: true, force: true });
    }
  })());

const fileOf = (page) => (page === '/' ? 'index.html' : page.slice(1) + 'index.html');
const englishTwin = (snap, page) => {
  const alt = tags(snap.text.get(fileOf(page)), 'link').find((l) => l.rel === 'alternate' && l.hreflang === 'en');
  return alt ? new URL(alt.href).pathname : page;
};

test('phone width: no page scrolls sideways at 390px', { skip }, async () => {
  const { results, pages } = await measured();
  assert.ok(pages.length >= 12, `expected the 12 pages, found ${pages.length}`);
  for (const page of pages) {
    const r = results[page];
    assert.ok(r, `${page}: not measured`);
    assert.equal(r.inner, WIDTH, `${page}: the iframe is ${r.inner}px wide, not ${WIDTH}`);
    assert.ok(r.scroll <= WIDTH, `${page}: the page is ${r.scroll}px wide at ${WIDTH}px`);
  }
});

test('phone width: the selector sits on its own full-width row, every language inside the screen, big enough to tap', { skip }, async () => {
  const { results, pages, snap } = await measured();
  let withSelector = 0;
  for (const page of pages) {
    const r = results[page];
    const expected = snap.text.get(fileOf(page)).includes('class="langnav"');
    assert.equal(Boolean(r.links), expected, `${page}: Chrome ${r.links ? 'found' : 'did not find'} the selector the HTML ${expected ? 'has' : 'lacks'}`);
    if (!r.links) continue;
    withSelector += 1;
    assert.ok(r.nav.right - r.nav.left >= WIDTH - 60, `${page}: the selector is ${Math.round(r.nav.right - r.nav.left)}px wide, not a row of its own`);
    for (const l of r.links) {
      assert.ok(l.left >= 0 && l.right <= WIDTH, `${page}: ${l.text} is outside the screen (${l.left} to ${l.right})`);
      assert.ok(l.height >= 44, `${page}: ${l.text} is ${l.height}px high`);
    }
    for (let i = 1; i < r.links.length; i += 1) {
      const a = r.links[i - 1];
      const b = r.links[i];
      const sameRow = Math.abs(a.top - b.top) < 4;
      assert.ok(!sameRow || a.right <= b.left, `${page}: ${a.text} and ${b.text} overlap`);
    }
  }
  assert.ok(withSelector >= 10, `the selector was measured on ${withSelector} pages`);
});

test('phone width: every language link can take keyboard focus', { skip }, async () => {
  const { results, pages } = await measured();
  for (const page of pages) {
    const r = results[page];
    if (!r.links) continue;
    for (const l of r.links) {
      assert.ok(l.shown, `${page}: ${l.text} is hidden`);
      assert.ok(l.tabIndex >= 0, `${page}: ${l.text} is out of the tab order`);
      assert.ok(l.focused, `${page}: ${l.text} did not take focus`);
    }
  }
});

test('phone width: a translated page lays out in the same columns as its English page', { skip }, async () => {
  const { results, pages, snap } = await measured();
  let compared = 0;
  for (const page of pages.filter((p) => /^\/(de|fr|pl)\//.test(p))) {
    const twin = englishTwin(snap, page);
    assert.ok(results[twin], `${page}: no English twin measured (${twin})`);
    assert.deepEqual(results[page].grids, results[twin].grids, `${page}: grid columns differ from ${twin}`);
    compared += 1;
  }
  assert.equal(compared, 6);
});
