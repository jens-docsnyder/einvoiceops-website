// FIXTURE for the parity gate tests, not a translation and not a page. It has the shape of a correct translation of en.ts:
// the same keys, placeholders, tags, links, conditional passage and switch dates, no typed number, the words in another order
// where that is allowed, and `from` carrying the hash of each English text. The words are English on purpose.
export const fixture = {
  flow: 'c',
  meta: {
    title: `Example 2026 | einvoiceops`,
    description: `In {countries}, we keep track of the rules.`,
  },
  opening: {
    h1: {
      from: '2027-01-01',
      coming: `Before you send, hear about the next change from us, not from a rejected invoice.`,
      here: `From us, not from a rejected invoice, you hear about the next change.`,
    },
    subline: `When we find a change, we email <strong>the person who owns it</strong>, with what changed and <span class='accent'>the place that says so</span>.`,
    kicker: ``,
  },
  proof: {
    headline: `Since {since}, we've counted {published} changes`,
    weekly: `Every week we read {weekly} sources`,
  },
  cards: [
    {
      id: 1,
      title: `Until weeks before January 2025 the rules kept moving`,
      points: [
        `Eleven weeks earlier, the ministry issued its letter (<a href="https://example.org/letter">example.org</a>)`,
        `27 days earlier, the law changed four rules (<a href='https://example.org/law'>example.org</a>)`,
      ],
    },
    {
      id: '1b',
      title: `Changes arrive from several places`,
      then: {
        ifNone: { body: 'law', from: '2025-01-01' },
        then: `Of the {published@2025-01-01} changes, none came through the law.`,
        otherwise: `Through the law came {body:law@2025-01-01} of the {published@2025-01-01} changes.`,
      },
    },
  ],
  grid: [`oic`],
  show: false,
  owners: [{ name: `Outbound invoicing, in other words`, line: `1 of 1`, items: 1 }],
  contact: {
    send: `Send the message`,
    person: { name: `Sample Person`, email: `person@example.org`, linkedin: `https://example.org/in/person/` },
  },
};

// Hash of the English text each key was made from (src/i18n/parity.ts, hashOf).
export const from = {
  'meta.title': '6e1cdad89aad',
  'meta.description': '17b1bcc1f3ed',
  'opening.h1.coming': '636dc84fd539',
  'opening.h1.here': '5d123d2fad41',
  'opening.subline': '7fd75fbcd507',
  'proof.headline': '1451d0a3ce5f',
  'proof.weekly': 'a0683f1ed850',
  'cards.0.title': 'a2a21632b3a6',
  'cards.0.points.0': 'bbd7dbafbb5a',
  'cards.0.points.1': '5be222660bdf',
  'cards.1.title': '2fa3ea1ab523',
  'cards.1.then.then': '82be1416b60a',
  'cards.1.then.otherwise': 'd6fddc619131',
  'owners.0.name': '5bc6ead6ad0e',
  'owners.0.line': '256404c0798e',
  'contact.send': 'c70a890d1411',
};
