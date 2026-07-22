# V2 Phase 2E — Implementation Report

**Scope:** Catalog and planning card families + the Tools and Roadmaps hubs, plus corrections
to three Phase 2D issues. Compatibility-first and additive, on branch
`claude/infinite-weblinks-v2-design-yb1yi3`. Governing spec: `docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (325 unit),
`npm run build` and `npm run test:e2e` (full Playwright + axe suite) all pass.

---

## 1. What Phase 2E accomplished

- Corrected three Phase 2D issues: non-interactive header fit probes, the duplicated Learn
  hero reassurance, and case-study verification semantics (a hard type contract).
- Added two card families: **ToolCard** (catalog / connection-led) and **RoadmapCard**
  (planning / sequence-led), keeping the five-family card system coherent yet distinguishable.
- Migrated **`/tools`** and **`/roadmaps`** off the cosmic components onto the V2 system.
- Extended the internal preview and the unit/e2e suites. Nothing outside the named scope was
  migrated.

## 2. Files changed

| Area | Files |
|---|---|
| Chrome | `chrome/SiteHeader.tsx` (probes) |
| Cards | `cards/ToolCard.tsx` + `.module.css` (new), `cards/RoadmapCard.tsx` + `.module.css` (new), `cards/CaseStudyCard.tsx` + `.module.css` (verification API) |
| Routes | `learn/page.tsx` (lead), `tools/page.tsx` (migrated), `roadmaps/page.tsx` (migrated) |
| Preview | `design-preview/page.tsx` (added ToolCard/RoadmapCard; removed the verified demo) |
| Tests | `unit/v2-chrome` (probe), `unit/v2-cards` (verification), `unit/v2-catalog-cards` (new), `e2e/catalog-hubs` (new) |
| Docs | `docs/design/phase-2e-implementation-report.md` |

## 3. Header-probe correction (§A1)

The adaptive-header measurement probes no longer contain any interactive element. The logo
clone now uses `<Logo>` **without** `href` — the component renders a non-interactive
`role="img"` span (not a `<Link>`), so there is no anchor. Each CTA clone is a `<span>`
carrying Button's own element-agnostic box classes (`.btn`/`.primary`/`.secondary`/`.sm` + the
`.label` span), which measures identically to the real Button without being a `<button>`,
`<a>`, `Link` or focusable element. The probe wrapper stays `aria-hidden` + `inert`, clipped by
the 0-height wrapper, and the nav clone remains a plain `<ul>` (no `<nav>` landmark, no `href`,
no prefetch). Result: no anchor, button, nav landmark, focusable descendant or duplicate
interactive name inside the wrapper. It still measures the logo, nav labels + chevrons, the
minimum and complete CTA sets and every gap/padding, so the adaptive fit is unchanged — the
200%-text tests at 1160/1280/1440 still pass, and a new unit test asserts the wrapper contains
no anchor/button/nav/`tabindex>=0` element.

## 4. Learn copy correction (§A2)

"Educational first, no hard sell." now appears once — as the trust note. The duplicated final
sentence was removed from the lead; metadata, JSON-LD, destinations and layout are otherwise
unchanged. An e2e assertion checks the phrase is not duplicated in the hero.

## 5. Case-study verification hardening (§A3)

`CaseStudyCard` now uses a discriminated status API:

- **Illustrative** (`status` omitted or `"illustrative"`): shows "Illustrative example"; the
  type does not accept any verification field.
- **Verified** (`status="verified"`): a hard contract — it **cannot compile** without a truthful
  `verification` object (`{ label, client? }`). The visible badge shows the supplied `label`
  (not a hardcoded string), and the optional `client`/confidentiality label is shown as given.

Both constraints are type-enforced and covered by a compile-time test (object-literal-to-union
assignability, checked by `tsc`). Production `/case-studies` stays illustrative; the
verified-looking demonstration was **removed** from `/design-preview`. No verified production
content exists, and future genuine status-gated content stays supported.

## 6. ToolCard design and data handling (§B, §G)

A catalog card led by its category and connections: a flat category `IconTile` + category
label head, an H3 tool-area title, a plain "what it does" description, and its signature
**"Connects with"** group — up to three real connected category names, then a truthful
"+N more" chip. Chips are informational `Chip` spans (no nested links/buttons). Whole-card link
(Card `href` mode), raised paper surface, one restrained category accent, ≤2px hover matched by
focus, reduced-motion-safe; long names/descriptions wrap. `ToolCategory.color` is mapped through
`domainInk`; connected-area **slugs are resolved to category NAMES on the route** (raw slugs are
never shown; unresolved slugs are dropped, not invented). No node-orb, glow, glass, giant art,
product screenshot, product-logo rail or example product brands — the card represents a tool
CATEGORY we help select/configure/connect, never a partnership, certification, endorsement or
ownership claim.

## 7. RoadmapCard design and phase handling (§C, §G)

A planning card led by its suggested sequence: a business-type `Badge`, an H3 title, a short
intro, the real phase count, and an ordered preview of the first three phase titles with
**compact numbered markers** — plus a truthful "+N more phase"/"+N more phases" line (singular
vs plural). Whole-card link, softly-tinted + accent-railed planning surface, ≤2px hover matched
by focus, reduced-motion-safe; long titles wrap and mobile source order is unchanged. It reads
as a suggested sequence, never progress: no durations, completion percentages, progress bars,
or "fixed/guaranteed" language. `BusinessType.color` is mapped through `domainInk` (never from
array position).

## 8. Card-system coherence (§D)

All five families share V2 radii, semantic hairline borders, neutral shadows, the focus ring +
hover-parity treatment, interaction timing, the H3 title hierarchy and the token spacing scale,
yet each stays recognisable: **BentoCard** navigational/category-led (node-orb + corner arrow),
**ArticleCard** editorial/text-led (meta row + excerpt), **CaseStudyCard** proof/status-led
(status badge), **ToolCard** catalog/connection-led (category tile + connects-with chips),
**RoadmapCard** planning/sequence-led (business-type badge + numbered phase sequence). No single
"mega-props" component, and the icon placement / internal layout differ per family.

## 9. Tools migration (§E)

`CosmicPageHero → PageHeader` (light; eyebrow "Tools", plain H1 "Tools we help you choose,
configure and connect", primary "Build my growth plan" + secondary "Browse the areas", trust
note "Accounts and billing stay in your name." — the overlapping ownership clause dropped from
the lead so the point is made once). Legacy `SectionShell → alt` surface. `BentoCard →
CardGrid(equal) + ToolCard`, one per real tool, no arbitrary first-card enlargement, no
brand-logo grid, no fake filter/search. `FinalCtaBannerSection → FinalCtaSection` reinforcing a
small, well-connected stack. URL, metadata, canonical, breadcrumb + ItemList JSON-LD,
tool/category loading, status gating, all ten destinations and server rendering are preserved.

## 10. Roadmaps migration (§F)

`CosmicPageHero → PageHeader` (light; eyebrow "Roadmaps", plain H1 "Suggested roadmaps for
common situations", primary "Build my growth plan" + secondary "Browse the roadmaps", trust
note "This is the map, not a fixed route." — the verbatim sentence removed from the lead).
Legacy `SectionShell → light` surface (chosen so the tinted RoadmapCards read best and the band
is distinct from the alt-surface tool areas). `BentoCard → CardGrid(editorial, no featured) +
RoadmapCard`, one per real roadmap, with real ordered phase titles. `FinalCtaBannerSection →
FinalCtaSection` that states a personal plan is tailored during discovery. URL, metadata,
canonical, breadcrumb + ItemList JSON-LD, roadmap/business-type loading, status gating, every
destination, all phase titles/ordering and server rendering are preserved.

## 11. What intentionally remained legacy / out of scope

`CosmicPageHero`, `GlowButton`, `NodeOrb`, `BentoCard`/`BentoGrid` and `FinalCtaBannerSection`
are all unchanged and keep their many other consumers (removed only from `/tools` and
`/roadmaps`). `tools.ts`, `tool-categories.ts`, `roadmaps.ts` and `business-types.ts` are **not**
rewritten. Not migrated: `/tools/[slug]`, `/roadmaps/[slug]`, article/case-study detail pages,
services/goals/business-type/growth-stage routes, the homepage, contact/growth-plan/
troubleshooter, and `ServiceDomainTemplate`. No root body/themeColor/colorScheme flip; no legacy
token or galaxy component deleted.

## 12. Tests actually run

- **Unit (Vitest): 325 pass (21 files).** New `v2-catalog-cards` (ToolCard + RoadmapCard:
  whole-card link, H3, labels/icon, max-3 chips + truthful +N, singular/plural phase overflow,
  missing-connection handling, no duration/progress/brands). Updated `v2-cards` (verified needs
  + shows truthful context; a compile-time `@ts-expect-error` test that verified cannot be
  written without context and illustrative forbids it). New `v2-chrome` probe tests.
- **E2E (Playwright + axe): full suite pass.** New `catalog-hubs` — `/tools` and `/roadmaps`:
  one plain H1, whole-card links with H3, connection chips are spans, an ordered `<ol>` phase
  sequence, no first-card feature, night `FinalCtaSection` (not the legacy banner), no cosmic
  canvas / gradient word, no horizontal overflow at 320/360/390/768/1024/1160/1280/1440,
  current-nav `aria-current="location"` on the hub **and** the legacy detail routes, the Learn
  reassurance appearing once, and a targeted axe sweep (0 serious/critical) on `/tools`,
  `/tools/[slug]`, `/roadmaps`, `/roadmaps/[slug]`. The existing `content`/`routes`/
  `rebrand-pages`/`navigation`/`layout`/`chrome-adaptive` suites (incl. the migrated pages)
  remain green.

## 13. Zoom, responsive and accessibility results

0 serious/critical axe violations across the touched pages (hubs + one legacy detail each, plus
the Phase 2D sweep). No horizontal overflow at any tested width (320–1440) on `/tools` and
`/roadmaps`; the adaptive header still collapses to compact under 200% text at 1160/1280/1440
with no interactive measurement element. One H1 per page, no heading skips, correct grid order,
long tool/roadmap titles wrap, each card is one keyboard tab stop with a visible focus ring
matching hover, reduced-motion honoured, and current-nav state is exposed on both hub and detail
routes.

## 14. Missing content relationships encountered

**None.** Every tool's `connectsWith` slug resolves to a real `ToolCategory`, every tool's
`categorySlug` resolves, and every roadmap's `forBusinessTypeSlug` resolves to a real
`BusinessType`. The safe fallbacks are implemented defensively per §G — unresolved category →
tone falls back to `var(--v2-ink-muted)` and label to "Tool area"; unresolved business type →
"Business roadmap" — but the current seed data does not trigger them. No content was added,
repaired or invented.

## 15. Known limitations

- The domain-colour bridge remains a migration bridge: `tool-categories.ts` and
  `business-types.ts` still carry legacy accent-palette tokens, mapped at render time.
- `RoadmapCard`'s "two-column reading rhythm on wider screens" is delivered via the editorial
  `CardGrid` (two cards per row on tablet/desktop); the card's own phase list stays a single
  ordered column, which is the clearest reading order for a sequence.
- Preview URLs are internal only: `/design-preview` (component gallery, incl. the new ToolCard
  and RoadmapCard sections) and `/design-preview/shells` — both `noindex,nofollow`, off-nav and
  off-sitemap. No screenshots are attached (headless run); the pages render the real components.

## 16. Recommended scope for Phase 2F

Migrate the **detail** templates that these hubs link to — `/tools/[slug]` and
`/roadmaps/[slug]` — onto the V2 system (PageHeader + explicit V2 surfaces + the card
families + FinalCtaSection), preserving each page's structured data, phase/tool relationships
and honesty language, and adding a detail-level `RoadmapCard`/phase view. Keep article and
case-study detail pages, services/goals/business-type routes, the homepage, the conversion
routes and `ServiceDomainTemplate` out of that phase.
