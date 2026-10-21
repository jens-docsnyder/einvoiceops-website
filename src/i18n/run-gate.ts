// Loads the story files and dictionaries and runs the parity gate (gate.ts) once per build. Called from getStaticPaths in
// locale-home.astro and locale-page.astro; the second call in a build does nothing. Throws, which stops the build.
import { assertReport, gateReport } from './gate';
import { isPlaceholder } from './dictionaries/index';

const storyModules = import.meta.glob('../data/stories/**/*.ts', { eager: true }) as Record<string, Record<string, unknown>>;
const dictionaryModules = import.meta.glob('./dictionaries/*.ts', { eager: true }) as Record<string, Record<string, unknown>>;

// "../data/stories/de/home.ts" is "de/home", "./dictionaries/de.ts" is "de".
const named = (mods: Record<string, Record<string, unknown>>, prefix: string) =>
  Object.fromEntries(Object.entries(mods).map(([k, v]) => [k.slice(prefix.length).replace(/\.ts$/, ''), v]));

let done = false;
export function runGate(): void {
  if (done) return;
  const dictionaries = named(dictionaryModules, './dictionaries/');
  for (const skip of ['index', 'types']) delete dictionaries[skip];
  assertReport(gateReport({ stories: named(storyModules, '../data/stories/'), dictionaries }, { isPlaceholder }));
  done = true;
}
