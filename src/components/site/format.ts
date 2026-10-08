// Small helpers shared by the story components. Dates come in as ISO (YYYY-MM-DD)
// and are formatted by hand, never through Date, so no timezone can move a day.
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

// A month-only value (YYYY-MM) prints as "Mar 2026": used where the source states only a month.
export function shortDate(iso: string): string {
  const [y, m, d] = parts(iso);
  if (d === undefined || Number.isNaN(d)) return `${SHORT[m - 1]} ${y}`;
  return `${d} ${SHORT[m - 1]} ${y}`;
}

export function longDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} ${LONG[m - 1]} ${y}`;
}

// The changes as the page counts them (Jens, 2026-10-08): a change is what a source published, and one change holds one or
// more rules, each of which is one counted row (one entry in data.changes). So the changes are the publication days of
// the counted rows, one per day: in France's data every day has a single issuing body. Undefined when the list does not
// agree with the released count.
export function publications(data: { total: number; changes?: { id: string; date: string }[] }): string[] | undefined {
  const list = data.changes ?? [];
  if (list.length !== data.total) return undefined;
  return [...new Set(list.map((c) => c.date))].sort();
}

// Fills {named}, {weekly}, {checked}, {since}, {total}, {published} in a copy string from the fan-out data.
export function fill(template: string, data: { total: number; since: string; checked_on: string; sources_named: number; sources_weekly: number; changes?: { id: string; date: string }[] }): string {
  let out = template;
  if (out.includes('{published}')) {
    // No fallback: the released total counts rules, so printing it here would call rules changes.
    const days = publications(data);
    if (!days) throw new Error('{published}: the changes list does not agree with the released total');
    out = out.replaceAll('{published}', String(days.length));
  }
  return out
    .replaceAll('{named}', String(data.sources_named))
    .replaceAll('{weekly}', String(data.sources_weekly))
    .replaceAll('{checked}', longDate(data.checked_on))
    .replaceAll('{since}', longDate(data.since))
    .replaceAll('{total}', String(data.total));
}
