// Shared helpers for the site tests: a lock so builds never overlap, build runners, and plain-string HTML reading.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SITE = 'https://einvoiceops.eu';
const LOCK = path.join(ROOT, '.astro', 'test-build.lock');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// node --test runs the files at the same time, and two astro builds in one folder would collide.
export async function withBuildLock(fn) {
  mkdirSync(path.dirname(LOCK), { recursive: true });
  const start = Date.now();
  for (;;) {
    try {
      mkdirSync(LOCK);
      break;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      try {
        if (Date.now() - statSync(LOCK).mtimeMs > 10 * 60 * 1000) rmSync(LOCK, { recursive: true, force: true });
      } catch {}
      if (Date.now() - start > 15 * 60 * 1000) throw new Error('Timed out waiting for the build lock');
      await sleep(250);
    }
  }
  try {
    return await fn();
  } finally {
    rmSync(LOCK, { recursive: true, force: true });
  }
}

function cleanEnv() {
  const env = { ...process.env };
  delete env.I18N_TEST_REGISTRY;
  return env;
}

// The real build, exactly as the deploy runs it. Output goes to dist/.
export function buildReal() {
  const run = spawnSync('npm', ['run', 'build'], { cwd: ROOT, env: cleanEnv(), encoding: 'utf8' });
  return { status: run.status, output: `${run.stdout}\n${run.stderr}` };
}

// A test build through the test script. The output folder is the one the script reports.
export function buildTest(registryFile) {
  const run = spawnSync('node', ['scripts/test-build.mjs', registryFile], { cwd: ROOT, env: cleanEnv(), encoding: 'utf8' });
  const output = `${run.stdout}\n${run.stderr}`;
  const reported = /Test build written to (.+)/.exec(run.stdout || '');
  return { status: run.status, output, dir: reported ? reported[1].trim() : '' };
}

// Every file under a folder, as relative paths with forward slashes.
export function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = path.join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(path.relative(dir, full).split(path.sep).join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

// A snapshot of a built site: the file list, and the text of every html and xml file.
export function snapshot(dir) {
  const files = listFiles(dir);
  const text = new Map();
  for (const f of files) {
    if (/\.(html|xml|txt)$/.test(f)) text.set(f, readFileSync(path.join(dir, f), 'utf8'));
  }
  return { dir, files, text };
}

// Built file path for a site path: "/de/" is "de/index.html", "/404.html" is "404.html".
export function fileFor(sitePath) {
  const p = sitePath.replace(/^\//, '');
  if (p === '') return 'index.html';
  if (p.endsWith('/')) return `${p}index.html`;
  return p;
}

// Site path of a built html file: "de/index.html" is "/de/".
export function pathOfFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`;
  return `/${file}`;
}

export function attrs(tagSource) {
  const out = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(tagSource))) out[m[1].toLowerCase()] = m[2] !== undefined ? m[2] : m[3];
  return out;
}

// All <a> elements in a piece of html: attributes and inner text.
export function anchors(html) {
  const out = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({ ...attrs(m[1]), raw: m[0], text: m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() });
  }
  return out;
}

// All void tags of one name, for example every <link> in the document.
export function tags(html, name) {
  const out = [];
  const re = new RegExp(`<${name}\\b([^>]*)>`, 'g');
  let m;
  while ((m = re.exec(html))) out.push(attrs(m[1]));
  return out;
}

export function between(html, openRe, closeStr) {
  const open = openRe.exec(html);
  if (!open) return '';
  const from = open.index;
  const to = html.indexOf(closeStr, from);
  return to === -1 ? '' : html.slice(from, to + closeStr.length);
}

export function htmlLang(html) {
  const m = /<html\b([^>]*)>/.exec(html);
  return m ? attrs(m[1]).lang : undefined;
}

export function pathOnly(href) {
  return href.split('#')[0].split('?')[0];
}

export const exists = (p) => existsSync(p);
