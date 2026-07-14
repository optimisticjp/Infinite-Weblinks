# Data Model — CMS Content Model, Modular Sections & Growth Plan Data

Phase 1 design artifact. Defines the **Sanity** content model: document types, shared objects, the
**controlled modular section model**, and the **Growth Plan Builder** data. This is a *modelling* spec
(field intent + relationships), not code. Field names are indicative; refine at schema implementation.

## Modelling principles
- **Content and business logic are separated from presentation** (brief §17). Presentation reads
  status-gated content; recommendation logic reads a reviewed rule set (see
  `contracts/growth-plan-rules.md`).
- **Controlled page builder**: pages are an ordered array of **approved section objects** only. No
  free-form HTML/CSS. Each section has enabled/visibility, ordering, allowed theme + layout variant.
- **Status gating everywhere**: every publishable document carries a `contentStatus`; only
  `verified`/`readyToPublish` renders publicly (brief §14). Draft/Placeholder/Approval-required never
  reach production.
- **The taxonomy is a graph**: goals ↔ services ↔ tools ↔ stages ↔ roadmaps ↔ business types are linked
  by references, enabling filtering (brief §16) and rich internal linking (SEO).
- **Global English** in all editorial fields; official names locked.

## Shared objects (reusable field groups)

| Object | Fields (intent) |
|---|---|
| `contentStatus` | `status`: enum `draft · placeholder · approvalRequired · verified · readyToPublish` (default `draft`); `noindex`: bool; optional `reviewNote`. Gate: public queries require `status in ["verified","readyToPublish"]`. |
| `seo` | `title`, `metaDescription`, `canonicalUrl` (override), `ogTitle`, `ogDescription`, `ogImage` (with focal point), `noindex`, `structuredDataType` hint. Drives `generateMetadata` + JSON-LD (see `design/seo.md`). |
| `cta` | `label` (from approved set), `route` (validated against allowed routes), `style` (primary/secondary/text), `ariaLabel?`. Enforces approved CTAs only (no "Book a Call"). |
| `mediaImage` | `asset`, `alt` (required for meaningful images), `focalPoint`, optional `mobileAsset`, `caption?`, `decorative` flag. |
| `themeChoice` | enum `darkCinematic · brightEditorial · boldFullColour` — restricts a section's palette to the approved rhythm; validator prevents >2 dark in a row on a page. |
| `layoutVariant` | enum per section type (e.g. `split-left · split-right · centered · rail`), constrained to approved variants only. |
| `link` | internal `reference` OR external `url`; label; `openInNew?`; used by nav/footer. |

## Document types — taxonomy (the graph)

| Document | Purpose | Key fields & references |
|---|---|---|
| `businessType` | Audience axis (ecommerce, creator, local/service, B2B, software, established, beginner) | `name`, `slug`, `summary`, `relatedGoals[]→goal`, `roadmap→roadmap`, `seo`, `contentStatus` |
| `goal` | A visitor goal (e.g. "Launch a professional store", "Make ads profitable") | `name`, `slug`, `whatYouNeed`, `howWeHelp`, `mainTools[]→tool`, `outcome`, `stages[]→growthStage`, `services[]→service`, `seo`, `contentStatus` |
| `startingPoint` | "Where are you now?" entry (Growth Guide p.4) | `name`, `slug`, `description`, `recommendedStage→growthStage`, `relatedGoals[]→goal`, `seo`, `contentStatus` |
| `growthStage` | One of the **8 exact stages** | `order` (1–8), `name` (locked), `slug`, `plainSummary`, `whatHappens`, `relatedServices[]→service`, `seo`, `contentStatus` |
| `crossCuttingSystem` | One of the **3 systems** (AI & Automation, Analytics & Data, Maintenance & Scale) | `name` (locked), `slug`, `description`, `relatedServices[]→service` |
| `deliveryModel` | One of the **4 models** | `name` (locked), `slug`, `description`, `ownershipLine` (shared constant) |
| `serviceCategory` | Grouping (Strategy, Branding, Websites, SEO, Ads, Social, Social Growth, Funnels, Courses, Email/CRM, Ops, Retention, AI & Automation, Analytics, Security/Maintenance, Marketplaces) | `name`, `slug`, `order`, `intro` |
| `service` | A single service (~110+) | `name`, `slug`, `category→serviceCategory`, `deliveryModel→deliveryModel`, `plainDescription`, `whatYouGet`, `relatedTools[]→tool`, `relatedGoals[]→goal`, `stages[]→growthStage`, `businessTypes[]→businessType`, `seo`, `contentStatus` |
| `toolCategory` | Tool grouping (Websites/hosting, Ecommerce/ops, Email/SMS/CRM, Funnels, Courses, Loyalty, SEO, Analytics, Automation/AI, Support/security/legal) | `name`, `slug`, `order` |
| `tool` | A platform/tool "we can connect" (~80+) | `name`, `slug`, `category→toolCategory`, `whatItDoes`, `whyUseful`, `connectsWith[]→tool`, `suitsBusinessTypes[]→businessType`, `whenNotNeeded`, `relatedServices[]→service`, `logo` (mediaImage, labelled non-partner), `seo`, `contentStatus` |
| `roadmap` | Suggested sequence for a situation (Growth Guide p.20–21) | `name`, `slug`, `forBusinessType→businessType`, `phases[]{ title, summary, stage→growthStage, services[]→service, tools[]→tool, goals[]→goal }`, `seo`, `contentStatus` |
| `solution` | Goal-first landing (may reference a `goal`) | `name`, `slug`, `hero`, `sections[]`, `relatedServices[]`, `relatedTools[]`, `roadmap→roadmap`, `seo`, `contentStatus` |

## Document types — content & editorial

| Document | Purpose | Key fields |
|---|---|---|
| `article` | Learn/resource article | `title`, `slug`, `excerpt`, `body` (Portable Text), `author?` (Verified only), `relatedServices[]`, `relatedGoals[]`, `publishedAt`, `seo`, `contentStatus` |
| `resource` | Resource/guide/download | `title`, `slug`, `description`, `file?`/`link?`, `seo`, `contentStatus` |
| `faq` | FAQ item | `question`, `answer` (Portable Text), `category?`, `order`, `contentStatus` |
| `caseStudy` | Case study (**placeholder-gated**) | `title`, `slug`, `client?`, `summary`, `body`, `metrics[]?`, `seo`, `contentStatus` (defaults hidden) |
| `example` | Illustrative example (gated) | `title`, `slug`, `summary`, `body`, `contentStatus` |
| `testimonial` | Quote (**placeholder-gated**) | `quote`, `attribution?`, `rating?`, `contentStatus` (defaults hidden) |
| `legalPage` | privacy/cookies/terms/accessibility | `title`, `slug`, `body`, `lastReviewed`, `reviewFlag` ("professional review pending"), `seo` |

## Document types — site configuration (singletons)

| Document | Purpose | Key fields |
|---|---|---|
| `siteSettings` | Global | `siteName`, `supportEmail` (fallback, shown), `defaultSeo`, `organizationInfo` (Verified fields only — no fake data), `analyticsToken?`, `announcementBar?{ enabled, message, link }` |
| `navigation` | Header + mega-menus | `primaryItems[]{ label, link, megaMenu→megaMenu? }`, `headerCtas[]→cta` (See How It All Works, Build My Digital Growth Plan) |
| `megaMenu` | One mega-menu family (How It Works / Solutions / Services / Resources) | `title`, `columns[]{ heading, items[]{ label, link, description?, enabled }, promoCard?{ heading, body, cta } }`, ordering, per-item `enabled` |
| `footer` | Footer | `columns[]{ heading, links[] }`, `socialLinks[]{ platform (Facebook/Instagram/YouTube/Pinterest), url, enabled(hidden until valid), ariaLabel }`, `legalLinks[]`, `supportEmail`. **No phone field.** |
| `ctaLibrary` | Reusable approved CTAs | list of `cta` presets |

## Modular page model

| Document/object | Purpose |
|---|---|
| `page` (document) | A composable page: `title`, `slug`, `sections[]` (ordered array of section objects), `seo`, `contentStatus`. Used for `/`, `/how-it-works`, `/about`, `/resources`, `/solutions/[slug]`, legal, etc. |
| Section objects | The **approved section types** from `design/component-inventory.md §4** — each an object with: `_type` (one of the approved list), `enabled` (bool), `theme` (`themeChoice`), `layout` (`layoutVariant`), type-specific content refs, optional `cta`, optional `anchorId`. Editors add/reorder/hide; no arbitrary layout. |

**Section validation rules** (enforced in schema/desk):
- Only approved `_type`s selectable (closed list).
- `enabled=false` or `contentStatus` not verified → section omitted from public render.
- Placeholder-gated sections (`caseStudyShowcase`, `testimonialWall`, `statBand`) render only when their
  referenced documents are Verified — otherwise the whole section auto-hides (no empty frames).
- Theme sequence validator warns if >2 `darkCinematic` sections are consecutive (rhythm rule).
- Media fields require `alt` unless `decorative=true`; focal points required for hero/feature imagery.

## Growth Plan Builder data

The builder is a **guided form + reviewed rule set** (brief §15). Two data concerns:

### 1. Builder input option sets (CMS-managed, so editors can adjust labels/order)
| Field | Source | Options |
|---|---|---|
| Business type | `businessType[]` | ecommerce, creator, local/service, B2B, software, established, beginner… |
| Current stage | `growthStage[]` | the 8 stages |
| Main goal | `goal[]` | goal list |
| Existing setup | `existingSetupOption[]` (small doc/enum) | e.g. nothing yet · have a site · have traffic · getting sales · running ads · established |
| Engagement preference | fixed enum (locked, no currency) | Small initial project · Focused growth project · Multi-service growth plan · Larger ongoing programme · Not sure yet · Prefer to discuss by email |
| Timeline | fixed enum | as soon as possible · 1–3 months · 3–6 months · exploring |
| Contact details | form fields | name, email, business name?, message? |

### 2. `growthPlanRuleSet` (document) — the reviewed recommendation logic
Stored as structured data, **not** free AI (brief §15). Shape (full contract in
`contracts/growth-plan-rules.md`):
- `version`, `status` (reviewed/approved), `updatedBy`.
- `rules[]`: each `{ when: { businessType?, currentStage?, mainGoal?, existingSetup? }, then: {
  startHere[]→(stage|service), connectNext[]→…, addLater[]→…, capabilities[], exampleTools[]→tool,
  expectedOutcomes[], howWeHelp } , priority }`.
- `fallback`: a safe default recommendation when no rule matches ("Prefer to discuss by email" path).
- `disclaimers`: outcomes are illustrative, not guarantees (Growth Guide voice).

**Output entity** (computed, not stored): `GrowthPlanResult { startHere, connectNext, addLater,
relevantCapabilities, exampleTools, expectedOutcomes, howWeHelp, matchedRuleId }` → rendered, then the
inputs+result summary are emailed to the team via Formspree (see `contracts/forms-and-email.md`).

## Public query gating (applies to all read paths)
Every public GROQ query MUST filter `contentStatus.status in ["verified","readyToPublish"]` and honour
`noindex` for sitemap/robots. Draft Mode (editor, secret-gated) bypasses the gate for preview only. This
guarantees SC-007 (no unverified content in production).

## Roles (brief §14, §22)
Two admin/editor users with least-privilege roles: full editor rights on content; publishing rights
governed by the status workflow; Studio access protected; no anonymous write. Draft datasets/preview are
not publicly reachable. See `design/security-privacy.md`.
