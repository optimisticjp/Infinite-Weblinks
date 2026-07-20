# V2 Phase 2C — Implementation Report

**Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
**Scope:** Global chrome rebuilt to light V2 (SiteHeader + mega-menu, MobileNav, SiteFooter, V2 logo treatment) + the `/resources` hub canary + the SectionShell unique-id fix. Compatibility-first. No homepage-body/other-route/conversion/ServiceDomainTemplate redesign, no root body/themeColor/colorScheme flip, no legacy-token/galaxy deletion (except the footer's own GlobeArc import). No PR, no deploy.
**Prior:** `docs/design/v2-design-spec.md` · `phase-1/2a/2b-implementation-report.md`.

---

## 1. What Phase 2C accomplished

- **Fixed the Phase 2B shell issues:** SectionShell now generates **stable, unique** heading ids via `useId` (server-safe, never derived from title content); PageHeader `accent` is documented/enforced for V2-token-only use; and reflow is now measured on the **whole document** (not just `<main>`), which surfaced and fixed real narrow-width overflows.
- **Rebuilt the shared chrome to light V2** — SiteHeader, the mega-menu, MobileNav and SiteFooter — preserving every interaction/focus/aria behaviour while replacing all dark/cosmic styling and legacy/raw tokens.
- **Migrated `/resources`** to PageHeader + V2 SectionShell surfaces + V2 BentoCards, removing CosmicPageHero/GlowButton/NodeOrb/gradient-word/FinalCtaBannerSection from that route only.
- **Verified** with lint/typecheck/**272 unit tests**/build and **211 Playwright e2e tests** (all existing chrome/nav/mega/mobile/axe contracts still green), plus full-document reflow and axe on the target routes.

**Governing rule honoured:** page bodies other than `/resources` are untouched — only the shared header/footer changed across all routes.

---

## 2. Files changed

**Added:** `src/app/(marketing)/resources/resources.module.css`; `tests/unit/v2-chrome.test.tsx`; this report.
**Modified:** `SectionShell.tsx`; chrome — `SiteHeader.tsx`+`.module.css`, `MobileNav.tsx`+`.module.css`, `SiteFooter.tsx`+`.module.css`; `brand/Logo.module.css`; `primitives/Button.module.css` (V2 button reflow); `app/(marketing)/resources/page.tsx`; `tests/unit/v2-shells.test.tsx`, `tests/unit/v2-token-hygiene.test.ts`.
**Untouched:** SiteHeader/MobileNav interaction logic (only re-skinned), CosmicPageHero, PageHero, ServiceDomainTemplate, all other routes, legacy tokens/themes, galaxy components (except the footer's GlobeArc import removal), root layout.

---

## 3. SectionShell ID correction

`SectionShell` fell back to a literal `"section-title"` id when a titled shell had no `id`, so two untitled-id shells on one page produced duplicate DOM ids and ambiguous `aria-labelledby`.

Fix: a stable id via **`useId()`** (colons stripped) — SSR/hydration-safe, works in the Server Component (verified by build), and never derived from arbitrary ReactNode title content. An explicit `id` still yields the readable `${id}-title`; without one, each shell gets `section-<useId>-title`, unique per instance. A unit test renders three untitled-id titled shells and asserts unique ids each referenced by a heading that exists in its section, plus the `${id}-title` behaviour for explicit ids.

---

## 4. SiteHeader design and preserved behaviour

**Design (light V2):** the `<header>` carries `.theme-light` — a near-white solid surface, subtle neutral bottom hairline, a restrained neutral shadow only after scroll (no dark glass, backdrop-filter, coloured glow, gradient border or cosmic decoration). The multicolour infinity mark stays (bloom removed on V2 chrome); the wordmark is accessible dark ink. Nav links/triggers are ≥ 44px, dark-ink, with a **visible current state that isn't colour-only** — a short solid-brand indicator bar under the active simple link, and the same bar + `aria-current` on a mega-menu trigger whose section owns the current route. Header CTAs use the real V2 `Button` ("Build my growth plan" primary + "See how it all works" secondary, labels intact); the mobile menu button is now an `IconButton` (`label="Open menu"`, `aria-expanded`/`aria-controls` preserved). Hover enhancements are gated to `@media (hover: hover) and (pointer: fine)`; active/pressed remains on touch. Hover-capability detection now requires **both** `(hover: hover)` and `(pointer: fine)`, so coarse hybrid devices aren't treated as desktop hover devices.

**Preserved (unchanged logic):** the continuous-`onPointerMove` safe-corridor (point-in-triangle) aim, hover-to-open + click-navigates-hub + reopen-on-1px-twitch, keyboard Enter/Space open, Escape close + trigger focus restore, outside-click close, focus-leave close, route-change close, same-route/hash-link close, and touch first-tap-open/second-tap-navigate. The mega panel keeps `role="group"` + `aria-label` = the trigger label + `#mega-<slug>` id, and its direct-child `.megaInner` grid contract (1 track without a promo, 2 with). MobileNav still renders **outside** `<header>` as a full-screen sibling landmark.

---

## 5. Mega-menu design and viewport handling

A structured **light paper panel**: solid `--surface`, neutral hairline border + `--v2-shadow-lg` (no backdrop-filter glass, no neon top edge, no glow, no radial-gradient promo). Link icons are **flat IconTile-style tiles** tinted per column with **V2 domain ink/tint tokens** (build → discover → convert → operate) — one accent per column for wayfinding only. The promo is a **compact tinted Card** (subtle brand tint + hairline) with a flat glyph tile and the real V2 `Button`, not a giant illustration. Headings, descriptions, destination URLs and promo content are unchanged.

**Viewport fit:** the panel has `max-height: calc(100dvh - var(--header-h))` with `overflow-y: auto` + `overscroll-behavior: contain`, so tall panels scroll internally (never a second full page) and the page behind doesn't scroll. Verified: at 1280×768 the "How It Works" panel bottom is 619px (fits) and there is no horizontal overflow; the existing mega-inset e2e (768/1024/1280/1440) and the "a11y with mega open" axe scan both pass. Interaction (safe corridor, keyboard, Escape+restore, outside-close, `aria-expanded`/`aria-controls`) is unchanged — still not hover-only.

---

## 6. Mobile drawer design and preserved focus behaviour

**Design (light V2):** full-screen on narrow phones (`inset: 0`), a right-side drawer capped at `min(26rem, 100%)` from ≥ 30rem, over a **neutral scrim** (`color-mix` of the ink token). Light surface, no bottom glow / galaxy / glass header. One short transform+opacity entrance (reduced-motion → instant). Restrained (non-heading) top-link typography; a solid-brand leading tick marks the active parent group and direct/sub current links (`aria-current`, not colour-only); flat V2 icon tiles; real V2 `Button` CTAs; the email address wraps safely (`overflow-wrap: anywhere`). No horizontal overflow at 320/360/390 or under 200% zoom.

**Preserved (unchanged):** `role="dialog"` + `aria-modal` + `aria-label="Site menu"` + `id="mobile-nav"`; close-button initial focus; the Tab/Shift+Tab focus trap; `inert` on the `header`/`main`/`footer` siblings; body-scroll lock; Escape close + focus restore; the accordion; and route-close. Added: current-route indication (uses `usePathname`) and a reset of stale expanded state on close. (The close control stays a real `<button ref>` — it needs the ref for initial focus — restyled to the V2 flat look.)

---

## 7. Footer design

A **light, structured footer** (`.theme-light`): white surface, clear top hairline, **no GlobeArc, no glow, no dark background, no overflow-clipping decoration**. The multicolour mark stays flat; column headings carry a small flat **V2 domain-ink tick**. Footer links now have a **visible focus ring and a hover underline**, fill their column and wrap long labels (`overflow-wrap: anywhere`); the column grid is one column at very narrow/zoomed widths and two/four wider. The email wraps safely; social controls keep their accessible names and still render only once a URL exists; legal links wrap cleanly. Copyright uses `new Date().getFullYear()` (build-time, no future hardcoded date, no client component). Semantic `<footer>` + footer `<nav aria-label="Footer">` and all content/data are preserved.

---

## 8. Resources canary changes

`/resources` migrated to V2, presentation only:
- **Header:** CosmicPageHero → **PageHeader** (light), eyebrow "Resources", `accent="var(--v2-domain-discover-ink)"` (a V2 token), a **plain H1** (gradient-word wrapper removed), the existing lead, V2 `Button` primary ("Build my growth plan") + secondary ("Browse the guides"), and a **restrained aside** of three resource-type preview Cards (IconTile + label, no links, no new destinations, no fabricated metrics; stacks after the CTA on mobile). No NodeOrb.
- **Resource areas:** `SectionShell surface="alt"` + V2 `BentoCard`s with **V2 domain ink** hues and the existing six destinations/descriptions (one featured).
- **Latest guides:** `SectionShell surface="light"` + V2 `BentoCard`s with the existing titles/excerpts, `Badge tone="neutral"` for read times (no glow, no NodeOrb, no fake thumbnails).
- **Final CTA:** a single restrained `.theme-night` `SectionShell` (matching the FAQ pattern), "Build my growth plan" primary + "Talk to us" → `/contact`. FinalCtaBannerSection is **not** used here.
- **Preserved:** URL, metadata + canonical (`…/resources`), breadcrumb JSON-LD, resource destinations, article loading/status, server rendering, internal links. Removed on this route only: CosmicPageHero, GlowButton, NodeOrb, gradient word, legacy SectionShell surfaces, FinalCtaBannerSection, cosmic backgrounds/glows. Verified: one H1, no heading skips, 45 links, **no `.theme-cosmic`/`<canvas>`**.

---

## 9. What intentionally remained legacy

Homepage body, all non-`/resources` hub/detail routes, contact/growth-plan/troubleshooter, ServiceDomainTemplate, CosmicPageHero + PageHero (and their consumers), GlowButton/NodeOrb and the galaxy components/tokens (GlobeArc still used by FinalCtaBannerSection/CosmicBackground/contact/troubleshooter), the root layout `colorScheme`/`themeColor`/body (still dark), and SectionShell's default surface (`legacy`). Those legacy page bodies now sit inside the new **light** chrome — a deliberate transitional state until they migrate.

---

## 10. Tests actually run

| Check | Result |
|---|---|
| `npm run lint` | **pass** |
| `npm run typecheck` | **pass** |
| `npm run test` (Vitest) | **272/272 pass** (16 files) |
| `npm run build` (Next 16) | **pass** |
| `npx playwright test` (full e2e) | **211/211 pass** — incl. mega-menu keyboard/pointer/safe-corridor/promo-track/close-on-click, mobile drawer focus+inert+Escape, header/hero alignment, and full-page **axe (0 serious/critical)** on ~20 routes that now include the light chrome |

New/updated unit tests: SectionShell unique ids + `${id}-title`; a chrome suite (`v2-chrome.test.tsx`) covering SiteHeader (light surface, simple-link `aria-current=page`, mega-parent `aria-current` when a child is current, `aria-expanded`, menu-button name + wiring, both CTA labels), MobileNav (dialog/`aria-modal`/`aria-label`/`id`, active parent group, direct-link `aria-current`, accordion expand, renders-null-when-closed), SiteFooter (named footer nav, email, legal, social gating, light class, current year, no canvas); and token-hygiene scanning of the three rebuilt chrome modules for banned legacy/raw colour values (comments stripped).

---

## 11. Full-page zoom and responsive results

Measured with an element-based max-right sweep (bypasses `overflow-x: hidden`, per the task) at **320/360/390/768/1024/1160/1280/1440**:
- **Chrome + migrated content have zero overflow** at every width. On a clean route, header + open mega-menu fit exactly (max-right = viewport). `/faq`, `/resources` and the previews show no element overflow.
- **200% text zoom:** the migrated `<main>` and the chrome reflow with **no horizontal overflow at all narrow/reflow widths (320–1024)**, where the compact hamburger header applies — this is the WCAG 1.4.10 reflow scenario. The narrow-width offenders found by the harness were fixed: V2 `Button`s now wrap long labels and cap at `max-width: 100%`, and footer links fill/wrap their column (1-column at narrow).
- The `/` and `/contact` element-overflows the sweep reports are their **legacy cosmic page-body decoration** (absolutely-positioned, clipped by `overflow-x: hidden`) — not chrome, not migrated routes; the standard `document.scrollWidth == clientWidth` holds on `/` (no real horizontal scroll).

---

## 12. Accessibility results

- **axe: 0 serious/critical** on `/`, `/faq`, `/resources`, `/privacy`, `/contact`, `/design-preview`, `/design-preview/shells` (all now include the light chrome), and on the ~20 routes scanned by the existing e2e suite, including the **mega-menu-open** scan.
- Exactly one `<h1>` and no heading skips on `/resources`.
- Visible focus rings on all chrome links/buttons; current state conveyed by an indicator bar + `aria-current` (not colour alone); ≥ 44px targets (nav links 44, header CTA 44, IconButton 48).
- Mobile drawer: full-height at 390, close-button focused on open, Escape closes and restores focus to the trigger, `inert` applied/cleared on siblings.
- Reduced-motion renders complete; hover effects gated to fine pointers.
- The global `--ring` purple token is unchanged (the `audit-fixes` focus-ring assertion stays green).

---

## 13. Preview URLs and screenshots

Production route migrated: **`/resources`**. Internal previews unchanged: `/design-preview`, `/design-preview/shells`. Screenshots captured during validation: the light single-row header, the light footer, the light mobile drawer, and `/resources` at 360/1440.

---

## 14. Known limitations

1. **Desktop-only text-zoom overflow.** At a **≥ 1160px physical viewport** with **200% text-size-only** zoom (`html{font-size:200%}`), the horizontal desktop nav + CTAs overflow. This is the artificial text-only harness, not how users zoom: under real **browser zoom** the CSS viewport shrinks (e.g. 1280 → 640 at 200%), which is `< 1160px` → the **compact hamburger header** engages and there is no overflow. Reflow (1.4.10, narrow widths) and browser-zoom behaviour are both clean; a pure-CSS reflow of a horizontal desktop nav under text-only zoom isn't achievable without breaking the normal single-row layout (attempted and reverted).
2. **Transitional theme mismatch.** Legacy page bodies (homepage, contact, cosmic hubs) now render inside light chrome — light header/footer around a dark body — until those bodies migrate (Phase 2D+).
3. **`/resources` aside** is a decorative preview (three Cards) that mirrors the real areas below; it carries no independent destinations.

---

## 15. Recommended scope for Phase 2D

Migrate the next batch of hub routes onto PageHeader + V2 SectionShell (now that the chrome is light):
1. **Migrate 2–4 more CosmicPageHero hubs** (e.g. `/tools`, `/roadmaps`, `/learn`, `/case-studies`) using the exact `/resources`/`/faq` pattern — light PageHeader, `surface="alt"/"light"` SectionShells, V2 BentoCards, a `.theme-night` final CTA — swapping each route's GlowButton/NodeOrb only on that route.
2. **Taxonomy detail templates** (`/goals/[slug]`, `/tools/[slug]`, `/roadmaps/[slug]`, …) as a group once their shared hub pattern is proven.
3. **Then** assess the root colour-scheme flip (`colorScheme`/`themeColor`/body) once enough bodies are light — still a late convergence step.
4. Extend e2e light-surface + axe coverage to each newly migrated route.

Explicitly still **out of scope** beyond the above: the homepage body redesign, the conversion tools (Phase 3), ServiceDomainTemplate, and deletion of the legacy layer + galaxy engine (final convergence).
