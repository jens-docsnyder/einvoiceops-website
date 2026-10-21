// The language registry: the four locales, the pages and the languages each page exists in, and the link rule.
// English is at the root and is always ready. German, French and Polish live under /de/, /fr/ and /pl/ and are not
// ready: a language is built only once its gate has passed, so no page of it exists until `ready` is true here.
// The country half (names, order, English addresses) is read from this file by src/data/countries.ts.
//
// A test build may switch locales on to check the routing, and only through the test script (scripts/test-build.mjs):
// it sets I18N_TEST_REGISTRY to a JSON file of `ready` flags. `npm run build` never sets it, and if it is set there the
// build stops instead of reading it. The real flags are the ones in this file.
import { readFileSync } from 'node:fs';

export type Locale = 'en' | 'de' | 'fr' | 'pl';
export type PageId = 'home' | 'FR' | 'DE' | 'BE' | 'PL' | 'legal' | 'privacy';

interface LocaleInfo { label: string; og: string }
interface Version { slug: string; name?: string; exists: boolean }

export const localeOrder: Locale[] = ['en', 'de', 'fr', 'pl'];

// The language's own name is the selector label.
export const localeInfo: Record<Locale, LocaleInfo> = {
  en: { label: 'English', og: 'en_US' },
  de: { label: 'Deutsch', og: 'de_DE' },
  fr: { label: 'Français', og: 'fr_FR' },
  pl: { label: 'Polski', og: 'pl_PL' },
};

const readyFlags: Record<Locale, boolean> = { en: true, de: false, fr: false, pl: false };

// Test builds only. Unknown keys, a non-boolean flag or English switched off stop the build. astro.config.mjs also
// refuses any build into dist/ while a test registry is in use, however the build was started.
const testFile = process.env.I18N_TEST_REGISTRY;
export const testRegistry: string | null = testFile || null;
if (testFile) {
  if (process.env.npm_lifecycle_event === 'build') {
    throw new Error('I18N_TEST_REGISTRY is set during npm run build. The real build never reads a test registry.');
  }
  const test = JSON.parse(readFileSync(testFile, 'utf8'));
  const keys = Object.keys(test);
  if (keys.length !== 1 || keys[0] !== 'ready') throw new Error(`Test registry ${testFile}: only a "ready" object is allowed.`);
  for (const [code, value] of Object.entries(test.ready)) {
    if (!(code in readyFlags) || code === 'en' || typeof value !== 'boolean') {
      throw new Error(`Test registry ${testFile}: bad entry "${code}" in "ready".`);
    }
    readyFlags[code as Locale] = value;
  }
}

// Where each page exists. An empty slug is the home page. A page that is planned but not built has exists: false, so
// nothing links to it and no route is made for it (Poland's pages: the English one is its own piece of work).
const pages: Record<PageId, { versions: Partial<Record<Locale, Version>> }> = {
  home: { versions: {
    en: { slug: '', exists: true },
    de: { slug: '', exists: true },
    fr: { slug: '', exists: true },
    pl: { slug: '', exists: true },
  } },
  FR: { versions: {
    en: { slug: 'france', name: 'France', exists: true },
    fr: { slug: 'france', name: 'France', exists: true },
  } },
  DE: { versions: {
    en: { slug: 'germany', name: 'Germany', exists: true },
    de: { slug: 'deutschland', name: 'Deutschland', exists: true },
  } },
  BE: { versions: {
    en: { slug: 'belgium', name: 'Belgium', exists: true },
    fr: { slug: 'belgique', name: 'Belgique', exists: true },
  } },
  PL: { versions: {
    en: { slug: 'poland', name: 'Poland', exists: false },
    pl: { slug: 'polska', name: 'Polska', exists: false },
  } },
  // The legal notice and the privacy policy are English only, as is the 404 page (which nothing links to).
  legal: { versions: { en: { slug: 'legal', exists: true } } },
  privacy: { versions: { en: { slug: 'privacy', exists: true } } },
};

// The country pages, in the order the top bar, the home page and the footer list them.
export const countryOrder: PageId[] = ['FR', 'DE', 'BE', 'PL'];

export function isReady(locale: Locale): boolean {
  return readyFlags[locale];
}

export function slugFor(page: PageId, locale: Locale): string | undefined {
  return pages[page].versions[locale]?.slug;
}

export function nameFor(page: PageId, locale: Locale): string | undefined {
  return pages[page].versions[locale]?.name;
}

// The address of a page in a language, whether or not it is built. Check pageExists before linking to it.
export function urlFor(page: PageId, locale: Locale): string {
  const v = pages[page].versions[locale];
  if (!v) throw new Error(`Registry: ${page} has no ${locale} version.`);
  const parts = [locale === 'en' ? '' : locale, v.slug].filter(Boolean);
  return parts.length ? `/${parts.join('/')}/` : '/';
}

// True when the page is built in that language: it exists there and the language is ready.
export function pageExists(page: PageId, locale: Locale): boolean {
  return !!pages[page].versions[locale]?.exists && isReady(locale);
}

// The link rule: a link opens the page in the visitor's language if it exists there and the language is ready, and in
// English if not. Legal, privacy and the other English-only pages always come out English. Null when the page is
// built in neither (a page not yet built), so the caller leaves the link out.
export function linkTarget(page: PageId, visitorLocale: Locale): string | null {
  if (pageExists(page, visitorLocale)) return urlFor(page, visitorLocale);
  if (pageExists(page, 'en')) return urlFor(page, 'en');
  return null;
}

export interface Alternate { locale: Locale; label: string; url: string; current: boolean }

// The ready language versions of a page, in language order, with the one for `locale` marked current.
export function alternatesFor(page: PageId, locale: Locale): Alternate[] {
  return localeOrder
    .filter((l) => pageExists(page, l))
    .map((l) => ({ locale: l, label: localeInfo[l].label, url: urlFor(page, l), current: l === locale }));
}

// Where the selector sends a visitor who picks `target` from `page`: the same page in that language, or the home page
// in that language if the page does not exist there, or English if that language is not ready.
export function switchTarget(page: PageId, target: Locale): string {
  if (pageExists(page, target)) return urlFor(page, target);
  return linkTarget('home', target) ?? '/';
}

export interface BuiltPage { page: PageId; locale: Locale; slug: string; path: string }

// Every page that is built, English included, in page order then language order.
export function builtPages(): BuiltPage[] {
  const out: BuiltPage[] = [];
  for (const page of Object.keys(pages) as PageId[]) {
    for (const locale of localeOrder) {
      if (pageExists(page, locale)) out.push({ page, locale, slug: slugFor(page, locale)!, path: urlFor(page, locale) });
    }
  }
  return out;
}
