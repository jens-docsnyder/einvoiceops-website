// All copy of the Germany page (one page per country, told to any company that runs its own invoicing in Germany,
// independent or part of a group, drawn from both German frameworks). Flow C, modelled on fr-standalone.ts as it stands on
// website main de5cfc2 (France as of Jens, 2026-10-09: price in the onboarding heading, no intro under it, contact block
// with the profile link).
// Strings may hold <strong> and <span class='accent'>; they are rendered with set:html.
// Placeholders {published} {since} are filled from src/data/fanout/DE.json (27 rows, 22 publications).
// Voice: Market Intelligence/Messaging/Tone of voice.md. Plan: the Germany page project plan of 2026-10 (Market Intelligence/Messaging). Facts only from
// the Germany facts file for messaging (same folder; cited below as "facts" with its line number) and Product Research/Change Velocity/DE-changes.csv (cited by event id).
// Vocabulary: a change is one publication by one body on one day; a rule is one counted row inside it. The Jahressteuergesetz
// 2024 is one change with four rules (DE-E35, E53, E54, E55); DE-E67 is one change with one rule.

// The sources we read every week: 24, confirmed by the weekly reads of 2026-10-09 (data seat, seat 1). It rises as the doors of
// pending action #1066 read on a Monday. The strip (proof.sourcesCount) and the limits line below both take this one
// constant, so the two cannot drift. Facts line 40 says the same number.
const SOURCES = 24;

// Which body published each counted row, for the box-count check in src/pages/germany/index.astro: the number of distinct
// (body, date) pairs over the rows has to equal publications() over the same rows, so a future day on which two bodies
// publish cannot quietly be counted as one. Bodies read from the channel and source columns of DE-changes.csv, counted
// rows from 2024-01-01 (plan appendix). law = Parliament through the Bundesgesetzblatt, ministry = the finance ministry's
// letters and FAQ, kosit = KoSIT's XRechnung bundle releases, ferd = FeRD's ZUGFeRD releases.
// The two KoSIT rows of 2024-06-20 (DE-E29 Schematron, DE-E30 XRechnung 3.0.2) are one KoSIT publication, as France counts
// one per source per publication day. If xeinkauf.de ever shows DE-E44 (5 February 2026) and DE-E48 (30 January 2026) on one
// day, the strip, card 1b and card 2's KoSIT count all move together (plan appendix, near collision).
export const deBodies: Record<string, 'law' | 'ministry' | 'kosit' | 'ferd'> = {
  'DE-E50': 'ministry',
  'DE-E27': 'law',
  'DE-E28': 'law',
  'DE-E29': 'kosit',
  'DE-E30': 'kosit',
  'DE-E51': 'law',
  'DE-E31': 'ferd',
  'DE-E32': 'ministry',
  'DE-E52': 'law',
  'DE-E33': 'ferd',
  'DE-E34': 'kosit',
  'DE-E35': 'law',
  'DE-E53': 'law',
  'DE-E54': 'law',
  'DE-E55': 'law',
  'DE-E38': 'kosit',
  'DE-E39': 'ferd',
  'DE-E40': 'kosit',
  'DE-E59': 'ministry',
  'DE-E41': 'ministry',
  'DE-E42': 'ferd',
  'DE-E48': 'kosit',
  'DE-E44': 'kosit',
  'DE-E46': 'ministry',
  'DE-E47': 'ferd',
  'DE-E49': 'ferd',
  'DE-E67': 'kosit',
};

export const de = {
  // Page flow C, country-first tree: the site structure file in Market Intelligence/Messaging.
  flow: 'c',

  meta: {
    title: `Germany | einvoiceops`,
    // Not date-bound. Ends in France's current form ("we email the person who looks after the invoicing function it affects").
    description: `Germany's e-invoicing rules have kept changing since receiving e-invoices became mandatory in January 2025. When we find a change, we email the person who looks after the invoicing function it affects.`,
  },

  opening: {
    kickerLinkText: ``,
    kickerRest: ` · Germany`,
    // Date-bound (switch.js): the first version names the issuing duty as still ahead, the second names no issuing date and
    // stays true for both turnover groups after 1 January 2027 (plan section 1). No count in the headline or the subline, because
    // a number there goes stale the day Germany's count moves. Rests on facts 14 (issuing ahead) and DE-E67 (an invoice that
    // validated in spring can fail now, facts 25).
    h1: {
      from: '2027-01-01',
      coming: `Hear about changes to Germany's e-invoicing rules from us before you have to send e-invoices, not from a rejected invoice.`,
      here: `Hear about the next change to Germany's e-invoicing rules from us, not from a rejected invoice.`,
    },
    // One version, no date switch: it names no date that stops being true. The first half rests on facts 24 (12 changes after
    // 1 January 2025); the second half is France's current subline, the same service in every country.
    subline: `The rules have kept changing since receiving e-invoices became mandatory in January 2025. When we find a change that affects one of your invoicing functions, we email the person on your team who looks after it, with what changed for them and where it says so.`,
  },

  // The proof strip in its lead shape (ProofStrip.astro): the sources read, then the count. {published} is the number of
  // publication days of the counted rows (publications() in format.ts): 22 for Germany since 1 January 2024, from 27 rows.
  // The count is publications by body and day, as France's (one per source per publication day); the box-count check in the
  // page file proves the two readings agree today.
  // The unit is "sources", not "official sources". Ruled by the check seat 2026-10-09: "official" does not hold, because the
  // 24 include a private mirror of the statute, the gazette index on a publisher's database and the format bodies' associations.
  proof: {
    headline: `{published} changes we've counted since {since}`,
    headlineSub: `to Germany's e-invoicing rules`,
    sourcesCount: SOURCES,
    sourcesUnit: `sources`,
    sources: `we read every week`,
    // The date column stays empty, as on France: nothing writes last_check.
    checked: ``,
  },

  // The row of boxes under the strip (ChangeBoxes.astro): one box per publication in DE.json, 22, the real example's box
  // (DE-E67) in the accent. Box dates are publication dates: DE-E48 carries 30 January 2026 (its CSV date, 1 August 2026,
  // is the day the cut-off took effect, facts 24), DE-E44 carries 5 February 2026 (GitHub tag), DE-E46 is a month only.
  // DE-E34, E38 and E40 carry their GitHub release days (19 November 2024, 24 March 2025, 9 July 2025), not the bundle
  // version dates in the CSV (check seat 2026-10-09).
  boxes: true,

  // What we see in the market: four cards that turn over (MarketCards.astro). Ids 1, 2 and 3 keep the framework challenge
  // numbers (1 the rules changing, 2 changes scattered, 3 everyone doing their part), so ?lead= still works; '1b' is the
  // second card. Backs as points with links as <a href>domain</a>, like France. Hedged where a card rests on a bet
  // ("likely", "may"). Every dated point is said as distance from a German milestone, counted from the dates:
  // 5 December 2024 is 27 days before 1 January 2025, 15 October 2024 is 78 days (eleven weeks), 4 December 2025 is eleven
  // months after, 2 September 2026 is twenty months after.
  market: {
    h2: `What we see in German e-invoicing`,
    // No intro, as France: the regime is carried by the subline and cards 1b and 2.
    intro: ``,
    turn: `Turn over`,
    turnBack: `Turn back`,
    cards: [
      {
        id: 1,
        title: `The rules kept moving until weeks before January 2025`,
        // Germany's go-live for this beat is receiving becoming mandatory on 1 January 2025, not the full mandate (facts 118).
        front: `Germany was still changing its e-invoicing rules in late 2024, weeks before receiving e-invoices became mandatory on 1 January 2025, so companies had to get ready against rules that hadn't settled.`,
        back: {
          points: [
            // DE-E32, the finance ministry's letter of 15 October 2024. Named by its date and subject only, never for what it says,
            // so it needs no copy disclosure; the link is the Bundessteuerblatt's own index (DE-W41), not a copy of the letter.
            `Eleven weeks before, on 15 October 2024, the finance ministry issued its letter on e-invoicing (<a href='https://www.bstbl.de/inhalt/ivz-nr-I_2024_018.htm'>bstbl.de</a>)`,
            // The Jahressteuergesetz 2024, BGBl 2024 I Nr. 387, published 5 December 2024: DE-E35, E53, E54, E55 (facts 25, 110).
            `27 days before, on 5 December 2024, the Jahressteuergesetz 2024 changed four rules for e-invoicing (<a href='https://www.recht.bund.de/bgbl/1/2024/387/VO.html'>recht.bund.de</a>)`,
          ],
        },
      },
      {
        id: '1b',
        title: `The rules kept changing after January 2025`,
        // Germany has this as fact, so the card is not a prediction as France's is. 12 changes after receiving became mandatory:
        // DE-E38, E39, E40, E59, E41, E42, E44, E46, E47, E48, E49, E67, each on its own day, so 12 is both a rule count and a
        // change count (facts 24). The date-bound clause uses the switch; the "here" form is the frameworks' neutral form and
        // stays true after 2028 as well.
        front: {
          from: '2027-01-01',
          coming: `We've counted 12 changes to Germany's rules since January 2025, and the dates for issuing e-invoices are still ahead, by turnover, from 1 January 2027 above €800,000 of prior-year total turnover and from 1 January 2028 for the rest.`,
          here: `We've counted 12 changes to Germany's rules since January 2025, and the duty to issue applies by turnover, from 1 January 2027 above €800,000 of prior-year total turnover and from 1 January 2028 for the rest.`,
        },
        back: {
          points: [
            // ZUGFeRD 2.4 / Factur-X 1.08, 4 December 2025 (DE-E42).
            `Eleven months after, on 4 December 2025, FeRD released ZUGFeRD 2.4, a new version of the format (<a href='https://fnfe-mpe.org/wp-content/uploads/2025/12/2025-12-04_ZUGFeRD_2.4_Factur-X_1.08_Meldung_DE.pdf'>fnfe-mpe.org</a>)`,
            // XRechnung summer 2026 bugfix bundle, released 2 September 2026 (DE-E67), which announces its own next change.
            `Twenty months after, on 2 September 2026, KoSIT released new XRechnung checks, with four more that start as warnings and are to be raised later (<a href='https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0'>github.com</a>)`,
          ],
          // No prediction line: Germany's own changes after go-live are the evidence.
        },
      },
      {
        id: 2,
        title: `Changes come from more than one place`,
        front: `Germany's rules come from Parliament through the law, from the finance ministry's letters and its FAQ, and from KoSIT and FeRD, the bodies behind XRechnung and ZUGFeRD, Germany's two accepted formats, each on its own calendar.`,
        back: {
          // Counted as changes, one per body per publication day, 22 since 1 January 2024 (deBodies above). Days per body:
          // law 4 (27 Mar 2024 DE-E27 and E28, 23 Jul 2024 DE-E51, 29 Oct 2024 DE-E52, 5 Dec 2024 DE-E35, E53, E54, E55);
          // finance ministry 5 (27 Feb 2024 DE-E50, 15 Oct 2024 DE-E32, 14 Jul 2025 DE-E59, 15 Oct 2025 DE-E41, Mar 2026 DE-E46);
          // KoSIT 7 (20 Jun 2024 DE-E29 and E30, 19 Nov 2024 DE-E34, 24 Mar 2025 DE-E38, 9 Jul 2025 DE-E40, 5 Feb 2026 DE-E44,
          // 30 Jan 2026 DE-E48, 2 Sep 2026 DE-E67); FeRD 6 (18 Sep 2024 DE-E31, 13 Nov 2024 DE-E33, 7 May 2025 DE-E39,
          // 4 Dec 2025 DE-E42, 10 Jun 2026 DE-E47, 4 Aug 2026 DE-E49). 4 + 5 + 7 + 6 = 22.
          // None of the 12 since receiving became mandatory came through the law (facts 26, 107).
          lead: `We've counted 22 changes since 1 January 2024, and this is where each of them came from.`,
          points: [
            `4 through the law`,
            `5 from the finance ministry`,
            `7 from KoSIT, for XRechnung`,
            `6 from FeRD, for ZUGFeRD`,
          ],
          then: `None of the 12 changes since January 2025 came through the law, so anyone watching only the law would have missed all of them.`,
        },
      },
      {
        id: 3,
        title: `A change can fall between the people you rely on`,
        // Germany has no central platform and no clearance model, so no mandated platform sits between a company and its
        // customers (facts 16, 32, 99). The whole card is both frameworks' bet and is hedged as one ("likely", "may").
        // It says nothing about where the obligation stays, which would rest on a ministry letter and need its disclosure.
        front: `In Germany your invoices move through the software and partners you chose, on whatever route you agree with each customer and supplier, and each of them looks after its own part.`,
        back: {
          points: [
            // The three outside parties of a standalone company are a bet (facts 35). The provider point (facts 74, 94) was cut by
            // the cold read of 2026-10-09: a group naming dependence on a change-watching provider as its weak spot argues against
            // buying one, and the facts file allows both halves or neither.
            `Your software vendor is likely to update its software, your ERP partner to look after its part and your tax advisor to know the tax, and it may be nobody's job to check that it all still fits`,
          ],
          then: `So checking that a change has reached all of it is likely left to you.`,
        },
      },
    ],
  },

  fanout: {
    // Left out of the page, as France's: the row of boxes carries the 22 and the September grid the per-function view.
    show: false,
  },

  // The September 2026 release told as the one publication that shows the cards at once. Picked: KoSIT's XRechnung summer
  // 2026 bugfix bundle, released 2 September 2026 (DE-E67, bundle dated 31 August 2026). It came twenty months after receiving
  // became mandatory (card 1b), from the format body and not the law (card 2), and it reaches the software that builds the
  // invoice, the checks on incoming invoices and the Peppol version at the same time (card 3). One rule, grid letters oic,
  // 3 work items: outbound 1, inbound 1, connectivity 1 (DE-changes.csv). So the grid is one column and the closing box reads
  // 1 rule, 3 work items: Germany's truth is 22 publications, most of them a single rule, and the row of boxes carries the breadth.
  followed: {
    h2: `A real example from September 2026`,
    intro: `On 2 September 2026, KoSIT released new checks for XRechnung, one of Germany's two accepted e-invoice formats, so an invoice that passed validation in spring can fail now. We count it as one change, and it affects three of your invoicing functions at once.`,
    stepLabels: { arrives: `What was published`, lands: `What it means for you`, reaches: `Who would have heard from us` },
    arrives: {
      date: `2 Sep 2026`,
      text: ``,
      // KoSIT's release of xrechnung-schematron v2.6.0 (the CSV holds the API address; the page links the human release page).
      source: `KoSIT's XRechnung release of 2 September 2026: <a href='https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0'>the release page</a>, github.com`,
    },
    shows: [],
    closing: {
      title: `Three invoicing functions had work to do`,
      // 1 rule DE-E67; 3 work items = row totals 1 + 1 + 1, the other three rows empty (DE-changes.csv, functions oic).
      lead: `One change, released on 2 September`,
      chain: [
        `1 rule in it`,
        `It affects 3 invoicing functions`,
        `3 work items to check or prepare`,
      ],
      // The rejected invoice rests on DE-E67 ("an invoice that validated in spring can fail now", facts 25); the payment left
      // waiting is the frameworks' bet, as on France.
      then: `Miss a change like it, and the first sign may be an invoice your customer rejects and a payment left waiting.`,
    },
    // The grid: one column, DE-E67, letters for the functions it touched, from the column of DE-changes.csv that lists them:
    // o outbound, i inbound, c connectivity, t tax engine, m master data, a archiving.
    grid: [`oic`],
    gridPrompt: `1 rule`,
    gridAxisY: `Invoicing functions`,
    gridFor: `What in this rule affects your`,
    gridCaption: `Each filled square is a rule that affects that invoicing function.`,
    countLabel: ``,
    countHead: ``,
    totalLabel: `Total work items`,
    // The part for each function, written for the page from the what_changed column of DE-E67. The union of the parts'
    // letters equals the grid entry: o + i + c = oic.
    changes: [
      { id: `DE-E67`, title: `New XRechnung checks`, parts: [
        { f: `o`, text: `A temporary check, BR-TMP-2, is now fatal, so an invoice you send that breaks it now fails the check and can be rejected, where in spring it would have passed.` },
        { f: `i`, text: `Invoices you receive are checked the same way, so one that breaks it now fails too, and four more temporary rules arrive as warnings, to be raised later.` },
        { f: `c`, text: `The release moves to Peppol BIS Billing 3.0.21.` },
      ] },
    ],
    gridStart: { col: 0, fn: `o` },
    notTouched: `not affected`,
    touched: [],
    untouched: [],
    ofTotal: 1,
    // Rows in the six functions' fixed order, not by count; the bars carry the size.
    owners: [
      { name: `Outbound invoicing`, line: `1 of 1`, items: 1 },
      { name: `Inbound invoicing`, line: `1 of 1`, items: 1 },
      { name: `Connectivity`, line: `1 of 1`, items: 1 },
      { name: `Tax engine`, line: `0 of 1`, items: 0 },
      { name: `Master data`, line: `0 of 1`, items: 0 },
      { name: `Archiving`, line: `0 of 1`, items: 0 },
    ],
    withheld: ``,
  },

  onboarding: {
    // France's, word for word (Jens, 2026-10-09): the price is said once, in the heading, and no intro repeats it.
    h2: `We keep your invoicing teams up to date. Free onboarding, then €450 a month.`,
    intro: ``,
    steps: [
      { label: ``, text: `After your first message, we send you a form, about an hour's work, where you tell us who looks after each of your invoicing functions.` },
      { label: ``, text: `We then have a short call with whoever signs off on your side, so they know what each person will hear from us and what we don't do.` },
      { label: ``, text: `When we find a change, each person it affects hears from us what to check or prepare, and where it says so. We keep a record of each change we find and who we sent it to, so it never rests on one person remembering.` },
    ],
    cta: `Get started`,
  },

  // The limits box, beside the onboarding steps: France's three lines with Germany for France. The number in the second line
  // is SOURCES, the strip's constant, so the two cannot drift. "Official" is left out of it, as in the strip's unit (check seat 2026-10-09).
  limits: {
    h2: `What we don't do`,
    lines: [
      { lead: `Give legal or tax advice.`, text: `What we send is our reading of what a change means for your invoicing, with the source beside it so you can check it.` },
      { lead: `Look beyond our sources.`, text: `We read ${SOURCES} of Germany's sources every week, and we tell you about the changes we find there and nowhere else.` },
      { lead: `Decide for you.`, text: `What to do about a change, and when, stays with you and the people who look after your invoicing.` },
    ],
  },

  // France's contact block, word for word, including the profile link on the name.
  contact: {
    h2: `Get started, or tell us how you keep up today`,
    name: `Name and company`,
    email: `Email`,
    message: `Your message`,
    send: `Send message`,
    after: `This opens a draft in your email program.`,
    mailto: `jens@einvoiceops.eu`,
    hint: `Tell us who looks after your invoicing today, and whether that's one person, several, or a team for each function.`,
    person: {
      name: `Jens Anttila`,
      email: `jens@einvoiceops.eu`,
      photo: `/jens-anttila.jpg`,
      linkedin: `https://www.linkedin.com/in/jens-anttila/`,
    },
    done: `If your email program opened, your message is there, addressed to Jens, and nothing is sent until you send it. If nothing opened, copy your message above and send it to <a href="mailto:jens@einvoiceops.eu">jens@einvoiceops.eu</a>.`,
  },
};
