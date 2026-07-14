# SEO and Structured-Data Plan — Infinite Weblinks

**Feature**: 001-infinite-weblinks-website
**Status**: Planning (no code)
**Governs**: indexation, metadata, headings, internal linking, structured data, sitemap/robots, OG images, AI-search readiness, i18n readiness, measurement

This plan operationalises Constitution Principle VII (SEO Is Part of the Build) and Locked
Brief §21 for a **Digital Growth Partner** services site — not a SaaS product — where the
brand story is "one connected system": goals, services, tools, roadmaps and journey stages
all link to each other. SEO here is inseparable from that navigation model, not a bolt-on.

Canonical domain: `https://infiniteweblinks.com` (root, not `www`). Global English spellings
throughout titles and descriptions (personalised, optimised, prioritised, fulfilment). No
public placeholder data — including in structured data. If a field's source value is
Draft/Placeholder/Approval Required, the field is omitted, never filled with filler text.

---

## 1. Indexation strategy per route type

Default posture: **indexable unless a route is a utility, a private surface, or has no unique
public content of its own.** Every indexable route needs a genuinely unique title and
description — no template collisions across sibling pages.

| Route | Index? | Notes |
|---|---|---|
| `/`, `/how-it-works` | Index | Core brand/explainer pages |
| `/solutions`, `/solutions/[slug]` | Index | Goal hub + one page per goal; core SEO surface |
| `/business-types/[slug]`, `/starting-points/[slug]` | Index | Segment/intent-matched landing content |
| `/services`, `/services/[slug]` | Index | Core SEO surface area |
| `/tools`, `/tools/[slug]` | Index | What/why/connects-with per Brief §16 |
| `/roadmaps`, `/roadmaps/[slug]` | Index (slug only once Verified/Ready) | |
| `/examples`, `/examples/[slug]` | Hub indexed; slug indexed only if Verified/Ready | Draft/Placeholder items 404, never a public noindex stub |
| `/case-studies`, `/case-studies/[slug]` | Same rule as examples | No placeholder case study lives at a public URL |
| `/learn`, `/learn/[slug]` | Index | Article schema (§4) |
| `/resources`, `/faq`, `/about` | Index | FAQ schema only if accordion is actually rendered (§4); team bios only once Verified |
| `/privacy`, `/cookies`, `/terms`, `/accessibility` | Index | Low priority in sitemap weighting, not excluded from index |
| `/growth-plan`, `/contact` (+ `?subject=growth-goals`) | **Noindex, follow** | Personalised/form flows, not search landing targets; query variant canonicals to `/contact` |
| `/studio` | **Noindex, nofollow**, blocked in `robots.txt`, never linked publicly | CMS admin surface |
| Thank-you / form-success states | **Noindex** | Thin-content duplicate, no search value |
| Filtered/faceted listing URLs (`/services?category=&stage=`) | **Noindex, canonical → clean listing URL** | Prevents duplicate-content explosion from the §16 filter model (category, goal, stage, business type, delivery model, tool) |
| Sanity Presentation-tool preview URLs | **Noindex, nofollow**, access-gated | Never crawlable in production |
| Paginated listings (`?page=2`) | Self-canonical, indexable | Never canonical all pages to page 1 |

Mechanics: prefer `generateMetadata` → `robots: { index:false, follow:true }` over
`robots.txt` disallow wherever link equity should still flow (`/growth-plan`, `/contact`) —
`robots.txt` disallow is reserved for `/studio` and genuine crawl-budget waste, since a
disallowed page's meta robots can't be read and its indexing becomes unpredictable if ever
linked externally. Faceted URLs are query-string only (never nested static routes) and always
carry both `noindex` and a canonical pointing at the clean listing page.

---

## 2. Metadata architecture (Next.js App Router)

Every indexable route's metadata is CMS-driven through a shared Sanity `seo` object embedded on
each content type (goal, service, tool, roadmap, article, example, case study, static page):

```
seo { metaTitle  metaDescription  canonicalUrl  ogImage  noindex(bool) }  // all optional overrides
```

Each dynamic segment (`/solutions/[slug]`, `/services/[slug]`, `/tools/[slug]`,
`/roadmaps/[slug]`, `/examples/[slug]`, `/case-studies/[slug]`, `/learn/[slug]`) implements
`generateMetadata({ params })` server-side:
1. Fetch the document + `seo` object; return not-found behaviour if missing or not
   Verified/Ready to Publish.
2. Title: `seo.metaTitle` → `${document.title} | Infinite Weblinks` fallback.
3. Description: `seo.metaDescription` → first ~155 characters of a mandatory plain-text summary
   field — never truncated mid-word, never a generic boilerplate fallback.
4. `alternates.canonical`: `seo.canonicalUrl` → computed
   `https://infiniteweblinks.com${pathname}` (absolute, root host, server-computed, never from
   `request.headers.host`).
5. `openGraph`/`twitter` per §6; `robots` per §1 (only noindex routes set it explicitly).

Static/utility routes (`/`, `/how-it-works`, `/growth-plan`, `/contact`, `/about`, hubs, legal
pages) read the same pattern from a singleton "page settings" CMS document per route, so
editors control metadata without a deploy (Brief §14: "Manage SEO fields").

**Title template** (root layout): `default: 'Infinite Weblinks — Digital Growth Partner'`,
`template: '%s | Infinite Weblinks'`. Homepage overrides `default` directly; all other routes
supply only their page-specific fragment.

**Canonical rules**: exactly one canonical per page (only `alternates.canonical`, never a
duplicate manual `<link>`); `www.infiniteweblinks.com` 301-redirects to root at the Cloudflare
edge (the actual fix — canonical tags are a hint, not enforcement); trailing slashes normalised
one way at the Next.js config level.

**Fallback safety net**: if a document has no `seo` object at all, `generateMetadata` still
produces a valid non-empty title/description from required base fields — this requires the
content model to make a short summary field mandatory on every SEO-relevant type, not just a
code-level fallback.

---

## 3. Heading hierarchy, semantic structure, internal linking

**Headings**: exactly one `<h1>` per page, matching the page's core subject (never the brand
name alone). Levels descend logically (`h2` sections, `h3` sub-groups) — visual size is a CSS/
token concern, never a reason to pick the wrong level. The homepage's 19-section content model
(Brief §13) needs disciplined H2s per named section (Goal Explorer, 8-stage Journey,
Starting-Point Selector, Business Roadmaps, Services Explorer, Tool Universe, Four Delivery
Models, Why Infinite Weblinks, Learning and resources, FAQ, etc.) that stay coherent regardless
of which sections editors hide/reorder. Nav labels and card titles are never a substitute for a
real heading on a major content block.

**Internal-linking model** (central to the brand story — "one connected system", not siloed
content):
- **Goals** (`/solutions/[slug]`) link to relevant services, tools, applicable roadmap(s), and
  journey stage(s).
- **Services** (`/services/[slug]`) link back to the goal(s) served, related tools, related
  services, and applicable delivery models.
- **Tools** (`/tools/[slug]`) link to what they connect with (Brief §16 requirement, doubling
  as internal links), related services, and suited business types/stages.
- **Roadmaps** link to the goals/services/tools composing each step.
- **Starting points / business types** link into relevant goals, services, roadmaps.
- **Learn articles** link to the services/tools/goals they explain, and to topically related
  articles (not a generic unrelated "related posts" widget).

This graph is modelled as explicit CMS reference fields (e.g. a service document's
`relatedTools`/`relatedGoals`/`relatedServices` arrays), rendered as a visible "Related" module
near the growth-plan CTA — not left to freeform body-copy links — so it survives content
reorganisation and directly feeds the BreadcrumbList/ItemList schema in §4.

**Breadcrumbs**: every deep route (`/solutions/`, `/business-types/`, `/starting-points/`,
`/services/`, `/tools/`, `/roadmaps/`, `/examples/`, `/case-studies/`, `/learn/`) renders a
visible breadcrumb trail as real markup, matched exactly by its BreadcrumbList schema —
never schema-only breadcrumbs with no visible equivalent.

---

## 4. Structured data (JSON-LD) plan

General rule: **structured data reflects only verified, currently-true, publicly-visible
content.** Nothing is emitted for Draft/Placeholder/Approval Required content, and no
aggregate numbers or ratings are ever emitted without a verified real source.

| Schema | Where | Rule |
|---|---|---|
| `Organization` | Root layout, site-wide | `name`, `url`, approved `logo/` asset, `sameAs` only for verified profile URLs. No `contactPoint` phone (locked: no phone numbers anywhere); no `foundingDate`/employee counts unless verified — omit rather than guess. |
| `WebSite` + `SearchAction` | Homepage | `SearchAction` only if on-site search actually exists; otherwise `WebSite` alone until search ships. |
| `BreadcrumbList` | Every deep route (§3) | Must match the visible trail exactly. |
| `Service` | `/services/[slug]` | `name`, `description`, `provider`, `areaServed` (UK/US/Canada/Australia/Europe, only if accurate), `serviceType`. No `offers`/price schema — Brief uses neutral engagement ranges, not prices. |
| `Article` | `/learn/[slug]` | `headline`, `datePublished`, `dateModified`, `author` = Organization (no individual bylines until team data is verified), `image`. Real dates only. |
| `FAQPage` | `/faq` and any page with a genuinely visible FAQ accordion | Only when the exact Q&A pairs are rendered on that page; never reused across pages with different visible content. |
| `ItemList` | `/services`, `/tools`, `/solutions`, `/roadmaps`, `/examples`, `/case-studies`, `/learn` | Generated from the same ordered CMS query as the rendered list. |
| Explicitly excluded | All routes | **No `Review`, `AggregateRating`, or Testimonial schema** until real, approved reviews/testimonials exist — gated on content status, not hidden by CSS alone. |

JSON-LD renders server-side (RSC) as `<script type="application/ld+json">` from the same
server component and CMS query that renders the visible content, so schema and markup can
never drift apart.

---

## 5. Sitemap and robots

**`sitemap.xml`** (`app/sitemap.ts`, dynamic): sourced from live CMS queries filtered to
**status = Verified or Ready to Publish only** — the same exclusion applied a second time at
the sitemap layer, so a status regression can't leak a draft URL even if a template briefly
renders it. Excludes every noindex route from §1. `lastmod` comes from the CMS's actual
publish timestamp, not a build timestamp. Split into an index sitemap per content type once
volume warrants it — not needed at launch scale, but keep `sitemap.ts` structured for it.

**`robots.txt`** (`app/robots.ts`):
```
User-agent: *
Allow: /
Disallow: /studio
Sitemap: https://infiniteweblinks.com/sitemap.xml
```
Start permissive on query strings; tighten only if Search Console crawl-stats evidence shows
waste (some query variants may be legitimate). `/studio` is blocked here as a third layer
beneath its own `noindex,nofollow` tag and app-level auth — belt and braces for the CMS admin
surface.

**Host canonicalisation**: Cloudflare edge 301 `www` → root (the actual enforcement) +
`alternates.canonical` always emitting the root host regardless of request host (covers edge
cases before redirect logic runs) + Search Console property verified on the root domain.

---

## 6. Open Graph / social image strategy

Every indexable route gets an `openGraph.images` entry, priority order: (1) CMS `seo.ogImage`
if an editor uploaded one, (2) a route-type default (goal/service/tool/article each get their
own on-brand template, not one generic image reused everywhere), (3) site-wide default. Images
never bake in unverified stats, quotes, or client names — same no-placeholder rule as the rest
of the site; defaults use the brand type/colour system and the page title only. Standard
1200×630 dimensions, `summary_large_image` Twitter card, `alt` text on every image. Prefer
generating route-type defaults programmatically (Next.js `ImageResponse`) so the two-person
editorial team (Brief §14) isn't manually designing one per page, while still allowing manual
overrides for specific pages.

---

## 7. AI-search / GEO / AEO considerations

Infinite Weblinks sells **Answer Engine Optimisation / Generative Engine Optimisation** as a
service (Growth Guide: AEO under the AI & Automation cross-cutting system). The site must
visibly practise what it sells.

- **No critical content hidden inside client-only animation.** The hero "connected universe"
  and the 8-stage Journey are editable SVG with a separate animation layer (per locked
  constraints); underlying text (stage names, goal names, headline copy) must be real
  server-rendered DOM, not canvas/WebGL drawing or text baked into an image. An LLM crawler or
  reduced-motion user gets the complete content with no dependency on JS execution.
- **Clean semantic HTML**: real landmark elements (`header`, `nav`, `main`, `footer`) and real
  list markup (`<ul>/<li>`) for journey stages, delivery models, and service/tool listings —
  not div soup.
- **Content answerable by LLMs**: goal/service/tool pages directly answer "what is this", "who
  is it for", "what does it connect with", "when might I not need this" — the tool-page fields
  required in Brief §16 already map to this.
- **Structured data reinforces extractability**: §4's schema mirrors visible content rather
  than adding undisclosed facts, consistent with how AI answer engines and Google both expect
  structured data to be used.
- **FAQ content is a strong AEO lever**: genuine, visible FAQ content is one of the
  highest-value formats for direct AI-answer citation — reason enough to do FAQPage schema
  properly (§4) rather than skip it.
- No `llms.txt` or AI-specific crawler file is a launch requirement — standard `robots.txt`
  already permits well-behaved AI crawlers; revisit only if a specific crawler's behaviour
  requires an explicit entry post-launch.

---

## 8. International / Global-English notes

Single `en` locale at launch, targeting UK/US/Canada/Australia/Europe with one shared Global
English spelling convention (personalised, optimised, prioritised, fulfilment) rather than
region-specific variants — no `/en-us/`/`/en-gb/` path splitting. Keep the route/content model
from baking in assumptions that would be painful to retrofit if a future locale variant is
commissioned, but do not build hreflang tags, a locale switcher, or i18n routing now — that
would be speculative complexity against Constitution Principles III (Speed) and XII (Efficient
Context) for a requirement that isn't live. No currency/price formatting concern either, since
Brief §15 uses neutral engagement ranges, not prices.

---

## 9. Measurement and validation

- **Google Search Console**: root-domain property verified, sitemap submitted; monitor
  Coverage, Core Web Vitals, and mobile usability post-launch.
- **Cloudflare Web Analytics** (cookieless, per stack pin): site-wide traffic/performance
  without a consent-banner burden; complements, not replaces, Search Console's index signals.
- **CI validation** (cross-reference `design/testing.md`): every sitemap route returns 200 with
  a non-empty title/description; JSON-LD validated per page type against schema.org
  expectations (fixture pages per content type); exactly one canonical per page and no
  noindex/sitemap contradictions, enforced as an automated assertion; exactly one `<h1>` per
  page (reuses the existing axe-core/Lighthouse heading-order check); Lighthouse CI SEO score
  tracked alongside Performance/Accessibility/Best Practices.

---

## 10. Done checklist

- [ ] Indexation table (§1) implemented; Verified/Ready gating applied to roadmaps, examples,
      case studies; `/growth-plan`, `/contact`, `/studio`, thank-you states, faceted URLs
      noindexed/canonicalised as specified.
- [ ] `generateMetadata` implemented per route type, CMS-driven, safe non-empty fallbacks;
      title template applied site-wide.
- [ ] Exactly one canonical per page; `www` → root 301 live at the edge; canonical always
      server-computed from the production host.
- [ ] Heading hierarchy correct across the homepage's 19 sections and all deep routes;
      breadcrumbs visible and correct everywhere required.
- [ ] Internal-linking reference graph (goal ↔ service ↔ tool ↔ roadmap ↔ stage) modelled as
      CMS references and rendered as visible "Related" modules.
- [ ] JSON-LD per §4: Organization, WebSite(+SearchAction if applicable), BreadcrumbList,
      Service, Article, FAQPage (only where visibly rendered), ItemList on listings. No
      Review/AggregateRating/Testimonial schema anywhere.
- [ ] `sitemap.xml` dynamic, Verified/Ready-only, excludes noindex routes; `robots.txt` blocks
      `/studio`; both via Next.js route handlers.
- [ ] Per-page OG images (CMS override → route-type default → site default), no unverified
      stats/quotes baked in; `summary_large_image` cards.
- [ ] Hero and 8-stage Journey text confirmed server-rendered without JS/animation dependency.
- [ ] Single `en` locale shipped, Global English spelling audit passed, no premature
      hreflang/locale scaffolding.
- [ ] Search Console verified + sitemap submitted; Cloudflare Web Analytics live.
- [ ] CI green: metadata completeness, structured-data validation, canonical/noindex
      consistency, single-`<h1>` check, Lighthouse SEO score tracked (see `design/testing.md`).
