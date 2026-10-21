// The copy of a page in a language. English is the story file itself; another language reads
// src/data/stories/<locale>/<same file name>.ts, which the parity gate (gate.ts) has already checked in the build.
// There is no fallback to English text: a ready language whose file is missing stops here. The only exception is the identity
// copy of a test build (scripts/test-build.mjs sets I18N_TEST_REGISTRY), which shows the English text on the frame of a
// language so the routing can be tested.
import { testRegistry, type Locale } from './registry';

const translated = import.meta.glob('../data/stories/*/*.ts', { eager: true }) as Record<string, Record<string, unknown>>;

export function storyFor<T>(file: string, exportName: string, english: T, locale: Locale): T {
  if (locale === 'en') return english;
  const mod = translated[`../data/stories/${locale}/${file}.ts`];
  if (mod) {
    if (!(exportName in mod)) throw new Error(`src/data/stories/${locale}/${file}.ts has no export ${exportName}.`);
    return mod[exportName] as T;
  }
  if (testRegistry) return english;
  throw new Error(`No ${locale} story file for ${file}.ts. The parity gate should have stopped the build.`);
}
