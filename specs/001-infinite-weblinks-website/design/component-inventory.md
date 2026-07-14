# Component & Section Inventory — Infinite Weblinks

Phase 1 design artifact. Catalogues the production components and the **approved modular section
types** the CMS page builder may compose. Everything here is **re-architected from scratch** as
accessible, server-first React (Next.js 16 App Router) — the design-handoff `_ds_bundle.js` and
`Homepage Opening Exploration.html` are visual references only, not source to copy.

**Conventions**
- **RSC** = React Server Component (default). **Client** = Client Component (interaction only).
- Every component reads design tokens (CSS custom properties from the approved token layer); no
  hard-coded colours. Motion via Motion/GSAP per `design/animation.md`; a11y per `design/accessibility.md`.
- ⚠ **Token blockers to resolve first** (from accessibility review): the pink→orange CTA gradient needs
  **dark** text (white fails AA at the orange end), and body text needs **section-scoped** colour
  aliases (on-dark / on-band / on-statement) rather than one global default. See `analysis.md`
  risks R-A11Y-1/2.

---

## 1. Primitives (design-system layer)

Rebuilt from the approved system; shared by all sections. RSC unless interaction noted.

| Component | Role | Client? | A11y / notes |
|---|---|---|---|
| `Button` | primary gradient CTA · brand tri-colour · secondary · ghost · text; sm/md/lg; icon slots | RSC (link) / Client (action) | 24px+ target, focus-visible ring, dark text on CTA gradient |
| `Logo` | Signature Crossover lockup + variants (mark, light, dark, solid) | RSC | Uses approved `logo/*.svg`; two words; min sizes; no baked glow |
| `IconTile` ("node") | colour-coded glowing tile wrapping one Lucide glyph | RSC | Decorative glyph `aria-hidden`; colour ≠ sole meaning |
| `Eyebrow` | uppercase wide-tracked label | RSC | Not a heading; paired with real heading |
| `GradientText` | one emphasised word per headline | RSC | Contrast-checked; text remains selectable |
| `Badge` | status/meaning pill (New/Popular/Free/Featured) + **content-status flag** | RSC | Placeholder/Draft flags never render in production |
| `Input` / `Textarea` / `Select` | labelled dark fields, hint/error/icon | Client | Real `<label>`, `aria-describedby`, `aria-invalid` |
| `Accordion` | FAQ / disclosure | Client | Native `<button>`+`aria-expanded`, keyboard, no hover-only |
| `Tabs` | underline tabs (e.g. filter axes) | Client | `role=tablist`, arrow-key roving focus |
| `Stepper` | connected process rail (spectrum for 8-stage; compact for builder) | RSC + Client progress | Not the only cue; labelled steps |
| `Card` | icon-tile content card ("Learn more →") | RSC | Whole-card link pattern accessible |
| `Table` | dark data table (delivery-model / tool matrices) | RSC | Real `<th scope>`; scrolls x on mobile |
| `StatBlock` | metric | RSC | **Hidden unless Verified** (no placeholder numbers) |
| `TestimonialCard` | quote + rating | RSC | **Hidden unless Verified**; SVG stars |
| `PricingCard` | plan tier | RSC | Likely unused at launch (no fixed pricing) |
| `CtaBanner` | full-width violet→pink→orange conversion banner | RSC | Dark text on gradient; single primary action |

---

## 2. Global chrome

| Component | Route scope | Client? | Notes |
|---|---|---|---|
| `SiteHeader` | all `(marketing)`/`(convert)` | Client (sticky + menu state) | Selective glass, sticky; logo left; nav families; two CTAs; focus not obscured (WCAG 2.4.11) |
| `MegaMenu` | desktop header | Client | CMS-driven columns; fade+slide (220ms); keyboard pattern, Esc, focus return |
| `MobileNav` | mobile header | Client | One button → full-screen menu; focus trap + restore; no squeezed desktop menu |
| `SkipLink` | all | RSC | First focusable; to `#main` |
| `SiteFooter` | all | RSC | Support email; CMS social links (hidden until valid URL); legal; **no phone** |
| `AnnouncementBar` | optional | RSC | CMS-toggled; dismissible; not required |
| `Breadcrumbs` | deep routes | RSC | BreadcrumbList schema; matches IA |
| `ConsentGate` | dormant at launch | Client | Architecture only; gates future non-essential scripts |

---

## 3. Hero & storytelling (custom illustrated layer)

Editable SVG, rebuilt from layers — never flattened raster with baked text. Motion is enhancement over
server-rendered text (see `design/animation.md`).

| Component | Used in | Client? | Notes |
|---|---|---|---|
| `HeroConnectedUniverse` | homepage | Client island over RSC text | Luminous infinity + 6 domain nodes (Website/Store, Search & Advertising, Social & Content, Customer Tools, Analytics, Automation & AI); static-first; reduced-motion end-state |
| `HeroCopy` | homepage | RSC | Eyebrow "DIGITAL GROWTH PARTNER", slogan, headline, support copy, CTAs, reassurance — server-rendered for SEO/AEO |
| `JourneySpectrum` | homepage, `/how-it-works` | RSC + Client progress | 8-stage rail using exact names; spectrum gradient; static text list fallback |
| `CrossCuttingSystemsBand` | `/how-it-works` | RSC | AI & Automation, Analytics & Data, Maintenance & Scale as running-through systems (not stages) |
| `ConnectedCustomerJourney` | homepage ("Apparel" scene) | Client island | Illustrative connected flow; needs static equivalent |
| `HowEverythingConnects` | `/how-it-works` | RSC + light motion | "One system, not silos" diagram (Growth Guide p.19) with text equivalent |

---

## 4. Approved modular section types (CMS page builder)

The page builder composes **only** these types (brief §13/§14). Each supports: `enabled`/visibility,
ordering, an allowed **theme** (dark cinematic / bright editorial `#F4F1EA` / bold full-colour), an
allowed **layout variant**, desktop/mobile media where relevant, alt text + focal points, and an
optional CTA. No arbitrary CSS. Section rhythm rule enforced: never >2 dark sections consecutively.

| Section type | Purpose | Maps to homepage block(s) | Key content refs |
|---|---|---|---|
| `heroConnectedUniverse` | The hero | 2 | headline, CTAs, node set |
| `editorialStatement` | Big-type reading moment | 3 ("The digital world keeps getting bigger") | heading, body, optional aside |
| `goalExplorer` | Interactive goal chooser | 4 | `goal[]` |
| `growthJourney` | 8-stage spectrum | 5 | `growthStage[]` |
| `connectedJourneyScene` | Illustrated connected customer journey | 6 | scene nodes |
| `startingPointSelector` | "Where are you now?" chooser | 7 | `startingPoint[]` |
| `roadmapShowcase` | Business roadmaps | 8 | `roadmap[]` |
| `servicesExplorer` | Filterable services preview | 9 | `service[]`, `serviceCategory[]` |
| `toolUniverse` | Tools we can connect | 10 | `tool[]`, `toolCategory[]` |
| `deliveryModels` | Four ways we deliver + ownership line | 11 | `deliveryModel[]` |
| `processSteps` | 8-step working process (Growth Guide p.23) | 12 | steps |
| `whyInfiniteWeblinks` | Differentiators (no fake proof) | 13 | value points |
| `caseStudyShowcase` | Case studies (hidden until Verified) | 14 | `caseStudy[]` |
| `testimonialWall` | Testimonials (hidden until Verified) | 15 | `testimonial[]` |
| `learningResources` | Articles/resources teasers | 16 | `article[]` |
| `faqSection` | FAQ accordion (+ FAQPage schema when shown) | 17 | `faq[]` |
| `finalCtaBanner` | Final Growth Plan CTA | 18 | `cta` |
| `richText` | General editorial prose block | (about, legal, learn) | portable text |
| `mediaFeature` | Image/illustration + copy (asymmetric) | (various) | media + focal point |
| `logoStrip` | "Platforms and tools we work with" | (various) | tool logos (never "partners") |
| `statBand` | Metrics band (hidden until Verified) | (optional) | `stat[]` |
| `stepListConnected` | Numbered connected sequence (anti-grid) | (various) | steps |
| `contactPrompt` | Email-led prompt + fallback email | (various) | `cta`, support email |

**Detail-page templates** (not free-form sections, but composed layouts): `ServiceDetail`,
`ToolDetail`, `RoadmapDetail`, `SolutionDetail`, `BusinessTypeLanding`, `StartingPointLanding`,
`ArticleDetail`, `CaseStudyDetail`, `ExampleDetail`, `LegalPage`, `ListingIndex` (services/tools/
roadmaps/learn with the filter island).

---

## 5. Interactive feature components

| Component | Route | Client? | Notes |
|---|---|---|---|
| `GrowthPlanBuilder` | `/growth-plan` | Client | Multi-step guided form; rules engine (see `contracts/growth-plan-rules.md`); Turnstile; Formspree submit; accessible step announcements + error summary |
| `GrowthPlanResult` | `/growth-plan` | Client/RSC | Structured output: Start here / Connect next / Add later / capabilities / example tools / expected outcomes / how we help |
| `ServiceFilter` / `ToolFilter` | `/services`, `/tools` | Client island | Facets (category, goal, stage, business type, delivery model, tool); canonical unfiltered page stays SSG |
| `ContactForm` | `/contact` | Client | Subject prefill; Turnstile; Formspree; team-only delivery |
| `TurnstileWidget` | forms | Client | Accessible; no cognitive test (WCAG 3.3.8) |
| `SearchAction` | optional | Client | Only if site search ships; drives WebSite SearchAction schema |

---

## 6. Component ↔ homepage block coverage

All 19 homepage blocks (spec Key Entities) are covered: block 1 → `SiteHeader`/`MegaMenu`/`MobileNav`;
blocks 2–18 → the section types above (in order); block 19 → `SiteFooter`. Placeholder blocks
(14 case studies, 15 testimonials) ship **disabled** and are enabled when Verified content exists.

## 7. Build order (aligns with milestones in `plan.md`)
1. Token layer + primitives (resolve contrast blockers first) + chrome.
2. Hero + JourneySpectrum + editorial/statement sections (homepage opening).
3. Remaining homepage section types.
4. `GrowthPlanBuilder` + forms.
5. Detail-page templates + listing/filter islands (services/tools/roadmaps/solutions/business-types/
   starting-points).
6. Learn/resources/case-studies/examples templates.

## 8. Icon policy
One family only: **Lucide** (`lucide-react`). Custom illustrated icons allowed **only** for major
storytelling scenes and must match Lucide's ~2px stroke, rounded geometry, glow and domain-colour
logic. No emoji, no second stroke weight, no unrelated illustration packs.
