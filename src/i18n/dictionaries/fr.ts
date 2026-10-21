// PLACEHOLDER, NOT A TRANSLATION. This is a typed copy of the English values so the test build can render a page in this
// language's frame. Real translations replace every value here, and then fr comes off the placeholders list in index.ts.
// Nothing in a real build reads this file while the language is not ready.
import type { Dictionary } from './types';
import { en } from './en';

export const fr: Dictionary = { ...en, countries: { ...en.countries }, changeWord: { ...en.changeWord } };
