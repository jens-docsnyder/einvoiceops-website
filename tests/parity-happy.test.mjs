// The parity gate on things that are right: the good fixture, and the real English files against themselves as an identity
// copy. The ways it has to fail are the reviewing seat's tests, not these.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, buildTest, withBuildLock } from './_lib/site.mjs';
import { importTs } from './_lib/ts.mjs';

const load = (rel) => importTs(new URL(`file://${path.join(ROOT, rel)}`).href);
const parity = await load('src/i18n/parity.ts');
const { PAGE_STORIES } = await load('src/i18n/gate.ts');
const { compareModules, hashOf, hashWarnings, ENGLISH_ONLY_EXPORT } = parity;

// What an identity copy of an English file would hold: its copy and a `from` made from the English itself.
function identityCopy(mod) {
  const copy = Object.fromEntries(Object.entries(mod).filter(([k]) => !ENGLISH_ONLY_EXPORT.test(k)));
  const name = parity.storyExportName(mod);
  copy.from = Object.fromEntries([...parity.translatableKeys(mod[name])].map(([k, t]) => [k, hashOf(t)]));
  return copy;
}

test('hashOf is the first 12 hex digits of the SHA-1 of the text', () => {
  assert.equal(hashOf('abc'), 'a9993e364706');
  assert.match(hashOf('Get started'), /^[0-9a-f]{12}$/);
  assert.notEqual(hashOf('Get started'), hashOf('Get started '));
});

test('the good fixture passes with no problem and no warning', async () => {
  const en = await load('tests/fixtures/parity/en.ts');
  const good = await load('tests/fixtures/parity/good.ts');
  assert.deepEqual(compareModules(en, good), { problems: [], warnings: [] });
});

test('every real English story file passes against an identity copy, hashes included', async () => {
  const files = readdirSync(path.join(ROOT, 'src/data/stories')).filter((f) => f.endsWith('.ts'));
  assert.ok(files.length >= 5);
  for (const f of files) {
    const en = await load(`src/data/stories/${f}`);
    assert.deepEqual(compareModules(en, identityCopy(en)), { problems: [], warnings: [] }, f);
  }
});

test('the English dictionary passes against the placeholder dictionaries', async () => {
  const en = await load('src/i18n/dictionaries/en.ts');
  for (const code of ['de', 'fr', 'pl']) {
    const dict = await load(`src/i18n/dictionaries/${code}.ts`);
    const result = compareModules(en, dict, { dictionary: true, skipHashes: true });
    assert.deepEqual(result.problems, [], code);
    assert.deepEqual(hashWarnings(en.en, Object.fromEntries([...parity.translatableKeys(en.en)].map(([k, t]) => [k, hashOf(t)]))), []);
  }
});

test('the gate lists a story file for every page file in src/data/stories', () => {
  const listed = new Set(Object.values(PAGE_STORIES).flat());
  const files = readdirSync(path.join(ROOT, 'src/data/stories')).filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, ''));
  assert.deepEqual([...listed].sort(), files.sort());
});

test('the command line check exits 0 on the good fixture and prints nothing to stdout', () => {
  const run = spawnSync('node', ['scripts/parity-check.mjs', 'tests/fixtures/parity/en.ts', 'tests/fixtures/parity/good.ts'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout, '');
});

test('a test build with every language ready runs the gate on the identity copies and passes', async () => {
  const result = await withBuildLock(() => buildTest('tests/fixtures/registry-all-ready.json'));
  assert.equal(result.status, 0, result.output.slice(-1500));
  assert.match(result.output, /Parity gate: de, fr, pl passed, 0 warning\(s\)/);
  assert.match(result.output, /src\/data\/stories\/de\/home\.ts is an identity copy/);
  assert.match(result.output, /src\/i18n\/dictionaries\/pl\.ts is an identity copy/);
});
