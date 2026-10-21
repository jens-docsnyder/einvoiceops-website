// The language selector's styles, written into a page only where the page has another ready language.
// Kept as a string, not a .css file, so the build does not count them as styles of every page.
export const selectorCss = `
/* The language selector in the top bar. Written into a page only where the page has another ready language. */
.langnav { display: flex; flex-wrap: wrap; gap: 0 18px; margin-right: 8px; }
.langnav a { display: inline-flex; align-items: center; min-height: 44px; font-size: 0.9rem; color: var(--quiet); text-decoration: none; }
.langnav a:hover { color: var(--ink); text-decoration: underline; }
.langnav a[aria-current="page"] { font-weight: 600; color: var(--ink); text-decoration: underline; text-decoration-color: var(--accent); text-decoration-thickness: 2px; text-underline-offset: 0.35em; }
@media (max-width: 759px) { .langnav { order: 4; flex-basis: 100%; margin-right: 0; } }
`;
