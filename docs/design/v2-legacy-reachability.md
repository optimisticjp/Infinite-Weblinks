# V2 Legacy Reachability & Removal Report

Proof-based classification of the legacy visual components and design tokens at Phase 2S, and the
removal decisions taken. Reachability was established with a repository-wide, import-only graph
(real `import` statements, not comment mentions) plus TypeScript/build verification — a component is
**not** called dead merely because no route currently renders it, and **not** called live merely
because a dead registry imports it. Every deletion below keeps `npm run typecheck`, `npm run build`,
`npm run cf:build` and the full Playwright suite green.

Decisions: **remove** (proven-dead, deleted in 2S) · **retain-intentionally** (live) · **retain**
(kept for a documented reason).

---

## 1. The two dead clusters (removed in Phase 2S)

### Cluster A — the orphaned section-registry system (Commit 7)

The homepage was migrated in Phase 2K to explicit `Homepage*Section` components + `FinalCtaSection`;
**no route renders `HomepageSections` / the section registry**, and `getHomepageSections` is never
called. That makes the whole registry system — and every section reachable *only* through it — dead.

| Removed | Evidence |
|---|---|
| `sections/registry.tsx` (`HomepageSections`) | zero importers (only two tests read it as text) |
| `getHomepageSections` + its config array (`lib/content/index.ts`) | zero callers (homepage uses `getHomepageOpening`) |
| `SectionType`, `SectionConfig` (`content/types.ts` + barrel re-export) | consumed only by the registry + `getHomepageSections` |
| `FinalCtaBannerSection` (+ css) | imported **only** by `registry.tsx` |
| 14 registry-only sections (+ css): `GrowthJourneySection`, `GoalExplorerSection`, `ConnectedSystemSection`, `CustomerJourneySection`, `ConnectedExamplesSection`, `AccountOwnershipSection`, `ServicesExplorerSection`, `ToolUniverseSection`, `DeliveryModelsSection`, `WhyInfiniteWeblinksSection`, `CaseStudyShowcaseSection`, `TestimonialWallSection`, `LearningResourcesSection`, `FaqSection` | each imported only by `registry.tsx` |
| 5 orphaned home sections (+ css): `GoalBentoSection`, `OneSystemSection`, `ConnectedGrowthSection`, `ServicesConstellationSection`, `HonestExpectationsSection` | zero importers |
| Freed viz (+ css): `ConnectorPath`, `RailBar`, `ConstellationLayout`, `StageTimeline` | reachable only from the orphaned home sections above |

A whole-set verification confirmed none of the 25 components is imported by anything outside the set.
`studio/` was not touched: no src-side Sanity mapping consumes `SectionType`/`SectionConfig`, so the
CMS content model is unaffected by the type removal.

### Cluster B — the leaves freed by the 2S migrations + the cosmic viz (Commit 8)

The 2S status-screen migration dropped `CosmicBackground` + `GlowButton` from the 404/error path, and
the 2S examples migration dropped `PageHero`/`HubGrid`/`IndexCard`/legacy `ProofDetail` from
`/examples`. That leaves these with no live importer:

| Removed | Evidence (real importers after Commits 5–6) |
|---|---|
| `GlowButton` (+ css) | only `error.tsx`/`not-found.tsx` (migrated to `Button`) + the orphaned home sections (Cluster A) |
| `PageHero` (+ css) | only `ProofDetail` + `examples/page.tsx` (both migrated to `PageHeader`) |
| `HubGrid`, `IndexCard` (+ css) | only `examples/page.tsx` (migrated) |
| `CosmicPageHero` (+ css) | zero real importers (only a comment in `PageHeader`) |
| `CosmicBackground` (+ css) | after removing the unused `SectionShell` legacy `background` branch + `CosmicPageHero`, and the status migration, it has no live render path |
| `GlobeArc`, `Starfield`, `StarfieldLazy` (+ css) | children of `CosmicBackground` (and `GlobeArc` of the removed `FinalCtaBannerSection`) — dead once it is |

`SectionShell` keeps its `light`/`alt`/`night` surfaces; its unused `legacy` (`theme-cosmic` +
`CosmicBackground`) branch is removed (no live caller passed `background`; only the orphaned home
sections used the legacy default) and the default surface becomes `light`.

---

## 2. Dead tokens removed (Phase 2S, Commit 8)

Every token below had **no** consumer outside its own definition (searched across `.css`, `.tsx`,
`.ts`). Verified by the CSS token census.

- **Theme class:** `.theme-statement` (+ its exclusive `--grad-violet-pink`).
- **After the cosmic cascade:** `.theme-cosmic` and the `--space-navy/-input/-heading/-body/-muted`
  group it alone kept alive (plus `--space-surface-2`, `--radius-panel` — dead outright).
- **Glows:** `--glow-pink`, `--glow-orange`, `--glow-cyan`, `--glow-lime`, `--glow-blue`,
  `--glow-ambient`, `--glow-float`.
- **Gradients:** `--grad-cyan-blue`, `--grad-lime`, `--grad-banner`.
- **Legacy domain aliases:** `--domain-search`, `--domain-ecom`.

---

## 3. Retained — live (retain-intentionally)

| Component / token | Why kept |
|---|---|
| `InfinityMark` | live on `/learn/[slug]` (decorative) + the restrained status mark |
| `BentoGrid`, `BentoCard`, `NodeOrb` | live on `/resources` (V2 light surface; NodeOrb hidden by CSS there) |
| `SectionShell`, `PageHeader`, `Card`, `CardGrid`, `Callout`, `Button`, `FinalCtaSection` | the V2 kit |
| The 7 `--domain-*` constellation hues | pervasive wayfinding (~150 refs across `lib/services/domains.ts`, content data, the domain bridge) |
| `theme-light`, `theme-light-alt`, `theme-night` | the V2 surfaces |
| `theme-band` (+ its exclusive `--band` / `--band-ink` / `--band-ink-2`) | **LIVE — retained.** Real consumers: `EditorialStatement.tsx:44` (rendered by the homepage `HomepageProblemSection`) and `ProcessStepsSection.tsx:31` (rendered by `WorkProcessSection` on `/how-it-works`). |
| `theme-dark` (+ `hero/Hero.tsx`) | **DEAD — removed (Phase 3A).** Its only reference was `hero/Hero.tsx`, which had **zero importers** (orphaned). The class + `hero/Hero.tsx`/`.module.css` were removed; the cascade also freed `.iw-gradient-text` (Hero was its sole consumer) and `--grad-text`, both removed. |
| `theme-band-bright` (+ `--band-bright` / `--band-bright-raised` / `--band-ink-3`) | **DEAD — removed (Phase 3A).** After the Cluster A/B deletions it had **no consumer at all** (only its own definition). The class and its three exclusive tokens were removed. |
| `GlobeArc`/`Starfield` **were** kept until the cosmic cascade proved them dead in Commit 8 | — |
| `lib/design/domainColor.ts` (migration bridge) | live: maps legacy + base tokens to accessible V2 inks, used across the card set |

---

## 4. Non-existent

`GalaxyEngine` — searched for; **does not exist** anywhere in the repository (no definition, no
reference). Listed as a candidate in the brief but there is nothing to remove.

---

## 5. Method note

For each name: (a) real import statements only (comment mentions excluded); (b) transitive
production-route reachability; (c) test-only / preview-only / registry-only / studio consumers
called out separately. Deletions proceed in reviewable commits (Cluster A → re-census → Cluster B +
tokens), with `typecheck`/`build`/`cf:build`/full-e2e green at each step, and the test guards that
asserted a removed file's existence updated to assert its absence.
