// English component text. These values are the text the components printed before the dictionary existed, character for
// character; the English build must stay byte-identical to the baseline.
import type { Dictionary } from './types';

export const en: Dictionary = {
  // Page frame
  countriesNavLabel: 'Countries',
  languageNavLabel: 'Language',
  getInTouch: 'Get in touch',
  footerEntity: 'Nomos Digital Oy · Espoo, Finland',
  legalNotice: 'Legal notice',
  privacy: 'Privacy',
  inEnglish: '(in English)',
  footerNote: "We help companies prepare for changes to e-invoicing rules, and we don't give legal or tax advice. When we describe a change on this site, we show you where it was published.",

  // Countries
  countries: { FR: 'France', DE: 'Germany', BE: 'Belgium', PL: 'Poland' },
  listAnd: 'and',

  // Buttons and labels
  close: 'Close',
  whatWeDo: 'What we do:',
  futureChanges: 'Future changes',
  changeWord: { one: 'change', few: 'changes', many: 'changes' },

  // Contact form
  formSending: 'Sending...',
  formError: 'Your message was not sent. Please email {mail} instead.',
  linkedinLabel: '{name} on LinkedIn',
};
