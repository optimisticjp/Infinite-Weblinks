# Feature Specification: Infinite Weblinks Website

**Feature Branch**: `001-infinite-weblinks-website`

**Created**: 2026-07-14

**Status**: Draft — planning only (Spec Kit phases specify → analyze; implementation NOT started)

**Input**: Locked Project Brief (`LOCKED_PROJECT_BRIEF.md`, decision authority) + Growth Guide 2026
(service/tool/stage/goal/roadmap/delivery-model taxonomy) + approved Design Handoff (colour, type,
spacing, logo, homepage-opening direction) + vibrant glowing-infinity hero reference image
(visual-motion reference only).

---

## Overview

Infinite Weblinks is a **Digital Growth Partner** — a full-stack web development and digital marketing
**services company, not a SaaS product**. The new website's job is to **teach before it sells**: help a
visitor understand what their business may need online, why the parts matter, how they connect, what
should come first and what can wait — then show how Infinite Weblinks can help build it.

The site must be **vibrant, premium and editorial** (a "living connected digital universe") while
remaining fast, accessible, mobile-first and easy for two non-technical admins to run through a
controlled CMS. Conversion is **email-led** through a guided **Growth Plan Builder** and simple
contact forms — there is **no call booking, no phone number, and no product login**.

### Definition of success (from brief §26)
A visitor should leave thinking: *"I understand what my business may need, why the parts matter, how
they work together, and how Infinite Weblinks can help me build it."* The site must feel vibrant and
distinctive, be easy to use, teach before selling, avoid generic agency/SaaS patterns, work on mobile
and desktop, be editable by two admins with controllable sections, use email-led conversion, and be
accessible, fast, secure and search-friendly.

---

## Non-negotiable guardrails *(apply to every requirement below)*

These are hard constraints. Any deviation must be raised with the owner, not assumed.

1. **Email-led conversion only.** No booking calendar, no phone-first flow, no "Book a Call" CTA, no
   phone numbers anywhere. Forms post via **Formspree**; `support@infiniteweblinks.com` is a visible
   **fallback**, never the primary action. *(The Growth Guide's "book a discovery call" language is
   superseded by the brief and must not appear on the site.)*
2. **Services company, not software.** No "one platform"/"all-in-one platform", no dashboard-led
   positioning, no sign-in/login language, no generic SaaS equal-card feature grids.
3. **No unverified public content.** Metrics, testimonials, case studies, client names, partnership
   claims, team bios and phone numbers are **hidden by default** and only shown when marked Verified/
   Ready to Publish.
4. **Global English** throughout (personalised, prioritised, optimise, fulfilment); official product/
   company/tool names unchanged.
5. **Exact official names** for the 8-stage journey, 3 cross-cutting systems, and 4 delivery models
   (see Key Entities). Do not rename.
6. **Accessibility WCAG 2.2 AA**, **mobile-first**, **performance-budgeted**, **secure by default**.
7. **Re-architect, don't copy.** Design-handoff artifact code (`_ds_bundle.js`, the homepage
   exploration HTML) and the raster hero are references only; the production build is rebuilt from
   editable, accessible, server-first components and editable SVG.

---

## User Scenarios & Testing *(mandatory)*

User journeys are prioritised P1–P4. Each is an independently testable slice; implementing P1 alone
yields a viable, valuable MVP. Priorities also drive the milestone plan in `plan.md`.

### User Story 1 — Understand what I need, then start a growth plan (Priority: P1) 🎯 MVP

A business owner (anywhere on the spectrum from "just an idea" to "established and scaling") lands on
the homepage. The connected-universe hero and the education sections explain, in plain English, how
online growth works as one connected system (the 8-stage journey, the cross-cutting systems). They
explore goal- and stage-based entry points, then start the **Growth Plan Builder**, answer a short
guided sequence, and receive a structured, reviewed recommendation (Start here / Connect next / Add
later, with relevant capabilities, example tools, expected outcomes, and how Infinite Weblinks helps).
They submit their details; the team receives the enquiry by email.

**Why this priority**: This is the core promise and the primary conversion path. Without it, the site
does not do its job. It is demonstrable end-to-end on its own.

**Independent Test**: Load the homepage on mobile and desktop; read and understand the growth story
without animation; open the Growth Plan Builder; complete all steps for a representative business type;
verify the recommendation is coherent and rule-based; submit and confirm the team-only email delivery
(Formspree) with Turnstile and validation working; confirm a clear success state and email fallback.

**Acceptance Scenarios**:
1. **Given** a first-time mobile visitor, **When** the homepage loads, **Then** the hero headline,
   slogan, category eyebrow, primary/secondary CTAs and reassurance are readable immediately with no
   layout shift and without waiting on any animation.
2. **Given** a visitor with `prefers-reduced-motion: reduce`, **When** the homepage renders, **Then**
   they receive the complete static end-state (connection lines drawn, no pulses, no float) with all
   content present.
3. **Given** a visitor on the Growth Plan Builder, **When** they complete business type, current
   stage, main goal, existing setup, engagement preference, timeline and contact details, **Then** a
   structured recommendation is produced from reviewed rule-based logic (not free AI) and displayed.
4. **Given** a completed builder, **When** they submit, **Then** the submission is validated, passes
   Turnstile, is delivered only to `support@infiniteweblinks.com` via Formspree, and the visitor sees
   an accessible success state; no automatic visitor copy is sent at launch.
5. **Given** invalid or spammy input, **When** they submit, **Then** accessible inline errors and spam
   protection prevent submission and explain what to fix.

---

### User Story 2 — Explore services, tools and roadmaps for my situation (Priority: P2)

A visitor who wants detail browses **Solutions** (goal/business-type/starting-point entry points),
**Services** (the full taxonomy, filterable), **Tools** ("platforms and tools we work with"), and
**Roadmaps** (suggested sequences for their business type). They understand each service's delivery
model (We Do the Work / We Bring In an Expert / We Run It End to End / You Run It After) and how tools
connect, and they can move from any of these into the Growth Plan Builder or a contact form.

**Why this priority**: Detail and SEO surface. Goal-based navigation is primary; service/tool/roadmap
pages provide depth, internal linking and search entry points. Independently valuable even before all
homepage sections exist.

**Independent Test**: Navigate to `/services`, filter by category/goal/growth-stage/business-type/
delivery-model/tool; open a service detail page and confirm delivery-model tagging and related
tools/goals cross-links; open a tool page and confirm the six explanation facets; open a roadmap and
confirm phased sequence; confirm every listing/detail page is server-rendered, indexable and
breadcrumbed.

**Acceptance Scenarios**:
1. **Given** the services index, **When** a visitor applies filters (category, goal, growth stage,
   business type, delivery model, tool), **Then** the result set updates accessibly and the URL/state
   remains crawlable for canonical pages.
2. **Given** a service detail page, **When** it renders, **Then** it shows what it is, how it is
   delivered (one of the four models), related tools, related goals/stages, and a next-step CTA.
3. **Given** a tool detail page, **When** it renders, **Then** it explains: what the tool does, why it
   may be useful, what it connects with, which businesses it suits, when it may not be needed, and
   related services — labelled as a tool "we can connect", never as a partnership.
4. **Given** any deep page, **When** it renders, **Then** breadcrumbs, canonical URL, metadata and
   relevant structured data are present and no critical content is hidden inside client-only animation.

---

### User Story 3 — Editors manage all content and sections safely (Priority: P2)

Two admins use an embedded, protected **Sanity Studio** to add/edit/remove content, publish/unpublish,
reorder and show/hide sections, switch a section's approved theme/layout, edit navigation and CMS-driven
mega-menus, edit footer/social links and CTAs, and manage goals, starting points, stages, services,
tools, roadmaps, examples, case studies, testimonials, articles, FAQs and SEO fields — all through a
**controlled modular page builder** with approved section types only, plus draft preview.

**Why this priority**: The brief requires the CMS architecture to support the complete model from the
start, even if pages ship in milestones. Editors must never be able to break layout or publish
unverified content.

**Independent Test**: In Studio, create a page from approved section types; reorder and hide a section;
switch an allowed layout variant; set content status to Placeholder and confirm it does not appear
publicly; set to Verified/Ready and confirm it appears; edit a mega-menu and confirm the header
updates; preview a draft without publishing.

**Acceptance Scenarios**:
1. **Given** an editor in Studio, **When** they add, reorder, show/hide, or re-theme a section from the
   approved set, **Then** the public page reflects the change after publish, with no arbitrary CSS or
   unrestricted layout controls exposed.
2. **Given** content with status Draft/Placeholder/Approval Required, **When** the public site renders,
   **Then** that content is not shown; only Verified/Ready to Publish content is public.
3. **Given** an editor, **When** they edit the mega-menu structure, footer, social links or CTAs,
   **Then** the changes are reflected site-wide after publish.
4. **Given** a draft, **When** the editor previews it, **Then** they see the draft via protected
   Draft Mode without exposing it publicly.

---

### User Story 4 — Learn, get answers, and reach the team (Priority: P3)

A visitor reads **Learn/Resources** articles, checks the **FAQ**, reviews **How It Works**, **About**,
and legal pages, and — if not ready for a full plan — uses **Contact** ("Send Us Your Goals" / "Ask Our
Team") to reach the team by form, with the support email visible as a fallback.

**Why this priority**: Supporting trust, education and secondary conversion. Valuable but not the core
path; can follow P1/P2.

**Independent Test**: Open `/learn`, read an article; open `/faq` and expand items (keyboard
accessible); submit `/contact` with `?subject=growth-goals` prefilled; confirm team-only delivery and
success state; confirm legal pages render and are marked for professional review where relevant.

**Acceptance Scenarios**:
1. **Given** `/contact?subject=growth-goals`, **When** the page loads, **Then** the subject is
   pre-selected and the form validates, protects against spam, and delivers only to the team.
2. **Given** the FAQ, **When** a keyboard user expands/collapses items, **Then** it is fully operable
   and FAQ structured data is emitted only because the FAQ is visibly present.
3. **Given** a learn article, **When** it renders, **Then** it is server-rendered, indexable,
   breadcrumbed, and internally linked to relevant services/goals.

---

### Edge Cases

- **Reduced motion / no JavaScript**: All critical content and navigation must work with motion
  disabled and degrade gracefully if client JS fails; the hero and journeys have static equivalents.
- **Empty/placeholder content**: Sections whose content is not yet Verified must hide cleanly (no empty
  frames, no "Lorem ipsum", no placeholder stats leaking to production).
- **Spam / abuse on forms**: Turnstile failure, honeypot hits, or rate-limit breaches block submission
  without confusing legitimate users.
- **Formspree/Turnstile/Sanity outage**: Forms show a graceful error and the email fallback; content
  pages still render from cache; the site never hard-fails on a third-party outage.
- **Very long taxonomies**: Services (~110+), tools (~80+) and filters must paginate/virtualise without
  performance or accessibility regressions.
- **Deep-linking into filtered lists**: Canonicalisation prevents duplicate-content and index bloat
  from filter permutations.
- **Mega-menu on mid-size/touch**: No squeezed desktop menu on mobile; the full-screen nav takes over
  at the correct breakpoint with correct focus management.
- **Long headlines / localisation-ready copy**: Layouts must not break with longer Global-English
  strings; no flattened text baked into images.

---

## Requirements *(mandatory)*

### Functional Requirements — Content & Navigation
- **FR-001**: The site MUST present goal-/stage-/business-type-based navigation as **primary**, with
  service/tool/roadmap pages available for detail and SEO.
- **FR-002**: The header MUST be a sticky, selective-glass bar with logo left and the nav families
  **How It Works, Solutions, Services, Resources, About Us**, plus **See How It All Works** and **Build
  My Digital Growth Plan**; desktop mega-menus MUST be CMS-controlled.
- **FR-003**: Mobile navigation MUST use a compact logo and one menu button opening a full-screen /
  full-height, keyboard- and screen-reader-accessible menu (no squeezed desktop menu).
- **FR-004**: The homepage MUST support the complete 19-block content model (see Key Entities →
  Homepage model), deliverable in milestones but architecturally complete in the CMS.
- **FR-005**: The site MUST implement the primary routes in brief §12 (see `design/sitemap-and-routes.md`).
- **FR-006**: The footer MUST show CMS-controlled social links (Facebook, Instagram, YouTube,
  Pinterest — add/remove/reorder, hidden until a valid URL exists, accessible labels) and the support
  email; **no phone number**.

### Functional Requirements — Growth Plan Builder
- **FR-010**: The Growth Plan Builder MUST be a **guided multi-step form**, not a free AI engine,
  collecting: business type, current stage, main goal, existing setup, engagement preference, timeline,
  contact details.
- **FR-011**: Engagement preference MUST use **neutral ranges with no currency**: Small initial
  project · Focused growth project · Multi-service growth plan · Larger ongoing programme · Not sure yet
  · Prefer to discuss by email.
- **FR-012**: The builder MUST produce a structured output: Start here · Connect next · Add later ·
  Relevant capabilities · Example tools · Expected outcomes · How Infinite Weblinks can help.
- **FR-013**: Recommendations MUST come from **reviewed rule-based logic stored as structured content/
  data** (see `contracts/growth-plan-rules.md`); AI MAY later phrase an approved result but MUST NOT
  decide the recommendation logic.
- **FR-014**: On submit, the builder MUST validate input, pass Turnstile, and deliver only to
  `support@infiniteweblinks.com` via Formspree, with an accessible success state and no automatic
  visitor copy at launch.

### Functional Requirements — Services, Tools, Roadmaps
- **FR-020**: Services MUST be filterable by **category, goal, growth stage, business type, delivery
  model, and tool**.
- **FR-021**: Each service MUST display its **delivery model** (We Do the Work / We Bring In an Expert /
  We Run It End to End / You Run It After) and the ownership statement.
- **FR-022**: Each tool page MUST explain: what it does, why it may be useful, what it connects with,
  which businesses it suits, when it may not be needed, and related services.
- **FR-023**: Platform/tool logos MUST be labelled "Platforms and tools we work with" / "Examples of
  tools we can connect"; formal partnership wording MUST NOT be used unless verified.
- **FR-024**: Roadmaps MUST present phased sequences (per business situation) using the exact stage
  names; each phase MUST cross-link to relevant services/tools/goals.

### Functional Requirements — CMS & Editing
- **FR-030**: Editors MUST manage (add/edit/remove, publish/unpublish, preview) all content types:
  navigation & mega-menus, footer & social links, CTAs, goals, starting points, growth stages,
  services, tools, roadmaps, examples, case studies, testimonials, articles/resources, FAQs, SEO fields.
- **FR-031**: The page builder MUST be **controlled and modular**: approved section types only, no
  arbitrary CSS/unrestricted layout, with per-section `enabled`/visibility and ordering, allowed
  theme/layout variants, desktop/mobile media fields where needed, and accessible alt text + focal
  points.
- **FR-032**: Content MUST carry a status (Draft, Placeholder, Approval Required, Verified, Ready to
  Publish); only Verified/Ready appears publicly.
- **FR-033**: The CMS MUST enforce least-privilege roles for two admins and protect drafts/preview.

### Functional Requirements — Forms & Contact
- **FR-040**: All conversion MUST be form-led via Formspree with validation, accessible errors, spam
  protection and Cloudflare Turnstile; the support email is a visible fallback only.
- **FR-041**: Approved CTAs and routes MUST be: **Build My Digital Growth Plan** → `/growth-plan`,
  **See How It All Works** → `/how-it-works`, **Send Us Your Goals** → `/contact?subject=growth-goals`,
  **Ask Our Team** / **Send Us a Message** → `/contact`, **Get My Recommended Starting Point** →
  `/growth-plan`. No scheduling/"Book a Call" language anywhere.

### Non-Functional Requirements *(summaries — detail in linked design docs)*
- **NFR-Perf**: Meet Core Web Vitals "good" and per-page performance budgets; Lighthouse mobile 90+
  (95+ best-effort). Hero usable without animation; static renders before enhancement. See
  `design/performance.md`.
- **NFR-A11y**: WCAG 2.2 AA across public routes. See `design/accessibility.md`.
- **NFR-SEO**: Indexable goal/service/tool/roadmap/article pages, metadata, canonicals, sitemap/robots,
  breadcrumbs, Organization/Service/Article structured data, FAQ schema only when visible, GEO/AEO
  readiness. See `design/seo.md`.
- **NFR-Sec**: No secrets in Git; validated/sanitised inputs; security headers; least-privilege CMS;
  draft protection; consent before any non-essential scripts. See `design/security-privacy.md`.
- **NFR-Motion**: GSAP for hero/scroll storytelling (loaded only where used), Motion for UI
  micro-interactions, CSS for ambient; full reduced-motion support; avoid Three.js unless a validated
  prototype proves need. See `design/animation.md`.
- **NFR-Test**: Unit tests for the rules engine and utilities; component tests where valuable;
  Playwright critical journeys; a11y scans; visual regression; link, metadata and structured-data
  checks; performance checks. See `design/testing.md`.
- **NFR-Deploy**: Cloudflare Workers via OpenNext with preview-before-production; www→root; rollback.
  See `design/deployment.md`.

### Key Entities

**Official taxonomy (use these names exactly):**
- **8-stage Online Growth Journey**: Discovery & Plan · Foundation · Get Discovered · Build Trust ·
  Convert · Deliver & Operate · Retain · Advocacy & Growth.
- **3 cross-cutting systems** (run ACROSS the journey, not stages): AI & Automation · Analytics & Data ·
  Maintenance & Scale.
- **4 delivery models**: We Do the Work · We Bring In an Expert · We Run It End to End · You Run It
  After. Ownership line: *clients own their accounts, data and tools, whichever model applies; nothing
  is locked to Infinite Weblinks.*
- **Audiences**: Ecommerce brands · Creators · Businesses (local, service, B2B, software) · Established
  brands · Beginners moving online · Businesses adopting automation and AI.

**Content entities** (modelled in the CMS — full schema in `data-model.md`): Goal, StartingPoint,
GrowthStage, CrossCuttingSystem, Service, Tool, Roadmap, DeliveryModel, Example, CaseStudy, Testimonial,
Article/Resource, FAQ, BusinessType, Solution, NavigationMenu/MegaMenu, Footer, CTA, SiteSettings,
Page (modular sections), SectionType, SEOFields, GrowthPlanRuleSet.

**Homepage content model (19 blocks)**: Header & navigation · Hero connected universe · "The digital
world keeps getting bigger" · Goal Explorer · Eight-stage Online Growth Journey · Apparel connected
customer journey · Starting-Point Selector · Business Roadmaps · Services Explorer · Tool Universe ·
Four Delivery Models · Eight-stage working process · Why Infinite Weblinks · Case-study placeholders ·
Testimonial placeholders · Learning and resources · FAQ · Final Growth Plan CTA · Footer. (Placeholder
blocks are hidden until Verified.)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: On mobile (≈360–390px) and desktop, the homepage's core message (hero headline, slogan,
  CTAs, reassurance) is fully readable **without any animation** and with **no horizontal overflow** at
  360, 390, 768, 1024 and large-desktop widths.
- **SC-002**: A visitor can complete the Growth Plan Builder and reach a coherent, rule-based
  recommendation, then submit successfully, in a single session on mobile.
- **SC-003**: 100% of public pages emit correct metadata, a single canonical URL, and valid structured
  data where applicable; sitemap contains only Verified/published, indexable URLs.
- **SC-004**: `prefers-reduced-motion` users receive complete content and the static end-state with **no
  loss of information** and no motion that blocks reading or interaction.
- **SC-005**: Lighthouse mobile Performance ≥ 90 (target 95+) and Core Web Vitals in "good" on the
  homepage and a representative detail page.
- **SC-006**: Automated accessibility scans (axe) report **zero critical violations** on key routes;
  keyboard-only operation completes all critical journeys (nav, mega-menus, builder, forms, FAQ).
- **SC-007**: No unverified placeholder metric, testimonial, case study, client name, partnership claim
  or phone number appears in production output.
- **SC-008**: Two admins can, unaided, add a page from approved sections, reorder/hide sections, edit a
  mega-menu, and publish — without exposing arbitrary layout controls or breaking the design.
- **SC-009**: Every form submission is validated, Turnstile-verified, and delivered only to the team;
  spam attempts are blocked; no secret is present in the repository.
- **SC-010**: No public route relies on client-only animation to convey critical content (server-rendered
  text equivalents exist for the hero and journeys).

### Acceptance & Definition of Done
The build is "done" only when the constitution's Definition of Done (principle XIV) and the acceptance
checklist in `checklist.md` are satisfied and the convergence review (`analysis.md` → future
`/speckit-converge`) records no open blocking gaps. A per-area Definition of Done is consolidated in
`quickstart.md`.

---

## Assumptions

- **Goal-based navigation is primary**; the exact grouping of Solutions/Services/Resources may be
  refined during `plan`, but service pages remain available for detail and SEO (brief §12).
- **Sanity CMS** is used unless planning identifies a materially better free-first option; planning
  concluded Sanity remains the choice (see `research.md`).
- **English-only, single `en` locale at launch**, built hreflang-ready for future markets.
- **No visitor auto-reply email at launch**; team-only delivery to `support@infiniteweblinks.com`.
- **Two admin/editor users**; small-team maintainability is a design constraint.
- **The vibrant hero image and Growth Guide "book a call" language are references only**; the brief
  overrides them (email-led, editable-SVG hero).
- **Placeholder homepage blocks** (case studies, testimonials) ship hidden and are enabled later when
  Verified content exists.
- **Legal copy** (privacy, cookies, terms, accessibility statement) is drafted structurally but marked
  for professional review; no legal assurances are invented.

---

## Out of Scope (this build / v1)

- Booking calendars, phone-based sales, live chat, or any product login/account area.
- E-commerce checkout or client portals (Infinite Weblinks sells services; it is not a store).
- Multi-language localisation at launch (architecture is hreflang-ready).
- Automatic visitor confirmation emails, CRM integrations, and marketing automation pixels at launch
  (consent architecture is prepared for later).
- Final trademark/originality clearance of the logo and outlining of the live Sora wordmark to vector
  (human tasks pending per handoff; do not block preview builds).
