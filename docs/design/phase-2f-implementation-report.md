# V2 Phase 2F — Implementation Report

**Scope:** The tool and roadmap DETAIL system — migrating the `/tools/[slug]` and
`/roadmaps/[slug]` dynamic templates (all currently renderable tool and roadmap detail pages)
onto the V2 system, with three new shared building blocks. Compatibility-first and additive,
on branch `claude/infinite-weblinks-v2-design-yb1yi3`. Governing spec:
`docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (410 unit),
`npm run build` and `npm run test:e2e` (full Playwright + axe suite) all pass.

---

## 1. What Phase 2F accomplished

- Added three shared building blocks: **LinkChip** (internal nav link), **RelationshipCard**
  (a static group of related destinations), and **RoadmapPhaseList** (the roadmap-specific
  ordered phase sequence).
- Migrated **`/tools/[slug]`** and **`/roadmaps/[slug]`** off the cosmic components onto the V2
  system, preserving every route, relationship destination, structured-data node and honesty
  line.
- Extended the internal preview and added relationship-integrity + token-hygiene coverage.
  Nothing outside the two named dynamic templates was migrated.

## 2. Files changed

| Area | Files |
|---|---|
| Primitives | `primitives/LinkChip.tsx` + `.module.css` (new) |
| Cards | `cards/RelationshipCard.tsx` + `.module.css` (new) |
| Routes | `routes/RoadmapPhaseList.tsx` + `.module.css` (new) |
| Templates | `tools/[slug]/page.tsx` + `tool.module.css` (rewritten); `roadmaps/[slug]/page.tsx` + `roadmap.module.css` (rewritten) |
| Preview | `design-preview/page.tsx` (added detail building blocks) |
| Tests | `unit/v2-relationship`, `unit/v2-roadmap-phases`, `unit/v2-detail-integrity` (new); `unit/v2-token-hygiene` (extended); `e2e/detail-pages` (new) |
| Docs | `docs/design/phase-2f-implementation-report.md` |

## 3. LinkChip semantics

A compact **internal** navigation link (real Next `<Link>`), distinct from the static `Chip`
(informational text). It has a ≥44px pointer target, a visible focus ring, focus/hover parity,
a clear pressed state, and hover only on `(hover: hover) and (pointer: fine)`. Long labels wrap
safely and are never truncated. `tone` maps through the domain-colour bridge to an accent
(icon + hover/focus border) — never body text or a raw value. No glow/glass/gradient;
reduced-motion-safe. It must not be nested inside a whole-card link (the detail templates place
it only inside RelationshipCard / RoadmapPhaseList, never inside a Card `href`).

## 4. RelationshipCard design

A static grouping card (NOT a whole-card link) collecting a real set of destinations — usually
LinkChips. A clear H3 title, an optional description and a flat IconTile on a neutral raised
surface with a semantic border and neutral shadow. No glow/glass/giant illustration/fixed
height. It renders **nothing** when it has no relationship children, so callers can never
produce an empty card. One reusable component serves "Connects with", "Where it fits in the
journey", "Suits these businesses" and "Related service domains".

## 5. RoadmapPhaseList design

A roadmap-specific server component rendering the suggested sequence as a semantic ordered
list. Each phase keeps its stable `phase-N` anchor id, a compact numbered marker (decorative —
the `<ol>` carries the order, so it is not announced twice), an H3 title, a summary, and
LinkChips to its resolved stage/services/goals. A restrained vertical sequence with a **neutral
(non-gradient) connector line** — no node-orb, glow, starfield, timeline illustration, sticky
scroll-jacking, animated path, fixed viewport height, fake progress, completion percentages or
invented durations. It stays understandable with CSS disabled and needs no alternate
interaction under reduced motion.

## 6. Tool detail migration

`CosmicPageHero → PageHeader` (light; breadcrumbs Tools / tool name, eyebrow = real category
name or "Tool area", mapped V2 accent, plain H1 = `tool.name`, lead = `tool.whatItDoes`,
primary "Build my growth plan", secondary "Why it matters", trust note "Accounts and billing
stay in your name.", and a restrained aside = a real static Card + flat IconTile). A
two-column "why it's useful / when it isn't" (a Card + an information Callout); example tools as
static Chips with the truthful "Examples only…" clarification; ownership as a single neutral
Callout. Related service domains as **medium** V2 BentoCards (no featured, mapped accent, real
name/intro/icon, `/services/[category]` preserved; the BentoCard's legacy node-orb is
`display:none` on the V2 surface, so none is visible). "Where it fits" is a CardGrid of
RelationshipCards (Connects with / Where it fits in the journey / Suits) built from LinkChips,
empty groups omitted. `FinalCtaBannerSection → FinalCtaSection`. `tool.module.css` rewritten to
V2 semantic tokens only. `getServiceDomainConfig` dropped from this template (still used
elsewhere).

## 7. Roadmap detail migration

`CosmicPageHero → PageHeader` (light; breadcrumbs Roadmaps / roadmap name, eyebrow "Suggested
roadmap", mapped V2 business-type accent, plain H1 = `roadmap.name`, lead = `roadmap.intro`,
primary "Build my growth plan", secondary "All roadmaps", trust note "This is a map, not a
fixed route."). The business-type summary is one restrained whole-card-link Card (flat IconTile
+ name + summary, mapped tone, `/business-types/[slug]`) — not a giant hero, no node-orb, no
nested interaction; omitted when unresolved. The phase sequence uses RoadmapPhaseList on a V2
light surface, preserving every `phase-N` anchor, title and summary in source order.
`FinalCtaBannerSection → FinalCtaSection` making clear the plan is tailored during discovery.
The "rough shape / not a fixed script / tailored during discovery" meaning is split across the
header, section lead and CTA — each said once. `roadmap.module.css` rewritten (cosmic timeline
+ gradient connector removed; RoadmapPhaseList owns the neutral connector).

## 8. Structured data preserved

- **Tool detail:** `articleJsonLd` (unchanged title/description/path) + `breadcrumbJsonLd`
  (Home / Tools / tool). `generateStaticParams`, `generateMetadata` (dynamic title/description/
  canonical) and `notFound` unchanged.
- **Roadmap detail:** `breadcrumbJsonLd` (Home / Roadmaps / roadmap) + `itemListJsonLd` over the
  phases with `#phase-N` paths (ids and order unchanged). `generateStaticParams`,
  `generateMetadata` and `notFound` unchanged.

## 9. Relationship-integrity results

Every referenced entity resolves for all renderable tools and roadmaps (10 tools, 7 roadmaps),
verified by `tests/unit/v2-detail-integrity.test.ts` (which mirrors the template resolutions,
including the derived ones) and by the existing `content-integrity.test.ts`. Resolved / total:

| Relationship | Resolved | Unresolved |
|---|---|---|
| tool → category | 10 | 0 |
| tool → related service (→ service DOMAIN) | 50 | 0 |
| tool → unique related domains (rendered) | 21 | 0 |
| tool `connectsWith` → tool in that category | 30 | 0 |
| tool → stage | 11 | 0 |
| tool → suits business type | 48 | 0 |
| roadmap → business type | 7 | 0 |
| roadmap phase → stage | 22 | 0 |
| roadmap phase → service | 66 | 0 |
| roadmap phase → goal | 27 | 0 |

## 10. Missing or unresolved relationships

**None.** No tool or roadmap detail relationship is unresolved in the current seed. Production
still uses safe omission (`.filter(Boolean)`), so a *future* CMS edit with one unresolved
optional relationship omits that single link rather than throwing; the integrity test is what
turns such a seed defect into an immediate red test. No replacement entities or labels were
invented; the defensive fallbacks (category → "Tool area" + `--v2-ink-muted`; business type →
omit the built-for section) exist but are not triggered by current data.

## 11. What intentionally remained legacy / out of scope

`CosmicPageHero`, `GlowButton`, `NodeOrb`, `BentoCard`/`BentoGrid` and `FinalCtaBannerSection`
are all unchanged and keep their many other consumers (removed only from the two migrated
templates; BentoCard is still used on the tool detail as a flat V2 card). No seed dataset was
rewritten; no route URL or anchor changed. Not migrated: `/learn/[slug]`, `/case-studies/[slug]`,
services, goals, business types, growth stages, the homepage, contact, growth-plan,
troubleshooter, and `ServiceDomainTemplate`. No root body/themeColor/colorScheme flip; no legacy
token or galaxy component deleted.

## 12. Tests actually run

- **Unit (Vitest): 410 pass (24 files).** New: `v2-relationship` (LinkChip vs Chip semantics,
  target/icon/tone, RelationshipCard h3/description/children, no whole-card nesting, no empty
  render); `v2-roadmap-phases` (ordered list, source order, stable ids, h3, stage/service/goal
  links, omitted empty groups, no node-orb/progress/duration); `v2-detail-integrity` (every
  template relationship resolves, 0 unresolved). Extended: `v2-token-hygiene` (both detail
  modules + the three new components scanned for `--domain-*`/`--hue`/base-palette/`--border-glow`
  /glow/glass/gradient/backdrop-filter/raw colour — all clean).
- **E2E (Playwright + axe): full suite pass.** New `detail-pages`: a crawl of all ten tool +
  seven roadmap routes (one H1, no cosmic canvas / legacy CTA banner / gradient word / visible
  node-orb, V2 FinalCtaSection, `/growth-plan` CTA, no overflow at 360/1280), structural checks
  (RelationshipCards, example-tool disclaimer, ownership, ordered phase anchors with
  stage/service/goal LinkChips, deep `#phase-3` navigation), a representative axe matrix
  (0 serious/critical), and responsive no-overflow at 320/360/390/768/1024/1160/1280/1440. The
  existing `content`/`routes`/`rebrand-pages`/`catalog-hubs`/`content-hubs`/`navigation`/`layout`/
  `chrome-adaptive` suites remain green (incl. the migrated detail pages).

## 13. Responsive, zoom and accessibility results

0 serious/critical axe violations on the representative detail matrix and the Phase 2D/2E
sweeps. No horizontal overflow at any tested width (320–1440) on the tool and roadmap detail
pages; one H1 per page with no heading skips (H1 → section H2 → card/phase H3); phase anchors
are keyboard-reachable and deep-linkable; long tool/relationship labels wrap; LinkChips are
≥44px targets with a visible focus ring matching hover; reduced motion is honoured; the adaptive
header still collapses under 200% text; and current-nav state exposes `aria-current="location"`
on the detail routes (they live under the Resources section).

## 14. Preview URLs and screenshots

Internal only, `noindex,nofollow`, off-nav and off-sitemap: `/design-preview` (component
gallery — now including the "Detail-page building blocks" section: LinkChip, RelationshipCard
with a long wrapping label, and a three-phase RoadmapPhaseList) and `/design-preview/shells`.
No screenshots are attached (headless run); the pages render the real components.

## 15. Known limitations

- The domain-colour bridge remains a migration bridge: stage / tool-category / service-category
  / business-type colours are still legacy accent-palette tokens, mapped to accessible V2 ink at
  render time.
- The related service domains on the tool detail use `BentoCard`, whose legacy node-orb markup
  is present but `display:none` on the V2 surface (no visible orb). A fully orb-free markup path
  would require either a RelationshipCard treatment (losing the domain intros) or a BentoCard
  variant that omits the legacy orb — deferred to avoid changing the shared component this phase.
- `RoadmapPhaseList` relies on native `<ol>`/`<li>` semantics for order (no explicit
  `role="list"`, to avoid a redundant-role lint); the visible numeric markers are aria-hidden.

## 16. Recommended scope for Phase 2G

Migrate the next detail/template family the site still renders on the cosmic kit — the
**`/learn/[slug]` article** and **`/case-studies/[slug]`** detail templates — onto PageHeader +
explicit V2 surfaces + the card/chip system + FinalCtaSection, preserving each page's BlogPosting
/ breadcrumb structured data, reading layout and honesty language (and the case-study
illustrative labelling). Keep services, goals, business-type and growth-stage routes, the
homepage, the conversion routes and `ServiceDomainTemplate` out of that phase.
