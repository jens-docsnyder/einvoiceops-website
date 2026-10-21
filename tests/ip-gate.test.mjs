// Content gate tests for translated files.
// Plants each banned term in a scratch copy of the gate files and checks the scanner stops it.
//
// Run:  IP_PYTHON=/path/to/python-with-pyyaml NAME_SCAN=/path/to/website-name-scan.py npm test
// The scratch copy lives in the OS temp folder, never in the repo. Nothing here is written to the repo.
//
// Terms are written with a "~" inside the first word and the marker is removed at run time.
// This keeps this file itself clean under the same scanner. The owner's name is read from the
// English legal page at run time and is never written here.
//
// Set IP_GATE_WEAKEN=<rule id> to blank that one rule in the scratch copy. The test must then fail:
// that is the check that the test is really looking at the scanner.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PY = process.env.IP_PYTHON || 'python3';
const NAME_SCAN = process.env.NAME_SCAN || '';
const WEAKEN = process.env.IP_GATE_WEAKEN || '';
const WORKERS = 8;
const LOCALES = ['de', 'fr', 'pl'];

const t = (s) => s.replace(/~/g, '');

// [term, expected rule ids (any one), blocks?]  blocks = false means a warning by design
const SHARED = [
  // ERP field names, codes, note numbers, configuration workspaces (same strings in every language)
  ['STC~D1', ['IP-L20']], ['STC~D4', ['IP-L20']], ['FR_B~2B', ['IP-L20']], ['FR_B2B_C~RN', ['IP-L20']],
  ['FRS~INV', ['IP-L20']], ['ED~OC_COCKPIT', ['IP-L20']], ['BA~DI_INVOICE', ['IP-L20']], ['BA~dI', ['IP-L20']],
  ['PROCESS_C~ALLBACK', ['IP-L20']], ['PROCESS_AFTER_STA~TUS_CHANGE', ['IP-L20']], ['EDIFACT_O~UT', ['IP-L20']],
  ['VD~ART', ['IP-L20']], ['VF~01', ['IP-L21']], ['FB~60', ['IP-L21']], ['MI~RO', ['IP-L21']], ['MI~GO', ['IP-L21']],
  ['SP~RO', ['IP-L21']], ['SAP No~te 1234567', ['IP-L22']], ['Globali~zation Studio', ['IP-L23']],
  ['ER format ma~pping', ['IP-L23']],
  // English source list, in case a translated file keeps English wording
  ['Vi~gil', ['IP-A', 'IP-L01']], ['Au~gur', ['IP-A', 'IP-L01']], ['Ac~ta', ['IP-A']],
  ['Prove~nance', ['IP-A']], ['Readi~ness Map', ['IP-A', 'IP-L04']],
  ['Confi~dence Board', ['IP-A', 'IP-L05']], ['Cano~nical Model', ['IP-A', 'IP-L06']],
  ['Sig~nal Engine', ['IP-A']], ['Sou~rce Registry', ['IP-A', 'IP-L07']], ['clu~ster', ['IP-L10']],
  ['La~yer 2', ['IP-L25']], ['ti~er 1 sources', ['IP-D05']], ['moni~toring 27 countries', ['IP-L32']],
  ['SP pipe~lines', ['IP-L33']], ['signal dete~ction', ['IP-L33']], ['we sc~an', ['IP-B01']],
  ['we cra~wl', ['IP-B01']], ['we mon~itor', ['IP-B02']], ['guaran~teed', ['IP-L40']],
  ['legally compl~iant', ['IP-L40']], ['certified compl~iant', ['IP-L40']], ['our tax adv~ice', ['IP-L40']],
];

const DE = [
  ['Vig~ils', ['IP-L01']], ['Aug~urs', ['IP-L01']], ['Readi~ness-Karte', ['IP-L04']],
  ['Bereit~schaftskarte', ['IP-L04']], ['Bereit~schafts-Map', ['IP-L04']], ['Konfi~denz-Board', ['IP-L05']],
  ['Vertrauens~board', ['IP-L05']], ['Vertrauens~tafel', ['IP-L05']], ['kano~nisches Modell', ['IP-L06']],
  ['kano~nisches Datenmodell', ['IP-L06']], ['Quellen~register', ['IP-L07']], ['Quellen~verzeichnis', ['IP-L07']],
  ['Prove~nienz', ['IP-L03'], false], ['Clu~ster', ['IP-L10']], ['Clu~stern', ['IP-L10']],
  ['Funktionsclu~ster', ['IP-L10']], ['ERP-Clu~ster', ['IP-L10']], ['Arbeits~paket', ['IP-L15']],
  ['Arbeits~pakete', ['IP-L15']], ['Arbeits-Pa~ket', ['IP-L15']], ['Schi~cht 1', ['IP-L25']],
  ['Schi~cht 2', ['IP-L25']], ['Schi~cht 3', ['IP-L25']], ['La~yer 1', ['IP-L25']], ['La~yer 3', ['IP-L25']],
  ['Ebe~ne 2', ['IP-L26'], false], ['Quel~len der Stufe 1', ['IP-L27']], ['Ebe~ne-2-Quellen', ['IP-L27']],
  ['wir über~wachen', ['IP-L28']], ['wir sca~nnen', ['IP-L28']], ['wir cra~wlen', ['IP-L28']],
  ['wir extra~hieren', ['IP-L28']], ['über~wachen wir', ['IP-L28']], ['unser Sys~tem überwacht', ['IP-L28']],
  ['Änderungs~erkennung', ['IP-L31'], false], ['wir über~wachen 27 Länder', ['IP-L32']],
  ['30 Län~der beobachtet', ['IP-L32']], ['Signal~erkennung', ['IP-L33']], ['Signal~register', ['IP-L33']],
  ['Überwachungs-Pipe~line', ['IP-L33']], ['SP-Pipe~line', ['IP-L33']], ['garan~tiert', ['IP-L41']],
  ['Gara~ntie', ['IP-L41']], ['rechts~sicher', ['IP-L41']], ['rechts~konform', ['IP-L41']],
  ['gesetzes~konform', ['IP-L41']], ['GoBD-kon~form', ['IP-L41']], ['steuer~konform', ['IP-L41']],
  ['gesetzlich kon~form', ['IP-L41']], ['zertifiziert kon~form', ['IP-L41']],
  ['Konformität gewähr~leistet', ['IP-L41']], ['beglau~bigt', ['IP-L41']],
  ['unsere Rechts- oder Steuer~beratung', ['IP-L41']], ['wir leisten Steuer~beratung', ['IP-L41']],
  ['wir bera~ten Sie rechtlich', ['IP-L41']], ['gewähr~leisten', ['IP-L42'], false],
  ['rechts~verbindlich', ['IP-L42'], false], ['Steuer~beratung', ['IP-L42'], false],
];

const FR = [
  ['vig~ile', ['IP-L02'], false], ['au~gure', ['IP-L02'], false], ['prove~nance', ['IP-L03'], false],
  ['carte de prépa~ration', ['IP-L04']], ['carte de matu~rité', ['IP-L04']], ['carte de readi~ness', ['IP-L04']],
  ['tableau de con~fiance', ['IP-L05']], ['tableau de fia~bilité', ['IP-L05']], ['modèle cano~nique', ['IP-L06']],
  ['modèle de données cano~nique', ['IP-L06']], ['registre des sou~rces', ['IP-L07']], ['clu~ster', ['IP-L10']],
  ['clu~sters', ['IP-L10']], ['clu~ster fonctionnel', ['IP-L10']], ['gra~ppe', ['IP-L11']],
  ['regroupe~ment fonctionnel', ['IP-L11']], ['lot de tra~vaux', ['IP-L16']], ['lot de tra~vail', ['IP-L16']],
  ['paquet de tra~vail', ['IP-L16']], ['cou~che 1', ['IP-L25']], ['cou~che 2', ['IP-L25']],
  ['cou~che 3', ['IP-L25']], ['niv~eau 2', ['IP-L26'], false], ['sources de niv~eau 1', ['IP-L27']],
  ['nous surveil~lons', ['IP-L29']], ['nous sca~nnons', ['IP-L29']], ['nous détec~tons', ['IP-L29']],
  ['nous extra~yons', ['IP-L29']], ['notre système surveil~le', ['IP-L29']],
  ['détec~tion des changements', ['IP-L31'], false], ['nous surveil~lons 27 pays', ['IP-L32']],
  ['30 pa~ys suivis', ['IP-L32']], ['pipeline de surveil~lance', ['IP-L33']], ['pipeline de vei~lle', ['IP-L33']],
  ['détection de sig~naux', ['IP-L33']], ['registre des sig~naux', ['IP-L33']], ['gara~nti', ['IP-L43']],
  ['gara~ntie', ['IP-L43', 'IP-L41']], ['gara~ntir', ['IP-L43']], ['gara~ntissons', ['IP-L43']],
  ['conforme à la l~oi', ['IP-L43']], ['légalement con~forme', ['IP-L43']], ['conformité lé~gale', ['IP-L43']],
  ['conformité gara~ntie', ['IP-L43']], ['certifié con~forme', ['IP-L43']],
  ['copie certifiée con~forme', ['IP-L43']], ['en règle avec la l~oi', ['IP-L43']],
  ['nos conseils juri~diques', ['IP-L43']], ['nous vous donnons des conseils fis~caux', ['IP-L43']],
  ['conseils juri~diques', ['IP-L44'], false], ['avis fis~cal', ['IP-L44'], false],
];

const PL = [
  ['Vig~ila', ['IP-L01']], ['Vig~ilem', ['IP-L01']], ['Aug~ura', ['IP-L01']], ['Aug~urem', ['IP-L01']],
  ['prowe~niencja', ['IP-L03'], false], ['mapa gotow~ości', ['IP-L04']], ['tablica pew~ności', ['IP-L05']],
  ['tablica zau~fania', ['IP-L05']], ['model kano~niczny', ['IP-L06']], ['rejestr źró~deł', ['IP-L07']],
  ['kla~ster', ['IP-L11']], ['kla~stra', ['IP-L11']], ['kla~stry', ['IP-L11']], ['kla~strów', ['IP-L11']],
  ['clu~ster', ['IP-L10']], ['pakiet ro~boczy', ['IP-L17']], ['pakiety ro~bocze', ['IP-L17']],
  ['pakiet pra~cy', ['IP-L17']], ['pakiet zada~ń', ['IP-L17']], ['war~stwa 1', ['IP-L25']],
  ['war~stwa 2', ['IP-L25']], ['war~stwa 3', ['IP-L25']], ['poz~iom 2', ['IP-L26'], false],
  ['źródła poz~iomu 1', ['IP-L27']], ['monito~rujemy', ['IP-L30']], ['skanu~jemy', ['IP-L30']],
  ['wykry~wamy', ['IP-L30']], ['parsu~jemy', ['IP-L30']], ['nasz sys~tem monitoruje', ['IP-L30']],
  ['wykry~wanie zmian', ['IP-L31'], false], ['monito~rujemy 27 krajów', ['IP-L32']],
  ['30 kra~jów monitorowanych', ['IP-L32']], ['wykry~wanie sygnałów', ['IP-L33']],
  ['rejestr sygn~ałów', ['IP-L33']], ['pipe~line monitorowania', ['IP-L33']], ['gwaran~tujemy', ['IP-L45']],
  ['gwaran~towane', ['IP-L45']], ['gwa~rancja', ['IP-L45']], ['zgod~ny z prawem', ['IP-L45']],
  ['praw~nie zgodny', ['IP-L45']], ['zgod~ność z prawem', ['IP-L45']], ['zgod~ność gwaran~towana', ['IP-L45']],
  ['certyfiko~wana zgodność', ['IP-L45']], ['zapewni~amy zgodność', ['IP-L45']],
  ['kopia poświad~czona', ['IP-L45']], ['nasze doradz~two podatkowe', ['IP-L45']],
  ['udzielamy po~rad prawnych', ['IP-L45']], ['zgod~ny z przepisami', ['IP-L46'], false],
  ['po~rady prawne', ['IP-L46'], false], ['doradz~two podatkowe', ['IP-L46'], false],
];

// Look-alike letters (Cyrillic) for the homoglyph variant.
const LOOKALIKE = { a: 'а', e: 'е', o: 'о', p: 'р', c: 'с', y: 'у', x: 'х', i: 'і', A: 'А', B: 'В', E: 'Е', K: 'К', M: 'М', H: 'Н', O: 'О', P: 'Р', C: 'С', T: 'Т', X: 'Х' };

function variants(term) {
  const m = term.match(/\S+/);
  const cut = m.index + Math.max(1, Math.floor(m[0].length / 2));
  const at = (ch) => term.slice(0, cut) + ch + term.slice(cut);
  return {
    plain: term,
    nfd: term.normalize('NFD'),
    softhyphen: at('\u00AD'),
    zerowidth: at('\u200B'),
    lookalike: [...term].map((c) => LOOKALIKE[c] || c).join(''),
  };
}

// The scratch copy: gate files plus one empty fixture of each kind per locale.
const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'ipgate-test-'));
after(() => fs.rmSync(parent, { recursive: true, force: true }));

function fixturePaths(locale) {
  return [`src/data/stories/${locale}/x.ts`, `src/i18n/dictionaries/${locale}.ts`];
}

function makeTree(name) {
  const dir = path.join(parent, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(path.join(ROOT, '.github', 'scripts'), path.join(dir, '.github', 'scripts'), { recursive: true });
  fs.cpSync(path.join(ROOT, '.github', 'ip-protection'), path.join(dir, '.github', 'ip-protection'), { recursive: true });
  if (WEAKEN) {
    const f = path.join(dir, '.github', 'ip-protection', 'patterns.yaml');
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    const i = lines.findIndex((l) => l.trim() === `- id: ${WEAKEN}`);
    assert.notEqual(i, -1, `rule ${WEAKEN} not found`);
    const j = lines.findIndex((l, k) => k > i && l.trim().startsWith('pattern:'));
    lines[j] = lines[j].replace(/pattern:.*/, "pattern: 'zzzneverzzz'");
    fs.writeFileSync(f, lines.join('\n'));
  }
  for (const loc of LOCALES) for (const p of fixturePaths(loc)) write(dir, p, '');
  return dir;
}

function write(dir, rel, text) {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
}

async function exec(cmd, args, cwd) {
  const env = { ...process.env };
  delete env.IP_GATE_PRIVATE_PATTERNS;
  try {
    const r = await run(cmd, args, { cwd, env, maxBuffer: 1 << 26 });
    return { code: 0, out: r.stdout };
  } catch (e) {
    return { code: e.code, out: (e.stdout || '') + (e.stderr || '') };
  }
}

const scan = (dir) => exec(PY, ['.github/scripts/ip_scanner.py', '--list'], dir);
const nameScan = (dir) => exec(PY, [NAME_SCAN, dir], process.cwd());
const hitsOf = (out) =>
  out.split('\n').filter((l) => l.startsWith('HIT ')).map((l) => {
    const [, loc, rule, sev] = l.split(' ');
    return { file: loc.replace(/:\d+$/, ''), rule, sev: sev.replace(':', '') };
  });

// Worker pool: each worker owns a tree, so cases never share files.
async function pool(items, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: WORKERS }, async (_, w) => {
      const dir = makeTree(`w${w}`);
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], dir);
      }
    }),
  );
  return results;
}

// ---- the term cases ----
const termCases = [];
function add(locale, group, list) {
  for (const [raw, rules, blocks = true] of list) {
    const term = t(raw);
    for (const [kind, text] of Object.entries(variants(term))) {
      termCases.push({ locale, group, term, kind, rules, blocks, text });
    }
  }
}
for (const loc of LOCALES) add(loc, 'shared', SHARED);
add('de', 'de', DE);
add('fr', 'fr', FR);
add('pl', 'pl', PL);

let counts = { ran: 0, blockedAsExpected: 0, warnedAsExpected: 0, nameScanRan: 0 };

const termResults = pool(termCases, async (c, dir) => {
  const files = fixturePaths(c.locale);
  for (const f of files) write(dir, f, `export const x = 'Vor ${c.text} nach';\n`);
  const r = await scan(dir);
  for (const f of files) write(dir, f, '');
  const hits = hitsOf(r.out);
  const problems = [];
  for (const f of files) {
    const mine = hits.filter((h) => h.file === f);
    if (!mine.some((h) => c.rules.some((id) => h.rule.startsWith(id)))) {
      problems.push(`no ${c.rules.join('/')} hit in ${f}`);
    }
  }
  if (c.blocks && r.code !== 1) problems.push(`exit ${r.code}, wanted 1`);
  if (!c.blocks && r.code !== 0) problems.push(`exit ${r.code}, wanted 0 (warning only)`);
  if (!c.blocks && hits.some((h) => h.sev === 'critical' || h.sev === 'high')) problems.push('blocking hit on a warning term');
  return { c, problems, code: r.code };
});

const groupTest = (group, label) =>
  test(label, async () => {
    const all = await termResults;
    const mine = all.filter((x) => x.c.group === group);
    const bad = mine.filter((x) => x.problems.length);
    counts.ran += mine.length;
    counts.blockedAsExpected += mine.filter((x) => x.c.blocks && x.code === 1 && !x.problems.length).length;
    counts.warnedAsExpected += mine.filter((x) => !x.c.blocks && !x.problems.length).length;
    assert.equal(
      bad.length,
      0,
      `${bad.length} of ${mine.length} cases slipped through:\n` +
        bad.map((x) => `  [${x.c.locale}] ${x.c.kind} ${JSON.stringify(x.c.text)}: ${x.problems.join('; ')}`).join('\n'),
    );
  });

groupTest('shared', 'codes, field names and English wording are stopped in de, fr and pl files');
groupTest('de', 'German banned terms are stopped');
groupTest('fr', 'French banned terms are stopped');
groupTest('pl', 'Polish banned terms are stopped');

test('a clean tree exits 0', async () => {
  const dir = makeTree('clean');
  const r = await scan(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /IP gate: CLEAN/);
  counts.ran += 1;
});

// ---- the owner's name ----
const legal = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'legal.astro'), 'utf8');
const nm = legal.match(/([A-ZÄÖÅ][\p{L}]+)\s+([A-ZÄÖÅ][\p{L}]+),\s*Board Member/u);
const OWNER_FULL = nm ? `${nm[1]} ${nm[2]}` : '';

// The exact allowed paths are read from the name scan script, so a change there is followed.
let ALLOWED = [];
if (NAME_SCAN && fs.existsSync(NAME_SCAN)) {
  const src = fs.readFileSync(NAME_SCAN, 'utf8');
  const block = src.match(/STORY_CONTACTS\s*=\s*\[([\s\S]*?)\]/);
  if (block) ALLOWED = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  ALLOWED.push('src/pages/legal.astro');
}

const nameSkip = NAME_SCAN ? false : 'NAME_SCAN is not set';

test('the owner name was found on the legal page', () => {
  assert.ok(OWNER_FULL, 'could not read the name from src/pages/legal.astro');
});

test('the owner name is stopped in non-contact translated files', { skip: nameSkip }, async () => {
  const dir = makeTree('names');
  const [first, last] = OWNER_FULL.split(' ');
  const forms = {
    full: OWNER_FULL,
    fullSoftHyphen: `${first}\u00AD ${last}`,
    fullZeroWidth: `${first} ${last.slice(0, 3)}\u200B${last.slice(3)}`,
    surname: last,
    surnameSoftHyphen: `${last.slice(0, 3)}\u00AD${last.slice(3)}`,
    firstName: `${first} schrieb`,
  };
  const targets = ['src/data/stories/de/fr-standalone.ts', 'src/i18n/dictionaries/de.ts'];
  const bad = [];
  let n = 0;
  for (const [kind, text] of Object.entries(forms)) {
    for (const p of targets) {
      write(dir, p, `export const x = 'Vor ${text} nach';\n`);
      const r = await nameScan(dir);
      write(dir, p, '');
      n++;
      if (r.code !== 1 || !r.out.includes(p)) bad.push(`${kind} in ${p}: exit ${r.code}`);
    }
  }
  counts.ran += n;
  counts.nameScanRan += n;
  assert.equal(bad.length, 0, `name slipped through:\n  ${bad.join('\n  ')}`);
});

test('the owner name passes at the exact contact paths and fails one step off', { skip: nameSkip }, async () => {
  assert.ok(ALLOWED.length >= 10, `read only ${ALLOWED.length} allowed paths from the name scan`);
  const dir = makeTree('names-allowed');
  const bad = [];
  let n = 0;
  for (const p of ALLOWED) {
    write(dir, p, `export const x = 'Vor ${OWNER_FULL} nach';\n`);
    const r = await nameScan(dir);
    write(dir, p, '');
    fs.rmSync(path.join(dir, p));
    n++;
    if (r.code !== 0) bad.push(`allowed path ${p} failed: exit ${r.code}`);
  }
  const offBy = [
    'src/data/stories/pl/de.ts',
    'src/data/stories/de/home-contact.ts.bak',
    'src/data/stories/de/other.ts',
    'src/data/stories/pl/fr-standalone.ts',
    'src/i18n/dictionaries/pl.ts',
  ];
  for (const p of offBy) {
    write(dir, p, `export const x = 'Vor ${OWNER_FULL} nach';\n`);
    const r = await nameScan(dir);
    fs.rmSync(path.join(dir, p));
    n++;
    if (r.code !== 1) bad.push(`off-path ${p} passed: exit ${r.code}`);
  }
  counts.ran += n;
  counts.nameScanRan += n;
  assert.equal(bad.length, 0, bad.join('\n'));
});

test('a clean tree passes the name scan', { skip: nameSkip }, async () => {
  const dir = makeTree('names-clean');
  const r = await nameScan(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /0 hit\(s\)/);
  counts.ran += 1;
  counts.nameScanRan += 1;
});

after(() => {
  console.log(
    `content gate cases: ${counts.ran} ran, ${counts.blockedAsExpected} exited 1 as expected, ` +
      `${counts.warnedAsExpected} warning-only terms reported as expected, ${counts.nameScanRan} name scan runs` +
      (NAME_SCAN ? '' : ' (name scan skipped: NAME_SCAN not set)'),
  );
});
