# Accessibility Plan — WCAG 2.2 AA

**Feature**: 001-infinite-weblinks-website
**Status**: Planning (no code)
**Owners**: two-person editorial/dev team
**Cross-references**: `design/animation.md` (reduced-motion, hero motion sequence), `design/testing.md` (tooling detail), `.specify/memory/constitution.md` Principle VIII

---

## 1. Target & scope

- **Baseline**: WCAG 2.2 Level AA, all Success Criteria (A + AA), across every public route listed in the sitemap (`/`, `/how-it-works`, `/growth-plan`, `/contact`, `/about`, `/solutions[/slug]`, `/business-types/[slug]`, `/starting-points/[slug]`, `/services[/slug]`, `/tools[/slug]`, `/roadmaps[/slug]`, `/examples[/slug]`, `/case-studies[/slug]`, `/learn[/slug]`, `/resources`, `/faq`, `/privacy`, `/cookies`, `/terms`, `/accessibility`). This is stricter than the constitution's 2.1 AA default (Principle VIII) per the locked brief §19; where 2.2 and 2.1 differ, 2.2 wins.
- **Out of public scope**: the **separately-hosted** Sanity Studio (`*.sanity.studio`, not a route on this domain). It is an authenticated internal tool, not a public page, so it is not held to the public AA audit — but it must still be **usable** by the two editors (keyboard operable, no color-only states, readable contrast in its own UI) because Sanity Studio ships its own accessible-by-default UI kit. Do not override Studio chrome with custom CSS that could regress its baseline accessibility. The **Presentation tool / live-preview iframe** that editors use to check content is a working tool, not a public deliverable, but broken keyboard focus inside it would block editors from doing their job — treat "editor can preview and publish without a mouse" as a functional requirement, not an AA line item.
- **Definition of "AA basics present"** (ties to constitution Principle XIV, Definition of Done): semantic HTML, keyboard operability, visible focus, labels, alt text, contrast, reduced-motion, accessible forms/errors — verified before any route is marked Ready to Publish.

## 2. POUR mapped to site requirements

### Perceivable
- Text alternatives for all non-decorative imagery, icons that carry meaning, and the hero's SVG scene (§4). Decorative icons/glow layers get `aria-hidden="true"` / empty alt.
- Color is never the only signal: journey-stage status, form errors, "current" nav item, and the 4 delivery-model badges all pair color with text, icon shape, or an underline/border — this matters because the palette assigns meaning to hue (websites=blue, e-commerce=lime, marketing=violet, customer tools=orange, automation=pink, analytics=cyan) and color-blind visitors must not lose that mapping.
- Captions/transcripts for any video (none confirmed yet; if added, required before publish).
- Contrast per §7 below.
- Content that reflows to 400% zoom / 320px CSS width without horizontal scroll or loss of function (ties to constitution Principle II, mobile-first).

### Operable
- Everything reachable and operable by keyboard alone: mega menus, mobile nav, Growth Plan Builder, accordions, tabs, dialogs, Turnstile.
- No keyboard trap outside intentional, escapable ones (mobile nav overlay, modal dialogs — both must return focus and support Esc).
- No content that flashes more than 3×/second (none planned; flag if any future promo animation is proposed).
- Skip link, logical tab order, visible focus indicator at every stop (§6).
- Enough time: the Growth Plan Builder and any session-based interaction must not impose an undisclosed timeout; if Formspree or Turnstile impose one, surface a warning and a way to extend (3.2.6/2.2.1 territory).
- Target size and dragging per §5 (2.5.7, 2.5.8).

### Understandable
- Global English throughout (`lang="en-GB"` or project-decided single English locale — confirm once in `plan.md`; do not mix spelling conventions).
- Predictable navigation: header order and mega-menu structure stay consistent across routes (3.2.3 Consistent Navigation, already required at AA); help mechanisms (contact link, FAQ link) appear in the same relative place on every page (3.2.6 Consistent Help, new in 2.2 — §5).
- Labels, instructions, and error identification for every form field; error text is specific ("Enter a work email address," not "Invalid input").
- Reused input isn't demanded twice in one session (3.3.7 Redundant Entry — §5).

### Robust
- Valid semantic HTML5, correct ARIA (no redundant or contradictory roles), name/role/value exposed correctly for every custom widget (mega menu, accordion, tabs, dialog).
- Components built once as shared primitives (nav disclosure, accordion, tabs, dialog, form field + error) so the accessibility contract is enforced in one place, not re-implemented per page — this also serves constitution Principle III (speed/maintainability) and the two-person team constraint.
- Works with current VoiceOver + NVDA/JAWS-class screen readers and with browser zoom/OS text-size overrides.

## 3. Component-level accessibility specs

### 3.1 Sticky glass header (desktop)
- Landmark: `<header>` containing a `<nav aria-label="Primary">`.
- Logo is a link to `/` with accessible name "Infinite Weblinks, home" (not just an `<img>` alt of "logo").
- The glass/blur treatment must not reduce text/icon contrast below the ratios in §7 at any scroll position; verify against whatever is scrolling behind it (dark ink sections and the bright editorial band both pass under the header).
- Sticky header must not permanently obscure a focused element — see 2.4.11 in §5.

### 3.2 CMS-controlled desktop mega menus (How It Works · Solutions · Services · Resources)
- Pattern: each top-level item is a `<button aria-expanded aria-controls="ID">` (not a bare link, since it opens a panel) unless the item is genuinely a single destination — the brief's header list mixes disclosure items (mega menus) with plain links ("How It Works" as a menu family vs. "About Us"/"See How It All Works"/CTA as direct links); keep that distinction explicit in the CMS schema so authors can't accidentally turn a link into a menu or vice versa.
- Menu panel is a `role="region"` (not `role="menu"` — mega menus are navigation panels of links, not application menus; using `menu`/`menuitem` roles here is a common anti-pattern that forces arrow-key semantics onto what screen readers expect to read as a list of links).
- Keyboard: `Enter`/`Space` on the trigger toggles the panel; `Esc` closes and returns focus to the trigger; `Tab` moves through the panel's links in visual/DOM order (roving `tabindex` is unnecessary for a link list — reserve roving focus for true widgets like tab lists); a mega menu open must trap nothing — Tab-ing past the last link in the panel closes it and continues into the next header item, it never traps.
- Only one mega menu open at a time; opening a second closes the first (managed focus, no orphaned open panels).
- `:focus-visible` styling is mandatory on every trigger and every link inside the panel — this is the highest-traffic interactive surface on the site and the most common place a client demo reveals "I can't see where I am."
- Because menus are CMS-controlled (editors add/reorder/hide columns and links), the Sanity schema must require a label and href/reference for every menu item — no empty link text ships.

Minimal trigger shape (illustrative, not final markup):

```html
<button aria-expanded="false" aria-controls="menu-solutions">Solutions</button>
<div id="menu-solutions" role="region" aria-label="Solutions menu" hidden>…</div>
```

### 3.3 Mobile full-screen navigation
- Trigger is a single `<button aria-expanded aria-controls="mobile-nav" aria-label="Menu">` that toggles to `aria-label="Close menu"` (or an `aria-live`-announced state change) when open.
- Opening moves focus into the panel (first focusable element or an `<h2>` "Menu" heading with `tabindex="-1"`), traps focus inside while open (Tab/Shift+Tab cycle within the panel only), and closing (via close button, Esc, or link activation) **restores focus to the trigger button**.
- Panel is full-screen or full-height per the brief — never a squeezed, scaled-down copy of the desktop mega menu; it gets its own simple, single-column disclosure pattern (accordion-style groups for How It Works/Solutions/Services/Resources), because cramming a desktop mega-menu's multi-column layout into a narrow trap is both a UX failure and a common source of unreachable links.
- Background content behind the panel gets `inert` (or `aria-hidden="true"` + a scroll lock) so screen reader virtual cursors and touch exploration can't leak into hidden content.

### 3.4 Growth Plan Builder (multi-step form)
- Each step is a `<fieldset>` with a `<legend>` naming the step (e.g., "Step 2 of 6 — Current stage"); the legend, not a decorative visual label, carries the accessible step name.
- Progress indicator: a visible step tracker (e.g., "Step 2 of 6") plus `aria-current="step"` on the active step marker if a stepper widget is used; step changes are announced via a polite `aria-live` region ("Step 2 of 6: Current stage") so screen reader users get the same orientation sighted users get from the visual tracker.
- Navigation between steps: explicit "Back"/"Continue" buttons (never auto-advance on selection, which breaks keyboard and screen-reader users' ability to review a choice before committing — auto-advance radio-button wizards are a known WCAG failure pattern).
- Validation errors on "Continue": focus moves to an error summary at the top of the current step (`role="alert"` or a heading + list, `tabindex="-1"` so it's focusable), each summary entry links (`href="#field-id"`) to its field, and the field itself carries `aria-invalid="true"` and `aria-describedby` pointing to its inline error text.
- Every field has a real `<label for>` (placeholder text is never the only label). Fields that repeat across steps (e.g., contact email requested once, business name not re-asked if already implied by an earlier answer) satisfy 3.3.7 Redundant Entry (§5) — the builder must carry forward anything the visitor already supplied rather than re-asking within the same session.
- The final review step lists all answers in plain text before submission so users can verify without relying on memory across 6+ steps (also supports 3.3.7's "auto-populate" intent and general cognitive-load reduction).
- Submit button is disabled-but-explained, not silently unclickable: if disabled pending validation, it explains why (e.g., via `aria-describedby`) rather than giving no feedback on click.

Step-announcement region (illustrative):

```html
<div aria-live="polite" class="sr-only">Step 2 of 6: Current stage</div>
```

Error summary shape (illustrative):

```html
<div role="alert" tabindex="-1" id="error-summary">
  <h2>2 things need attention</h2>
  <ul><li><a href="#field-business-type">Choose a business type</a></li></ul>
</div>
```

### 3.5 Accordions (FAQ and similar)
- Trigger is a `<button aria-expanded aria-controls="panel-id">` inside a heading (`<h3><button>…</button></h3>`) so screen reader users can navigate FAQs by heading.
- Only the trigger button is in the tab sequence; the panel's focusable content becomes reachable only when expanded (standard DOM show/hide, not `visibility:hidden` tricks that leave it focusable).
- No arrow-key requirement for accordions (that's a tabs/tree pattern); simple Tab + Enter/Space is correct and expected.

### 3.6 Tabs (if used, e.g., in service/solution comparison blocks)
- `role="tablist"` / `role="tab"` / `role="tabpanel"` with `aria-selected`, one tab in the Tab order (`tabindex="0"` on the active tab, `-1` on others), Left/Right arrow keys move between tabs, Home/End jump to first/last.
- Selecting a tab moves focus to its panel only if the panel doesn't immediately follow the tab visually and needs orientation — default is to keep focus on the tab and let the panel content be read via the `aria-controls` relationship.

### 3.7 Dialogs (e.g., a confirmation modal, cookie-preferences modal)
- `role="dialog"` or `role="alertdialog"` with `aria-modal="true"`, `aria-labelledby` pointing at a visible heading.
- Focus moves into the dialog on open (first field or heading), is trapped inside while open, and returns to the triggering element on close. `Esc` closes.
- Background is `inert`/`aria-hidden` while the dialog is open (same rule as mobile nav, §3.3).

### 3.8 Cloudflare Turnstile widget
- Turnstile's managed challenge is designed to avoid puzzles by default (its "managed" mode passes most users with no interaction), which is the right mode to select specifically because it avoids a cognitive-function test — see 3.3.8 in §5.
- Ensure the widget's iframe content receives a visible focus indicator and that the surrounding form doesn't trap focus before or after it.
- Provide a text fallback: if Turnstile fails to load (ad blocker, script error), the form must degrade to something submittable (e.g., server-side honeypot + rate limiting as a fallback path, or a clear message directing the visitor to email `support@infiniteweblinks.com`) rather than silently blocking submission with no explanation.
- Label the widget's presence in the form (e.g., "This site is protected by Cloudflare Turnstile" text near it) so its purpose isn't a mystery to assistive-tech users encountering an unfamiliar iframe.

### 3.9 Forms in general (contact form, newsletter, any short form)
- Every input: visible `<label>`, correct `type`/`autocomplete` attribute (helps 3.3.7/3.3.8 and general usability — e.g., `autocomplete="email"`, `autocomplete="name"`), inline error text tied via `aria-describedby`, error summary on submit for multi-field forms.
- Required fields marked with both a visual indicator and `required`/`aria-required`, not color alone.
- Success state after submission is announced (`aria-live="polite"` region or a focus-moved confirmation page/section) — never a silent redirect with no confirmation text.

## 4. The visual-journey problem: static, text-equivalent alternative

The hero's "living connected digital universe" and the 8-stage journey visualization are the site's signature visuals — and its biggest accessibility risk if treated as image-only or hover-only.

- **No information only on hover.** Every connected area in the hero (Website or Store · Search and Advertising · Social and Content · Customer Tools · Analytics · Automation and AI) and every stage in the 8-stage journey must have its label and one-line description available without hovering — visible by default or on tap/focus, never revealed exclusively by `:hover`. Mouse-hover-only tooltips fail for keyboard users, touch users, and screen reader users alike.
- **Static, complete-at-rest requirement.** Per the brief's hero motion sequence (§8: "reduced-motion users receive the complete static state immediately") and the constitution's reduced-motion rule, the entire hero and journey scene must be fully legible with zero animation running — same content, same labels, just no movement. This is a rendering requirement, not just a media-query stub: the SVG/DOM must contain all six hero-area labels and all eight journey-stage labels as real text nodes (not baked into a raster image, consistent with the brief's "no flattened text within a production image" rule and "editable SVG" requirement in §6/§8 of the locked brief), so they are already screen-reader-readable and selectable before any script runs.
- **Text-equivalent structure, not just alt text.** Because the hero/journey are informational (they teach the 6 connected areas and the 8 stages, they're not decorative), the accessible name for the overall SVG graphic should be minimal (e.g., `role="img" aria-label="Diagram: six connected growth areas around Infinite Weblinks"`) while the six/eight individual labels are exposed as ordinary in-DOM text (headings or list items) that a screen reader encounters in reading order — effectively an outline of the diagram that exists whether or not the visual renders. Do not rely on a single long `alt` string to describe a multi-node diagram; that produces an unusable wall of text for screen reader users and is unmaintainable for CMS editors.
- **Reduced motion honored**: `prefers-reduced-motion: reduce` removes the "signal travels through the journey" animation and any ambient particle motion; the connection lines and nodes still render in their resolved end-state instantly. Full mechanism lives in `design/animation.md` — this document's requirement is the outcome (complete static content, no motion-gated information), not the implementation.
- **No animation blocks reading or interaction**: scroll-triggered reveals must not delay text/CTA availability — if GSAP/ScrollTrigger hasn't loaded yet, the static HTML/SVG must already show the finished state (progressive enhancement, not animation-gated content), consistent with constitution Principle III ("static content renders before enhancement").

## 5. WCAG 2.2-specific criteria (new since 2.1)

| SC | Requirement | How this site meets it |
|---|---|---|
| **2.4.11 Focus Not Obscured (Minimum)** | A focused component must not be entirely hidden by author-created content (e.g., sticky headers). | Directly relevant to the **sticky glass header**: any element that scrolls under the sticky header on focus (e.g., Tab-ing through a long page) must not end up fully hidden behind it. Apply `scroll-margin-top` (or equivalent) sized to the header's rendered height on every anchor target and every focusable element near the top of scrolling content, so focus lands visibly below the header, not underneath it. |
| **2.4.12 Focus Not Obscured (Enhanced)** | AAA-level: focused component must not be *partially* hidden either. | Treated as **best-effort**, not a hard gate (it's AAA). Apply the same `scroll-margin-top` fix; where full compliance is impractical (e.g., a mega-menu panel briefly overlapping content), don't block launch on it — note it as a documented AAA stretch item. |
| **2.5.7 Dragging Movements** | Any drag-based interaction needs a single-pointer, non-drag alternative. | The plan has no drag-to-reorder or drag-based interaction on public pages. If a future component (e.g., a draggable comparison slider) is proposed, it must ship with click/tap-based increment controls as the equivalent. Currently: not applicable, no violation. |
| **2.5.8 Target Size (Minimum)** | Pointer targets at least 24×24 CSS px, with defined exceptions (inline text links, spacing exception, essential/legal exceptions). | All buttons, nav triggers, accordion headers, form controls, and icon-only buttons (menu toggle, close button, mega-menu triggers) must have a minimum 24×24px hit area — pad the hit area even if the visible icon is smaller. Inline text links inside body copy are exempt (inline-text exception) but standalone icon buttons and CTA buttons are not. Verify specifically on mobile nav close button, Turnstile-adjacent controls, and any compact header icon. |
| **3.2.6 Consistent Help** | If a help mechanism (contact details, help link, chat) appears on multiple pages, it must appear in the same relative order/location on each. | The `support@infiniteweblinks.com` fallback and any FAQ/help link must occupy a consistent position across templates (e.g., always footer, same column) — do not let per-page CMS section reordering move the help mechanism around; lock its slot in the modular page-builder schema. |
| **3.3.7 Redundant Entry** | Information already supplied by the user in the same process should not need re-entry, unless required for security/timing/no-longer-valid reasons. | Applies mainly to the **Growth Plan Builder**: once a visitor gives contact details or an earlier answer, later steps and the final review must reference/reuse it rather than re-ask; if the contact form on `/contact?subject=growth-goals` is reached after starting the builder, don't force re-entry of already-given details within the same session. |
| **3.3.8 Accessible Authentication (Minimum)** | No step in an authentication-like process may rely purely on a cognitive function test (remembering, transcribing, solving a puzzle) without an alternative. | Directly relevant to **Cloudflare Turnstile**: select Turnstile's non-interactive/managed challenge mode as the default (no puzzle for most visitors); this satisfies 3.3.8 because it doesn't impose a cognitive test on the common path. Do not configure Turnstile in a mode that forces an image/logic puzzle with no alternative. There is no login/auth flow on the public site (no accounts), so this SC otherwise has minimal surface area beyond Turnstile. |

## 6. Semantic structure

- **Landmarks**: one `<header>` (site chrome), one `<nav aria-label="Primary">` (+ a second labelled nav for footer links if needed, e.g. `aria-label="Footer"`), one `<main>` per page, one `<footer>`. Mega-menu panels and the mobile nav panel live inside the header's landmark scope, not as competing top-level landmarks.
- **One `<h1>` per page**, matching the page's actual topic (not always literally the hero headline — e.g., a service detail page's `<h1>` is the service name, not the sitewide slogan).
- **Heading hierarchy** is sequential (h1 → h2 → h3, no skipped levels) and reflects real document structure — CMS section templates must map to a predictable heading level per section type so editors can't accidentally produce h1→h4 jumps by reordering sections.
- **Skip link**: a visually-hidden-until-focused "Skip to main content" link as the first focusable element on every page, target `id="main-content"` on `<main>`.

```html
<a class="skip-link" href="#main-content">Skip to main content</a>
…
<main id="main-content">…</main>
```
- **`lang` attribute**: `<html lang="en">` (confirm single Global-English locale code in `plan.md`; do not vary per region since content is one English variant for all markets per the Facts Pack).
- **Reduced motion**: `prefers-reduced-motion: reduce` is honored globally, not just in the hero — page-transition animations, micro-interactions (Motion for React), and any scroll-linked GSAP timeline all get a no-motion fallback. Full spec in `design/animation.md`.
- **Document title & metadata**: unique, descriptive `<title>` per route (ties to `design/seo` work, not duplicated here).

## 7. Colour & contrast validation

Computed against the approved token file (`design-system/tokens/colors.css`), using WCAG relative-luminance contrast math. AA normal text requires ≥4.5:1; AA large text (≥24px regular or ≥18.66px/14pt bold) and UI components/graphical objects require ≥3:1.

| Pairing | Ratio | Verdict |
|---|---|---|
| `--text-2` (#C4BEDC body copy) on `--ink-950` (#07050F) | 11.3:1 | Pass (AAA even) |
| `--text-2` on `--ink-900` (#0A0715, app background) | 11.1:1 | Pass |
| `--text-2` on `--ink-800` (#141026, card surface) | 10.4:1 | Pass |
| `--text-1` (#F6F4FF headings) on `--ink-950` | 18.6:1 | Pass |
| `--text-3` (#928BB0 captions) on `--ink-950` | 6.3:1 | Pass (normal text) |
| `--text-4` (#635C82 muted/disabled) on `--ink-950` | 3.3:1 | **Fails normal-text AA.** Acceptable only for genuinely disabled controls or non-text decoration (3:1 threshold applies to those); never use `--text-4` for body copy, captions, or any control a user is expected to read/operate. |
| Accent hues (`--violet` 5.1:1, `--pink` 5.1:1, `--orange` 7.8:1, `--cyan` 11.2:1, `--lime` 10.5:1, `--blue` 5.5:1) as **text** on `--ink-950` | 5.1–11.2:1 | Pass — all accent colours are safe as text/icon colour on the dark ink surfaces. |
| `--grad-text` (gradient text, #FF2E93 → #FF7A18) on `--ink-950` | 5.8:1 – 7.8:1 across the gradient | Pass at both stops — safe to use as headline gradient-text treatment on dark sections. |
| **`--grad-cta` button (#F5197E → #FF7A18) with white label text** | **3.95:1 (pink end) down to 2.61:1 (orange end)** | **Fails.** The orange end fails even the 3:1 large-text/UI-component minimum; the pink end fails normal-text AA. This is the primary CTA button ("Build My Digital Growth Plan") — it cannot ship with white text as specified. **Fix**: use `--ink-950` (near-black) as the CTA button label colour instead of white. Ink-950-on-pink = 5.1:1 and ink-950-on-orange = 7.8:1 — both pass comfortably across the whole gradient, and the vivid gradient itself is unchanged. Do not attempt to fix this by enlarging/bolding the label alone; font size cannot rescue the orange-end ratio. |
| Bright editorial band `--bg-band`-class surface (#F4F1EA) with `--text-2` or any accent hue as text | 1.6:1 (text-2) · 1.6–3.5:1 (accent hues) · 2.3–3.1:1 (grad-text) | **Fails across the board for body text; marginal-at-best even for large headline text.** The token file has no defined "text on bright band" alias — `--text-body: var(--text-2)` is a dark-surface default and must not be reused verbatim inside a bright-band section. **Fix**: every component must resolve its text colour from the enclosing section's theme, not a single global default. On the bright editorial band, body and label text uses `--ink-950`/`--ink-900` (17.9:1 — Pass), and colour accents on that band are reserved for non-text elements (icon fills, underlines, pill borders, tags — 3:1 UI-component threshold, which violet (3.5:1) and blue (3.3:1) clear, though cyan (1.6:1) and lime (1.7:1) still do not and need a darker on-band variant if used decoratively there). Gradient text treatments are reserved for dark/full-colour sections only, never the bright band. |
| Non-text UI (focus ring `--border-glow`, dividers, icon-only buttons) | Focus ring (violet-based) ≥3:1 against dark surfaces confirmed above | Pass on dark surfaces; re-verify the focus ring's own contrast against the bright band and full-colour statement sections specifically, since a violet ring may sit inside its own colour family there. |

**Net finding for `plan.md`/design system to action**: (1) CTA button label colour must switch to dark-on-gradient, not white-on-gradient. (2) Every themed section (dark / bright-band / full-colour) needs its own resolved text-colour tokens rather than one global `--text-body`; this should be formalized as a small set of "on-dark" / "on-band" / "on-statement" text aliases in the design token layer so engineers and CMS theme pickers can't combine an accent text colour with the wrong background. Both are token-layer fixes, not layout fixes, and should be resolved before component build.

## 8. Testing & tooling

- **Automated**: axe-core wired into the Playwright suite, run against every route template at minimum (not just the homepage) — one axe pass per unique page *type*, since CMS-driven pages share templates. Fail the check on any "serious"/"critical" axe violation; "moderate" findings are triaged, not auto-failed.
- **Manual keyboard pass**: full Tab/Shift+Tab/Enter/Space/Esc/Arrow-key sweep of header (desktop + mobile), every mega-menu family, the Growth Plan Builder end-to-end, FAQ accordion, and any tabs/dialogs — before each release and whenever a nav/form component changes.
- **Screen-reader matrix**: VoiceOver (macOS Safari + iOS Safari) and NVDA (Windows Chrome) as the minimum pairing; spot-check JAWS if available. Priority order: header/nav, Growth Plan Builder, hero/journey static content, forms.
- **Contrast tooling**: automated contrast checks as part of the design-token pipeline (e.g., a lint step over `colors.css` pairings) plus manual spot checks with a contrast tool (e.g., browser DevTools contrast picker) on any new gradient or section-theme combination — treat §7's findings as the baseline regression set.
- **Reduced-motion pass**: verify with OS-level `prefers-reduced-motion: reduce` toggled on, across hero, journey, and page-transition surfaces.
- Full test-stack ownership (unit/Playwright/Lighthouse CI wiring, CI gates) is specified in `design/testing.md`; this document defines *what* must be checked for accessibility, that document defines *how it runs in CI*.

## 9. Roles & cadence (two-person team)

Accessibility work must fit inside the constraints already set for this project (two admin/editor users, small dev team, no dedicated a11y specialist):

- **At component build time**: the developer building a shared primitive (nav disclosure, accordion, tabs, dialog, form field) is responsible for that primitive meeting §3 in full — accessibility is part of the component's definition of done, not a separate pass at the end.
- **At content/CMS time**: editors are responsible for supplying real alt text, non-empty menu labels, and correct heading-worthy titles when authoring sections — the CMS schema should make it hard to skip these (required fields), not rely on editor discipline alone.
- **Before any route ships**: run CHK-A01–A20 below. A route only moves from Draft/Approval-Required to Ready to Publish once its applicable checklist items pass, mirroring the same content-status discipline already used for placeholder/testimonial content.
- **Regression watch**: any change to the header, mega menus, Growth Plan Builder, or hero/journey components re-triggers the manual keyboard pass and at least the VoiceOver check in §8, since these are the highest-risk, highest-traffic surfaces.

## 10. Acceptance checklist (CHK-style)

- [ ] CHK-A01 — Every public route has exactly one `<h1>` and a sequential heading hierarchy.
- [ ] CHK-A02 — Skip link present, first in tab order, targets `<main>` on every route.
- [ ] CHK-A03 — `<html lang>` set to the single confirmed English locale sitewide.
- [ ] CHK-A04 — Landmarks (`header`, `nav[aria-label]`, `main`, `footer`) present and non-duplicated on every template.
- [ ] CHK-A05 — Desktop mega menus: keyboard operable, `Esc` closes and returns focus, `:focus-visible` on trigger and all panel links, only one panel open at a time.
- [ ] CHK-A06 — Mobile nav: focus trapped while open, focus restored to trigger on close, background `inert`, no squeezed desktop menu reused.
- [ ] CHK-A07 — Growth Plan Builder: fieldset/legend per step, live-region step announcement, visible progress, error summary + per-field `aria-invalid`/`aria-describedby`, no auto-advance, review step before submit, no redundant re-entry of already-given data.
- [ ] CHK-A08 — Accordions/tabs/dialogs follow the patterns in §3.5–3.7 (correct roles, keyboard model, focus management).
- [ ] CHK-A09 — Turnstile set to managed/non-puzzle mode; form has a fallback path if the widget fails to load; widget's presence is announced to assistive tech.
- [ ] CHK-A10 — All forms sitewide: visible labels, `autocomplete` attributes, accessible error identification, accessible success confirmation.
- [ ] CHK-A11 — Hero and 8-stage journey: all node/stage labels exist as real text (not hover-only, not image-baked), fully legible with zero animation running, `prefers-reduced-motion` honored.
- [ ] CHK-A12 — CTA button label colour corrected to dark-on-gradient per §7 finding; verified ≥3:1 (large text) across the full gradient.
- [ ] CHK-A13 — Section-scoped text colour tokens (on-dark / on-band / on-statement) defined and used correctly; no dark-surface text token reused verbatim on the bright editorial band.
- [ ] CHK-A14 — Sticky header: `scroll-margin-top` (or equivalent) applied so focused elements are never fully hidden underneath it (2.4.11).
- [ ] CHK-A15 — All interactive targets ≥24×24 CSS px (2.5.8), spot-checked on mobile nav toggle, mega-menu triggers, accordion headers, icon-only buttons.
- [ ] CHK-A16 — Help mechanism (`support@infiniteweblinks.com` / FAQ link) appears in a consistent position across all templates (3.2.6).
- [ ] CHK-A17 — axe-core passes with zero serious/critical violations on every unique page template.
- [ ] CHK-A18 — Manual keyboard-only pass and VoiceOver + NVDA pass completed on header, Growth Plan Builder, and forms before each release.
- [ ] CHK-A19 — No content flashes >3×/second anywhere on the site.
- [ ] CHK-A20 — Sanity Studio editor preview (Presentation tool) confirmed keyboard-operable for the two editors, even though the separately-hosted Studio (`*.sanity.studio`) is outside the public AA audit.
