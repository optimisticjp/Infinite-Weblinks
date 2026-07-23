# V2 Final Route & Template Inventory

The complete App Router surface of Infinite Weblinks at the close of the V2 redesign (Phase 2S),
branch `claude/infinite-weblinks-v2-design-yb1yi3`. Route groups `(marketing)` and `(convert)` do
**not** appear in URLs. Every dynamic detail route exports `generateStaticParams` and gates unknown
slugs with `notFound()`. The `(marketing)` and `(convert)` layouts each render `<main id="main">`
so the root skip link (`#main`) resolves; the status surfaces render their own `<main id="main">`
outside chrome.

**Presentation legend** — V2 = migrated to the light-first V2 kit (PageHeader / SectionShell
light·alt·night, semantic tokens, no cosmic canvas). Every live route is V2. The reserved single
`theme-night` band is the V2 `FinalCtaSection` (a scoped dark section, never a page default).

---

## 1. Public · indexable · static (sitemap `staticPaths`, 20 entries)

| URL | Group | Content source | Header | Section surfaces | Final CTA | Structured data | No-JS | V2 |
|---|---|---|---|---|---|---|---|---|
| `/` | (marketing) | `getHomepageOpening()` | HomepageHeroSection (light) | light / alt / **night** | FinalCtaSection | Organization, WebSite | full (server) | ✅ |
| `/goals` | (marketing) | `getGoals`,`getBusinessTypes` | PageHeader | light / alt | FinalCtaSection | Breadcrumb, ItemList | full | ✅ |
| `/how-it-works` | (marketing) | delivery metadata | PageHeader | light / alt / night | FinalCtaSection | Breadcrumb | full | ✅ |
| `/services` | (marketing) | `getServiceCategories`,`getServices` | PageHeader | light / alt | FinalCtaSection | Breadcrumb, ItemList | full | ✅ |
| `/pricing` | (marketing) | exported pricing content | PageHeader | light / alt | FinalCtaSection | Breadcrumb | full | ✅ |
| `/tools` | (marketing) | `getToolCategories`,`getTools` | PageHeader | light / alt | FinalCtaSection | Breadcrumb, ItemList | full | ✅ |
| `/roadmaps` | (marketing) | `getRoadmaps`,`getBusinessTypes` | PageHeader | light / alt | FinalCtaSection | Breadcrumb, ItemList | full | ✅ |
| `/learn` | (marketing) | `getLearnArticles`,`getGoals` | PageHeader | light / alt | FinalCtaSection | Breadcrumb, ItemList | full | ✅ |
| `/resources` | (marketing) | `getLearnArticles` | PageHeader | light / alt | FinalCtaSection | Breadcrumb | full | ✅ (BentoGrid/BentoCard on V2 surface) |
| `/faq` | (marketing) | FAQ content | PageHeader | light / alt | FinalCtaSection | Breadcrumb, FAQPage | full | ✅ |
| `/about` | (marketing) | about content | PageHeader | light / alt | FinalCtaSection | Breadcrumb | full | ✅ |
| `/connected-growth` | (marketing) | connected-examples | PageHeader | light / alt | FinalCtaSection | Breadcrumb | full | ✅ |
| `/account-ownership` | (marketing) | ownership content | PageHeader | light / alt | FinalCtaSection | Breadcrumb | full | ✅ |
| `/case-studies` | (marketing) | `getCaseScenarios` (always renders scenarios) | PageHeader | light / alt | FinalCtaSection | Breadcrumb, ItemList | full | ✅ |
| `/contact` | (convert) | `getBusinessTypes`,`getStages`,`getGoals` | PageHeader | light / alt | — (form) | Breadcrumb | server render; **submit needs JS** | ✅ |
| `/privacy` `/cookies` `/terms` `/refunds` `/accessibility` | (marketing) | legal content (LegalPageView) | PageHeader (light) | light | — | Breadcrumb | full | ✅ |

`/contact` is deliberately indexable (a content-ful Contact page). Legal pages stay light and quiet.

## 2. Public · indexable · dynamic detail templates (9)

| URL pattern | `generateStaticParams` | Detail getter | Header | Final CTA | Structured data | No-JS | V2 |
|---|---|---|---|---|---|---|---|
| `/goals/[slug]` | `getGoals` | `getGoal` | PageHeader | FinalCtaSection | Breadcrumb | full | ✅ |
| `/services/[category]` (16) | `getServiceCategories` | category + `getServiceDomainConfig` | PageHeader (ServiceDomainTemplate) | FinalCtaSection | Breadcrumb, Service, ItemList | full | ✅ |
| `/tools/[slug]` | `getTools` | `getTool` | PageHeader | FinalCtaSection | Breadcrumb | full | ✅ |
| `/roadmaps/[slug]` | `getRoadmaps` | `getRoadmap` | PageHeader | FinalCtaSection | Breadcrumb | full | ✅ |
| `/learn/[slug]` | `getLearnArticles` | `getLearnArticle` | PageHeader | FinalCtaSection | Breadcrumb, Article | full | ✅ (InfinityMark, decorative) |
| `/business-types/[slug]` | `getBusinessTypes` | `getBusinessType` | PageHeader | FinalCtaSection | Breadcrumb | full | ✅ |
| `/starting-points/[slug]` (8) | `getStartingPoints` | `getStartingPoint` | PageHeader | FinalCtaSection | Breadcrumb | full | ✅ |
| `/case-studies/[slug]` | `getCaseScenarios` | `getCaseScenario` | PageHeader | FinalCtaSection | Breadcrumb | full | ✅ |
| `/examples/[slug]` | `getExamples` | `getExample` | **gated** (see §4) | — | Breadcrumb | full | ✅ (Phase 2S) |

Note: the `/business-types` and `/starting-points` **index** URLs 308-redirect into `/goals`
(see §5), but their `[slug]` **detail** pages remain live and prebuilt.

## 3. Public · noindex (conversion & internal)

| URL | Group | Directive | Header | V2 | No-JS |
|---|---|---|---|---|---|
| `/growth-plan` | (convert) | `index:false, follow` | PageHeader | ✅ | intro server; **progression needs JS** |
| `/troubleshooter` | (convert) | `index:false, follow` | PageHeader | ✅ | selector + first problem server; **switching needs JS** |
| `/design-preview` | (root) | `index:false, nofollow` | internal | ✅ | preview harness |
| `/design-preview/shells` | (root) | `index:false, nofollow` | internal | ✅ | preview harness |

`/design-preview` and `/design-preview/shells` are off-nav and off-sitemap (internal review only).

## 4. Gated (proof stays hidden until verified)

| URL | Behaviour | Structured data | V2 |
|---|---|---|---|
| `/examples` | `getExamples()` empty ⇒ `notFound()` (whole index 404s) | Breadcrumb, ItemList (only when records exist) | ✅ (Phase 2S: PageHeader + light SectionShell + CardGrid + ExampleCard + FinalCtaSection) |
| `/examples/[slug]` | `getExample(slug)` unresolved ⇒ `notFound()`; missing ⇒ noindex metadata | Breadcrumb (only when the record renders) | ✅ (Phase 2S: PageHeader + light content surface + FinalCtaSection) |

**Contract preserved exactly:** proof statuses, `generateStaticParams`, metadata, the 404 gate, and
the absence of Review/AggregateRating schema. No invented proof, no newly published record. The
latent templates are exercised through pure presentation components + unit fixtures — the production
routes stay gated. `/examples` is **not** merged with `/case-studies`.

## 5. Status surfaces

| Surface | File | Directive | Behaviour | V2 |
|---|---|---|---|---|
| 404 | `app/not-found.tsx` (server) | `index:false, follow` | self-contained `<main id="main">`; visible "404", message, "Back to home" + "Build my growth plan", helpful links | ✅ (Phase 2S) |
| Error boundary | `app/error.tsx` (**client**) | — | catches segment render/data errors; `reset()` retry + console logging; "Try again" + "Back to home" + helpful links | ✅ (Phase 2S) |

Both render outside marketing chrome so they survive layout-data failures. Phase 2S replaced the
cosmic StatusScreen (CosmicBackground + luminous InfinityMark + GlowButton + reconnect animation)
with a calm light panel: `id="main"`, one H1, a restrained non-luminous brand mark, `Button`, no
canvas/starfield/globe/glow, reduced-motion safe (no status-specific animation).

## 6. Redirects (all HTTP 308 permanent)

| Source | Destination |
|---|---|
| `/business-types` | `/goals#by-business-type` |
| `/starting-points` | `/goals#by-where-you-are` |
| `/solutions` | `/goals` |
| **70 × `/services/<service>`** | `/services/<category>#<service>` (generated from service data) |

The 70 folded service URLs are generated in `src/lib/seo/service-redirects.ts` from
`data/services.ts`; their source slugs are disjoint from the live category/detail slugs, so no
redirect shadows a real route.

## 7. Special routes

| URL | File | Notes |
|---|---|---|
| `/sitemap.xml` | `app/sitemap.ts` | 20 static + dynamic (services categories, tools, roadmaps, articles, business-types, starting-points, goals, case-study scenarios + verified studies, and examples only when present). No `lastModified`. |
| `/robots.txt` | `app/robots.ts` | allow `/`; disallow `/api/`, `/growth-plan/result`, `/studio`; declares sitemap + host. |
| `/llms.txt` | `app/llms.txt/route.ts` | `force-static`, text/plain, built from `getServiceCategories` + `getGoals`. |
| `/api/forms/contact`, `/api/forms/growth-plan` | `app/api/.../route.ts` | POST endpoints (disallowed in robots). Out of scope for the redesign — untouched. |

## 8. Template families (unique) & their V2 status

homepage · goals-hub · goal-detail · business-type-detail · starting-point-detail · services-hub ·
service-category (ServiceDomainTemplate) · tools-hub · tool-detail · roadmaps-hub · roadmap-detail ·
learn-hub · article-detail · case-study-hub · case-study/scenario-detail · resources · faq · pricing ·
how-it-works · about · connected-growth · account-ownership · contact · growth-plan · troubleshooter ·
legal (LegalPageView) · **examples-index + proof-detail (gated)** · **404 / error (StatusScreen)** ·
design-preview (+ shells).

**All template families are V2 after Phase 2S.** The last two families still on legacy cosmic at the
start of Phase 2S — the status screens and the gated examples templates — are migrated in this phase.

## 9. Remaining legacy dependencies (after Phase 2S)

- **Retained-live legacy primitives** used on V2 surfaces: `InfinityMark` (learn/[slug] + status
  mark), `BentoGrid`/`BentoCard`/`NodeOrb` (`/resources`, with NodeOrb hidden on V2 surfaces), the
  seven `--domain-*` constellation hues (pervasive wayfinding), and the live legacy theme classes
  `theme-band` (EditorialStatement, ProcessStepsSection) — see `v2-legacy-reachability.md` for the
  proof and the retained/removed decisions.
- **No live route** renders a cosmic canvas, starfield, globe, node-orb decoration, GlowButton,
  gradient content heading, or the legacy PageHero/CosmicPageHero after Phase 2S.

## 10. Coverage note

Every live and gated route/template family is covered by Playwright e2e (`tests/e2e/`) and/or unit
route-contract tests (`tests/unit/`). The status surfaces and gated examples gain Phase 2S coverage
(`tests/e2e/status-and-examples.spec.ts` + unit fixtures). No live or potentially publishable route
is left unclassified.
