# CLAUDE.md — Infinite Weblinks

Guidance for Claude Code working in this repository. This is an **existing production
project**, not a starter template. The website already exists — build on it, refine it, and
extend it. Optimize for the requested result: keep what works, and change what a better
result clearly justifies. Don't scaffold a redundant second app or throw away working work
for no gain, but a wholesale rework **is** on the table when the task genuinely calls for it —
explain a major architectural change briefly, then proceed.

This guidance is **capability-first**: Claude has broad freedom to use any relevant installed
skills, tools, libraries, components, frameworks, dependencies, agents, and workflows to
produce the best result. The rules here are **outcome-based** (what must be true of the
result) rather than blanket bans on tools. The governing source is
[`.specify/memory/constitution.md`](.specify/memory/constitution.md); this file applies it.

**Infinite Weblinks** is the marketing website for a Digital Growth Partner that helps
businesses plan, build and connect the right digital tools and services around their goals.

---

## Project Stack (what this project actually uses)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** — App Router, `src/` directory, import alias `@/*` → `src/*` |
| Language | **TypeScript** (strict) |
| UI runtime | **React 19** |
| Styling | **CSS Modules** + a **CSS-variable design-token system** (see `src/styles/`) — the current default. Not Tailwind *today*; Tailwind, shadcn/ui, or 21st.dev may be introduced when a task justifies it (see [Technical Freedom](#technical-freedom)). |
| Animation | **GSAP** (`gsap`) — the single motion runtime (the unused `motion`/`motion/react` package was removed; reintroduce only if a task justifies a second runtime) |
| Icons | **lucide-react** |
| Content | **Sanity** (`@sanity/client`, `@sanity/image-url`) — optional, flag-gated (see below); Studio lives in `studio/` |
| Validation | **Zod** (`zod`) for form/input schemas |
| Unit tests | **Vitest** (`tests/unit/`) |
| E2E + a11y | **Playwright** + **@axe-core/playwright** (`tests/e2e/`) |
| Hosting | **OpenNext** (`@opennextjs/cloudflare`) on **Cloudflare Workers** (Wrangler) |
| Package manager | **npm** · Node **≥ 20.9** |

> **Current state (factual, not a ban):** as of today this project styles with **CSS Modules
> and CSS-variable tokens**, and shadcn/ui is **not yet initialized** (there is no
> `components.json` and no Tailwind config). Describe the stack accurately — don't claim
> Tailwind is present when it isn't. But this is the *starting point*, not a locked
> foundation: introducing Tailwind, initializing shadcn, or pulling in 21st.dev components is
> allowed when it produces a better result. See [shadcn / 21st.dev](#shadcn--21stdev-components)
> and [Technical Freedom](#technical-freedom) below.

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
npm run dev        # dev/preview server — fine to run temporarily to verify a change; stop it after
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

Temporary dev/preview servers (`npm run dev`, `npm run cf:preview`) are fine for verifying
work — **stop them after verification**. `npm run cf:deploy` deploys to production and
therefore **requires explicit user authorization** (see [Actions & Authorization](#actions--authorization)).

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

### Capability-first skill use

**Automatically select and use any skills directly relevant to the task, and combine multiple
skills when that produces a better result.** Skills are tools, not gated actions — you do
**not** need permission merely to use one. Invoke a skill by typing `/skill-name`.

The one limit is **relevance, not permission**: don't activate unrelated skills just to
increase the count or pad a response — that wastes context and degrades output. Pick the
skills that help; use as many of them as genuinely help.

Skills to reach for on this project, by dimension (combine freely):

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
the set but are simply **not relevant** to a marketing site — skip them for web work on
relevance grounds (not because any tool is banned).

---

## GitHub Spec Kit Workflow

The official [GitHub Spec Kit](https://github.com/github/spec-kit) is installed as **10
`speckit-*` skills**. Use the **full** Spec Kit workflow when it adds value — new production
features, significant changes, and work with meaningful ambiguity. Use a **lighter** workflow
when the task is already clear; don't force a long planning cycle onto small or obvious work.

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

- **Right-size the process.** Small, low-risk, or already-clear changes (a one-line copy fix,
  a doc update) use a leaner workflow — a full spec-and-plan cycle is not required and should
  not be forced.
- **Don't run `/speckit-implement` on an ambiguous or unplanned feature.** For real features,
  implementation should not begin before the spec and plan are sufficiently clear.
- Bring in supporting skills at the stages where they help — and combine them freely.

### The Project Constitution

`.specify/memory/constitution.md` (v2.0.0) is the **governing source of project principles**
(spec before code, right-sized; mobile-first; performance as a validation outcome; deliberate
design; capability-first skill use; human-sounding content; SEO, accessibility and security as
part of the build; test important behavior; the right-sized Spec Kit workflow; efficient
context; preview without deployment; a verified Definition of Done; and **technical freedom,
outcome-bound**). The principles are outcome-based, not blanket tool bans. Every plan must
pass its Constitution Check; documented exceptions go in the plan's Complexity Tracking.

---

## shadcn / 21st.dev Components

The **official shadcn skill is installed** at `.claude/skills/shadcn/` (and mirrored at
`.agents/skills/shadcn/`), tracked in `skills-lock.json`. Today the project uses **CSS Modules
and CSS-variable tokens** and shadcn is **not yet initialized** (no `components.json`, no
Tailwind). Both of the following paths are fully available — pick the one that produces the
better result:

1. **Adapt into the existing system.** Use shadcn/21st.dev components as structure and
   composition references and translate their Tailwind classes into this repo's CSS Modules +
   tokens (in `src/styles/`). `21ST_DEV_GUIDE.md` walks through this. This is often the lowest-
   friction path for a single component and keeps one styling system.
2. **Introduce Tailwind / initialize shadcn / add 21st.dev components directly.** When a task
   genuinely benefits — e.g. you're bringing in many components, or shadcn's primitives are the
   right foundation for the work — you may add Tailwind and run `shadcn init`. Reconcile it with
   the existing CSS-variable tokens and CSP rather than blindly replacing the design foundation,
   briefly explain the choice, then proceed. This no longer requires a separate approval step.

Either way: use the shadcn/21st.dev skills to **research** patterns and **inspect** registry
components (`npx shadcn@latest search <query>`, `--view`, `--dry-run`), and **read every
component top-to-bottom** before using it — keep the effects that serve the design, drop the
ones that don't.

---

## Animation, Icons & Libraries

This project **already ships GSAP, Motion, and lucide-react** and the design references call
for rich, expressive motion — so **there are no bans on animation, client components,
libraries, or visual effects**. Reach for the right tool:

- **GSAP** for timeline-driven / scroll-choreographed sequences and component-level animation —
  it is now the single, code-split motion runtime (the previously-installed-but-unused `motion`
  package was removed to avoid a duplicate runtime). Reach for the shared `Reveal`/motion helpers
  in `src/components/motion` and `src/lib/motion`; reintroduce a second runtime only if a task
  genuinely justifies it.
- **lucide-react** is the default icon set; bring in others when a design genuinely needs them.
- Advanced techniques — scroll choreography, SVG animation, masks, gradients, glass, canvas,
  WebGL/3D — are fair game **when they serve the design**.
- **Client Components are fully allowed** wherever interaction, animation, or browser APIs
  require them. Prefer Server Components where suitable and push `"use client"` toward the
  smallest sensible boundary — as a preference, not a hard rule.

Claude **may use any suitable skill, component source, or library** when the task justifies
it. Do not make a build visually minimal just to hit a metric — hit the metric.

---

## Technical Freedom

Constitution Principle XV, applied here: **the result leads, not the current stack.** When a
task justifies it, Claude may use or introduce any of the following (and anything comparable)
without asking permission first:

- **Tailwind**, **shadcn/ui**, **21st.dev components**, or keep **CSS Modules** — whichever
  serves the work
- **new npm packages**, and removal of ones that no longer earn their weight
- **client components** and **server components** — pick per need
- **GSAP**, **Motion**, **Three.js / WebGL / canvas / shaders / SVG**
- **external component sources**, **new architecture or refactors**
- any suitable **framework, service, API, database, testing tool, or build tool**

Guidance for using that freedom well:

- **Preserve the current stack when it's the best choice; change it when a better result
  clearly justifies the change.** Don't keep something merely because it already exists, and
  don't churn the foundation for novelty.
- **Optimize for the requested result, not for minimal diff.** A larger, correct change beats a
  small one that under-delivers.
- **Explain major architectural choices briefly, then proceed** — a sentence or two on why, not
  a permission request. Reach for [`AskUserQuestion`] only when missing information could
  *materially* change the product; normal implementation decisions don't need sign-off.
- **Freedom is outcome-bound.** It never overrides the
  [Non-Negotiable Quality Outcomes](#non-negotiable-quality-outcomes) below — mobile,
  performance, accessibility, security, SEO, correctness, maintainability, and secret
  protection still hold, whatever tools you use.

[`AskUserQuestion`]: #working-style

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

- **Ask only when it matters** — raise a question only when missing information could
  *materially* change the product; then proceed. Don't ask permission for normal
  implementation decisions or merely to use a skill/tool/library.
- **Bias to working software** — prefer verified, working results over rigid process. Explain a
  major architectural choice briefly, then act on it.
- **Plan before large edits** — for anything touching more than a couple of files or adding a
  feature, produce a brief plan (files, approach, order) first; use Spec Kit for real features.
- **TDD when practical** — for logic-heavy code (form validation, data transforms, adapters),
  write failing tests first. This project has a real Vitest + Playwright/axe suite — extend it.
- **Security & quality before delivery** — run `/owasp-security` on new endpoints/handlers and
  review the diff (`/code-review`) before handoff.
- **Efficient context** — prefer concise artifacts over re-explaining the project in chat;
  summarize decisions, changed files, checks, and next actions.

---

## Actions & Authorization

This is a **repository-control clarification, not a technical restriction** — it does not
narrow the technical or creative freedom above. It only separates routine work from actions
that change shared, published, or production state.

As part of normal work, and **without asking permission first**, Claude may:

- create task branches
- edit files
- add or remove dependencies
- run temporary development or preview servers (stopping them after verification)
- run migrations in **safe development / throwaway** environments
- run lint, typecheck, tests, and builds
- commit changes
- push **task** branches
- open and update pull requests

**Explicit user authorization is required** before any of the following:

- **Merging a pull request**
- **Pushing directly to `main`** or another protected branch
- **Force-pushing**
- **Rewriting published Git history** (rebasing/amending commits already pushed and shared)
- **Deleting remote branches**
- **Production deployment** (e.g. `npm run cf:deploy`)
- **Destructive changes to production data**
- **Creating paid resources or incurring charges**
- **Exposing, rotating, or transferring secrets**
- **Deleting important remote resources** (repositories, branches with unmerged work,
  releases, remote environments)

**Major foundation changes** — replacing the framework, CMS, database, hosting platform, or
primary styling system — **remain allowed when genuinely justified** (see
[Technical Freedom](#technical-freedom)) and do **not** require permission merely because they
are large. When you make one, **document the reason, expected impact, migration path, and
rollback path in the pull request.**

**External services** may be integrated in code, but Claude must **not** create accounts,
accept paid plans, transmit real user data, or incur charges without explicit authorization.

When unsure whether an action crosses one of these lines, ask via [`AskUserQuestion`].

---

## Guardrails (the few real limits)

These are the outcome- and safety-based limits — not tool bans:

- Do **not** modify files inside `.claude/skills/` — they are upstream skill definitions.
- Do **not** deploy to production, make destructive production-data changes, rotate/expose
  secrets, incur charges, or delete important remote resources **without explicit
  authorization** (see [Actions & Authorization](#actions--authorization)).
- Do **not** rework the site wholesale *for no benefit* — a large change is welcome when it
  produces a clearly better result, and wasteful when it doesn't. Optimize for the result.
- Do **not** invoke unrelated skills to pad responses — use the ones that genuinely help
  (combining freely), and skip the rest on relevance grounds.
- Do **not** put real secrets in `.env.example` (names + placeholders only), and keep secrets
  out of the client bundle.
- Do **not** ship a change that regresses the [Non-Negotiable Quality Outcomes](#non-negotiable-quality-outcomes)
  (mobile, performance, accessibility, security, SEO, correctness) — freedom is outcome-bound.

---

## Skill Caveats (external dependencies)

Some installed skills need setup or external services before they can run:

- **`tdd-guard`** — requires a per-project npm install (e.g. `tdd-guard-vitest`) before it can
  enforce anything; the skill guides setup but cannot run without the package.
- **API-dependent SEO skills** (`seo-dataforseo`, `seo-google`, …) — require external API
  keys / env vars configured per project before use.
- **Claude Mem advanced tools** (memory-server skills) — require a running Docker container /
  MCP server.
- **Scientific & data skills** — not relevant to this marketing site; skip them for web work on
  relevance grounds (they aren't banned, they just don't apply).

See `CLAUDE_SKILLS_REPORT.md` for the full installation record and skill inventory.
