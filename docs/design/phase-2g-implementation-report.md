# V2 Phase 2G — Implementation Report

**Scope:** The article and illustrative-case detail system — migrating the `/learn/[slug]` and
`/case-studies/[slug]` dynamic templates onto V2 — plus three contained Phase 2F corrections.
Compatibility-first and additive, on branch `claude/infinite-weblinks-v2-design-yb1yi3`.
Governing spec: `docs/design/v2-design-spec.md`.

**Status:** Complete. `npm run lint`, `npm run typecheck`, `npm run test` (495 unit) and
`npm run build` all pass. On the e2e suite (Playwright + axe), the migrated `/learn` and
`/case-studies` targets and their new specs pass; the full `npm run test:e2e` invocation was
**not a clean single-run pass** — see §15 for the one observed intermittent failure and its
successful reruns.

---

## 1. What Phase 2G accomplished

- Fixed three Phase 2F issues: an idempotent domain-colour bridge, real roadmap phase-jump
  navigation, and removal of the hidden legacy orb markup from the tool detail (via a new
  DomainCard).
- Added three components: **DomainCard**, **ArticleMetaLine** and **ScenarioApproachList**.
- Migrated **`/learn/[slug]`** (single semantic article, calm light reading surface) and
  **`/case-studies/[slug]`** (unmistakably illustrative) off the cosmic components.
- Extended previews, integrity and token-hygiene coverage. Nothing outside the two named
  dynamic templates was migrated.

## 2. Files changed

| Area | Files |
|---|---|
| Bridge | `lib/design/domainColor.ts` (idempotent) |
| Components | `cards/DomainCard.tsx`+css, `routes/ArticleMetaLine.tsx`+css, `routes/ScenarioApproachList.tsx`+css (new); `routes/RoadmapPhaseList.tsx`+css (phase-jump) |
| Templates | `learn/[slug]/page.tsx`+`article.module.css`, `case-studies/[slug]/page.tsx`+`case.module.css`, `tools/[slug]/page.tsx` (DomainCard swap), `roadmaps/[slug]/page.tsx` (lead) |
| Preview | `design-preview/page.tsx` |
| Tests | `unit/v2-domain-color`, `unit/v2-roadmap-phases`, `unit/v2-catalog-cards`, `unit/v2-token-hygiene` (extended); `unit/v2-article-meta`, `unit/v2-scenario-approach`, `unit/v2-article-case-integrity`, `e2e/article-case-detail` (new) |
| Docs | `docs/design/phase-2g-implementation-report.md` |

## 3. Domain-token idempotence correction (§B1)

The bridge now recognises its own V2 domain-role outputs (`--v2-domain-{X}-ink` / `-tint` /
`-line`) alongside the legacy `--domain-*` and accent-palette tokens. So
`domainInk(domainInk(t)) === domainInk(t)`, `domainTint(domainTint(t)) === domainTint(t)`, and
ink↔tint round-trips within a domain (`domainTint(domainInk(t))` → the domain tint;
`domainInk(domainTint(t))` → the domain ink). Unknown/absent input and raw colour values
(`#…`, `rgb(…)`) still fall back safely; existing legacy mappings are unchanged; output is only
ever a `var(--v2-*)` token. A component API may now truthfully say it accepts a legacy OR a V2
domain-role token. Covered by new idempotence + raw-colour-fallback tests.

## 4. Roadmap phase-jump navigation (§B2)

`RoadmapPhaseList` now renders a compact semantic `nav` (`aria-label="Roadmap phases"`) before
the list — one LinkChip per phase linking to its stable `#phase-N` anchor, real phase title as
the label, in source order, wrapping cleanly (no horizontal scroll, dropdown, sticky behaviour
or client state). Each phase target gained `scroll-margin-top: calc(var(--header-h) +
var(--space-4))` so the fragment clears the sticky header. The static phase `<li>` is not made
focusable and the decorative marker stays aria-hidden. The roadmap detail section lead now
refers to the phase links. Validated by an e2e that checks the nav, the hrefs, the scroll-margin
and a live `#phase-3` jump.

## 5. DomainCard design and tool-detail cleanup (§B3, §C)

**DomainCard** — a restrained whole-card link to a service domain (flat IconTile, optional
eyebrow, H3 title, short description, quiet affordance) on a raised surface with a semantic
border, neutral shadow, ≤2px hover matched by focus, reduced-motion-safe; long text wraps.
Colour resolves through the bridge to an accessible ink; no node-orb, glow, glass, gradient,
giant artwork, fixed height, raw colour or legacy token as text. The tool detail's related-domain
section now uses `CardGrid(equal) + DomainCard` — **no BentoCard and no hidden NodeOrb markup**
in that section; every domain destination/name/intro/icon is preserved, none featured. The
`/tools` hub and other BentoCard consumers are untouched.

## 6. ArticleMetaLine semantics (§D)

An inline-safe server component (reading time · date · organisation author) built from inline
elements only, so it lives inside PageHeader's trustNote paragraph. Reading time shows only when
present; a `<time dateTime>` is emitted **only for a real, parseable** publication date (invalid
or absent dates are safely omitted, never invented; the ISO is preserved in `dateTime`, the
label is readable en-GB); the author is always the organisation, never a fabricated individual;
no avatar, no "updated" date, no client component.

## 7. Learn article-detail migration (§F)

A single semantic `<article>` holds the PageHeader (light, compact; breadcrumbs Learn / title;
eyebrow = real related-goal label or "Guide"; mapped V2 accent; plain H1 = `article.title`; lead
= `article.excerpt`; trustNote = ArticleMetaLine), the calm light reading body (paragraphs
one-for-one in source order at a ~66ch measure — no invented headings/pull-quotes/progress), and
a non-glowing organisation byline. **The excerpt appears once.** Related goals (all resolved, not
only the first) use one RelationshipCard of LinkChips to `/goals/[slug]`; more guides use
ArticleCard + CardGrid (no featured) — both after the article, then FinalCtaSection. Removed:
ScrollThread, CosmicBackground, theme-cosmic surfaces, the glowing InfinityMark, BentoCard/Grid,
FinalCtaBannerSection, `--hue`, the cosmic article CSS.

## 8. ScenarioApproachList design (§E)

A case-scenario-specific server component: a semantic `<ol>` of restrained light step panels,
each with a compact visible sequence number (decorative — the list carries the order, so no
duplicate announcement), a flat IconTile in the step's mapped V2 tone, an H3 label and its
detail. A simple wrapping 1/2/3-column grid, never a forced single row — no ConnectorPath, SVG
path animation, node-orb, glow, starfield, fixed height, scroll-jacking, fake progress or
outcome claim. Steps are distinguished by number/label/icon/text, not colour alone, and it stays
understandable with CSS disabled.

## 9. Case-scenario-detail migration (§G)

`CosmicPageHero → PageHeader` (light; eyebrow "Illustrative example", mapped V2 accent, plain H1
= title, lead = summary, primary "Build my growth plan" + secondary "See the approach", trust
note = a visible "Illustrative example" information Badge + the real `forWho`). The challenge
sits on a V2 alt surface with its full text and a **prominent Callout disclosure** ("This is an
illustrative example, not a real client."). The approach uses ScenarioApproachList (steps, order,
labels, details, icons and mapped tones preserved; connectors and node-orbs removed). Work is a
plain semantic list with a decorative marker. The StatCard becomes an **honest qualitative
outcome Card**: an "Illustrative outcome" Badge, the result label/value at a restrained size, the
qualitative outcome, and a "Qualitative example, not a measured client result." clarification —
no stat styling, large numeric, chart, percentage or trend. Related domains use DomainCard +
CardGrid (no BentoCard, no hidden node-orb, none featured). `FinalCtaBannerSection →
FinalCtaSection`. Removed: CosmicPageHero, GlowButton, NodeOrb, ConnectorPath, StatCard,
BentoCard/Grid, `--hue`, cosmic case CSS.

## 10. Structured data preserved

- **Learn detail:** `blogPostingJsonLd` (datePublished only when supplied — no article has one,
  so none is emitted) + breadcrumb. `generateStaticParams`/`generateMetadata` (dynamic
  title/description/canonical + `article.publishedTime` only when present)/`notFound` unchanged.
- **Case detail:** breadcrumb only — the deliberate absence of Review / AggregateRating /
  result / testimonial schema is maintained (asserted by e2e). Metadata/canonical/`notFound`
  unchanged.

## 11. Proof and honesty safeguards

No copy rewritten; no verified/client/testimonial/rating/numeric content added. Each case page
carries the illustrative status twice (header Badge + prominent challenge Callout), the outcome
is explicitly "Illustrative outcome" + "not a measured client result", and the CTA states it is
"an illustrative example, not a delivered result". Article dates and authors are never invented
(no article has a date → none renders; author is always the organisation). The removed
verified-looking demonstrations from Phase 2F stay removed.

## 12. Relationship-integrity results

All references resolve for every renderable article (5) and scenario (5), verified by
`tests/unit/v2-article-case-integrity.test.ts`. Resolved / total:

| Relationship | Resolved | Unresolved |
|---|---|---|
| article → related goal | 2 | 0 |
| scenario → service category | 20 | 0 |
| scenario hue → domain | 5 | 0 |
| scenario approach-step hue → domain | 17 | 0 |

Articles with a publication date: **0** (so no date is rendered anywhere). Articles with a
related goal: 2 of 5 (the other 3 omit the related-goals card, as designed).

## 13. Missing or unresolved relationships

**None.** No article or scenario detail relationship is unresolved in the current seed.
Production uses safe omission (`.filter(Boolean)`), so a *future* CMS edit with one unresolved
optional relationship omits that single link/goal rather than throwing; the integrity test turns
such a seed defect into an immediate red test. No entities, labels, dates or outcomes were
invented.

## 14. What intentionally remained legacy / out of scope

`CosmicPageHero`, `GlowButton`, `NodeOrb`, `ScrollThread`, `CosmicBackground`, `ConnectorPath`,
`StatCard`/`FloatingCards`, `InfinityMark` (glow), `BentoCard`/`BentoGrid` and
`FinalCtaBannerSection` are all unchanged and keep their many other consumers (removed from the
two migrated templates only; InfinityMark is kept non-glowing in the article byline). No seed
dataset was rewritten; no route URL or anchor changed. Not migrated: services, goals, business
types, growth stages, the homepage, contact, growth-plan, troubleshooter and `ServiceDomainTemplate`.
No root body/themeColor/colorScheme flip; no legacy token or galaxy component deleted.

## 15. Tests actually run

- **Unit (Vitest): 495 pass (27 files).** New: `v2-article-meta`, `v2-scenario-approach`,
  `v2-article-case-integrity`; DomainCard added to `v2-catalog-cards`; domain idempotence added
  to `v2-domain-color`; phase-jump added to `v2-roadmap-phases`; hygiene extended to DomainCard,
  ArticleMetaLine, ScenarioApproachList and both detail modules.
- **E2E (Playwright + axe): one observed intermittent failure, not a clean original full-suite
  pass.** On the full `npm run test:e2e` run, a single spec —
  `/services/social-media` "renders template with one H1 and anchored services, no overflow" (in
  the `service-domains` suite, an *unchanged* Phase 2G-external route) — failed **once** under
  full parallel worker load. It is an observed intermittent (flaky) failure, not a reproduced
  defect: re-running that spec in isolation passed (2/2), and re-running the whole
  `service-domains` suite passed (32/32). **No service, service-domain, or other application
  file was changed in Phase 2G** — the migration touched only `/learn/[slug]`,
  `/case-studies/[slug]` and the additive new components — so the failure is attributable to
  test-run scheduling under parallel load, not to any change in this phase. Per flake discipline,
  no service-route presentation was altered, no assertion weakened, no sleep added and no timeout
  broadly raised to "fix" it. The migrated targets and their new `article-case-detail` spec pass:
  it crawls all five article + five scenario routes (one H1, semantic `<article>`, no cosmic
  canvas / legacy banner / visible node-orb, V2 FinalCtaSection), structural checks (excerpt once,
  ordered paragraphs, org byline, meta + related goals/guides; illustrative Badge + Callout,
  ordered approach steps, work list, honest qualitative outcome with no `%`, DomainCards, no
  Review/AggregateRating), the roadmap phase-jump fragment navigation (scroll-margin clears the
  header), a representative axe matrix, and responsive no-overflow at 320–1440. The existing
  `content`/`rebrand-pages`/`catalog-hubs`/`content-hubs`/`detail-pages`/`navigation`/`layout`/
  `chrome-adaptive` suites passed.

## 16. Responsive, zoom and accessibility results

0 serious/critical axe on the representative article + scenario matrix and the prior sweeps. No
horizontal overflow at any tested width (320–1440) on the article and case detail pages; article
reading measure ~66ch; one H1 per page with no heading skips (H1 → section H2 → step/card H3);
paragraph and approach order preserved; visible honesty labels; the illustrative outcome carries
no statistic styling; phase-jump fragments resolve and clear the sticky header; long labels wrap;
LinkChips are ≥44px targets with visible focus matching hover; reduced motion honoured; the
adaptive header holds at 200% text; and current-nav state is exposed on the detail routes.

## 17. Preview URLs and screenshots

Internal only, `noindex,nofollow`, off-nav and off-sitemap: `/design-preview` (now including
"Article & scenario detail blocks": DomainCard incl. a long wrapping title, ArticleMetaLine with
and without a date, a three-step ScenarioApproachList, and a qualitative illustrative-outcome
Card; the RoadmapPhaseList preview shows the phase-jump nav) and `/design-preview/shells`. No
screenshots are attached (headless run); the pages render the real components.

## 18. Known limitations

- The domain-colour bridge remains a migration bridge: seed content (goals, service/tool
  categories, business types, scenario hues) still carries legacy tokens, mapped to accessible V2
  ink/tint at render time (now idempotently).
- The Learn reading body renders `<p>` paragraphs only (the seed carries no headings/lists); the
  richer prose element styles are present defensively but unused by current content.
- No Learn article carries a publication date, so `ArticleMetaLine`'s `<time>` path is exercised
  only in tests and the preview, never in production content.

## 19. Recommended scope for Phase 2H

Migrate the next cosmic-kit surface that most benefits users — the **`/goals/[slug]`** and
**`/business-types/[slug]`** detail templates — onto PageHeader + explicit V2 surfaces + the
card/chip system + FinalCtaSection, reusing DomainCard / RelationshipCard / LinkChip for their
service, stage and goal relationships and preserving each page's structured data and honesty
language. Keep the service-category routes, growth-stage routes, the homepage, the conversion
routes and `ServiceDomainTemplate` out of that phase.
