// The country pages that are published, in the order the top bar, the home page and the footer list them.
// A country gets a line here when its page goes up; the home page reads its counts from src/data/fanout/<CC>.json.
export const countryPages = [
  { cc: 'FR', name: 'France', href: '/france/' },
  { cc: 'DE', name: 'Germany', href: '/germany/' },
  { cc: 'BE', name: 'Belgium', href: '/belgium/' },
];

export function countryNav(current?: string) {
  return countryPages.map((c) => ({ name: c.name, href: c.href, current: c.cc === current }));
}
