# V2 Phase 2B — Implementation Report

**Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
**Scope:** Shared page shells (PageHeader + a compatible SectionShell surface API) + the `/faq` canary. Compatibility-first. No chrome rebuild, no homepage/other-route migration, no ServiceDomainTemplate change, no removal of CosmicPageHero/PageHero/GlowButton/NodeOrb/legacy tokens, no global body/root flip, no galaxy-engine deletion. No PR, no deploy.
**Prior:** `docs/design/v2-design-spec.md` · `phase-1-implementation-report.md` · `phase-2a-implementation-report.md`.

---

## 1. What Phase 2B accomplished

- **Corrected the five Phase 2A issues** (Button loading types/rendering, V2 pointer targets, hover-capability gating, a central night link token, night-safe BentoCard).
- **Built `PageHeader`** — the V2 light-first page opener (the replacement target for CosmicPageHero/PageHero), supporting light/alt/night surfaces, a single semantic H1, breadcrumb, eyebrow, lead, actions, trust note, and a controlled-width aside. No cosmic layers.
- **Refactored `SectionShell` compatibly** — added a `surface` API (`legacy` | `light` | `alt` | `night`) that **defaults to `legacy`**, so all 22 existing callers are byte-identical; V2 surfaces render no cosmic background and a plain (non-gradient) eyebrow.
- **Added an internal shells preview** at `/design-preview/shells` and **migrated only `/faq`** to PageHeader + V2 SectionShell surfaces, preserving all metadata/JSON-LD/content/accordion behaviour.
- **Added tests** (Button loading intent, PageHeader, SectionShell surface mapping, token hygiene, night contrast) and validated with lint / typecheck / test / build + Playwright/axe across six routes and five breakpoints.

**Governing rule honoured:** shared defaults were not changed in a way that converts other routes. SectionShell stays `legacy` by default; PageHeader is new; the FAQ migration is route-level composition. Legacy routes verified unchanged (axe 0 serious on `/`, `/contact`).

---

## 2. Files changed

**Added:** `src/components/routes/PageHeader.tsx` + `.module.css`; `src/app/design-preview/shells/page.tsx`; `src/app/(marketing)/faq/faq.module.css`; `tests/unit/v2-shells.test.tsx`, `tests/unit/v2-token-hygiene.test.ts`; this report.

**Modified:** `src/components/primitives/Button.tsx` + `Button.module.css`, `IconButton.module.css`, `Card.module.css`, `Bento.module.css`, `FilterChip.module.css`; `src/styles/tokens/v2.css`; `src/components/sections/SectionShell.tsx` + `.module.css`; `src/app/(marketing)/faq/page.tsx`; `src/app/design-preview/page.tsx` + `design-preview.module.css`; `tests/unit/v2-buttons.test.tsx`, `tests/unit/v2-contrast.test.ts`.

**Untouched (as required):** SiteHeader, MobileNav, MegaMenu, SiteFooter, CosmicPageHero, PageHero, ServiceDomainTemplate, GlowButton, NodeOrb, all galaxy components, all legacy tokens, the root layout/body, and every non-FAQ route.

---

## 3. Phase 2A corrections made

1. **Button loading types & rendering.** `loading` moved out of shared `BaseProps` into `ActionProps` only, so a link **cannot** accept `loading` at the type level (guarded by a `@ts-expect-error` test). When loading, **both** the left and right icons are hidden, the visible label stays, `aria-busy="true"` and `disabled` are set.
2. **Pointer targets (V2, theme-scoped).** Button sm **44px** / md **46px** / lg **52px** on V2 surfaces (legacy sm stays 40px off V2). IconButton **44 / 48 / 52** (square). Measured live: Button 44/46/52, IconButton 44/48/52.
3. **Hover capability.** V2 Button hover lift + icon-right nudge now run **only** inside `@media (hover: hover) and (pointer: fine)`: the legacy global lift is neutralised on V2 surfaces first, then re-enabled for fine pointers (reduced-motion still wins, declared last). Touch keeps the `:active` pressed state. Card, BentoCard, IconButton and FilterChip hovers were upgraded to the same query.
4. **Night link token.** Added `--v2-link-night: #cdbcff` (10.9:1 on night) centrally in `v2.css`; `.theme-night` and Card `.night` now reference it. The raw `#cdbcff` is removed from `Card.module.css` (guarded by a token-hygiene test).
5. **Night-safe BentoCard.** On `.theme-night`, the eyebrow, index, icon tile, corner arrow and accent rail re-map to `--v2-link-night` (the light-only domain ink is never used as visible text/icon on night; the hue survives only as non-text decoration). Contrast coverage added; shown in the shells preview.

---

## 4. PageHeader API and behaviour

`src/components/routes/PageHeader.tsx` (Server Component).

**Props:** `title` (required, the single H1) · `breadcrumbs?` · `eyebrow?` · `lead?` · `actions?` · `trustNote?` · `aside?` · `surface?: "light" | "alt" | "night"` (default `light`) · `accent?` (eyebrow accent; defaults to the theme link colour, which is always AA-safe) · `spacing?: "standard" | "compact"` · `id?` · `headingId?` · `className?`.

**Behaviour & contract:**
- Renders the page's **single semantic `<h1>`** as plain server-rendered text (LCP, never motion-gated); labelled region via `aria-labelledby`.
- **No** CosmicBackground, Starfield, GlobeArc, NodeOrb, full-screen wash, gradient heading text, or forced `100vh` — height is content-driven.
- One restrained accent (the eyebrow). Neutral shadows + semantic borders only; no raw colours.
- Desktop: structured grid — single column, or two columns only when an `aside` is present (copy ~1.05fr, aside ≤ 30rem, text dominant). Mobile: source order is breadcrumb → eyebrow → H1 → lead → actions → trust note → **aside last**, so the H1 and primary CTA precede the visual. At 390px the base `h1` clamp (32→56) avoids cinematic type.
- Night is a supported but rare variant.

Uses the Phase-2A primitives (Button, Card/BentoCard) for content; the FAQ hero and the shells preview both consume it.

---

## 5. SectionShell compatibility strategy

`surface: "legacy" | "light" | "alt" | "night"`, **default `legacy`**.

- **`legacy` (default):** unchanged — `.theme-cosmic`, the optional `CosmicBackground` layer (`background` / `"horizon"`), the gradient eyebrow, and the edge-clipping `overflow: hidden` (now scoped to a `legacyClip` class). All 22 existing callers pass no `surface`, so they are **byte-identical**. The cosmic `background` options are marked deprecated for new V2 use.
- **`light` / `alt` / `night`:** map to `.theme-light` / `.theme-light-alt` / `.theme-night`; **never** render `CosmicBackground` (even if `background` is passed — verified by test); use a plain accent eyebrow (`.eyebrowV2`, no gradient); no edge-clipping so focus rings aren't hidden.
- Preserved capabilities: `id`, `eyebrow`, `title`, `titleLevel`, `lead`, `align`, `container`, `spacing`, `children`, `className`, `contentClassName`, `labelledBy`. **One** minimal addition beyond `surface`: `ariaLabel`, so a headingless V2 section (the FAQ body) stays a named landmark without adding a heading.
- The default will become `light` only at final convergence (documented in code).

---

## 6. FAQ canary changes

`/faq` (the single production canary). **Presentation shell replaced; everything else preserved.**

- **Replaced** `CosmicPageHero` → **`PageHeader`** (light); the `theme-cosmic` accordion band → **`SectionShell surface="alt"`**; the shared cosmic `FinalCtaBannerSection` → a **route-level restrained `SectionShell surface="night"`** final CTA (dark, no cosmic decoration) with real V2 Buttons. Actions use the real `Button` with the standard primary wording **"Build my growth plan."**
- **No galaxy/starfield** on the route (verified: 0 `<canvas>`, no CosmicBackground).
- Category hues switched to the accessible **V2 domain inks** so the accordion tints read on light.
- **Preserved:** URL, metadata + canonical (`…/faq`), breadcrumb JSON-LD, **FAQPage structured data** (verified present), the full FAQ content and copy (not rewritten), the accessible accordion (verified: `aria-expanded` toggles), internal links, status-gated behaviour, and server rendering.
- Heading order: one H1 (PageHeader) → h2 (accordion groups) → h3 (questions) → h2 (final CTA). Verified single H1, no skips.
- **Transitional chrome:** the global SiteHeader/SiteFooter remain legacy dark (out of scope), so `/faq` currently reads dark-header → light-content → dark-footer. Documented (see §11); resolved when chrome migrates in 2C.

---

## 7. What intentionally remained legacy

SiteHeader, MobileNav, MegaMenu, SiteFooter (all dark this phase); CosmicPageHero + PageHero + their ~19/legacy consumers; every non-FAQ hub/detail route; ServiceDomainTemplate; the contact/growth-plan/troubleshooter conversion routes; GlowButton, NodeOrb, and all galaxy components/tokens; the root layout `colorScheme`/`themeColor`/body (still dark); SectionShell's default surface (`legacy`); Button's `brand` variant and Card's `glass` variant (deprecated, kept).

---

## 8. Tests actually run

| Check | Result |
|---|---|
| `npm run lint` | **pass** |
| `npm run typecheck` (incl. the `@ts-expect-error` loading-on-link intent test) | **pass** |
| `npm run test` (Vitest) | **229/229 pass** (15 files) |
| `npm run build` (Next 16) | **pass** — `/faq`, `/design-preview`, `/design-preview/shells` all static |
| Playwright + axe (tags incl. `wcag22aa`) | `/design-preview` **0**, `/design-preview/shells` **0**, `/faq` **0**, `/privacy` **0**, legacy `/` **0**, `/contact` **0** serious/critical |

New/updated tests: Button (loading action-only at the type level, hides both icons); PageHeader (one H1; breadcrumb/lead/actions/trust-note/aside; surface→theme-class mapping; never cosmic); SectionShell (legacy default = cosmic; explicit light/alt/night mapping; no cosmic layer on V2 even with `background`; V2 plain eyebrow vs legacy gradient); token hygiene (`--v2-link-night` central, no raw `#cdbcff` in modules); contrast (night accent on night surfaces + 8% domain-badge tint).

---

## 9. Accessibility & responsive results

- **No horizontal overflow** at **360 / 390 / 768 / 1024 / 1440px** on all six routes.
- **Exactly one `<h1>`** and **no heading-level skips** on `/design-preview`, `/design-preview/shells`, `/faq`.
- **Target sizes** (measured live): Button **44 / 46 / 52**; IconButton **44 / 48 / 52**.
- **Focus:** visible V2 ring on all interactive V2 controls; interactive Card focus-within parity.
- **Hover/focus parity + touch:** V2 hover effects gated to `(hover: hover) and (pointer: fine)`; touch keeps the active state.
- **200% text zoom:** the migrated `<main>` content of `/design-preview`, `/design-preview/shells` and `/faq` reflows with **no overflow**. (The full-page `/faq` reports overflow at 200% **from the legacy SiteHeader CTA + footer GlobeArc only** — see §11; the body's `overflow-x: hidden` prevents any user-facing horizontal scroll.)
- **Reduced motion:** shells preview renders complete; all V2 hover lifts/spinner are reduced-motion-guarded.
- **FAQ keyboard:** the accordion trigger toggles `aria-expanded` (verified).
- **Legacy `/` and `/contact`:** unchanged and axe-clean.

---

## 10. Preview URLs & screenshots

- **`/design-preview`** — component board (Phase 2A), now cross-linked to the shells preview.
- **`/design-preview/shells`** — NEW: PageHeader (the route's only H1) + light/alt/light/night SectionShell surfaces, compact vs standard spacing, night-safe BentoCard. noindex/nofollow, off-nav, off-sitemap.
- **`/faq`** — the migrated production canary.
Screenshots captured at 360 (full page) and 1440px for all six routes during validation.

---

## 11. Known limitations

1. **Transitional chrome mismatch.** The global SiteHeader/SiteFooter stay legacy dark, so a migrated light page (`/faq`) reads dark-header → light-content → dark-footer. The **only** 200%-zoom overflow on `/faq` comes from the legacy header CTA group + footer GlobeArc (verified by element diagnosis); it is pre-existing on every route and clipped by the body's `overflow-x: hidden`. Both are resolved when chrome migrates in Phase 2C.
2. **PageHeader accent responsibility.** The eyebrow accent defaults to the theme link (always AA-safe); a caller-supplied `accent` must clear AA on the chosen surface (documented in the prop).
3. **SectionShell default stays `legacy`.** Intentional during migration; flipping the default to `light` is a convergence step gated on migrating all consumers.
4. **Two internal preview routes** (`/design-preview`, `/design-preview/shells`) remain in the app; both noindex/nofollow and off-sitemap. Remove at convergence.
5. **BentoCard on night still relies on `hue` being present** to source the domain hue for non-text decoration; visible elements are re-mapped to the night token regardless.

---

## 12. Recommended scope for Phase 2C

Chrome migration + the first router-hub route (still no homepage/tools/service-template/conversion redesign):

1. **SiteHeader / MobileNav / MegaMenu / SiteFooter → light**, theme-scoped so any not-yet-migrated route still gets legacy dark chrome where needed — or gate the light chrome behind a per-route opt-in until enough routes are light. This ends the transitional mismatch and the 200%-zoom header overflow.
2. **Migrate one CosmicPageHero hub route** (e.g. `/resources` or `/roadmaps`) onto PageHeader + V2 SectionShell as the next canary, swapping its `GlowButton`/`NodeOrb` usages only on that route.
3. **Global colour-scheme readiness:** once chrome + a few routes are light, evaluate flipping the root `colorScheme`/`themeColor`/body default (a late step; still not this phase).
4. **Tests:** add e2e light-surface + axe coverage for the migrated hub route; keep `/design-preview` and `/design-preview/shells` current.

Explicitly still **out of scope** for 2C beyond the above: the homepage IA redesign, ServiceDomainTemplate, the conversion tools (Phase 3), and deletion of the legacy layer + galaxy engine (convergence).
