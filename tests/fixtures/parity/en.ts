// FIXTURE for the parity gate tests, not a page. A small English story file with every feature the gate reads: placeholders, a
// tag, a span, a link, a conditional passage, a date switch, a number that comes from a placeholder, a year typed in the
// English, ids and letters that stay as they are, and the list of issuing bodies that stays in the English file.
export const fixtureBodies: Record<string, string> = { 'sample-1': 'law' };

export const fixture = {
  flow: 'c',
  meta: {
    title: `Sample 2026 | einvoiceops`,
    description: `We keep track of the rules in {countries}.`,
  },
  opening: {
    // A date switch: the version is picked by today's date.
    h1: {
      from: '2027-01-01',
      coming: `Hear about the next change before you send, not from a rejected invoice.`,
      here: `Hear about the next change from us, not from a rejected invoice.`,
    },
    subline: `When we find a change, we email <strong>the person who looks after it</strong>, with what changed and <span class='accent'>where it says so</span>.`,
    kicker: ``,
  },
  proof: {
    // The count comes from a placeholder, it is not typed.
    headline: `{published} changes we've counted since {since}`,
    weekly: `{weekly} sources we read every week`,
  },
  cards: [
    {
      id: 1,
      title: `The rules kept moving until weeks before January 2025`,
      points: [
        `Eleven weeks before, the ministry issued its letter (<a href='https://example.org/letter'>example.org</a>)`,
        `27 days before, the law changed four rules (<a href='https://example.org/law'>example.org</a>)`,
      ],
    },
    {
      id: '1b',
      title: `Changes come from more than one place`,
      // A conditional passage: "then" when no change of that body since the date, "otherwise" when at least one.
      then: {
        ifNone: { body: 'law', from: '2025-01-01' },
        then: `None of the {published@2025-01-01} changes came through the law.`,
        otherwise: `{body:law@2025-01-01} of the {published@2025-01-01} changes came through the law.`,
      },
    },
  ],
  grid: [`oic`],
  show: false,
  owners: [{ name: `Outbound invoicing`, line: `1 of 1`, items: 1 }],
  contact: {
    send: `Send message`,
    person: { name: `Sample Person`, email: `person@example.org`, linkedin: `https://example.org/in/person/` },
  },
};
