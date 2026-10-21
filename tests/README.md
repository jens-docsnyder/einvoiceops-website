# Tests

These tests check the language work: that English is untouched while no language is ready, that the language pages route
and link as the plan says, and that nothing banned gets into a translated file. Nothing here sends anything to the contact
form service, and nothing is written into the repository (scratch files go to the system temp folder, test builds to
`.astro/i18n-test-dist/`, which is git-ignored).

## Run

    npm test

This is `node --test "tests/*.test.mjs"`. It takes about a minute. The test builds run one at a time under a lock, so the
files can run side by side safely.

## Environment variables

None is needed for `npm test` to pass. A missing one skips the tests that need it, and the skipped line says why.

| Variable | What it is | Tests skipped without it |
|---|---|---|
| `BASELINE_DIST` | Folder with the English build made before the language work | `english-identical` (one test) |
| `IP_PYTHON` | A Python that has PyYAML (the content scanner needs it). Defaults to `python3` | `ip-gate` (all but one test) and the two scanner tests in `round-trip`, when that Python has no PyYAML |
| `NAME_SCAN` | Path to the name scan script, `website-name-scan.py` | the owner name tests in `ip-gate` |
| `GLOSSARY` | Path to the multilingual glossary file | the glossary note and banned list tests in `round-trip` |
| `CHROME_BIN` | Chrome binary, if it is not at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | `chrome-phone` (all) when no Chrome is found |

Two tests also skip for another reason: tests that compare with the original source need commit `3720675` in the clone,
and the dropped strong or span tag test runs only while some English string carries such a tag.

A full run:

    BASELINE_DIST=<english baseline folder> IP_PYTHON=<python with PyYAML> NAME_SCAN=<path to website-name-scan.py> GLOSSARY=<path to the glossary> npm test

## What each file proves

- `english-identical.test.mjs`: with no language ready, `npm run build` gives output identical to the English baseline.
- `not-ready.test.mjs`: in the real build there is no `/de/`, `/fr/` or `/pl/` path, no selector and no `hreflang`; the real
  build refuses the test registry, and never reads `tests/fixtures`.
- `routing.test.mjs`: a test build with every language ready (English copied in) follows the plan's link table: the built
  pages are the URL map, links go to the visitor's language or English, the selector offers what the plan says, every internal
  link ends with a slash and none is dead.
- `hreflang.test.mjs`: one canonical per page equal to its own URL, alternates are reciprocal, `x-default` is English,
  `html lang` and `og:locale` are right, the sitemap alternates match the page heads.
- `dates.test.mjs`: all 12 months in each language, short and long forms, edge days, Polish genitive and plural, and that
  the date code never goes through `Date`.
- `dictionary.test.mjs`: the English words moved into the dictionaries and story files are the original text, and the
  dictionaries have the same shape in every language.
- `parity-happy.test.mjs`, `parity-gate.test.mjs`: the parity gate accepts good translated files and stops each of the nine
  breaks, naming the key, also inside a build.
- `round-trip.test.mjs`: translation export and import: a filled sheet comes back into the right files, and every bad
  sheet (changed link, dropped tag, missing key, banned word and so on) is refused with the key named.
- `form-field.test.mjs`: the English forms are as they were and post to the same address; the other languages add a hidden
  `language` field with the page language.
- `chrome.test.mjs`: from built HTML, `lang` on every page, the selector is real links with no negative tab index, the form
  language field.
- `chrome-phone.test.mjs`: in Chrome, with each page in a 390px wide frame: no sideways scroll, the selector on its own
  full-width row inside the screen with tappable links, every language link takes keyboard focus, and the columns match the
  English page.
- `ip-gate.test.mjs`: every banned term in every language, planted in a scratch copy, is stopped by the content scanner;
  the owner name is stopped outside the contact pages; a clean tree passes. `IP_GATE_WEAKEN=<rule id>` blanks one rule in
  the scratch copy and the test must then fail.

`_lib/` holds the shared helpers and `fixtures/` the test registry and the parity fixtures.
