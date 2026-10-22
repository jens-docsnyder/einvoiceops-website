// All copy of the home page, in the shape of the country story files (meta, opening, onboarding, limits). The contact block
// is home-contact.ts. Strings may hold <strong> and <span class='accent'>; they are rendered with set:html.
// Placeholders: {countries} is the list of country names ("France, Germany and Belgium", joined with the language's own
// "and"), {since} the date a country's count starts, {weekly} the number of sources read every week and {name} a country's
// name. The counts and dates come from src/data/fanout/<CC>.json; none is typed here.
export const home = {
  meta: {
    title: `einvoiceops | Changes to e-invoicing rules, sent to the people they affect`,
    description: `We keep track of the e-invoicing rules in {countries}, and when we find a change, we email the person who looks after the part of your invoicing it affects, with what changed for them and where it says so.`,
  },
  opening: {
    h1: `When e-invoicing rules change, you piece the news together from wherever you can. You never know if it's the full picture.`,
    subline: `The piece you missed turns up later, as a rush job. Heard in time, it would have been a plan.`,
  },
  // The country cards: a count and its start date, the sources read every week, and the link.
  countries: {
    h2: `How many of these changes reached you?`,
    line: `Pick the country where you run your invoicing.`,
    changes: `changes we've counted since {since}`,
    strip: `One square for each change, in the month it was published.`,
    weekly: `{weekly} sources we read every week`,
    go: `Read about {name}`,
  },
  // The six functions, in the order the tiles show them.
  functions: {
    h2: `A change can touch one part of your invoicing or several`,
    intro: `Whoever looks after each part a change touches hears from us about their own part, so nobody has to follow the change across all six.`,
    names: [`Outbound invoicing`, `Inbound invoicing`, `Connectivity`, `Tax engine`, `Master data`, `Archiving`],
  },
  // Starting and the limits: the country pages' onboarding steps word for word; the price per country, because the home page
  // speaks for all of them; the limits as the country pages say them, without a country's source count.
  onboarding: {
    h2: `We keep your invoicing teams up to date. Free onboarding, then €450 a month for each country.`,
    steps: [
      { text: `After your first message, we send you a form, about an hour's work, where you tell us who looks after each of your invoicing functions.` },
      { text: `We then have a short call with whoever signs off on your side, so they know what each person will hear from us and what we don't do.` },
      { text: `When we find a change, each person it affects hears from us what to check or prepare, and where it says so. We keep a record of each change we find and who we sent it to, so it never rests on one person remembering.` },
    ],
    cta: `Get started`,
  },
  limits: {
    h2: `What we don't do`,
    lines: [
      { lead: `Give legal or tax advice.`, text: `What we send is our reading of what a change means for your invoicing, with the source beside it so you can check it.` },
      { lead: `Look beyond our sources.`, text: `For each country we read a fixed list of sources every week, and we tell you about the changes we find there and nowhere else.` },
      { lead: `Decide for you.`, text: `What to do about a change, and when, stays with you and the people who look after your invoicing.` },
    ],
  },
};
