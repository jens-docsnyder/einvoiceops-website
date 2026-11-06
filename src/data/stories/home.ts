// All copy of the home page, in the shape of the country story files (meta, opening, onboarding, limits). The contact block
// is home-contact.ts. Strings may hold <strong> and <span class='accent'>; they are rendered with set:html.
// Placeholders: {countries} is the list of country names ("France, Germany and Belgium", joined with the language's own
// "and"), {since} the date a country's count starts, {weekly} the number of sources read every week and {name} a country's
// name; in the hover panel under a card {fn} is a function's name, {n} the changes that touched it and {m} all the changes shown. The counts and dates come from src/data/fanout/<CC>.json; none is typed here.
export const home = {
  meta: {
    title: `einvoiceops | Changes to e-invoicing rules, sent to the people they affect`,
    description: `We keep track of the e-invoicing rules in {countries}, and when we find a change, we email the person who looks after the part of your invoicing it affects, with what changed for them and where it says so.`,
  },
  opening: {
    h1: `E-invoicing news reaches you in pieces. You never know if you have the full picture.`,
    subline: `Some changes reach you late, and some don't reach you at all. Here are the ones we've counted in each country.`,
    imageAlt: `Two colleagues discussing a printed document at an office table.`,
  },
  // The country cards: each folds open from its question, then a count and its start date, the sources read every week, and the link.
  countries: {
    ask: `How many changes in {name} have reached you?`,
    askAll: `How many e-invoicing changes have reached you?`,
    tabsLabel: `Country`,
    changes: `changes we've counted since {since}`,
    panelIdle: `Point at a function name to see the changes that touched it. On a phone, tap it.`,
    panelFn: `{fn}: touched by {n} of the {m} changes`,
    weekly: `Connected to {weekly} sources`,
    go: `Learn about our service for {name}`,
    labelSource: `Source`,
    labelFn: `Affected function`,
  },
  // The six functions, in the order the tiles show them.
  functions: {
    h2: `A change can touch one part of your invoicing or several`,
    intro: `Whoever looks after each part a change touches hears from us about their own part, so nobody has to follow the change across all six.`,
    names: [`Outbound invoicing`, `Inbound invoicing`, `Connectivity`, `Tax engine`, `Master data`, `Archiving`],
  },
  // What reaches you when a rule changes: the lead, the line into the example and the example in three tabs (Germany, France,
  // Belgium). Each tab reuses its country page's followed example with the intro below in place of the page's own.
  // Lines with built: false are not rendered until the item behind them is built (readiness report #181, quiet-week note #183).
  reach: {
    h2: `What reaches you when a rule changes`,
    lead: `When we find a change that touches the part of your invoicing you look after, you get a mail from us with what changed, what it means for your part and where it says so.`,
    readiness: { built: false, text: `Before the first mail, you receive a readiness report covering each of your invoicing functions as the baseline, with materials to take it through your teams, your provider and IT.` },
    quiet: { built: false, text: `When nothing has changed in your country, you hear that too.` },
    into: `Here's how that looked for one real change in each country.`,
    tabsLabel: `Choose a country`,
    tabs: { DE: `Germany`, FR: `France`, BE: `Belgium` },
    intros: {
      DE: `On 2 September 2026 KoSIT released new checks for XRechnung, one of Germany's two accepted formats, and that one change touched three parts of your invoicing at once.`,
      FR: `On 28 July 2026, five weeks before the e-invoicing mandate in France went live, a decree and an order brought 11 new rules at once, and between them they touched every part of your invoicing.`,
      BE: `On 20 February 2026, seven weeks after the e-invoicing mandate in Belgium went live, a new law took effect the same day it was published, and it touched three parts of your invoicing.`,
    },
  },
  // The six function cards: front = label (the function's name from functions.names) + hook + cue; back = the outcome. Same order as names.
  // What you'd have heard from us: one real change per part of the invoicing, its mail item (src/data/home-mails.json) and what is different. outcomes in function order.
  yours: {
    h2: `What you'd have heard from us`,
    intro: `Whichever part of your invoicing you look after, here's a real change that touched it and the mail we'd have sent you about it.`,
    tabsLabel: `The part of your invoicing you look after`,
    changeLabel: `The change`,
    mailLabel: `The mail you'd have got`,
    diffLabel: `What's different for you`,
    from: `einvoiceops`,
    to: `you`,
    quoteLabel: `What the source says, in our verified English:`,
    checkLabel: `What to check:`,
    contexts: [
      `On 27 March 2024 Germany's parliament passed the law that makes e-invoices between businesses the rule, from 1 January 2025.`,
      `On 20 February 2026 a new Belgian law changed who has to be able to receive e-invoices, and it applied the day it was published.`,
      `On 20 February 2026 France's finance law took the government portal out of invoice exchange, so invoices between French companies have to go through a certified platform.`,
      `On 14 July 2025 a Belgian royal decree set fines for invoicing late and for not having the means to send and receive e-invoices, from 1 January 2026.`,
      `On 28 July 2026 a French decree widened who the central directory lists to the members of a VAT group, and it applied the next day.`,
      `On 29 October 2024 Germany cut the time most companies must keep their invoices from ten years to eight, from 1 January 2025.`,
    ],
    outcomes: [
      `You'd have had 40 weeks to get it onto IT's plan.`,
      `You'd have known why supplier invoices changed before they piled up.`,
      `You and IT would have had it on the roadmap in time.`,
      `You'd have had 24 weeks to check your tax settings.`,
      `You'd have checked your records before an invoice bounced.`,
      `You'd have had nine weeks to change what your archive keeps.`,
    ],
  },
  cards: {
    intro: `Find the part of your invoicing you look after and turn its card to see what changes for you.`,
    cue: `What changes for you`,
    after: ``,
    items: [
      { id: `outbound-invoicing`, hook: `The change you assumed was automatic`, back: `You hear about a change to how you send invoices in time to raise it with your provider and get it onto IT's plan.` },
      { id: `inbound-invoicing`, hook: `Hand work nobody can explain`, back: `You know what will arrive differently from your suppliers and from when, so hand work doesn't pile up without anyone knowing why.` },
      { id: `connectivity`, hook: `The step your provider leaves to you`, back: `A change to your connection becomes one more item that you and IT put in order on the roadmap you already keep.` },
      { id: `tax-engine`, hook: `A tax change rarely stays in tax`, back: `When a change touches tax, the tax setting gets checked before the date, rather than someone spotting it later on hand-corrected invoices.` },
      { id: `master-data`, hook: `The record that no longer fits`, back: `You can update your customer and supplier records before the change applies, so you aren't fixing them one failed invoice at a time.` },
      { id: `archiving`, hook: `The question that comes years later`, back: `You hear when what you keep, or how long you keep it, changes, so nobody finds the gap years later when an invoice is asked for.` },
    ],
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
    lead: `When we find a change, your teams hear what it means for their part while there's still time to plan it, so you know what's coming and roughly what it'll take. It costs less than one advisor day a month.`,
    cta: `Get started`,
  },
  limits: {
    h2: `What we don't do`,
    lines: [
      { lead: `Give legal or tax advice.`, text: `What we send is our reading of what a change means for your invoicing, with the source beside it so you can check it.` },
      { lead: `Look beyond our sources.`, text: `For each country we read a fixed list of sources every week, and we tell you about the changes we find there and nowhere else.` },
      { lead: `Make the changes for you.`, text: `Your provider, your IT and your advisors do that, and we tell whoever looks after each part what to check.` },
      { lead: `Decide for you.`, text: `What to do about a change, and when, stays with you and the people who look after your invoicing.` },
    ],
  },
};
