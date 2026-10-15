# Instructions: einvoiceops website repo

Read at the start of every website code session.

---

## Design north star

**Always read the Design System before building or editing any page:**
The Design System document kept with the project notes (outside this repository).

North star references:
- Homepage (`src/pages/index.astro`) — all design decisions flow from this
- SP page (`src/pages/for_Service_Providers/index.astro`) — template for SP and enterprise pages

---

## Build and dev

```bash
npm run dev     # start dev server (localhost:4321 or next available port)
npm run build   # production build to dist/
```

**Deploy rule:** Never `git push` without an explicit instruction to deploy. Commit freely; push only on direct instruction.

**Staging:** `http://localhost:4321/` — verify all changes here before reporting done.

---

## Critical technical rules

### Astro CSS scoping
`<style>` in Astro adds `[data-astro-cid-xxx]` to every CSS rule. Elements injected via `<Fragment set:html={...} />` (SVG maps) and via JS `element.innerHTML` do NOT get that attribute. Result: hover states, fill rules, panel styles silently fail.

**Fix:** Use `<style is:global>` for any CSS targeting SVG paths or JS-injected content. Already applied in `index.astro` and `map/[country].astro`.

### Trailing slash
`trailingSlash: 'always'` is set in `astro.config.mjs`. All internal `href` links must end with `/`:
- `/status/`, `/changelog/DE/`, `/map/DE/` ✓
- `/status`, `/changelog/DE`, `/map/DE` ✗ (will 404 on GitHub Pages)

Exception: hash links (`/#map`, `#calculator`, `#contact`) — no trailing slash needed.

### Smart quotes break JS
The Edit tool can introduce curly quotes (`'` `'`) into JS string literals in `index.astro`, causing a silent SyntaxError that kills the entire script. **Use Python with `open(..., encoding='utf-8')` for all edits to `<script is:inline>` blocks in `index.astro`.**

After every such edit, verify: `sed -n '[start],[end]p' src/pages/index.astro | node --check`

### SVG z-order
SVG renders in document order (painter's algorithm). Elements defined later appear on top. Animated icons (document, work packet) must be the LAST elements defined in their SVG so they appear above routing lines and function boxes.

---

## Page structure

```
src/
  pages/
    index.astro               # Homepage — design north star
    for_Service_Providers/
      index.astro             # SP landing page — noindex
    for-enterprise/
      index.astro             # Enterprise landing page — noindex
    map/
      index.astro             # Redirect only → /#map
      [country].astro         # Individual country profiles at /map/[CC]/
    status.astro              # Internal quality dashboard — LOCAL ONLY, do not deploy
    changelog/
      [country].astro         # Per-country changelog
    legal/, privacy/          # Legal pages
  content/
    countries/[CC].md         # Country data (Schema → Zod validation)
    research/                 # Local only, gitignored: open items for the status page, linked in from outside this repo
    changelogs/[CC].yaml      # Audit log (append-only)
  components/
    Nav.astro                 # Shared nav component
  content.config.ts           # Zod schema for all three collections
```

---

## Map architecture

The compliance map lives on the homepage at `/#map`. `/map/` redirects there.

- Homepage map + country profiles both read from `src/content/countries/*.md` via `getCollection('countries')`
- Adding a new country file automatically updates both the homepage map and the `/map/[CC]/` profile
- If a new country's SVG path is not in `PATH_MAP` in `index.astro`, add it manually

Map colour logic:
- `b2b=mandatory` + `status=live/pilot` → `#1e40af`
- `b2b=announced` → `#2563eb`
- `b2b=voluntary/not-yet` → `#3d7ab5`
- else → `#1e2d40`

---

## Changelog rule

Every change to `src/content/countries/[CC].md` requires a changelog entry in `src/content/changelogs/[CC].yaml` written in the same operation. The full format and trigger rules are kept with the project notes (outside this repository).

---

## Two-repo workflow

1. Author and annotate in the project notes, outside this repository (markers, source citations)
2. Verify each source against the primary document
3. Write a **clean version** to `src/content/countries/[CC].md` - never copy annotated drafts directly
4. Annotated drafts contain markers and YAML fences that break the Astro build
