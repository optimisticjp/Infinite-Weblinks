# CLAUDE.md — Infinite Weblinks

Guidance for Claude Code working in this repository. This is an **existing production
project**, not a starter template. The website already exists — build on it, refine it, and
extend it. Do not scaffold a second app, and do not replace the current site wholesale
unless a specification explicitly calls for it.

**Infinite Weblinks** is the marketing website for a Digital Growth Partner that helps
businesses plan, build and connect the right digital tools and services around their goals.

---

## Project Stack (what this project actually uses)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** — App Router, `src/` directory, import alias `@/*` → `src/*` |
| Language | **TypeScript** (strict) |
| UI runtime | **React 19** |
| Styling | **CSS Modules** + a **CSS-variable design-token system** (see `src/styles/`). **No Tailwind.** |
| Animation | **GSAP** (`gsap`) and **Motion** (`motion` / `motion/react`) |
| Icons | **lucide-react** |
| Content | **Sanity** (`@sanity/client`, `@sanity/image-url`) — optional, flag-gated (see below); Studio lives in `studio/` |
| Validation | **Zod** (`zod`) for form/input schemas |
| Unit tests | **Vitest** (`tests/unit/`) |
| E2E + a11y | **Playwright** + **@axe-core/playwright** (`tests/e2e/`) |
| Hosting | **OpenNext** (`@opennextjs/cloudflare`) on **Cloudflare Workers** (Wrangler) |
| Package manager | **npm** · Node **≥ 20.9** |

> **Important:** this project uses **CSS Modules and CSS-variable tokens, not Tailwind**, and
> shadcn/ui is **not** initialized (there is no `components.json` and no Tailwind config). Do
> not claim otherwise, and do not silently convert the project to Tailwind. See
> [shadcn / 21st.dev](#shadcn--21stdev-components) below for how to use those skills anyway.

### Content model — Sanity is flag-gated

The public site renders **reviewed local seed content by default** and issues **no Sanity
queries**. Live CMS reads are gated behind `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED` (default
`false`). The Sanity project id/dataset are public identifiers; server-only tokens (draft
mode, preview, revalidation) are added per-milestone. See `.env.example` for the full,
placeholder-only inventory — never put real secrets there.

---

## Commands

```bash
npm ci             # install exactly from package-lock.json (preferred in CI/web)
npm run dev        # dev server — ONLY when the user explicitly asks to run it
npm run build      # Next.js production build (webpack)
npm run start      # serve the production build (needed before e2e)
npm run lint       # ESLint (eslint .)
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
npm run test       # unit tests (Vitest)
npm run test:e2e   # Playwright + axe (builds/serves via next start on port 3101)
npm run cf:build   # OpenNext → Cloudflare Worker bundle (build only, no deploy)
npm run cf:preview # cf build + local preview
npm run cf:deploy  # cf build + DEPLOY — never run without explicit permission
npm run seed:export# export reviewed Sanity seed content
```

Do **not** run `npm run cf:deploy` or start a persistent `npm run dev` server unless the user
explicitly asks.

---

## Repository Layout

```
src/app/            App Router routes: (marketing) and (convert) route groups, api/ handlers
src/components/     brand/ builder/ chrome/ forms/ hero/ primitives/ routes/ sections/ seo/
                    troubleshooter/ viz/  — feature-grouped React components (CSS Modules)
src/lib/            content/ forms/ growth-plan/ motion/ sanity/ seo/ validation/  — logic
src/styles/         globals.css + tokens/ (base, colors, effects, spacing, typography .css)
studio/             Sanity Studio: schemaTypes/, structure/, seed/
tests/unit/         Vitest unit tests           tests/e2e/  Playwright + axe specs
public/             static assets (brand-logos/, …)
docs/design-references/  target visual direction (reference images + README)
scripts/            export-sanity-seed.ts, fetch-brand-logos.mjs
```

Config lives at the root: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
`open-next.config.ts`, `wrangler.jsonc`, `playwright.config.ts`, `vitest.config.ts`,
`.prettierrc.json`.

---

## Design Direction

The target visual direction lives in **`docs/design-references/`** (reference images + a
`README.md`). Review the references before making major design decisions. The direction is
deliberately **vibrant and experimental**:

- dark, space-inspired backgrounds; neon blue/purple/pink/cyan/orange lighting; glowing
  gradients; connected-systems and journey visuals; large bold headings; premium cards and
  panels; rounded borders; subtle glass effects; illustrated digital ecosystems; strong CTAs;
  alternating dark/light sections; polished desktop **and** mobile layouts.

You have real creative freedom here — see [Creative Freedom](#creative-freedom). Use the
references for direction, then create original content and layouts that fit Infinite Weblinks;
do not copy reference text verbatim.

---

## 322 Installed Claude Code Skills

This repo ships **322 skills** under `.claude/skills/` — **311** curated third-party skills,
the **10-skill GitHub Spec Kit** workflow, and the **1 official shadcn/ui** skill. They are
available to every Claude Code session run inside this repo.

### Selective skill activation (do not activate everything)

Read the task first, then invoke only the skills that are **directly relevant**. Activating
unrelated skills wastes context and degrades output. Invoke a skill by typing `/skill-name`.

Skills to reach for on this project, by dimension:

| Dimension | Skills |
|---|---|
| UI/UX design | **`ui-ux-pro-max`** (full UI/UX orchestration), `design`, `design-system`, `brand`, `ui-styling` |
| Frontend implementation | **`frontend-design`** — layout, components, responsive patterns |
| Copy & tone | **`humanizer`** — remove AI-writing fingerprints, make copy sound human; plus `copywriting`, `copy-editing` |
| SEO | **`seo`**, `seo-technical`, `seo-content`, `seo-schema`, `seo-sitemap`, `seo-audit`, and the AI-search/GEO/AEO skills |
| Marketing & CRO | **`cro`**, `marketing-plan`, `product-marketing`, `email`, `content-strategy`, `landing-page` flows |
| Security | **`owasp-security`** — review new endpoints and form handlers against OWASP Top 10 |
| Testing / TDD | **`tdd-guard`** (needs per-project setup — see caveats), `write-tests`, `test-coverage` |
| Context & planning | **`context-engineering`**, `make-plan`, `brainstorm`, project memory/handoff skills |
| Spec workflow | the 10 **`speckit-*`** skills (see below) |

Data-heavy/scientific skills (`scanpy`, `rdkit`, `qiskit`, `pytorch-lightning`, …) exist in
the set but are **not relevant** to this marketing site — do not invoke them for web work.

---

## GitHub Spec Kit Workflow

The official [GitHub Spec Kit](https://github.com/github/spec-kit) is installed as **10
`speckit-*` skills**. Spec Kit is the **default workflow** for new production features,
significant changes, and any work with meaningful ambiguity.

### Default sequence

```
constitution → specify → clarify → plan → checklist → tasks → analyze → implement → converge
```

| Stage | Skill | Purpose |
|---|---|---|
| constitution | `/speckit-constitution` | Establish/amend governing project principles |
| specify | `/speckit-specify` | Capture the feature spec: outcome, users, requirements, success criteria |
| clarify | `/speckit-clarify` | Resolve ambiguity before planning |
| plan | `/speckit-plan` | Implementation plan + design artifacts |
| checklist | `/speckit-checklist` | Validate requirement completeness/clarity/consistency |
| tasks | `/speckit-tasks` | Dependency-ordered, actionable tasks |
| analyze | `/speckit-analyze` | Cross-artifact consistency (spec ↔ plan ↔ tasks) |
| implement | `/speckit-implement` | Execute the tasks |
| converge | `/speckit-converge` | Assess build vs spec/plan; append remaining work |

There is also `/speckit-taskstoissues` to turn tasks into GitHub issues.

**Rules**

- Very small, low-risk changes (a one-line copy fix) may use a leaner workflow — a full
  spec-and-plan cycle is not required.
- **Never run `/speckit-implement` on an ambiguous or unplanned feature.** Implementation
  must not begin before the spec and plan are sufficiently clear.
- Select supporting skills during the relevant Spec Kit stages, not all at once.

### The Project Constitution

`.specify/memory/constitution.md` is the **governing source of project principles** (spec
before code; mobile-first; performance; deliberate design; selective skill activation;
human-sounding content; SEO, accessibility and security as part of the build; test important
behavior; the Spec Kit workflow; efficient context; preview without deployment; and a
verified Definition of Done). Every plan must pass its Constitution Check; documented
exceptions go in the plan's Complexity Tracking.

---

## shadcn / 21st.dev Components

The **official shadcn skill is installed** at `.claude/skills/shadcn/` (and mirrored at
`.agents/skills/shadcn/`), tracked in `skills-lock.json`. **shadcn is not initialized in this
project** — there is no `components.json` and no Tailwind, because Infinite Weblinks uses **CSS
Modules and CSS-variable tokens**.

You may still use the shadcn and 21st.dev skills to:

- **research** component patterns and composition,
- **inspect** registry components (`npx shadcn@latest search <query>`, `--dry-run` / `--view`),
- **adapt component ideas** into this project's CSS-Modules + token system, and
- **initialize shadcn** *only if a future specification explicitly requires it*.

Because shadcn/21st.dev components ship as Tailwind classes, adapting them here means
translating their structure into CSS Modules and this repo's CSS-variable tokens (in
`src/styles/`) — not pasting Tailwind utilities. `21ST_DEV_GUIDE.md` describes the general
import-and-adapt workflow; read a component top-to-bottom before using it, strip effects you
don't need, and keep the effects that serve the design.

> **Any Tailwind adoption or shadcn initialization is a separate proposal.** If a spec calls
> for it, present it on its own with an impact report before changing the project's styling
> foundation. Do not convert to Tailwind as a side effect of importing a component.

---

## Animation, Icons & Libraries

This project **already ships GSAP, Motion, and lucide-react** and the design references call
for rich, expressive motion — so **there are no bans on animation, client components,
libraries, or visual effects**. Reach for the right tool:

- **GSAP** for timeline-driven / scroll-choreographed sequences; **Motion** (`motion/react`)
  for component-level animation and gesture/layout transitions. Prefer one primary runtime per
  feature for consistency, but use both where each fits.
- **lucide-react** is the default icon set; bring in others when a design genuinely needs them.
- Advanced techniques — scroll choreography, SVG animation, masks, gradients, glass, canvas,
  WebGL/3D — are fair game **when they serve the design**.
- **Client Components are fully allowed** wherever interaction, animation, or browser APIs
  require them. Prefer Server Components where suitable and push `"use client"` toward the
  smallest sensible boundary — as a preference, not a hard rule.

Claude **may use any suitable skill, component source, or library** when the specification
justifies it. Do not make a build visually minimal just to hit a metric — hit the metric.

---

## Non-Negotiable Quality Outcomes

Creative freedom is real, but these outcomes are **mandatory** — they are validation
requirements, not creative limits. Every change must deliver them, whatever tools get it there:

- **Excellent mobile behavior** — deliberate mobile experience, validated at ~360px and
  ~390px (and up through tablet/desktop), with **no horizontal overflow** and touch-friendly
  targets. Mobile is not a shrunk desktop.
- **Fast loading** — Core Web Vitals green where realistically possible; optimize images,
  fonts (self-hosted via `next/font`), and client JS; scale heavy motion down on mobile /
  reduced-motion rather than deleting the direction.
- **Accessibility** — WCAG 2.1 AA baseline: semantic HTML, keyboard operability, visible
  focus, meaningful alt text, sufficient contrast, and `prefers-reduced-motion` support. The
  e2e suite runs **axe** checks — keep them green.
- **Security** — validate inputs (Zod), protect form handlers and endpoints, keep secrets out
  of the client and out of `.env.example`. The site already sets a strict CSP and security
  headers in `next.config.ts`, and forms use rate-limiting (Cloudflare rule + in-memory
  fallback) and Turnstile. Run `/owasp-security` on new server surfaces.
- **Coherent design** — a deliberate, consistent token-driven system (colors, spacing, type,
  effects in `src/styles/tokens/`), not ad-hoc styling.
- **Green checks** — `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`
  (Playwright + axe), and `npm run build` all pass for the change. `npm run cf:build` should
  also succeed for hosting-affecting changes.

---

## Creative Freedom

- **Build boldly when the direction calls for it** — vibrant, experimental, animated
  interfaces are encouraged and match the design references.
- **Adapt complexity, don't delete it** — for mobile and reduced-motion users, scale the
  experience down gracefully (simpler motion, lighter effects, static fallbacks).
- **The aesthetic and specification lead** — match the selected visual direction and the spec.
- **Performance, accessibility, mobile quality, and security are validation requirements, not
  reasons to make every project minimal.** Hit the bar; don't lower the ambition to hit it.

---

## Working Style

- **Ask essential questions only** — 1–3 clarifying questions before a large task, then begin.
- **Plan before large edits** — for anything touching more than a couple of files or adding a
  feature, produce a brief plan (files, approach, order) first; use Spec Kit for real features.
- **TDD when practical** — for logic-heavy code (form validation, data transforms, adapters),
  write failing tests first. This project has a real Vitest + Playwright/axe suite — extend it.
- **Security & quality before delivery** — run `/owasp-security` on new endpoints/handlers and
  review the diff (`/code-review`) before handoff.
- **Efficient context** — prefer concise artifacts over re-explaining the project in chat;
  summarize decisions, changed files, checks, and next actions.

---

## What Not To Do

- Do **not** modify files inside `.claude/skills/` — they are upstream skill definitions.
- Do **not** convert the project to Tailwind or initialize shadcn without an explicit,
  separately-proposed spec + impact report.
- Do **not** replace or overwrite the existing website wholesale unless a spec requires it.
- Do **not** run `npm run cf:deploy`, start a persistent `npm run dev`, or commit/push unless
  the user explicitly asks.
- Do **not** invoke skills speculatively to pad responses — only when they meaningfully help.
- Do **not** put real secrets in `.env.example` (names + placeholders only).

---

## Skill Caveats (external dependencies)

Some installed skills need setup or external services before they can run:

- **`tdd-guard`** — requires a per-project npm install (e.g. `tdd-guard-vitest`) before it can
  enforce anything; the skill guides setup but cannot run without the package.
- **API-dependent SEO skills** (`seo-dataforseo`, `seo-google`, …) — require external API
  keys / env vars configured per project before use.
- **Claude Mem advanced tools** (memory-server skills) — require a running Docker container /
  MCP server.
- **Scientific & data skills** — irrelevant to this marketing site; do not invoke for web work.

See `CLAUDE_SKILLS_REPORT.md` for the full installation record and skill inventory.
