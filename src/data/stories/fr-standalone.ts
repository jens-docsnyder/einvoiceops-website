// All copy of the France standalone company story page (framework: France, standalone).
// One file per framework: a framework change is one edit here.
// Strings may hold <strong> and <span class='accent'>; they are rendered with set:html.
// Placeholders {named} {weekly} {checked} {since} {total} are filled from src/data/fanout/FR.json.
// Voice: Market Intelligence/Messaging/Tone of voice.md. Rewritten 2026-10-05 from Jens's word on the built page: the banner,
// the market cards in place of the three numbered columns, the July change with an example note, starting, contact and
// the person line. Polished the same day as one piece, read top to bottom, so each section hands on to the next. Facts only from Market Intelligence/Messaging/France - facts for messaging.md.

// Check seat findings applied 2026-10-08: second seat 2026-10-08 (Opus), completeness only about our sources, voice fixes.
// One page per country (Jens, 2026-10-08): this page is told to any company that runs its own invoicing in France,
// independent or part of a group, drawn from both France frameworks. Review: Market Intelligence/Messaging/
// France page - review for one page per country, 2026-10-08.md. The provider bets below are both frameworks' bets.
export const frStandalone = {
  // Page flow C, country-first tree: Market Intelligence/Messaging/Website - page and site structure.md (Jens, 2026-10-05).
  flow: 'c',

  meta: {
    title: `France | einvoiceops`,
    description: `France's e-invoicing rules were still being rewritten weeks before go-live, and we expect them to change again. When we find a change, we email the person who looks after the invoicing function it affects.`,
  },

  opening: {
    kickerLinkText: ``,
    kickerRest: ` · France`,
    h1: `Hear about the next change to France's e-invoicing rules from us, not from a rejected invoice.`,
    // Subline and meta description say "email" and "what changed for them" (Jens, 2026-10-09, from Petteri's read).
    subline: `When we find a change that affects one of your invoicing functions, we email the person on your team who looks after it, with what changed for them and where it says so.`,
  },

  // The proof strip in its lead shape (ProofStrip.astro, proof.headline): three columns read left to right as one story,
  // the last check, the sources read, then the count (Jens, 2026-10-06). {checked} is the date of the released count;
  // the date over "last time we checked for changes" is last_check in FR.json.
  // sourcesCount is a hard number, 27, in place of sources_weekly (29): two of the 29 polled sources (FR-W35, FR-W36)
  // are switched on and have never been read once (the stuck-items plan, item 6), so the page says 27 until they are read.
  proof: {
    // A change is what a source published; it holds one or more rules, each a counted row (Jens, 2026-10-08). {published}
    // is the number of publication days of the counted rows (publications() in format.ts), 10 for France since 2024.
    headline: `{published} changes we've counted since {since}`,
    headlineSub: `to France's e-invoicing rules`,
    sourcesCount: 27,
    sourcesUnit: `official sources`,
    sources: `we read every week`,
    // The date column is gone (improvement review 2026-10, item 3): nothing writes last_check, so a typed date went stale
    // beside "every week". It comes back only with a writer that updates it on each weekly read.
    checked: ``,
  },

  // The row of boxes under the proof strip (ChangeBoxes.astro, Jens 2026-10-07, approved mockup in Market Intelligence/
  // Messaging/Website structure pictures, 2026-10): one box per counted change in FR.json's changes list, filling with the
  // scroll, the change the grid opens on in the accent, a line from it into the July grid. With it, the July grid comes
  // straight after the strip and the market cards after the grid. No captions, colours, markers or labels on the boxes.
  boxes: true,

  // What we see in the market: four cards that turn over (MarketCards.astro), in place of the three numbered columns.
  // Rewritten 2026-10-06 from Jens's word as one story read left to right: the rules moved until weeks before the start,
  // they'll move again, they move in more than one place, and each provider keeps up with only its own part. The card on
  // key people was taken out because the page expands on it further down. Card ids 2 and 3 keep the framework's challenge
  // numbers, so ?lead=2 and ?lead=3 still move their card first; the new second card is '1b'.
  // Bets carried: "we expect changes to France's rules to arrive within months" is labelled as a prediction (no counted
  // French change since 1 September 2026, said on the card); Belgium's February law change and May guidance are Belgium's, quoted in the
  // France facts file; the last card's providers each answering for their own part and the bounced invoice rest on the
  // standalone row's bets, put as "nobody may be watching" and, for the outside parties, as a condition ("if you work
  // with", "likely"), not a claim.
  // Cold read second seat 2026-10-06 (Opus); its four findings fixed in the steering seat, not read again.
  // Second pass 2026-10-06 from Jens's word: card 2 names the three bodies, and its back gives the count per body in the
  // same order (24 legislative, 5 AFNOR, 4 tax administration, from the channel and source columns of FR-changes.csv,
  // counted rows since 2024-01-01; the ministry press release of October 2024 sits with the tax administration). Card 3
  // front cut to one statement, its back carries it to the outside parties (still the standalone row's bet). Cold read
  // second seat 2026-10-06 (Opus): four findings (repeated prediction, colon list, two bets stated as fact), fixed here.
  // Backs as points (Jens, 2026-10-06): bullets, and a closing consequence after an arrow where the card has one.
  // Card 3 rewritten 2026-10-06 (Jens: "their own part" reads as machine text, "named someone where?", back choppy): the
  // front says the job falls to the company, the back carries the mechanism; provider roles hedged as the standalone
  // row's bet. Cold read second seat 2026-10-06 (Opus), its findings applied in the steering seat.
  // Dates as distance from go-live (Jens, 2026-10-06): France's finance law of 20 February 2026 is six months before
  // 1 September, the 28 July package 35 days (five weeks); Belgium's law of 10 February 2026 was published and in force on
  // 20 February, 50 days after its 1 January start (seven weeks, counted from publication like France's finance law); its
  // FAQ addition is dated 20 May 2026 by its first capture, so the page says "In May" (improvement review 2026-10, items 2, 11).
  // Each dated point links its source (review item 1): Légifrance for the finance law and the decree, the Belgian gazette
  // copy (BE-W33) and the FAQ (BE-W18) for Belgium.
  market: {
    h2: `What we see in French e-invoicing`,
    // Intro paragraph cut (Jens, 2026-10-09, from Petteri's read); MarketCards.astro renders no intro when it is empty.
    intro: ``,
    // Card button now reads "Turn over" (Jens, 2026-10-09, from Petteri's read).
    turn: `Turn over`,
    turnBack: `Turn back`,
    cards: [
      {
        id: 1,
        title: `The rules kept moving until weeks before go-live`,
        front: `France was still rewriting its e-invoicing rules a few weeks before go-live, so companies had to get ready against rules that hadn't settled.`,
        back: {
          points: [
            `Six months before go-live, the finance law gave your platform the job of sending your invoice data to the administration (<a href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053508155'>legifrance.gouv.fr</a>)`,
            `Five weeks before go-live, a decree and an order wrote the required invoice formats into law (<a href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054499487'>the decree</a> and <a href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054499535'>the order</a>, legifrance.gouv.fr)`,
          ],
        },
      },
      {
        id: '1b',
        title: `We expect the rules to change again`,
        front: `We haven't counted a change to France's rules since go-live yet, but Belgium, which went live in January, kept changing its rules well after go-live.`,
        back: {
          points: [
            `Seven weeks after go-live, Belgium amended its law (<a href='https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=nl&amp;caller=summary&amp;pub_date=2026-02-20&amp;numac=2026001291'>ejustice.just.fgov.be</a>)`,
            `In May, Belgium's tax administration added guidance (<a href='https://efactuur.belgium.be/nl/FAQ'>efactuur.belgium.be</a>)`,
          ],
          then: `We expect changes to France's rules to arrive within months.`,
        },
      },
      {
        id: 2,
        title: `Changes come from more than one place`,
        front: `France's rules come from Parliament and the government through the law, from AFNOR, France's standards body, and from the tax administration, each on its own calendar.`,
        back: {
          // Counted as changes, one per source per publication day (Jens, 2026-10-08): 2 through the law (the finance law of
          // 20 February 2026, the decree and order of 28 July 2026), 4 AFNOR days (13 May, 19 June, 31 July, 17 November 2025),
          // 4 from the tax administration (the ministry release of 15 October 2024, DGFiP specifications v3.0, v3.1, v3.2),
          // from the date, channel and source_ref columns of FR-changes.csv, counted rows from 2024-01-01.
          lead: `We've counted 10 changes since 1 January 2024, and this is where each of them came from.`,
          points: [
            `2 through Parliament and the government`,
            `4 from AFNOR`,
            `4 from the tax administration`,
          ],
          then: `Anyone watching only the law would have missed 8 of them.`,
        },
      },
      {
        id: 3,
        title: `A change can fall between your providers`,
        front: `Your certified platform and your other providers each look after what they supply, but checking that it all still works together is likely left to you.`,
        back: {
          points: [
            `A change from the law, AFNOR or the tax administration can affect your platform and your other providers at the same time`,
            `Each of them is likely to update its own part, and on your side it may be nobody's job to check that it all still fits`,
          ],
          // The rejected invoice line is gone (Jens, 2026-10-08): the closing box beside the July grid says it just before.
        },
      },
    ],
  },

  fanout: {
    // Left out of the page (Jens, 2026-10-07: "do we take this section out?", yes): the row of boxes carries the 33 and
    // the July grid the per-function view; its per-function counts (19, 17, 15, 11, 5, 3) are function hits labelled as
    // changes, the mix-up the grid's action items now keep apart. Its lines named what the two July 2025 AFNOR changes
    // were, which is what needed the copy disclosure below; with the section gone the page names neither. Copy kept so the
    // section can come back with show removed.
    show: false,
    topAfter: `changes to France's own e-invoicing rules since {since}`,
    heading: `We've counted {total} changes to France's own e-invoicing rules since {since}`,
    intro: `The July package accounts for eleven of them, and if you open the box for the invoicing function you look after, you'll see how many of them touched it.`,
    openLine: `Open the box for the invoicing function you look after to see which of these changes touched it.`,
    more: `and {n} more`,
    changesOne: `change`,
    changesMany: `changes`,
    // The sources in aggregate, always in view (Jens, 2026-10-05: "just a few lines on the sources on aggregate, very short").
    sourcesNote: `Most of these changes were published in French law and the tax code, which we read in the official publisher's own text, and the rest came in format standards or from the administration. Each line in a box shows the site it came from.`,
    // The copy disclosure for the two July 2025 AFNOR editions, all four parts (CLAUDE.md, mandate text). Its wording is
    // Tone of voice.md's France disclosure; the words "not the authoritative wording of any sentence" are checker words
    // and stay exact.
    about: {
      summary: `Two of these changes, from July 2025, were read from copies of AFNOR standards`,
      text: `AFNOR only publishes the edition of a standard that's in force now, so we read the July 2025 editions of two of its format standards from copies downloaded from third-party sites that carry AFNOR's cover notice. We checked them against AFNOR's own catalogue, which lists those editions as since replaced, and one of them against a second independent copy with the same version table. That establishes that the editions existed and what their version tables say, not the authoritative wording of any sentence. Closing that gap takes an AFNOR Editions account and a request for the earlier edition, rather than a sum we can name.`,
    },
  },

  // The July package told as the one publication that shows all four market cards at once (Jens, 2026-10-07: "we want
  // to cover as many challenges as possible with the example"; steps 2 and 3 merged, the functions named once). Facts:
  // the package and its per-function split (7, 4, 4, 3, 3, 2) from FR-changes.csv FR-E48 to FR-E58, unaffected by the
  // 2026-09-22 corrections; the new data item is FR-E52, the unnamed AFNOR standards FR-E48 and FR-E49 (scope.md TRIGGER
  // item 2), the invoice number check FR-E51. Provider roles in the last point and the note are the standalone row's
  // bet, hedged ("likely", "may"). No sentence pairs AFNOR with update words, so the review-page regex stays quiet.
  // Cold read second seat 2026-10-07 (Opus): eight findings, seven applied in the steering seat. Rebuilt the same day from
  // Jens's word ("Effekthascherei instead of communicating straight", "impossible to follow the argument"): plain headline,
  // one sentence on what was published, the four points headed by the cards' own titles. Cold read second seat
  // 2026-10-07 (Sonnet), its findings applied in the steering seat, not read again.
  followed: {
    h2: `A real example from July 2026`,
    // Names the start (Jens's boxes, 2026-10-07): with the grid moved up under the strip, this is the first place the page
    // says when the rules went live (facts file: 28 July is 35 days before 1 September 2026).
    // Jens, 2026-10-07: "five weeks before the mandate came into effect" (the first phase, 1 September 2026, facts file).
    // Jens, 2026-10-08: one change holds several rules; 28 July is one change with 11 rules. The start is go-live everywhere.
    // The decree and the order are named on card 1's back and the gazette in the source line, so the intro only counts.
    intro: `On 28 July 2026, five weeks before go-live on 1 September, France published a decree and an order that we count as one change, with 11 rules that affect invoicing.`,
    stepLabels: { arrives: `What was published`, lands: `What it means for you`, reaches: `Who would have heard from us` },
    arrives: {
      date: `28 Jul 2026`,
      text: ``,
      // Both texts appeared in the Journal officiel of 28 July 2026 (JORF_20260728 in FR-changes.csv); the order is dated the
      // day before, so the line names the gazette date only (Jens, 2026-10-07: 28 July above, 27 juillet here, read as a clash).
      source: `Journal officiel of 28 July 2026: <a href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054499487'>the decree</a> and <a href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054499535'>the order</a>, legifrance.gouv.fr`,
    },
    // Beside the grid, the close of the argument (Jens, 2026-10-07: the four bullets looked out of place and were too
    // granular; this part wraps up the argument and says how badly this hurts a company, not exactly what the hurt is).
    // Facts: all six rows of the grid are filled; the rest carries the cards' own hedges ("likely", "we expect", "may").
    shows: [],
    closing: {
      title: `Every invoicing function had work to do`,
      // With the market cards now after the grid (2026-10-07), the closing keeps only what the July example shows and the
      // hurt; "from more than one place" and "likely left to each company" are the cards' own points and now come there.
      // The chain read down (Jens, 2026-10-08): change, rules, functions, work items, then the consequence set apart.
      // 11 rules FR-E48 to FR-E58; 23 work items = row totals 7 + 3 + 4 + 4 + 3 + 2, all six rows filled (FR-changes.csv).
      lead: `One change, published on 28 July`,
      chain: [
        `11 rules in it`,
        `Each rule affects one or more invoicing functions`,
        `23 work items to check or prepare`,
      ],
      then: `Miss a change like it, and the first sign may be invoices rejected and payments left waiting.`,
    },
    // The grid: one column per change of 28 July 2026 (FR-E48 to FR-E58, in order), letters for the functions each
    // touched, from the clusters column of FR-changes.csv: o outbound, i inbound, c connectivity, t tax engine,
    // m master data, a archiving. Row totals 7, 3, 4, 4, 3, 2.
    grid: [`oi`, `coi`, `oia`, `om`, `to`, `to`, `to`, `tc`, `m`, `cma`, `c`],
    // The grid is clickable (Jens, 2026-10-07): the top row of numbered boxes opens a change; a filled square opens the
    // same change with the part for that function highlighted. Written for the page from the what_changed column of
    // FR-changes.csv, FR-E48 to FR-E58 in order. Each part's letters say which functions it is for; a change that cannot
    // be split honestly is one part carrying all its letters. The union of each change's letters equals its grid entry.
    // The prompt over the label column is gone (Jens, 2026-10-07); the line over a change opened from a square names the
    // function in his words ("which part affects function x"). The count after each row says what the publication left
    // that function to act on (Jens, 2026-10-07: the number has to read as this one publication's work for the row).
    // Jens, 2026-10-07: changes run across the top, action items down the side and in the total; the words "changes to act
    // on" are gone from the rows, the counts carry one head beside the numbered changes and a total under them.
    // Jens, 2026-10-08: the corner label took too much room; the grid now names its axes, changes across the top in a
    // small line over the numbered boxes, invoicing functions down the side in the corner over the names.
    gridPrompt: `11 rules`,
    gridAxisY: `Invoicing functions`,
    gridFor: `What in this rule affects your`,
    // Caption ends after the first sentence; the squares now glow once to show they can be clicked (Jens, 2026-10-09, from Petteri's read).
    // Review item 9, the grid half: the boxes above keep no caption (Jens, 2026-10-07), the grid says what a square is.
    gridCaption: `Each filled square is a rule that affects that invoicing function.`,
    countLabel: ``,
    countHead: ``,
    totalLabel: `Total work items`,
    changes: [
      { id: `FR-E48`, title: `The invoice formats are written into law`, parts: [
        { f: `oi`, text: `The law now lists the formats invoices must travel in, defined in an AFNOR standard with no edition named.` },
      ] },
      { id: `FR-E49`, title: `Standards for connections and use cases`, parts: [
        { f: `c`, text: `A platform must follow an AFNOR standard for any standard connection (API) it offers,` },
        { f: `oi`, text: `and another for each kind of invoicing case it handles,` },
        { f: `coi`, text: `again with no edition named.` },
      ] },
      { id: `FR-E50`, title: `Converting between formats`, parts: [
        { f: `o`, text: `The sending platform converts an invoice into one of the listed formats.` },
        { f: `a`, text: `If the conversion cannot keep every detail, a readable copy of everything in the original must travel with it.` },
        { f: `i`, text: `The receiving platform has the same duty.` },
      ] },
      { id: `FR-E51`, title: `Every invoice number must be unique`, parts: [
        { f: `o`, text: `Your certified platform now has to check that every invoice number is unique.` },
        { f: `m`, text: `A reused number would most likely come from how your own software numbers invoices.` },
      ] },
      { id: `FR-E52`, title: `A new entry in the invoice data`, parts: [
        { f: `t`, text: `Price surcharges for fees and charges join the data a company has to transmit,` },
        { f: `o`, text: `so your invoices have to be able to carry them.` },
      ] },
      { id: `FR-E53`, title: `Two dates moved`, parts: [
        { f: `to`, text: `Two dates in the rules on invoice data move to 1 September 2026 and 1 September 2027, so they now match the mandate's own timetable.` },
      ] },
      { id: `FR-E54`, title: `Sales and payment data redefined`, parts: [
        { f: `to`, text: `The data you report on sales and payments is redefined, with the total amount becoming the total taxable base and the amount collected now reported in euros, while two entries go.` },
      ] },
      { id: `FR-E55`, title: `A fixed timetable for e-reporting`, parts: [
        { f: `t`, text: `E-reporting follows a fixed timetable instead of a minimum frequency, and a period with no transactions needs no report.` },
        { f: `c`, text: `The timetable applies separately to each platform a company uses.` },
      ] },
      { id: `FR-E56`, title: `VAT groups in the directory`, parts: [
        { f: `m`, text: `The central directory must now list the members of a VAT group, and each routing code gets a label.` },
      ] },
      { id: `FR-E57`, title: `Changing platform gets fixed deadlines`, parts: [
        { f: `c`, text: `Moving to a new receiving platform becomes a set procedure, with two working days to tell the old platform and five for it to object.` },
        { f: `m`, text: `The directory is then updated within a set time.` },
        { f: `a`, text: `The signed agreement behind the move is kept for three years.` },
      ] },
      { id: `FR-E58`, title: `Stricter terms for certified platforms`, parts: [
        { f: `c`, text: `Certified platforms face stricter conditions to register and stay certified, including security certification from an accredited body and connection tests with the directory and another platform.` },
      ] },
    ],
    // The selection the page opens on: change 4 (FR-E51) for outbound invoicing. The change opened here is also the box
    // that turns red in the row of boxes above (ChangeBoxes.astro); its place in that row is computed from the dates.
    gridStart: { col: 3, fn: `o` },
    notTouched: `not affected`,
    touched: [],
    untouched: [],
    ofTotal: 11,
    // Rows in the six functions' fixed order (Tone of voice.md), not by count; the bars carry the size.
    owners: [
      { name: `Outbound invoicing`, line: `7 of 11`, items: 7 },
      { name: `Inbound invoicing`, line: `3 of 11`, items: 3 },
      { name: `Connectivity`, line: `4 of 11`, items: 4 },
      { name: `Tax engine`, line: `4 of 11`, items: 4 },
      { name: `Master data`, line: `3 of 11`, items: 3 },
      { name: `Archiving`, line: `2 of 11`, items: 2 },
    ],
    withheld: ``,
  },

  onboarding: {
    // Jens, 2026-10-09, after the ship: the heading and the intro said the same thing, so the price stays in the heading only,
    // in his words, and the intro goes; "Start with France" is gone from the button and the contact heading.
    // Copy check second seat 2026-10-09 (Opus): HOLD on "setting up is free" (the model frees onboarding for the first three
    // only, so "for now") and on a per-company price (the model is per country); also the subline, the go-live date in the July
    // intro and "who we sent it to". All five applied in the steering seat, not read again.
    // The terms (Jens, 2026-10-09: show the price, keep a free start; commercial model free onboarding then EUR 450 per country
    // per month, 3-month minimum). One country is the page itself; the entity is said, because a company in a group may have
    // several French entities (one page per country, 2026-10-08).
    h2: `We keep your invoicing teams up to date. Free onboarding, then €450 a month.`,
    intro: ``,
    // Version B of the three shown (Jens, 2026-10-08): three steps across under large numbers, the button, the limits as
    // one row. Plain sentences, no step titles.
    steps: [
      { label: ``, text: `After your first message, we send you a form, about an hour's work, where you tell us who looks after each of your invoicing functions.` },
      { label: ``, text: `We then have a short call with whoever signs off on your side, so they know what each person will hear from us and what we don't do.` },
      // In the page's chain (Jens, 2026-10-08): what the note carries is the work items, said as the closing box says them
      // ("work items to check or prepare"), with the source (facts file, "What we give the owner").
      { label: ``, text: `When we find a change, each person it affects hears from us what to check or prepare, and where it says so. We keep a record of each change we find and who we sent it to, so it never rests on one person remembering.` },
    ],
    cta: `Get started`,
  },

  // The limits box, beside the onboarding steps. Lines from Tone of voice.md ("The hard rules, said in this voice"), France.
  limits: {
    h2: `What we don't do`,
    // Plainer than the lines in Tone of voice.md (Jens, 2026-10-08: "way too technical"). The 27 is proof.sourcesCount
    // above, so the two change together.
    lines: [
      { lead: `Give legal or tax advice.`, text: `What we send is our reading of what a change means for your invoicing, with the source beside it so you can check it.` },
      { lead: `Look beyond our sources.`, text: `We read 27 of France's official sources every week, and we tell you about the changes we find there and nowhere else.` },
      { lead: `Decide for you.`, text: `What to do about a change, and when, stays with you and the people who look after your invoicing.` },
    ],
  },

  contact: {
    // Jens, 2026-10-08: the start button lands here, so the heading names it (Jens, 2026-10-09, from Petteri's read).
    h2: `Get started, or tell us how you keep up today`,
    name: `Name and company`,
    email: `Email`,
    message: `Your message`,
    send: `Send message`,
    // Review item 5: the button opens a draft, it does not send; said under it, and the done line no longer assumes it opened.
    after: `This opens a draft in your email program.`,
    mailto: `jens@einvoiceops.eu`,
    // Jens, 2026-10-08: in place of the line on where the message goes, a short note on what to tell us.
    hint: `Tell us who looks after your invoicing today, and whether that's one person, several, or a team for each function.`,
    // Flow C: the person beside the form, photo, name and address only (Jens, 2026-10-08: no career lines as proof).
    person: {
      name: `Jens Anttila`,
      email: `jens@einvoiceops.eu`,
      photo: `/jens-anttila.jpg`,
      // The name links to his profile (Jens, 2026-10-09, from Petteri's read); ContactForm.astro leaves the name plain without it.
      linkedin: `https://www.linkedin.com/in/jens-anttila/`,
    },
    done: `If your email program opened, your message is there, addressed to Jens, and nothing is sent until you send it. If nothing opened, copy your message above and send it to <a href="mailto:jens@einvoiceops.eu">jens@einvoiceops.eu</a>.`,
  },
};
