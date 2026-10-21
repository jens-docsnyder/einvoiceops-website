// The component text of a language. A language whose dictionary is still the English placeholder copy can be used only by a
// test build (scripts/test-build.mjs sets I18N_TEST_REGISTRY); a real build that reaches one stops here. The registry's own
// guard (src/i18n/locale-home.astro, locale-page.astro) stops it earlier, with its message about the missing story text.
import type { Locale } from '../registry';
import type { Dictionary } from './types';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { pl } from './pl';

export type { Dictionary, ChangeWord, CountryCode } from './types';

const dictionaries: Record<Locale, Dictionary> = { en, de, fr, pl };

// Every dictionary has exactly English's keys, at every level, and every value is text. The build does not run the type
// checker, so this is what stops a missing, extra or empty entry.
export function shapeProblems(dict: unknown, source: unknown = en, at = ''): string[] {
  if (typeof source === 'string') {
    return typeof dict === 'string' && dict.length > 0 ? [] : [`${at.replace(/\.$/, '')}: expected text`];
  }
  if (typeof dict !== 'object' || dict === null) return [`${at.replace(/\.$/, '')}: expected an object`];
  const want = Object.keys(source as object).sort();
  const have = Object.keys(dict).sort();
  const out = want.filter((k) => !have.includes(k)).map((k) => `${at}${k}: missing`);
  out.push(...have.filter((k) => !want.includes(k)).map((k) => `${at}${k}: not in English`));
  for (const k of want.filter((k) => have.includes(k))) {
    out.push(...shapeProblems((dict as any)[k], (source as any)[k], `${at}${k}.`));
  }
  return out;
}
for (const [code, dict] of Object.entries(dictionaries)) {
  const problems = shapeProblems(dict);
  if (problems.length) throw new Error(`The ${code} dictionary does not match English: ${problems.join('; ')}`);
}

// Take a language off this list when its real dictionary replaces the placeholder copy.
const placeholders: Locale[] = ['de', 'fr', 'pl'];

export function dictionary(locale: Locale): Dictionary {
  if (placeholders.includes(locale) && !process.env.I18N_TEST_REGISTRY) {
    throw new Error(`The ${locale} dictionary is still the English placeholder copy. Only a test build may use it.`);
  }
  return dictionaries[locale];
}
