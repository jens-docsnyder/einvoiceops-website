// The build hook of the parity gate (src/i18n/parity.ts holds the checks). It runs once per build, from the getStaticPaths of
// the two routes of the other languages (locale-home.astro, locale-page.astro), before any page of them is made. Those routes
// exist only when the registry builds a ready language, so with none ready the gate never runs and the build is the English
// site alone. (astro.config.mjs cannot do it: its module runner is closed by the time an integration hook runs, so the hook
// could not load the story files.)
//
// For each ready language it needs, for every page the registry builds in it, the translated story files
// src/data/stories/<locale>/<same file name as the English>.ts, and its dictionary src/i18n/dictionaries/<locale>.ts. A file
// that is missing stops the build and is named. Each one goes through compareModules(); any problem stops the build with
// every problem listed, a warning (a stale or missing hash) is printed and the build goes on.
//
// The one way round a missing file is the identity copy of a test build (scripts/test-build.mjs sets I18N_TEST_REGISTRY): the
// page then shows the English text on the frame of its language, the gate compares the English file with itself, and the
// build log says "identity copy". A real build never takes this way.
//
// This file takes the loaded modules as arguments and touches no file, so the tests can run it. run-gate.ts loads them.
import { builtPages, localeOrder, testRegistry, type Locale, type PageId } from './registry';
import { compareModules, ENGLISH_ONLY_EXPORT, type Result } from './parity';

type Mod = Record<string, unknown>;

// What an identity copy of an English file would hold: its copy, without the lists that stay in the English file.
const identityOf = (mod: Mod): Mod => Object.fromEntries(Object.entries(mod).filter(([k]) => !ENGLISH_ONLY_EXPORT.test(k)));

// The story files each page is made from (src/components/site/*Page.astro). A page the registry builds in a language and that
// is not listed here stops the build. The legal notice and the privacy policy are English only.
export const PAGE_STORIES: Record<PageId, string[]> = {
  home: ['home', 'home-contact'],
  FR: ['fr-standalone'],
  DE: ['de'],
  BE: ['be'],
  PL: [],
  legal: [],
  privacy: [],
};

// The loaded files, by name without the ending: stories by "home" (English) and "de/home" (a language), dictionaries by "en"
// and "de".
export interface Files { stories: Record<string, Mod>; dictionaries: Record<string, Mod> }

export interface GateReport {
  locales: Locale[];
  problems: string[];
  warnings: string[];
  identity: string[];
}

// Run the checks and return what they found, without stopping anything. `isPlaceholder` says that a dictionary is still the
// English placeholder copy; `identityAllowed` is true in a test build only (the registry's testRegistry by default).
export function gateReport(
  files: Files,
  opts: { isPlaceholder?: (locale: Locale) => boolean; identityAllowed?: boolean } = {},
): GateReport {
  const isPlaceholder = opts.isPlaceholder || (() => false);
  const identityAllowed = opts.identityAllowed === undefined ? !!testRegistry : opts.identityAllowed;
  const report: GateReport = { locales: [], problems: [], warnings: [], identity: [] };
  const add = (label: string, r: Result) => {
    report.problems.push(...r.problems.map((p) => `${label}: ${p}`));
    report.warnings.push(...r.warnings.map((w) => `${label}: ${w}`));
  };

  for (const locale of localeOrder.filter((l) => l !== 'en')) {
    const pages = builtPages().filter((p) => p.locale === locale);
    if (!pages.length) continue;
    report.locales.push(locale);

    const names = new Set<string>();
    for (const p of pages) {
      if (!(p.page in PAGE_STORIES)) report.problems.push(`${locale}/${p.page}: no story files are listed for this page in src/i18n/gate.ts`);
      for (const f of PAGE_STORIES[p.page] || []) names.add(f);
    }
    for (const f of [...names].sort()) {
      const label = `src/data/stories/${locale}/${f}.ts`;
      const english = files.stories[f];
      const translated = files.stories[`${locale}/${f}`];
      if (!english) {
        report.problems.push(`src/data/stories/${f}.ts: the English story file is missing`);
      } else if (translated) {
        add(label, compareModules(english, translated));
      } else if (identityAllowed) {
        report.identity.push(label);
        add(label, compareModules(english, identityOf(english), { skipHashes: true }));
      } else {
        report.problems.push(`${label}: the translated story file is missing`);
      }
    }

    const label = `src/i18n/dictionaries/${locale}.ts`;
    const english = files.dictionaries.en;
    const dict = files.dictionaries[locale];
    if (!dict) {
      report.problems.push(`${label}: the dictionary is missing`);
    } else if (isPlaceholder(locale)) {
      if (identityAllowed) {
        report.identity.push(label);
        add(label, compareModules(english, dict, { dictionary: true, skipHashes: true }));
      } else {
        report.problems.push(`${label}: still the English placeholder copy, a real build needs the translation`);
      }
    } else {
      add(label, compareModules(english, dict, { dictionary: true }));
    }
  }
  return report;
}

// Stop the build on any problem (all listed), print the warnings and one line saying what was checked.
export function assertReport(report: GateReport): void {
  if (!report.locales.length) return;
  for (const w of report.warnings) console.warn(`Parity gate warning: ${w}`);
  for (const i of report.identity) console.log(`Parity gate: ${i} is an identity copy of the English (test build only)`);
  if (report.problems.length) {
    throw new Error(`The parity gate failed for ${report.locales.join(', ')}:\n${report.problems.map((p) => `  ${p}`).join('\n')}`);
  }
  console.log(`Parity gate: ${report.locales.join(', ')} passed, ${report.warnings.length} warning(s)`);
}
