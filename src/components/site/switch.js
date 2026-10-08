// The date switch for date-bound story passages.
//
// A dated value in a story file is { from: 'YYYY-MM-DD', coming: '...', here: '...' } in place of a
// string. At build time the version is picked by comparing `from` with today, where today is the
// STORY_TODAY environment variable (YYYY-MM-DD) if set, else the real date. Both versions are
// rendered; the one not chosen carries the `hidden` attribute. The inline script (CLIENT_SCRIPT)
// flips the page on the date even if no build runs after it, using the viewer's local date.
//
// Plain JavaScript on purpose, so the comparison can be unit-tested in node with no build step.

// Pure comparison: true when `today` is on or after `from`. Both are YYYY-MM-DD, which sort as text.
export function reached(today, from) {
  return today >= from;
}

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

// Today as YYYY-MM-DD: STORY_TODAY if set and well formed, else the machine's local date.
export function storyToday(env) {
  const e = env && env.STORY_TODAY;
  if (e && /^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function isDated(v) {
  return v !== null && typeof v === 'object' && typeof v.from === 'string' && 'coming' in v && 'here' in v;
}

// A paragraph that is a source disclosure, rendered on its own with the src style.
export function isSrc(v) {
  return v !== null && typeof v === 'object' && typeof v.src === 'string';
}

// True when any value inside a copy object is a dated value (decides whether the page ships the script).
export function containsDated(obj) {
  if (isDated(obj)) return true;
  if (Array.isArray(obj)) return obj.some(containsDated);
  if (obj !== null && typeof obj === 'object') return Object.values(obj).some(containsDated);
  return false;
}

// Turns a string or a dated value into the HTML for set:html. `fill` is applied to each version's text.
export function renderText(v, fill, today) {
  const f = fill || ((s) => s);
  if (!isDated(v)) return f(v);
  const here = reached(today, v.from);
  const span = (version, text, hidden) =>
    '<span data-switch-from="' + v.from + '" data-switch-version="' + version + '"' + (hidden ? ' hidden' : '') + '>' + f(text) + '</span>';
  return span('coming', v.coming, here) + span('here', v.here, !here);
}

// The inline script shipped once on a page that carries a dated value. `reached` is inlined from the
// function above, so the page and the unit test run the same comparison.
export const CLIENT_SCRIPT =
  '(function () {' +
  'var reached = (' + reached.toString() + ');' +
  'var pad = (' + pad.toString() + ');' +
  'var d = new Date();' +
  'var t = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());' +
  'var els = document.querySelectorAll("[data-switch-from]");' +
  'for (var i = 0; i < els.length; i++) {' +
  'var el = els[i];' +
  'if (!reached(t, el.getAttribute("data-switch-from"))) continue;' +
  'if (el.getAttribute("data-switch-version") === "here") el.removeAttribute("hidden");' +
  'else if (el.getAttribute("data-switch-version") === "coming") el.setAttribute("hidden", "");' +
  '}' +
  '})();';
