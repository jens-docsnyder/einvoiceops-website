// The English words moved out of the components into src/i18n/dictionaries/en.ts and src/data/stories/home.ts. Each one has to
// be the text the original source (commit 3720675, before the language work) printed, character for character. The shape of
// the dictionaries is checked both on the function and through a real build.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, buildReal, withBuildLock } from './_lib/site.mjs';
import { importTs } from './_lib/ts.mjs';

const ORIGINAL = '3720675';
const original = (file) => {
  const run = spawnSync('git', ['show', `${ORIGINAL}:${file}`], { cwd: ROOT, encoding: 'utf8' });
  return run.status === 0 ? run.stdout : null;
};
const skip = original('src/layouts/Site.astro') === null ? `commit ${ORIGINAL} is not in this clone` : false;

const { en } = await importTs(new URL(`file://${path.join(ROOT, 'src/i18n/dictionaries/en.ts')}`).href);
const { shapeProblems } = await importTs(new URL(`file://${path.join(ROOT, 'src/i18n/dictionaries/index.ts')}`).href);
const { home } = await importTs(new URL(`file://${path.join(ROOT, 'src/data/stories/home.ts')}`).href);

// Each English word, with the markup it sat in before: the original file must hold before + word + after.
const SITE = 'src/layouts/Site.astro';
const STORY = 'src/components/site/StoryPage.astro';
const FORM = 'src/components/site/ContactForm.astro';
const WORDS = [
  ['countriesNavLabel', SITE, 'aria-label="', '"'],
  ['getInTouch', SITE, 'href={contact}>', '</a>'],
  ['getInTouch', STORY, '<a class="btn" href="#contact">', '</a>'],
  ['footerEntity', SITE, '<p class="foot-line">', ' · <a href="mailto:jens@einvoiceops.eu">'],
  ['legalNotice', SITE, '<a href="/legal/">', '</a>'],
  ['privacy', SITE, '<a href="/privacy/">', '</a>'],
  ['footerNote', SITE, '<p class="foot-note">', '</p>'],
  ['close', STORY, '<button type="button" class="sp-close">', '</button>'],
  ['whatWeDo', STORY, '<strong>', '</strong>'],
  ['futureChanges', 'src/components/site/ChangeBoxes.astro', '<span class="cb-next">', '</span>'],
  ['formSending', FORM, "button.textContent = '", "';"],
];

test('every English word in the dictionary is the original text, in its original markup', { skip }, () => {
  for (const [key, file, before, after] of WORDS) {
    assert.ok(typeof en[key] === 'string' && en[key].length > 0, `en.${key} is missing`);
    assert.ok(original(file).includes(`${before}${en[key]}${after}`), `en.${key} (${JSON.stringify(en[key])}) is not what ${file} printed in ${ORIGINAL}`);
  }
});

test('the form failure line and the LinkedIn label keep their words and their placeholder', { skip }, () => {
  const form = original(FORM);
  const [lead, tail] = en.formError.split('{mail}');
  assert.ok(form.includes(`>${lead}<a href=`), `formError starts differently: ${JSON.stringify(lead)}`);
  assert.ok(form.includes(`</a>${tail}</p>`), `formError ends differently: ${JSON.stringify(tail)}`);
  assert.equal(en.formError, 'Your message was not sent. Please email {mail} instead.');
  const [, rest] = en.linkedinLabel.split('{name}');
  assert.ok(form.includes('aria-label={`${person.name}' + rest + '`}'), `linkedinLabel differs: ${JSON.stringify(en.linkedinLabel)}`);
});

test('the country names and the list word are the original ones', { skip }, () => {
  const countries = original('src/data/countries.ts');
  assert.equal(en.countries.FR, 'France');
  assert.equal(en.countries.DE, 'Germany');
  assert.equal(en.countries.BE, 'Belgium');
  for (const cc of ['FR', 'DE', 'BE']) assert.ok(countries.includes(`name: '${en.countries[cc]}'`), `${cc} name`);
  assert.ok(original('src/content/countries/PL.md').includes(`country: ${en.countries.PL}\n`), 'PL name');
  assert.ok(original('src/pages/index.astro').includes(`.join(', ')} ${en.listAnd} \${names[`), 'listAnd');
});

test('the dictionary holds nothing that is not accounted for: new keys are only the ones the language work added', () => {
  const ADDED = ['languageNavLabel', 'inEnglish', 'listAnd', 'changeWord'];
  const FROM_ORIGINAL = new Set(WORDS.map((w) => w[0]).concat(['formError', 'linkedinLabel', 'countries']));
  for (const key of Object.keys(en)) {
    assert.ok(FROM_ORIGINAL.has(key) || ADDED.includes(key), `en.${key} is neither traced to the original nor a known addition`);
  }
  assert.equal(en.languageNavLabel, 'Language');
  assert.equal(en.inEnglish, '(in English)');
  assert.deepEqual(en.changeWord, { one: 'change', few: 'changes', many: 'changes' });
});

test('every English sentence of the home page story is in the original index.astro, apart from its placeholders', { skip }, () => {
  const src = original('src/pages/index.astro');
  const leaves = [];
  const walk = (v, at) => {
    if (typeof v === 'string') leaves.push([at, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${at}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${at}.${k}`);
  };
  walk(home, 'home');
  assert.ok(leaves.length >= 20, 'the story holds the home page copy');
  // Copy written after the language work, locked 2026-10-22: the hero, the subheader and the country banner; the country card key and the connected line; 2026-10-22 evening: the card button and the panel labels.
  const REWRITTEN = ['home.opening.h1', 'home.opening.subline', 'home.countries.h2', 'home.countries.line', 'home.countries.strip', 'home.countries.weekly', 'home.countries.panelIdle', 'home.countries.panelFn', 'home.countries.go', 'home.countries.labelSource', 'home.countries.labelFn'];
  for (const [at, text] of leaves) {
    if (REWRITTEN.includes(at)) continue;
    for (const piece of text.split(/\{\w+\}/).filter((p) => p.trim().length > 0)) {
      assert.ok(src.includes(piece), `${at}: ${JSON.stringify(piece)} is not in the original home page`);
    }
  }
});

// Three ways to break a dictionary. The shape check names the key each time.
// An empty value is reported as "close.: expected text" (a stray full stop after the key); the key is what matters here.
const norm = (list) => list.map((m) => m.replace(/\.:/, ':'));
const clone = (o) => JSON.parse(JSON.stringify(o));
test('the shape check names a missing key, an extra key and an empty value', async () => {
  const { pl } = await importTs(new URL(`file://${path.join(ROOT, 'src/i18n/dictionaries/pl.ts')}`).href);
  assert.deepEqual(shapeProblems(pl), []);

  const missing = clone(pl);
  delete missing.footerNote;
  assert.deepEqual(norm(shapeProblems(missing)), ['footerNote: missing']);

  const extra = clone(pl);
  extra.surplusKey = 'x';
  assert.deepEqual(norm(shapeProblems(extra)), ['surplusKey: not in English']);

  const empty = clone(pl);
  empty.close = '';
  assert.deepEqual(norm(shapeProblems(empty)), ['close: expected text']);

  const nested = clone(pl);
  delete nested.countries.BE;
  nested.changeWord.few = '';
  assert.deepEqual(norm(shapeProblems(nested)).sort(), ['changeWord.few: expected text', 'countries.BE: missing']);
});

// The same three breaks in the real build: it has to stop, and say which key. The source is put back afterwards.
const PL = path.join(ROOT, 'src/i18n/dictionaries/pl.ts');
const LINE = /^export const pl: Dictionary = .*$/m;
const ASSIGN = (body) => () => `export const pl: Dictionary = ${body} as any;`;
for (const [name, body, expected] of [
  ['a missing key', "(() => { const { footerNote, ...rest } = en; return rest; })()", 'footerNote: missing'],
  ['an extra key', "{ ...en, surplusKey: 'x' }", 'surplusKey: not in English'],
  ['an empty value', "{ ...en, close: '' }", 'close: expected text'],
]) {
  test(`the real build stops on ${name} in the Polish dictionary and names the key`, async () => {
    await withBuildLock(() => {
      const before = readFileSync(PL, 'utf8');
      const after = before.replace(LINE, ASSIGN(body));
      assert.notEqual(after, before, 'the sabotage did not change the file');
      writeFileSync(PL, after);
      try {
        const build = buildReal();
        assert.notEqual(build.status, 0, 'the build passed with a broken dictionary');
        assert.ok(build.output.replace(/\.: /g, ': ').includes(expected), `the message does not name the key (${expected}):\n${build.output.slice(-1200)}`);
        assert.ok(/pl dictionary/.test(build.output), 'the message does not name the language');
      } finally {
        writeFileSync(PL, before);
      }
    });
  });
}

// The parity gate reads the placeholders a story may use. The home story names them in its header comment, and the page fills
// exactly those: {countries}, {since}, {weekly} and {name}.
test('the home story uses only the placeholders its header comment lists, and the page fills them', () => {
  const text = readFileSync(path.join(ROOT, 'src/data/stories/home.ts'), 'utf8');
  const [header, body] = [text.slice(0, text.indexOf('export const home')), text.slice(text.indexOf('export const home'))];
  const listed = new Set(header.match(/\{\w+\}/g));
  const used = new Set(body.match(/\{\w+\}/g));
  assert.deepEqual([...listed].sort(), ['{countries}', '{fn}', '{m}', '{name}', '{n}', '{since}', '{weekly}']);
  assert.deepEqual([...used].sort(), ['{countries}', '{fn}', '{m}', '{name}', '{n}', '{since}', '{weekly}']);
  const page = readFileSync(path.join(ROOT, 'src/components/site/HomePage.astro'), 'utf8');
  for (const key of ['countries', 'since', 'weekly', 'name']) {
    assert.ok(new RegExp(`put\\([^)]*\\{[^}]*\\b${key}\\b`).test(page), `HomePage.astro does not fill {${key}}`);
  }
  // No sentence is typed in the page itself: between tags there is only code.
  const markup = page.slice(page.indexOf('<Site'), page.indexOf('<style'));
  assert.deepEqual(markup.match(/>[^<>{}]*[A-Za-z][^<>{}]*</g)?.map((s) => s.trim()) ?? [], [], 'English text typed in HomePage.astro');
});
