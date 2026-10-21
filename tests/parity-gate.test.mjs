// The parity gate broken on purpose: each break is made from a real English story file (de.ts, fr-standalone.ts, be.ts,
// home.ts) and has to fail naming its key, through the checks, the command line check and, for some, a test build that
// has to stop. A stale hash only warns. The happy-path tests are parity-happy.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, buildTest, withBuildLock } from './_lib/site.mjs';
import { importTs } from './_lib/ts.mjs';

const load = (rel) => importTs(new URL(`file://${path.join(ROOT, rel)}`).href);
const parity = await load('src/i18n/parity.ts');
const { compareModules, hashOf, storyExportName, translatableKeys, ENGLISH_ONLY_EXPORT } = parity;

// Scratch files live under .astro/, which git ignores. A translated story for a build has to sit in src/data/stories/de/.
const TMP = path.join(ROOT, '.astro', 'parity-gate-test');
const DE_DIR = path.join(ROOT, 'src', 'data', 'stories', 'de');

const ENGLISH = {
  de: await load('src/data/stories/de.ts'),
  'fr-standalone': await load('src/data/stories/fr-standalone.ts'),
  be: await load('src/data/stories/be.ts'),
  home: await load('src/data/stories/home.ts'),
};

// A translated file as the import tool would write it, with the English text itself: the copy and a hash for every key.
function translation(file) {
  const en = ENGLISH[file];
  const name = storyExportName(en);
  const copy = structuredClone(en[name]);
  const from = Object.fromEntries([...translatableKeys(en[name])].map(([k, t]) => [k, hashOf(t)]));
  return { name, copy, from };
}

function parentOf(obj, keyPath) {
  const parts = keyPath.split('.');
  let o = obj;
  for (const p of parts.slice(0, -1)) o = o[p];
  return [o, parts[parts.length - 1]];
}

// Change one key of a translated copy. `change(parent, key)` edits it in place.
function broken(file, keyPath, change) {
  const t = translation(file);
  const [o, k] = parentOf(t.copy, keyPath);
  change(o, k, t);
  return t;
}

const modOf = (t) => ({ [t.name]: t.copy, from: t.from });
const check = (file, t) => compareModules(ENGLISH[file], modOf(t));
const tsOf = (t) => `export const ${t.name} = ${JSON.stringify(t.copy, null, 2)};\nexport const from = ${JSON.stringify(t.from, null, 2)};\n`;

// The command line check on a translated copy written to a scratch file.
function cli(file, t, label) {
  mkdirSync(TMP, { recursive: true });
  const out = path.join(TMP, `${label}.ts`);
  writeFileSync(out, tsOf(t));
  const run = spawnSync('node', ['scripts/parity-check.mjs', `src/data/stories/${file}.ts`, out], { cwd: ROOT, encoding: 'utf8' });
  rmSync(out, { force: true });
  return run;
}

// The nine breaks of the run plan, item 4. `key` is the key path the problem line must start with.
const BREAKS = [
  { name: 'dropped key', file: 'de', key: 'followed.closing.then', change: (o, k) => delete o[k], says: 'missing' },
  { name: 'extra key', file: 'fr-standalone', key: 'opening.note', change: (o) => { o.note = 'Ein Zusatz'; }, says: 'not in the English' },
  {
    name: 'dropped placeholder', file: 'be', key: 'market.cards.2.back.then.otherwise',
    change: (o, k) => { o[k] = o[k].replace('{missed:law@2026-01-01}', 'some'); }, says: 'placeholders differ',
  },
  { name: 'renamed placeholder', file: 'home', key: 'countries.go', change: (o, k) => { o[k] = o[k].replace('{name}', '{nom}'); }, says: 'placeholders differ' },
  {
    name: 'dropped tag', file: 'fr-standalone', key: 'market.cards.0.back.points.1',
    change: (o, k) => { o[k] = o[k].replace(/<a href='[^']*54499535'>the order<\/a>/, 'the order'); }, says: 'tags differ',
  },
  {
    name: 'changed link target', file: 'be', key: 'followed.arrives.source',
    change: (o, k) => { o[k] = o[k].replace('language=fr&amp;', 'language=de&amp;'); }, says: 'links differ',
  },
  { name: 'typed number', file: 'de', key: 'proof.headlineSub', change: (o, k) => { o[k] += ' (22)'; }, says: 'typed number 22' },
  {
    name: 'changed conditional', file: 'de', key: 'market.cards.2.back.then.ifNone.from',
    change: (o, k) => { o[k] = '2025-02-01'; }, says: 'must stay exactly as in the English',
  },
];

for (const b of BREAKS) {
  test(`${b.name} (${b.file}.ts) fails and names ${b.key}`, () => {
    const t = broken(b.file, b.key, b.change);
    const r = check(b.file, t);
    assert.ok(r.problems.some((p) => p.startsWith(`${b.key}: `) && p.includes(b.says)), r.problems.join('\n') || 'no problem');
    const run = cli(b.file, t, b.name.replace(/ /g, '-'));
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stdout, new RegExp(`^problem: ${b.key.replace(/\./g, '\\.')}: `, 'm'));
  });
}

test('changed conditional: a conditional made plain text fails and names its key', () => {
  const t = broken('fr-standalone', 'market.cards.1.front', (o, k) => { o[k] = o[k].then; });
  const r = check('fr-standalone', t);
  assert.ok(r.problems.some((p) => p.startsWith('market.cards.1.front: expected a conditional passage')), r.problems.join('\n'));
});

test('stale hash warns and names the key, and does not fail', () => {
  const t = translation('home');
  t.from['opening.h1'] = hashOf('Go-live was the start.');
  const r = check('home', t);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.warnings, ['opening.h1: stale, the English text has changed since this was translated']);
  const run = cli('home', t, 'stale-hash');
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(run.stdout, 'warning: opening.h1: stale, the English text has changed since this was translated\n');
});

test('a hash of another key is stale, a missing from warns for every key, neither fails', () => {
  const t = translation('de');
  t.from['meta.title'] = t.from['meta.description'];
  assert.deepEqual(check('de', t).warnings, ['meta.title: stale, the English text has changed since this was translated']);
  const r = compareModules(ENGLISH.de, { de: t.copy });
  assert.deepEqual(r.problems, []);
  assert.equal(r.warnings.length, translatableKeys(ENGLISH.de.de).size);
});

test('the happy path: an identity copy of each real file passes the checks and the command line check', () => {
  for (const file of Object.keys(ENGLISH)) {
    const t = translation(file);
    assert.deepEqual(check(file, t), { problems: [], warnings: [] }, file);
    const run = cli(file, t, `identity-${file}`);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.equal(run.stdout, '');
  }
});

test('exports: an extra export, the English-only list repeated, a missing copy and a from that is not an object fail', () => {
  const t = translation('de');
  assert.ok(compareModules(ENGLISH.de, { ...modOf(t), extra: 1 }).problems.includes('export extra: not in the English file'));
  assert.ok(compareModules(ENGLISH.de, { ...modOf(t), deBodies: ENGLISH.de.deBodies }).problems[0].startsWith('export deBodies: stays in the English file'));
  assert.ok(compareModules(ENGLISH.de, { from: t.from }).problems[0].startsWith('export de: missing'));
  assert.ok(compareModules(ENGLISH.de, { de: t.copy, from: 'x' }).problems.includes('export from: must be an object of key to hash'));
  assert.ok(compareModules(ENGLISH.de, { ...modOf(t), default: t.copy }).problems.includes('export default: not in the English file'));
});

// Ways round the gate a careless translator or an attacker might try. Each must fail and name its key.
const PROBES = [
  ['full-width braces leave the placeholder out', 'de', 'proof.headline', (o, k) => { o[k] = o[k].replace('{published}', '｛published｝'); }, 'placeholders differ'],
  ['a number inside a placeholder-looking token', 'de', 'proof.headline', (o, k) => { o[k] = o[k].replace('{published}', '{12}'); }, 'placeholders differ'],
  ['a placeholder with a space in it', 'de', 'proof.headline', (o, k) => { o[k] = o[k].replace('{published}', '{ published}'); }, 'placeholders differ'],
  ['one placeholder used twice for another', 'de', 'market.cards.2.back.then.otherwise', (o, k) => { o[k] = o[k].replace('{missed:law@2025-01-01}', '{body:law@2025-01-01}'); }, 'placeholders differ'],
  ['a tag with a changed attribute', 'de', 'market.cards.0.back.points.0', (o, k) => { o[k] = o[k].replace('<a href=', "<a target='_blank' href="); }, 'tags differ'],
  ['an unclosed tag', 'de', 'market.cards.0.back.points.0', (o, k) => { o[k] = o[k].replace('</a>', ''); }, 'tags differ'],
  ['a switch date moved by one day', 'de', 'opening.h1.from', (o, k) => { o[k] = '2027-01-02'; }, 'must stay exactly'],
  ['a date in the text moved by one day', 'de', 'market.cards.0.back.points.0', (o, k) => { o[k] = o[k].replace('15 October', '16 October'); }, 'typed number 16'],
  ['a conditional branch swapped for the other', 'fr-standalone', 'market.cards.1.front.then', (o) => { [o.then, o.otherwise] = [o.otherwise, o.then]; }, 'placeholders differ'],
  ['text where the English is empty', 'de', 'market.intro', (o, k) => { o[k] = 'Einleitung'; }, 'must be empty'],
  ['the person changed', 'de', 'contact.person.name', (o, k) => { o[k] = 'Someone Else'; }, 'must stay exactly'],
  ['a grid letter changed', 'de', 'followed.grid.0', (o, k) => { o[k] = 'oi'; }, 'must stay exactly'],
  ['a link swapped between two keys', 'de', 'market.cards.0.back.points.0', (o) => { [o[0], o[1]] = [o[1], o[0]]; }, 'links differ'],
  ['list items with placeholders swapped', 'de', 'market.cards.2.back.points.0', (o) => { [o[0], o[1]] = [o[1], o[0]]; }, 'placeholders differ'],
];

for (const [name, file, key, change, says] of PROBES) {
  test(`probe: ${name} (${file}.ts) fails and names ${key}`, () => {
    const t = broken(file, key, change);
    const r = check(file, t);
    assert.ok(r.problems.some((p) => p.startsWith(`${key}: `) && p.includes(says)), r.problems.join('\n') || 'no problem');
  });
}

// The gate as the build runs it, with German ready and no test-build identity copies: a missing file stops it.
test('a ready language with a story file missing stops the gate, a real dictionary is required too', async () => {
  mkdirSync(TMP, { recursive: true });
  const reg = path.join(TMP, 'registry-de.json');
  writeFileSync(reg, JSON.stringify({ ready: { de: true } }));
  const before = process.env.I18N_TEST_REGISTRY;
  process.env.I18N_TEST_REGISTRY = reg;
  let gate;
  try {
    gate = await load('src/i18n/gate.ts');
  } finally {
    if (before === undefined) delete process.env.I18N_TEST_REGISTRY;
    else process.env.I18N_TEST_REGISTRY = before;
  }
  const en = await load('src/i18n/dictionaries/en.ts');
  const t = translation('home');
  const files = {
    stories: { ...ENGLISH, 'home-contact': await load('src/data/stories/home-contact.ts'), 'de/home': modOf(t) },
    dictionaries: { en, de: { de: en.en } },
  };
  const real = gate.gateReport(files, { identityAllowed: false, isPlaceholder: () => true });
  assert.deepEqual(real.locales, ['de']);
  assert.ok(real.problems.includes('src/data/stories/de/de.ts: the translated story file is missing'), real.problems.join('\n'));
  assert.ok(real.problems.includes('src/data/stories/de/home-contact.ts: the translated story file is missing'));
  assert.ok(real.problems.some((p) => p.startsWith('src/i18n/dictionaries/de.ts: still the English placeholder copy')));
  assert.ok(!real.problems.some((p) => p.startsWith('src/data/stories/de/home.ts')));
  assert.throws(() => gate.assertReport(real), /The parity gate failed for de:\n.*de\/de\.ts: the translated story file is missing/s);
});

// Test builds with German ready and a broken src/data/stories/de/de.ts: each has to stop and name the key.
const BUILD_BREAKS = [
  ['dropped key', 'followed.closing.then', (o, k) => delete o[k], 'missing'],
  ['dropped placeholder', 'limits.lines.1.text', (o, k) => { o[k] = o[k].replace('{weekly}', 'viele'); }, 'placeholders differ'],
  ['changed link target', 'market.cards.0.back.points.1', (o, k) => { o[k] = o[k].replace('/387/', '/388/'); }, 'links differ'],
  ['typed number', 'followed.intro', (o, k) => { o[k] += ' 4 of 6.'; }, 'typed number'],
];

async function buildWith(t, label) {
  const file = path.join(DE_DIR, 'de.ts');
  if (existsSync(DE_DIR)) throw new Error('src/data/stories/de/ exists already; this test never writes over a real translation.');
  mkdirSync(TMP, { recursive: true });
  const reg = path.join(TMP, `${label}.json`);
  writeFileSync(reg, JSON.stringify({ ready: { de: true } }));
  try {
    mkdirSync(DE_DIR);
    writeFileSync(file, tsOf(t));
    return buildTest(reg);
  } finally {
    rmSync(DE_DIR, { recursive: true, force: true });
    rmSync(path.join(ROOT, '.astro', 'i18n-test-dist', label), { recursive: true, force: true });
    rmSync(path.join(ROOT, '.astro', 'i18n-test-dist', `${label}.made-by-test-build`), { force: true });
  }
}

for (const [name, key, change, says] of BUILD_BREAKS) {
  test(`build: ${name} in a German de.ts stops the test build and names ${key}`, async () => {
    const t = broken('de', key, change);
    const result = await withBuildLock(() => buildWith(t, `parity-${name.replace(/ /g, '-')}`));
    assert.notEqual(result.status, 0, result.output.slice(-1500));
    assert.match(result.output, /The parity gate failed for de/);
    assert.ok(result.output.includes(`src/data/stories/de/de.ts: ${key}: `) && result.output.includes(says), result.output.slice(-1500));
  });
}

test('build: a German de.ts that matches passes and is read as a file, not as an identity copy; a stale hash warns', async () => {
  const t = translation('de');
  t.from['opening.subline'] = hashOf('An older English subline.');
  const result = await withBuildLock(() => buildWith(t, 'parity-good'));
  assert.equal(result.status, 0, result.output.slice(-1500));
  assert.match(result.output, /Parity gate warning: src\/data\/stories\/de\/de\.ts: opening\.subline: stale/);
  assert.match(result.output, /Parity gate: de passed, 1 warning\(s\)/);
  assert.doesNotMatch(result.output, /de\/de\.ts is an identity copy/);
  assert.match(result.output, /de\/home\.ts is an identity copy/);
});

test('cleanup: no scratch file is left in the tree', () => {
  rmSync(TMP, { recursive: true, force: true });
  assert.equal(existsSync(DE_DIR), false);
});

// Holes the gate does not close by design, for the language seat: a number written as a word, two numbers swapped inside
// one text, the two texts of a date switch swapped, list items without placeholders reordered, an English text left
// untranslated, and a hash written from the current English over an old translation. Each of them keeps the shape.
test('known limits, for the language seat: these keep the shape and pass the gate', () => {
  const limits = [
    broken('de', 'market.cards.0.back.points.0', (o, k) => { o[k] = o[k].replace('Eleven', 'Twelve'); }),
    broken('de', 'market.cards.1.front.coming', (o, k) => { o[k] = o[k].replace('2027', 'X').replace('2028', '2027').replace('X', '2028'); }),
    broken('de', 'opening.h1', (o, k) => { [o[k].coming, o[k].here] = [o[k].here, o[k].coming]; }),
    broken('home', 'functions.names', (o, k) => { o[k].reverse(); }),
  ];
  const files = ['de', 'de', 'de', 'home'];
  limits.forEach((t, i) => assert.deepEqual(check(files[i], t).problems, []));
});
