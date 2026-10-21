// The country pages that are published, in the order the top bar, the home page and the footer list them.
// Which countries exist, their names and their addresses are in the language registry (src/i18n/registry.ts); a country
// gets its English page there when it goes up. The home page reads its counts from src/data/fanout/<CC>.json.
import { countryOrder, pageExists, urlFor, nameFor, linkTarget, type Locale } from '../i18n/registry';

// The sitemap reads every built page through here.
export { builtPages } from '../i18n/registry';

const liveCountries = countryOrder.filter((cc) => pageExists(cc, 'en'));

export const countryPages = liveCountries.map((cc) => ({ cc, name: nameFor(cc, 'en')!, href: urlFor(cc, 'en') }));

// The same list for a visitor in `locale`: each address follows the link rule, so it is the country page in that language
// where there is one and the English page where there is not. The names stay English until the dictionaries land.
export function countryPagesFor(locale: Locale) {
  return liveCountries.map((cc) => ({ cc, name: nameFor(cc, 'en')!, href: linkTarget(cc, locale)! }));
}

export function countryNav(current?: string, locale: Locale = 'en') {
  return countryPagesFor(locale).map((c) => ({ name: c.name, href: c.href, current: c.cc === current }));
}
