# Route & Sitemap Proposal — Infinite Weblinks

Phase 1 design artifact. Grounds brief §12 (Website architecture) into a concrete route table with
rendering strategy, plus the information architecture for navigation and CMS-controlled mega-menus.
Goal-based navigation is **primary**; service/tool detail pages exist for depth and SEO.

## Rendering strategy legend
- **SSG/ISR** — statically generated at build, revalidated on-demand when Sanity publishes (OpenNext
  incremental cache in Cloudflare KV). Default for all content pages.
- **Dynamic (RSC)** — server-rendered per request (used only where filter state or draft mode needs it;
  canonical unfiltered version is still SSG/ISR).
- **Client island** — a Client Component embedded in an otherwise server-rendered page (builder,
  filters, mega-menu interactivity, hero motion).

## Primary route table

| Route | Purpose | Render | Index | Data source | Notes |
|---|---|---|---|---|---|
| `/` | Homepage — connected-universe story + primary CTA | SSG/ISR | ✅ | `page` (modular) + taxonomy | 19-block model; hero is a client island over server text |
| `/how-it-works` | Explains the 8-stage journey + 3 cross-cutting systems + process | SSG/ISR | ✅ | `page` + `growthStage` + `crossCuttingSystem` | "See How It All Works" target |
| `/growth-plan` | **Growth Plan Builder** (primary conversion) | Dynamic shell + client island | 🚫 noindex | `growthPlanRuleSet` + `businessType`/`goal`/… | No calendar; Formspree+Turnstile submit |
| `/contact` | Contact / "Ask Our Team" / "Send Us Your Goals" | Dynamic shell + client island | 🚫 noindex | `siteSettings`, `cta` | Honours `?subject=growth-goals` |
| `/about` | About Us — positioning, approach, delivery models, ownership promise | SSG/ISR | ✅ | `page` | No team bios/phone unless Verified |
| `/solutions` | Solutions hub — goal / business-type / starting-point entry points | SSG/ISR | ✅ | `solution`, `goal`, `businessType`, `startingPoint` | Goal-first framing |
| `/solutions/[slug]` | A solution/goal landing (e.g. "Launch a professional store") | SSG/ISR | ✅ | `solution`/`goal` | Cross-links to services/tools/roadmap |
| `/business-types/[slug]` | Audience landing (ecommerce, creator, local/service, B2B, software, established) | SSG/ISR | ✅ | `businessType` | Roadmap + relevant goals/services |
| `/starting-points/[slug]` | "Where are you now?" entry (from Growth Guide p.4) | SSG/ISR | ✅ | `startingPoint` | Maps to recommended first stage |
| `/services` | Services index — filterable full taxonomy (~110+ services) | SSG/ISR + client filter island | ✅ | `service`, `serviceCategory` | Facets: category, goal, stage, business type, delivery model, tool |
| `/services/[slug]` | Service detail — what/how delivered/related | SSG/ISR | ✅ | `service` | Shows one of four delivery models + ownership line |
| `/tools` | Tool Universe index — "platforms and tools we work with" | SSG/ISR + client filter island | ✅ | `tool`, `toolCategory` | Never "partners" |
| `/tools/[slug]` | Tool detail — 6 explanation facets | SSG/ISR | ✅ | `tool` | what/why/connects/suits/when-not/related |
| `/roadmaps` | Roadmaps index — suggested sequences by situation | SSG/ISR | ✅ | `roadmap` | From Growth Guide p.20–21 |
| `/roadmaps/[slug]` | A roadmap — phased sequence using exact stage names | SSG/ISR | ✅ | `roadmap` | Phase → services/tools/goals cross-links |
| `/examples` | Examples index (illustrative; hidden until Verified) | SSG/ISR | ✅ if populated | `example` | Empty-safe; may be hidden at launch |
| `/examples/[slug]` | Example detail | SSG/ISR | ✅ if Verified | `example` | No fabricated client names |
| `/case-studies` | Case studies index (placeholder — hidden until Verified) | SSG/ISR | conditional | `caseStudy` | Not indexed while empty/placeholder |
| `/case-studies/[slug]` | Case study detail | SSG/ISR | ✅ if Verified | `caseStudy` | |
| `/learn` | Learn hub / article index | SSG/ISR | ✅ | `article` | Educational content |
| `/learn/[slug]` | Article | SSG/ISR | ✅ | `article` | Article structured data |
| `/resources` | Resources hub (guides, downloads, links) | SSG/ISR | ✅ | `page`/`resource` | Lead-magnet-ready (no gating at launch) |
| `/faq` | FAQ (accessible accordion) | SSG/ISR | ✅ | `faq` | FAQPage schema only because visible |
| `/privacy` | Privacy policy | SSG/ISR | ✅ | `legalPage` | Marked for professional review |
| `/cookies` | Cookie policy | SSG/ISR | ✅ | `legalPage` | Cookieless analytics posture |
| `/terms` | Terms | SSG/ISR | ✅ | `legalPage` | |
| `/accessibility` | Accessibility statement (WCAG 2.2 AA) | SSG/ISR | ✅ | `legalPage` | Consistent-help entry (WCAG 3.2.6) |

## System / non-page routes

| Route | Purpose | Notes |
|---|---|---|
| `/studio` (+ `/studio/[[...tool]]`) | Embedded Sanity Studio | Protected; `noindex`; excluded from sitemap; CSP/frame rules per `design/security-privacy.md` |
| `/api/revalidate` | Sanity publish webhook → on-demand ISR revalidation | Secret-verified (`SANITY_REVALIDATE_SECRET`) |
| `/api/draft` + `/api/disable-draft` | Draft Mode enable/disable for preview | Secret-verified; editor-only |
| `/sitemap.xml` | Dynamic sitemap | Verified/Ready + indexable URLs only |
| `/robots.txt` | Robots | Allows crawl; disallows `/studio`, `/api`, `/growth-plan`, `/contact`, draft params |
| `/opengraph-image` (per route) | OG image generation | No unverified stats baked in |
| `404` / `500` | Error pages | On-brand, static, link back into the journey |

## Route grouping refinement (allowed per brief §12)
Goal-based navigation stays primary. Recommended grouping in the App Router:
- **`(marketing)`** segment: `/`, `/how-it-works`, `/about`, `/solutions*`, `/business-types*`,
  `/starting-points*`, `/services*`, `/tools*`, `/roadmaps*`, `/examples*`, `/case-studies*`, `/learn*`,
  `/resources`, `/faq`, legal — shared header/footer layout, SSG/ISR.
- **`(convert)`** segment: `/growth-plan`, `/contact` — same shell, `noindex`, client-heavy islands.
- **`studio`** segment: `/studio` — isolated layout, no marketing chrome.

Solutions is the goal-first umbrella; Services/Tools/Roadmaps provide depth. `business-types` and
`starting-points` are alternate entry axes into the same taxonomy (many-to-many via CMS references).

## Navigation information architecture (brief §9)

Desktop header (sticky, selective glass): **Logo** · How It Works · Solutions · Services · Resources ·
About Us · **See How It All Works** (secondary CTA) · **Build My Digital Growth Plan** (primary CTA).

**CMS-controlled mega-menu families** (structure editable in Studio; see `data-model.md` → `megaMenu`):

| Family | Columns (illustrative, CMS-driven) | Links into |
|---|---|---|
| **How It Works** | The 8-stage journey · The 3 cross-cutting systems · Our process · The four delivery models | `/how-it-works`, `/solutions`, stage anchors |
| **Solutions** | By goal · By business type · By starting point · Featured solutions | `/solutions`, `/solutions/[slug]`, `/business-types/[slug]`, `/starting-points/[slug]` |
| **Services** | By category (Strategy, Branding, Websites, SEO, Ads, Social, Funnels, Email/CRM, Ops, Retention, AI & Automation, Analytics, Security/Maintenance, Marketplaces) · By delivery model · Popular services | `/services`, `/services/[slug]` |
| **Resources** | Learn / articles · Roadmaps · Tool Universe · FAQ · Examples/Case studies (when Verified) | `/learn`, `/roadmaps`, `/tools`, `/faq` |

Rules: menu items, columns and ordering are CMS-managed; each item supports enabled/visibility; a menu
column can feature a promoted card (e.g. "Not sure where to start? → Build My Digital Growth Plan").
Mobile collapses all families into one full-screen accordion menu (no squeezed desktop menu).

Footer (brief §23): support email (fallback), CMS social links (Facebook, Instagram, YouTube,
Pinterest — hidden until valid URL), secondary nav, legal links. **No phone number.**

## Sitemap generation rules
- Source: Sanity — include only documents with status **Verified** / **Ready to Publish** and
  `noindex !== true`.
- Exclude: `/studio`, `/api/*`, `/growth-plan`, `/contact`, thank-you states, draft/preview URLs,
  faceted filter permutations.
- Include `lastmod` from document `_updatedAt`; sensible `changefreq`/`priority` by route type.
- Canonical host `https://infiniteweblinks.com`; `www` → root 301 (see `design/deployment.md`).
- Regenerate on publish via the revalidation webhook; validate in CI (see `design/testing.md`).

## Open refinement (non-blocking)
- Whether `/examples` and `/case-studies` share one "proof" index at launch (both may be hidden until
  Verified content exists) — decide at content-QA milestone.
- Whether `/solutions` and `/business-types` should be unified under `/solutions` with a type facet, or
  remain distinct routes for SEO — recommend keeping distinct routes (clearer internal linking, more
  indexable landing pages), refine during `plan` review.
