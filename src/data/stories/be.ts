// All copy of the Belgium page (one page per country, told to any company that runs its own invoicing in Belgium,
// independent or part of a group, drawn from both Belgian frameworks). Flow C, modelled on de.ts and fr-standalone.ts
// (price in the onboarding heading, no intro under it, contact block with the profile link).
// Strings may hold <strong> and <span class='accent'>; they are rendered with set:html.
// Placeholders are filled from src/data/fanout/BE.json (format.ts fill()): {published} {since} {weekly}, and the counts
// computed from its changes list, {published@DATE} {changes@DATE} {body:KEY@DATE} {missed:KEY@DATE}; a passage that depends on a
// count is a conditional ({ ifNone, then, otherwise }, format.ts). No count on the page is typed except the example's own
// (one change, three rules, three functions, six work items), as on France and Germany.
// Facts come only from the Belgian sources named in the notes below, cited by section.
// Vocabulary: a change is one publication by one body on one day; a rule is one counted row inside it. The law published on
// 20 February 2026 is one change with three rules; the tax administration's FAQ of May 2026 is one change with one rule.
//
// Belgium is France-shaped, not Germany-shaped: of the 8 publications since 1 January 2024, 6 came before go-live
// on 1 January 2026 (three of them between 24 and 31 December 2025) and 2 after: the law published on 20 February 2026 and the
// tax administration's FAQ of May 2026. Nothing on the page is bound to a mandate date: issuing and receiving both became
// mandatory on 1 January 2026, in one step, so there is no date switch in the headline.
//
// Law detail: the example's first rule names who is taken out of the obligation, and that group is defined in a
// VAT code article that is read in the tax administration's consolidated copy, not in the gazette text of the law. So the page
// carries the signed copy disclosure under the example (key "disclosure", passed as followedDisclosure by the page file). The
// other two rules and the dates are read from the gazette's own text of the law, and the December publications are named by
// date and kind of act only. The fines and the obligation staying with the company (both read from the copy) are left out.
// Wording point: the February law is dated 10 February 2026 and was published, and took effect, on
// 20 February 2026. The page says "published on 20 February", never "law of 20 February", and never that the Chamber passed it
// that day.

// Which body published each counted row. The fan-out file BE.json carries it on every change (key "body"), written by the
// weekly job, and the file wins. This map is only the fallback for a change the file gives no body (src/pages/belgium/index.astro
// calls withBodies()); a change in neither stops the build and names its id. Keys: law = Parliament and the government through
// the Belgian Official Gazette (laws and royal decrees), administration = the tax administration's e-invoicing FAQ.
export const beBodies: Record<string, string> = {
  'BE-E02': 'law',
  'BE-E16': 'law',
  'BE-E17': 'law',
  'BE-E18': 'law',
  'BE-E19': 'law',
  'BE-E25': 'law',
  'BE-E21': 'law',
  'BE-E24': 'law',
  'BE-E08a': 'law',
  'BE-E08b': 'law',
  'BE-E08c': 'law',
  'BE-E11': 'administration',
};

// The bodies card 2 lists, in its order (the page file warns in the build log if the file names another).
export const beBodyKeys = ['law', 'administration'];

export const be = {
  // Page flow C, country-first tree.
  flow: 'c',

  meta: {
    title: `Belgium | einvoiceops`,
    // Not date-bound. Ends in France's and Germany's current form ("we email the person who looks after the invoicing function it affects").
    description: `Belgium's e-invoicing rules were still changing days before the 1 January 2026 start, and they've changed since. When we find a change, we email the person who looks after the invoicing function it affects.`,
  },

  opening: {
    kickerLinkText: ``,
    kickerRest: ` · Belgium`,
    // One version, no date switch: issuing and receiving both became mandatory on 1 January 2026, so nothing here is ahead.
    h1: `Hear about the next change to Belgium's e-invoicing rules from us, not from a rejected invoice.`,
    // No count in the headline or the subline, because a number there goes stale the day Belgium's count moves. The first sentence
    // rests on the mandate (1 January 2026, issuing and receiving in one step) and the changes since go-live (three
    // publications between 24 and 31 December 2025, and changes after go-live). The second is the same service in every country.
    subline: `Belgium's rules were still changing in the last days before e-invoicing became mandatory on 1 January 2026, and they've changed since. When we find a change that affects one of your invoicing functions, we email the person on your team who looks after it, with what changed for them and where it says so.`,
  },

  // The proof strip in its lead shape (ProofStrip.astro): the sources read, then the count. The sources number is
  // sources_weekly in BE.json and the count {published} is the number of publications of the counted rows, one per
  // issuing body per day (publications() in format.ts); no number is typed here, both move with the file.
  // The unit is "sources", not "official sources", as on Germany: the list holds more than official bodies.
  proof: {
    headline: `{published} changes we've counted since {since}`,
    headlineSub: `to Belgium's e-invoicing rules`,
    sourcesUnit: `sources`,
    sources: `we read every week`,
    // The date column stays empty, as on France and Germany: nothing writes last_check.
    checked: ``,
  },

  // The row of boxes under the strip (ChangeBoxes.astro): one box per publication in BE.json, the real example's box
  // (the law published on 20 February 2026) in the accent. Box dates are publication dates, not signing dates:
  // 20 February 2024, 24 December 2024, 14 July 2025 (three rules), 24 December 2025, 30 December 2025, 31 December 2025,
  // 20 February 2026 (three rules); the tax administration's FAQ is a month only (May 2026).
  boxes: true,

  // What we see in the market: four cards that turn over (MarketCards.astro). Ids 1, 2 and 3 keep the framework challenge
  // numbers, so ?lead= still works; '1b' is the second card. Backs as points with links as <a href>domain</a>, like France and
  // Germany. Hedged where a card rests on a bet ("likely", "may", "we expect"). Every dated point is said as distance from
  // go-live (1 January 2026), counted from the publication dates: 24 December 2025 is 8 days before, 30 December 2 days,
  // 31 December 1 day, and 20 February 2026 is 50 days (seven weeks) after, counted from publication as France counts its
  // finance law. The FAQ addition is dated 20 May 2026 by its first capture only, so the page says "In May".
  market: {
    h2: `What we see in Belgian e-invoicing`,
    // No intro, as France and Germany: the regime is carried by the subline and cards 1b and 2.
    intro: ``,
    turn: `Turn over`,
    turnBack: `Turn back`,
    cards: [
      {
        id: 1,
        title: `The rules kept moving until days before go-live`,
        // Rests on the changes since go-live and the ones before it: three publications fell between 24 and 31 December
        // 2025, days before the obligation began. The card names each by date, kind of act and the instrument it amends (the first
        // by the title the gazette database gives it), never for what the amendment says: the 30 December law in particular is told only as
        // "published days before the obligation began".
        front: `Belgium was still changing its e-invoicing rules in the last days of 2025, just before the mandate began on 1 January 2026, so companies had to get ready against rules that hadn't settled.`,
        back: {
          points: [
            // Royal decree of 12 December 2025, published 24 December 2025 (the decree's own page on the gazette database).
            `Eight days before go-live, on 24 December 2025, a royal decree on issuing the farmers' purchase note in structured electronic form was published in the gazette (<a href='https://www.ejustice.just.fgov.be/eli/besluit/2025/12/12/2025009711/justel'>ejustice.just.fgov.be</a>)`,
            // Law of 18 December 2025, published 30 December 2025 (the VAT code's amendment register).
            `Two days before, on 30 December, a law amending the VAT code was published (<a href='https://www.ejustice.just.fgov.be/eli/wet/1969/07/03/1969070305/justel'>ejustice.just.fgov.be</a>)`,
            // Royal decree of 17 December 2025, published 31 December 2025 (the register of royal decree no. 1).
            `And on 31 December, the day before, another royal decree was published, amending royal decree no. 1 on VAT (<a href='https://www.ejustice.just.fgov.be/eli/besluit/1992/12/29/1992003823/justel'>ejustice.just.fgov.be</a>)`,
          ],
        },
      },
      {
        id: '1b',
        title: `We expect the rules to change again`,
        // Told as France tells its 1b: a hedged expectation. The count is {changes@2026-01-01}, the publication days from go-live on,
        // computed from BE.json (2 on 2026-10-14: the law published 20 February 2026 and the FAQ of May 2026). "yet" while no
        // counted change falls on or after 1 January 2026, the count once one does.
        front: {
          ifNone: { from: '2026-01-01' },
          then: `We haven't counted a change to Belgium's rules since go-live yet, but they were still changing in the last days before it.`,
          otherwise: `We've counted {changes@2026-01-01} to Belgium's rules since go-live on 1 January 2026, so we expect more, though we can't tell you when.`,
        },
        back: {
          points: [
            // The law dated 10 February 2026, published and in force 20 February 2026 (the gazette's own text).
            // 20 February is 50 days after 1 January, seven weeks.
            `Seven weeks after go-live, on 20 February 2026, the gazette published a law that changed the e-invoicing rules (<a href='https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=nl&amp;caller=summary&amp;pub_date=2026-02-20&amp;numac=2026001291'>ejustice.just.fgov.be</a>)`,
            // The tax administration's e-invoicing FAQ, dated by its first capture to 20 May 2026, so "In May".
            `In May, Belgium's tax administration added to its e-invoicing FAQ that an invoice sent to the wrong address is rejected over the network and not booked (<a href='https://efactuur.belgium.be/nl/FAQ'>efactuur.belgium.be</a>)`,
            // PEPPOL sentence. Format versions that became mandatory in Belgium (the dates are
            // mandatory-from dates, not release dates), named as
            // outside the count and never as one of the counted changes. It is the only place the page mentions them: delete this
            // one line and nothing else on the page refers to it.
            `Outside our count, two new versions of Peppol's invoice format became mandatory in Belgium in 2026, 3.0.20 on 23 February and 3.0.21 on 17 August, and a new format version is one way an invoice that went through before could stop validating (<a href='https://docs.peppol.eu/poacc/billing/3.0/release-notes/'>docs.peppol.eu</a>)`,
          ],
          then: `We expect further changes to Belgium's rules to arrive.`,
        },
      },
      {
        id: 2,
        title: `Changes come from more than one place`,
        // Names the two bodies the count lists. Rests on where the rules are published: laws and decrees in the gazette,
        // in Dutch and French, and guidance and answers on the tax administration's own site.
        front: `Belgium's rules come from Parliament and the government through the law, published in the gazette in Dutch and French, and from the tax administration, which answers questions on its own site, each on its own calendar.`,
        back: {
          // Counted as changes, one per body per publication day, from BE.json: each change carries its issuing body (key "body")
          // and the placeholders count the distinct days per body, so the split moves with the file. On 2026-10-14 it read law 7
          // (20 Feb 2024, 24 Dec 2024, 14 Jul 2025 three rules, 24, 30 and 31 Dec 2025,
          // 20 Feb 2026 three rules), administration 1 (May 2026), 8 in all. The closing line counts from go-live: 2
          // changes, 1 through the law, so anyone watching only the law would have missed 1 of them. When no change since go-live
          // came from the administration it says all came through the law instead of "missed 0".
          lead: `We've counted {published} changes since {since}, and this is where each of them came from.`,
          points: [
            `{body:law} through Parliament and the government`,
            `{body:administration} from the tax administration`,
          ],
          then: {
            ifNone: { body: 'administration', from: '2026-01-01' },
            then: `All {published@2026-01-01} of the changes since go-live came through the law.`,
            otherwise: `Of the {published@2026-01-01} changes since go-live, {body:law@2026-01-01} came through the law, so anyone watching only the law would have missed {missed:law@2026-01-01} of them.`,
          },
        },
      },
      {
        id: 3,
        title: `A change can fall between the people you rely on`,
        // The whole card is the frameworks' bet and is hedged as one ("likely", "may"). The outside parties are the
        // providers line: the platform provider keeps its connection current, software vendors update their products; the ERP
        // partner and the accountant are the standalone row's bet. It says nothing about where the obligation stays, which
        // would rest on law detail read from the tax administration's copy and need its disclosure, and it names no call.
        front: `In Belgium your invoices move through the software and providers you chose, and each of them is likely to look after only its own part.`,
        back: {
          points: [
            `Your platform provider, the one that connects you to the Peppol network, is likely to keep that connection current, your software vendor to update its software, your ERP partner or group IT to look after its part and your accountant to know the tax, and it may be nobody's job to check that it all still fits`,
          ],
          then: `So checking that a change has reached all of it is likely left to you.`,
        },
      },
    ],
  },

  fanout: {
    // Left out of the page, as France and Germany: the row of boxes carries the count and the grid the per-function view.
    show: false,
  },

  // The February 2026 law told as the one publication that shows the cards at once. Picked and confirmed against the gazette's own
  // text (the Belgisch Staatsblad act page of 20 February 2026, numac 2026001291): the law dated 10 February 2026,
  // published and in force on 20 February 2026, seven weeks after go-live (card 1b), from the law and not the administration
  // (card 2), reaching more than one function at once (card 3). Three rules, one publication; grid letters
  // oim, om, o (first rule: master data, outbound, inbound; second: outbound, master data; third:
  // outbound). Work items: outbound 3, inbound 1, master data 2, six in all (from the page's data), the other three rows empty.
  // The box that turns red is the first rule's publication, found from the file by the id of the first grid column.
  followed: {
    h2: `A real example from February 2026`,
    intro: `On 20 February 2026, seven weeks after go-live, Belgium published a law, and the three rules we count in it took effect that same day. We count it as one change, and it touches three of your invoicing functions at once.`,
    stepLabels: { arrives: `What was published`, lands: `What it means for you`, reaches: `Who would have heard from us` },
    arrives: {
      date: `20 Feb 2026`,
      text: ``,
      // The act as published in the Belgisch Staatsblad, in Dutch and French. The law is dated 10 February 2026; the line names the
      // publication day, as the box does.
      source: `Belgian Official Gazette of 20 February 2026: the law in <a href='https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=nl&amp;caller=summary&amp;pub_date=2026-02-20&amp;numac=2026001291'>Dutch</a> and <a href='https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=fr&amp;caller=summary&amp;pub_date=2026-02-20&amp;numac=2026001291'>French</a>, ejustice.just.fgov.be`,
    },
    shows: [],
    closing: {
      title: `Three invoicing functions had something to check`,
      // 3 rules; 6 work items = row totals 3 + 1 + 2, the other three rows empty.
      lead: `One change, published on 20 February`,
      chain: [
        `3 rules in it`,
        `Together they affect 3 invoicing functions`,
        `6 work items to check or prepare, one for each rule and function it touches`,
      ],
      // Belgian-true, not Germany's rejected-invoice line: two of the three rules loosen the obligation, so the honest frame is
      // that a change moves who owes what, and that you only know your own position changed if you know the change exists.
      // Nothing here tells a missed change as an event that stopped anyone invoicing.
      then: `A change like this moves who owes what, and you only know your own position has changed if you know the change exists.`,
    },
    // The grid: one column per rule of the law published on 20 February 2026 (in order), letters for the functions
    // each touched: o outbound, i inbound, c connectivity, t tax engine, m master
    // data, a archiving. Row totals 3, 1, 0, 0, 2, 0.
    grid: [`oim`, `om`, `o`],
    gridPrompt: `3 rules`,
    gridAxisY: `Invoicing functions`,
    gridFor: `What in this rule affects your`,
    gridCaption: `Each filled square is a rule that affects that invoicing function.`,
    countLabel: ``,
    countHead: ``,
    totalLabel: `Total work items`,
    // The part for each function, written for the page from the what_changed column of each row and read against the gazette's own
    // text. The union of each rule's parts' letters equals its grid entry: first rule o + i + m = oim,
    // second o + m = om, third o. Nothing says how to fix, and nothing is added that the rows do not carry.
    changes: [
      { id: `BE-E08a`, title: `Foreign VAT-registered companies leave the obligation`, parts: [
        { f: `o`, text: `Foreign companies that are VAT-registered in Belgium but have no establishment there are taken out of the obligation, so the law no longer requires you to send an e-invoice to a customer of that kind.` },
        { f: `i`, text: `If you are a foreign company that is VAT-registered in Belgium but has no establishment there, the law no longer requires you to be able to receive e-invoices from your Belgian suppliers.` },
        { f: `m`, text: `Which of your customers are in that group now decides who the obligation covers, so your records of them matter.` },
      ] },
      { id: `BE-E08b`, title: `A carve-out when the recipient can't receive`, parts: [
        { f: `o`, text: `When your customer is technically unable to receive an e-invoice, the law no longer requires you to send one, but an ordinary invoice is still owed. The condition is worded in the law, linked above.` },
        { f: `m`, text: `Whether a customer can technically receive an e-invoice now matters to how you invoice them, so it belongs in what you know about that customer.` },
      ] },
      { id: `BE-E08c`, title: `The format reference follows the European standard`, parts: [
        { f: `o`, text: `The law no longer names the two European standards it used to cite and refers to the European e-invoicing standard under Directive 2014/55/EU instead, so the standard that an agreed alternative invoice format has to meet can move with it.` },
      ] },
    ],
    gridStart: { col: 0, fn: `o` },
    notTouched: `not affected`,
    touched: [],
    untouched: [],
    ofTotal: 3,
    // Rows in the six functions' fixed order, not by count; the bars carry the size.
    owners: [
      { name: `Outbound invoicing`, line: `3 of 3`, items: 3 },
      { name: `Inbound invoicing`, line: `1 of 3`, items: 1 },
      { name: `Connectivity`, line: `0 of 3`, items: 0 },
      { name: `Tax engine`, line: `0 of 3`, items: 0 },
      { name: `Master data`, line: `2 of 3`, items: 2 },
      { name: `Archiving`, line: `0 of 3`, items: 0 },
    ],
    withheld: ``,
  },

  // The general copy disclosure, shown under the example because its
  // first rule defines who is taken out of the obligation from a VAT code article read in the tax administration's copy.
  // StoryPage prints it through followedDisclosure (the page file passes c.disclosure).
  disclosure: `We read the Belgian law in the tax administration's published copy, not the official gazette, and check it against the gazette's record of which acts amended which articles. That confirms what changed and when, not that every sentence matches the gazette word for word; closing that gap is work, not money.`,

  onboarding: {
    // As on the France page, word for word: the price is said once, in the heading, and no intro repeats it.
    h2: `We keep your invoicing teams up to date. Free onboarding, then €450 a month.`,
    intro: ``,
    steps: [
      { label: ``, text: `After your first message, we send you a form, about an hour's work, where you tell us who looks after each of your invoicing functions.` },
      { label: ``, text: `We then have a short call with whoever signs off on your side, so they know what each person will hear from us and what we don't do.` },
      { label: ``, text: `When we find a change, each person it affects hears from us what to check or prepare, and where it says so. We keep a record of each change we find and who we sent it to, so it never rests on one person remembering.` },
    ],
    cta: `Get started`,
  },

  // The limits box, beside the onboarding steps: France's three lines with Belgium for France. The number in the second line
  // is {weekly}, sources_weekly from src/data/fanout/BE.json, the same number the strip shows, so the two cannot drift.
  // "Official" is left out of it, as in the strip's unit. The page never says the gazette is read every day.
  limits: {
    h2: `What we don't do`,
    lines: [
      { lead: `Give legal or tax advice.`, text: `What we send is our reading of what a change means for your invoicing, with the source beside it so you can check it.` },
      { lead: `Look beyond our sources.`, text: `We read {weekly} of Belgium's sources every week, and we tell you about the changes we find there and nowhere else.` },
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
    mailto: `jens@einvoiceops.eu`,
    hint: `Tell us who looks after your invoicing today, and whether that's one person, several, or a team for each function.`,
    person: {
      name: `Jens Anttila`,
      email: `jens@einvoiceops.eu`,
      photo: `/jens-anttila.jpg`,
      linkedin: `https://www.linkedin.com/in/jens-anttila/`,
    },
    done: `Thank you, your message is sent. Jens will answer by email.`,
  },
};
