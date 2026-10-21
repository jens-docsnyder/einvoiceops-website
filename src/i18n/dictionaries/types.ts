// The shape of a language's component text: the words the page frame and the shared components print themselves, as opposed
// to the story files, which hold each page's copy. Every language has exactly these keys: index.ts checks the shape when the dictionaries load, so a missing
// or extra key stops the build. English is the source (en.ts); the other three are placeholders until real translations replace them.
export type CountryCode = 'FR' | 'DE' | 'BE' | 'PL';

// The unit word after a count ("1 change", "3 changes"), by plural form (format.ts, pluralForm()). English and German use
// one and many, French counts 0 and 1 as one, Polish uses all three.
export interface ChangeWord { one: string; few: string; many: string }

export interface Dictionary {
  // Page frame: top bar, footer and the language selector (src/layouts/Site.astro).
  countriesNavLabel: string;
  languageNavLabel: string;
  getInTouch: string;
  footerEntity: string;
  legalNotice: string;
  privacy: string;
  // Added after the legal notice and privacy links on a translated page, because both are English only.
  inEnglish: string;
  footerNote: string;

  // The countries as the top bar, the footer and the home page name them.
  countries: Record<CountryCode, string>;
  // The word before the last name in a list of countries: "France, Germany and Belgium".
  listAnd: string;

  // Buttons and labels in the shared components.
  close: string;
  whatWeDo: string;
  futureChanges: string;
  changeWord: ChangeWord;

  // Contact form: the sending state, the failure line ({mail} is the address as a link) and the LinkedIn link's name ({name}).
  formSending: string;
  formError: string;
  linkedinLabel: string;
}
