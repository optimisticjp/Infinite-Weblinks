# V2 Phase 2D — Implementation Report

**Scope:** Content card system + Learn and Case-studies hubs, plus a hardening pass on the
global chrome. Compatibility-first and additive, on branch
`claude/infinite-weblinks-v2-design-yb1yi3`. Governing spec: `docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (310 unit),
`npm run test:e2e` (250 Playwright + axe) and `npm run build` all pass.

---

## 1. What Phase 2D accomplished

- Hardened the global chrome: an **adaptive compact header** (measured-fit, no retained
  exception) and a **shared route-current helper** (page / location / none) applied across
  every nav surface, plus stale-comment cleanup.
- Added a reusable **content-card system**: a central domain-colour bridge, an `href`-capable
  `Card`, `CardGrid`, `ArticleCard`, `CaseStudyCard`, `Callout` and `FinalCtaSection`.
- Migrated **`/learn`** and **`/case-studies`** off the cosmic components onto that system,
  and de-duplicated the closing CTA on **`/faq`** and **`/resources`**.
- Extended the internal component and shells previews and the test suites; nothing outside the
  named scope was migrated.

## 2. Files changed (by area)

| Area | Files |
|---|---|
| Chrome | `chrome/SiteHeader.tsx`, `chrome/SiteHeader.module.css`, `chrome/MobileNav.tsx` |
| Helpers | `lib/nav/currentRoute.ts` (new), `lib/design/domainColor.ts` (new) |
| Primitives | `primitives/Card.tsx` + `.module.css`, `primitives/CardGrid.tsx` + `.module.css`, `primitives/Callout.tsx` + `.module.css` |
| Cards | `cards/ArticleCard.tsx` + `.module.css`, `cards/CaseStudyCard.tsx` + `.module.css` |
| Sections | `sections/FinalCtaSection.tsx` + `.module.css` |
| Routes | `learn/page.tsx`, `case-studies/page.tsx`, `faq/page.tsx` (+ css), `resources/page.tsx` (+ css) |
| Previews | `design-preview/page.tsx`, `design-preview/shells/page.tsx` |
| Tests | `unit/v2-domain-color`, `unit/v2-cards`, `unit/v2-callout-cta`, `unit/v2-nav-current`, updated `unit/v2-chrome`; `e2e/chrome-adaptive`, `e2e/content-hubs` |

## 3. Adaptive compact header (§A1)

The header now switches to the compact logo + hamburger whenever the desktop nav + CTAs don't
fit — **including at ≥1160px under large text / zoom** — and returns to the desktop nav when
the room is restored. It never shrinks text, hides overflow, wraps the nav to a second row, or
drops CTA wording. Fit is measured with two off-screen **probes that always carry the desktop
content**, so the result is independent of the current mode: there is no measurement feedback
loop and no post-hydration flicker. The probes are `aria-hidden` + `inert` and clipped by a
0-height wrapper, so they are not focusable, not in the a11y tree, add no landmark and cause no
overflow. Desktop stays gated at ≥1160px, so the mega-menu keeps its layout. Pre-hydration /
no-JS falls back to the existing media queries; `data-mode` / `data-secondary` override them
once mounted. Re-measures on container resize, breakpoint change and webfont load. **The prior
200%-text overflow limitation is fixed, not documented as an exception.**

## 4. Shared route-current semantics (§A2)

`lib/nav/currentRoute.ts` is the single source of truth: exact → `aria-current="page"`,
ancestor/section → `aria-current="location"`, unrelated → none (trailing slash normalised;
hash/query ignored). Applied to header simple links and mega triggers, and to the mobile top
links, group triggers, overview links and submenu links. The visible cue stays the brand
indicator bar (never colour-only). A mega trigger is only `page` when its hub is the current
page; a child route makes it `location`. Sibling collisions (`/service` vs `/services`) do not
false-match.

## 5. Stale-comment cleanup (§A3)

Removed the stale "header's `backdrop-filter` establishes a containing block" comment in
`SiteHeader.tsx` (the V2 header has no backdrop-filter) and reworded it to the real reason the
mobile overlay renders outside `<header>`.

## 6. Central domain-colour bridge (§B)

`lib/design/domainColor.ts` maps the seven legacy `--domain-*` tokens to their accessible V2
domain ink (measured AA on white and on tint), plus the legacy accent-palette aliases still
carried by the goals seed (mapped by hue family) so per-goal wayfinding survives. Pure and
server-safe (string → token string, no DOM/computed style); unknown/absent input returns a
safe neutral ink; output is only ever a `var(--v2-*)` token. Documented as a removable
convergence-phase bridge and used by the Learn / case-study migrations — **the datasets are
not rewritten.**

## 7. Card optional `href` (§C)

`Card` gained a type-safe discriminated union: without `href` it renders `div`/`li`/`article`
(via `as`) exactly as before — every existing consumer is byte-compatible; with `href` the
whole card becomes one Next `<Link>` root (a single tab stop, no nested link), auto-interactive
with a clear focus-visible ring that matches the hover lift. `className`, `style`, `accent` and
`index` are preserved on both forms; internal links only.

## 8. CardGrid (§D)

A semantic list (`<ul>` with one `<li>` per child), token-driven gaps and breakpoints, no
masonry, no fixed row heights. `equal` = uniform 1/2/3-column equal-height cards; `editorial` =
1-col mobile → 2-col tablet/desktop. A child spans both columns **only when it explicitly
declares `featured`** — never inferred from position. Mobile source order equals visual order.

## 9. ArticleCard (§E)

Server component. Text-forward editorial guide card: a topic label + reading time (visible
text), an H3 title, a short standfirst and a quiet read affordance. The whole card is one link
with soft elevation and a ≤2px hover matched by focus (reduced-motion-safe). Goal colour is
resolved through the domain-ink bridge. No node-orb, corner-arrow tile, glow, glass, image,
fake author, date or metric. Standard / featured (featured is a genuine caller signal only).

## 10. CaseStudyCard (§F)

Server component. Every illustrative card visibly declares itself an **"Illustrative example"**
via a real V2 `Badge` — carried on the card, not just a page disclaimer — so none can be
mistaken for a real client. It shows the situation, who it's for and the summary only: never a
client name, logo, testimonial or numeric result. Whole-card link, H3 title, outlined +
accent-railed so it reads distinctly from ArticleCard. The status API accepts a future
`verified` state (a real success badge) without inventing any client content now.

## 11. Callout (§G)

A restrained inline notice with tones neutral / information / warning. **Passive by default**
(`role="note"`, never an alert), meaning carried by the icon **and** copy, not colour alone.
Tones map to V2 semantic tokens (soft tint + accessible ink); no raw colours, no glow, no
oversized illustration; icon + text wrap on mobile. Used for the case-studies illustrative
disclosure.

## 12. FinalCtaSection (§H)

The reusable V2 closing CTA: one reserved `theme-night` `SectionShell` (no cosmic layer) with
an **`<h2>`**, a lead, a signature-gradient primary Button and an optional secondary Button.
API: `id / title / lead / primary{href,label} / secondary? / className`. **The legacy cosmic
`FinalCtaBannerSection` is untouched** (still used by its 15 other consumers); only `/faq`,
`/resources`, `/learn` and `/case-studies` moved to `FinalCtaSection`.

## 13. `/learn` migration (§I)

`CosmicPageHero → PageHeader` (light; eyebrow "Learn", plain H1 "Understand how it all fits
together", existing lead, primary "Build my growth plan" + secondary "Browse the guides", trust
note "Educational first, no hard sell", no node-orb/aside). Legacy `SectionShell → alt`
surface. `BentoCard → CardGrid(editorial) + ArticleCard` with real goal labels, mapped V2 tones
and reading times; **the arbitrary index-0 featured emphasis is removed**. `FinalCtaBannerSection
→ FinalCtaSection` (one night band, `#get-started`). URL, metadata, canonical, breadcrumb +
ItemList JSON-LD, data loading and server rendering are preserved.

## 14. `/case-studies` migration (§J)

`CosmicPageHero → PageHeader` (light; eyebrow "Worked examples", plain H1 "How a connected
system fits together", primary "Build my growth plan" + secondary "See the examples", trust
note stating every entry is an illustrative scenario). The ad-hoc notice becomes a prominent
page-level `Callout`. `BentoCard → CardGrid(equal) + CaseStudyCard`, so **every card also
carries its own "Illustrative example" marker**; scenario hues mapped to V2 inks; no first-card
enlargement; no testimonial/numeric result. `FinalCtaBannerSection → FinalCtaSection` worded so
it never implies the examples are verified clients. Preserves URL, metadata, JSON-LD, data
loading and server rendering. The case-study **detail page is intentionally untouched**.

## 15. Previews (§K)

`/design-preview` gained "Content cards" (CardGrid equal/editorial, ArticleCard standard +
featured, CaseStudyCard illustrative, plus the future `verified` status clearly labelled as an
API preview with no real client) and "Callout tones". `/design-preview/shells` gained a
`FinalCtaSection` example (so it isn't demonstrated on a nested marketing page). Both keep their
single `<h1>`, `noindex,nofollow`, and off-nav / off-sitemap status; all preview content is
generic and preview-labelled.

## 16. What intentionally remained legacy / out of scope

`FinalCtaBannerSection` and `BentoCard`/`BentoGrid` are unchanged and keep their other
consumers. `case-scenarios.ts` and `goals.ts` are **not** rewritten (the domain bridge reads
their tokens at render time). Not migrated: article/case-study **detail** pages, `/tools`,
`/roadmaps`, other hubs, the homepage, conversion routes and `ServiceDomainTemplate`.

## 17. Tests

- **Unit (Vitest): 310 pass (20 files).** New: `v2-domain-color` (bridge + fallback + only
  `var(--v2-*)` output), `v2-cards` (Card link root, CardGrid layouts/featured, ArticleCard,
  CaseStudyCard), `v2-callout-cta` (Callout role/tones, FinalCtaSection h2/night/signature),
  `v2-nav-current` (page/location/none, sibling collisions). Updated `v2-chrome` to the
  page/location aria-current semantics.
- **E2E (Playwright + axe): 250 pass.** New: `chrome-adaptive` (200% text at 1160/1280/1440 →
  compact, one row, header no overflow, returns to desktop) and `content-hubs` (one H1, whole-
  card links with H3, illustrative marker on every case card, night FinalCtaSection, no
  overflow at 320/360/390/768/1024/1160/1280/1440, and a targeted axe sweep of `/`, `/faq`,
  `/resources`, `/learn`, a `/learn/[slug]`, `/case-studies`, a `/case-studies/[slug]`,
  `/privacy`, `/contact`, `/design-preview`, `/design-preview/shells`). All existing
  navigation/layout mega-menu contracts still pass.

## 18. Accessibility & responsive results

0 serious/critical axe violations on every page in the targeted sweep. No horizontal overflow
at any tested width (320–1440) on the migrated hubs; the header stays a single row and does not
overflow under 200% text. Each card is one tab stop with a visible focus ring matching hover;
current-nav state exposes `aria-current` page/location with a non-colour-only indicator.

## 19. Verification commands

```
npm run lint         # clean
npm run typecheck    # clean
npm run test         # 310 unit tests pass
npm run test:e2e     # 250 Playwright + axe tests pass
npm run build        # succeeds (103 routes)
```

## 20. Recommended scope for a later phase

Migrate the article/case-study **detail** templates and the remaining hubs (`/tools`,
`/roadmaps`) onto the same content-card system; then retire the domain-colour bridge by
re-authoring `case-scenarios.ts` / `goals.ts` with V2 tokens directly, and remove the legacy
cosmic components once their last consumers migrate.
