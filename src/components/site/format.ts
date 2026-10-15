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

// The changes as the page counts them (box rule): a change is what ONE issuing body published
// on ONE day, and it holds one or more rules, each of which is one counted row (one entry in data.changes). So a box is one
// distinct (day, issuing body) pair of the counted rows: a day on which two bodies both published is two boxes, and a body's
// split counts that body's distinct days, so the splits add up to the boxes. Sorted by day, then body. A change without a
// body counts under the empty body. Undefined when the list does not agree with the released count.
export interface Publication { date: string; body: string }
export function publications(data: { total: number; changes?: { id: string; date: string; body?: string }[] }): Publication[] | undefined {
  const list = data.changes ?? [];
  if (list.length !== data.total) return undefined;
  const seen = new Map<string, Publication>();
  for (const c of list) seen.set(`${c.date}\u0000${c.body ?? ''}`, { date: c.date, body: c.body ?? '' });
  return [...seen.values()].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : x.body < y.body ? -1 : x.body > y.body ? 1 : 0));
}

// Every count and split the story copy states is computed here from the fan-out file, never typed, so the
// numbers update by themselves after each weekly run. A change in a count is one publication, that is one (day, issuing
// body) pair, optionally narrowed to one issuing body (the `body` key of each entry in changes[]) and to the days from a date on. A month-only date
// (YYYY-MM) counts as the first of its month.
export interface Change { id: string; date: string; body?: string }
type CountData = { total: number; changes?: Change[] };
const norm = (d: string) => (d.length === 7 ? `${d}-01` : d);

// Distinct publications of the changes (one per issuing body per day), optionally of one body (then that body's distinct
// days) and from a date on (>=). Without a body filter this is the number of boxes, and the per-body counts add up to it.
export function countDays(data: CountData, opts: { body?: string; from?: string } = {}): number {
  const rows = (data.changes ?? []).filter((c) => (!opts.body || c.body === opts.body) && (!opts.from || norm(c.date) >= opts.from));
  return new Set(rows.map((c) => `${c.date}\u0000${c.body ?? ''}`)).size;
}

// Returns the data with a body on every change. The file's own `body` wins; `fallback` (id to body, optional) fills only
// what the file lacks. A change with neither stops the build and names its id: a split by body that silently left a
// change out would print numbers that do not add up.
export function withBodies<T extends CountData>(data: T, fallback: Record<string, string> = {}, label = 'the fan-out file'): T {
  const missing: string[] = [];
  const changes = (data.changes ?? []).map((c) => {
    const body = c.body ?? fallback[c.id];
    if (!body) missing.push(c.id);
    return { ...c, body };
  });
  if (missing.length > 0) {
    throw new Error(`${label}: no issuing body (key "body") for change ${missing.join(', ')}, in the file or in a fallback map; the split by body cannot be counted.`);
  }
  return { ...data, changes };
}

// Soft check on the split by body. It warns in the build log and never stops the build: a body the story copy does not list
// still builds. A day on which two bodies both published is two boxes (one per body and day), so the splits always add up
// to the boxes and there is nothing to warn about there.
export function warnBodies(label: string, data: CountData, listed: string[]): void {
  const rows = data.changes ?? [];
  const unknown = [...new Set(rows.map((c) => c.body).filter((b): b is string => !!b && !listed.includes(b)))];
  if (unknown.length > 0) console.warn(`${label}: the file names body ${unknown.join(', ')} that the story copy does not list; its changes are in the boxes and the total but on no line of the split.`);
}

// A conditional passage: { ifNone: { body?, from? }, then, otherwise }. "then" is used when no change matches (of that body,
// from that date), "otherwise" when at least one does. Both may be plain strings or dated values.
export function isCond(v: any): boolean {
  return v !== null && typeof v === 'object' && 'ifNone' in v && 'then' in v && 'otherwise' in v;
}
export function pickCond(v: any, data: CountData): any {
  return countDays(data, v.ifNone) === 0 ? v.then : v.otherwise;
}



// Fills {named}, {weekly}, {checked}, {since}, {total}, {published} in a copy string from the fan-out data, plus the counts
// computed from changes[]: {published@DATE} (publications, one per issuing body per day, from DATE on), {changes@DATE} ("1 change" or "3 changes"),
// {body:KEY} and {body:KEY@DATE} (one body's publication days), {missed:KEY} and {missed:KEY@DATE} (the days that did not
// come from that body).
export function fill(template: string, data: { total: number; since: string; checked_on: string; sources_named: number; sources_weekly: number; changes?: Change[] }): string {
  let out = template;
  if (out.includes('{published')) {
    // No fallback: the released total counts rules, so printing it here would call rules changes.
    const days = publications(data);
    if (!days) throw new Error('{published}: the changes list does not agree with the released total');
    out = out.replaceAll('{published}', String(days.length));   // publications: one per issuing body per day, the number of boxes
  }
  out = out.replace(/\{(published|changes|body|missed)(?::([a-z0-9-]+))?(?:@(\d{4}-\d{2}-\d{2}))?\}/g, (m, kind: string, body: string | undefined, from: string | undefined) => {
    const n = (o: { body?: string; from?: string }) => countDays(data, o);
    if ((kind === 'body' || kind === 'missed') && !body) throw new Error(`${m}: a body key is needed`);
    if (kind === 'published') return String(n({ from }));
    if (kind === 'changes') return `${n({ from })} ${n({ from }) === 1 ? 'change' : 'changes'}`;
    if (kind === 'body') return String(n({ body, from }));
    return String(n({ from }) - n({ body, from }));
  });
  return out
    .replaceAll('{named}', String(data.sources_named))
    .replaceAll('{weekly}', String(data.sources_weekly))
    .replaceAll('{checked}', longDate(data.checked_on))
    .replaceAll('{since}', longDate(data.since))
    .replaceAll('{total}', String(data.total));
}
