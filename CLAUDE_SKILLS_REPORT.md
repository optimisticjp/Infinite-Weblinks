# Claude Code Skills & Spec Kit — Installation Record

This document records the installation of the Claude Code skill infrastructure and GitHub
Spec Kit into **Infinite Weblinks**, copied from the master template.

## Source

| | |
|---|---|
| Source template repository | `optimisticjp/claude-web-builder-skills` |
| Source template commit | `ceb9b0a449f619f37542c0f1acc1c94f986e7b6d` (Merge PR #5 — shadcn/ui init, 2026-07-15) |
| Target repository | `optimisticjp/Infinite-Weblinks` |
| Target branch | `claude/add-skills-spec-kit-gupgtu` (based on the live `main` website state — see [Branch base](#branch-base) below) |
| Installation date | 2026-07-17 |
| Installed by | Claude Code |

## Branch base

The working branch `claude/add-skills-spec-kit-gupgtu` is based on the **live `main` website
state**, which includes the current site redesign.

At the start of this work the **local** `origin/main` ref was **stale** — it pointed at
`3fd8a23` (before the redesign / cleanup was merged), while the branch HEAD was already at
`3cc6c32`. A `git fetch origin` **refreshed** the ref: `origin/main` is now
`3cc6c328fbf05b9118cb7c47c2cbd005a9a43ede`, an **exact match** with the branch HEAD. The branch
is therefore built directly on the current production website — **no re-cut or rebase was
needed, and the site redesign was neither reverted nor dropped.**

## Skill totals

| Category | Count |
|---|---|
| **Total skills** | **322** |
| Original curated third-party skills | 311 |
| GitHub Spec Kit skills (`speckit-*`) | 10 |
| Official shadcn/ui skill | 1 |

The 10 Spec Kit skills are: `speckit-analyze`, `speckit-checklist`, `speckit-clarify`,
`speckit-constitution`, `speckit-converge`, `speckit-implement`, `speckit-plan`,
`speckit-specify`, `speckit-tasks`, `speckit-taskstoissues`.

Source-documented breakdown of the 311 original skills (per the template's own manifest):
UI/UX Pro Max (7), Blader Humanizer (1), Frontend Design / Anthropic (1), Claude SEO (25),
Marketing Skills (44), OWASP Security (1), TDD Guard (1), Context Engineering Kit (67),
Claude Scientific Skills (147), Claude Mem (17). `311 + 10 (Spec Kit) + 1 (shadcn) = 322`.

## Paths copied (from the template into this repo)

| Path | Contents |
|---|---|
| `.claude/skills/` | 322 skill folders, 2137 files, **0 symlinks** (each folder has a `SKILL.md`) |
| `.specify/` | Spec Kit engine — `memory/constitution.md`, `templates/`, `scripts/bash/`, `workflows/`, `integrations/`, `init-options.json`, `integration.json` (17 files) |
| `.agents/skills/shadcn/` | Official shadcn agent skill mirror (15 files: `SKILL.md`, `cli.md`, `mcp.md`, `registry.md`, `customization.md`, `rules/`, `agents/`, `assets/`, `evals/`) |
| `skills-lock.json` | Skill lockfile (records the shadcn skill source + computed hash) |
| `21ST_DEV_GUIDE.md` | 21st.dev / shadcn component import-and-adapt workflow guide |

## Paths intentionally NOT copied

Per the installation brief, none of the template's **application** files were copied — the
target already has its own production architecture:

- `src/` (template starter app) — **not copied**
- `public/` (template assets) — **not copied**
- `package.json`, `package-lock.json` — **not copied**
- `next.config.*`, `tsconfig.json`, `eslint.config.*`, `postcss.config.*` — **not copied**
- **`components.json` — deliberately not copied.** Infinite Weblinks uses **CSS Modules**, not
  the template's Tailwind config; copying `components.json` would misconfigure shadcn for this
  project. shadcn is intentionally **not initialized** here.
- `README.md`, `INSTALL_REPORT.md` — **not copied** (target keeps its own README)
- Any starter homepage / template components — **not copied**

## Target application files preserved (unchanged)

All pre-existing tracked files were verified byte-for-byte unchanged (git tree-hash compared
against a pre-install baseline). No original application file was removed or modified:

`src/`, `public/`, `studio/`, `tests/`, `scripts/`, `package.json`, `package-lock.json`,
`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `open-next.config.ts`,
`wrangler.jsonc`, `playwright.config.ts`, `vitest.config.ts`, `.prettierrc.json`,
`src/styles/` (CSS + design tokens), `.env.example`, `.gitignore`, `README.md`, `docs/`
(including `docs/design-references/`).

Result: **0 tracked files modified or deleted.**

## Project-specific CLAUDE.md

A **new, project-specific `CLAUDE.md`** was written for Infinite Weblinks (the template's
`CLAUDE.md` was **not** copied). It documents the target's real stack — Next.js 16 App Router,
React 19, TypeScript, **CSS Modules + CSS-variable tokens (no Tailwind)**, GSAP, Motion,
lucide-react, Sanity (flag-gated), Vitest, Playwright + axe, and OpenNext on Cloudflare
Workers — plus selective skill activation, the Spec Kit workflow, the constitution, the
shadcn/21st.dev availability (research/adapt only; not initialized), animation/library
freedom, and the mandatory mobile/performance/accessibility/security quality outcomes. It does
**not** claim Tailwind or an initialized shadcn.

## UI/UX Pro Max — full working skill (real `data/` and `scripts/`)

The `ui-ux-pro-max` skill was installed as a **fully functional skill**, not the broken
placeholder from the template. As copied from the master template, this one skill shipped two
**dangling symlinks** (`data`, `scripts`) that pointed at a non-existent `src/ui-ux-pro-max/`
path — they were dead in the template itself.

**Fix applied.** The official UI/UX Pro Max CLI was run in a temporary directory **outside** the
repo (`npx uipro-cli@latest init --ai claude --offline`), which generates the skill with real
directories. Only the single folder `.claude/skills/ui-ux-pro-max/` was then replaced with the
freshly generated one; **no other skill was touched**, and the temporary directory was deleted.
The generated Python bytecode cache (`scripts/__pycache__/`) was excluded so no `.pyc` files are
committed.

Result — `.claude/skills/ui-ux-pro-max/` now contains **28 real files, 0 symlinks**:

- `SKILL.md` (14 KB, current CLI version)
- **`scripts/` — a real directory** with `search.py`, `core.py`, `design_system.py`
- **`data/` — a real directory** with the design database: `styles.csv`, `colors.csv`,
  `typography.csv`, `icons.csv`, `charts.csv`, `landing.csv`, `products.csv`, `ui-reasoning.csv`,
  `ux-guidelines.csv`, `web-interface.csv`, `react-performance.csv`, and a `stacks/` folder of
  13 stack profiles (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind,
  shadcn, Astro, Nuxt, and more).

**Functionality test — passed (exit 0).** Run from the target location:

```
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "digital agency futuristic vibrant" --design-system -p "Infinite Weblinks"
```

It returned a full recommended design system (pattern, style, colors, typography, effects,
anti-patterns) for "Infinite Weblinks". `search.py` uses only the Python standard library (no
pip dependencies), and Python 3.11 is available in the environment. The output was used **only**
to confirm the skill runs — no application source code was changed based on it.

## Verification results

### Structure (Phase 7) — all pass

| Check | Result |
|---|---|
| `.claude/skills/` contains exactly 322 skill folders | ✅ 322 |
| Every skill folder contains `SKILL.md` | ✅ 0 missing |
| 10 Spec Kit skills present | ✅ all 10 |
| `.claude/skills/shadcn/SKILL.md` exists | ✅ |
| `ui-ux-pro-max/data/` is a **real directory** (not a symlink) | ✅ |
| `ui-ux-pro-max/scripts/` is a **real directory** (not a symlink) | ✅ |
| `ui-ux-pro-max/scripts/search.py` runs successfully | ✅ exit 0 |
| Zero symlinks remain under `.claude/skills/` | ✅ 0 |
| `.specify/memory/constitution.md` exists | ✅ |
| `.agents/skills/shadcn/` exists (with `SKILL.md`) | ✅ |
| `skills-lock.json` is valid JSON | ✅ |
| `CLAUDE.md` accurately reflects Infinite Weblinks | ✅ |
| No original target application file removed | ✅ |
| No protected application file changed | ✅ |

### Build & tests (Phase 8) — all pass

| Step | Command | Result |
|---|---|---|
| Install | `npm ci` | ✅ 769 packages (4 moderate audit advisories, pre-existing in the lockfile) |
| Lint | `npm run lint` | ✅ pass (eslint already ignores `.claude/**`, `.specify/**`) |
| Typecheck | `npm run typecheck` | ✅ pass (`tsc --noEmit`) |
| Unit tests | `npm run test` | ✅ 124 passed (10 files, Vitest) |
| Production build | `npm run build` | ✅ pass (Next.js 16, webpack) |
| E2E + a11y | `npm run test:e2e` | ✅ 109 passed (Playwright + axe; pre-installed Chromium at `/opt/pw-browsers/chromium`) |
| Cloudflare build | `npm run cf:build` | ✅ pass (OpenNext bundle → `.open-next/worker.js`; no deploy, no credentials required) |

`npm run cf:deploy` was **not** run (would deploy). `npm run dev` was **not** started.

## Skills requiring external services or API credentials

These installed skills need extra setup before they can actually run — they are documented but
inert until configured:

- **`tdd-guard`** — requires a per-project npm install (e.g. `tdd-guard-vitest`) to enforce.
- **API-dependent SEO skills** (`seo-dataforseo`, `seo-google`, …) — require external API
  keys / environment variables.
- **Claude Mem advanced/memory tools** — require a running Docker container / MCP server.
- **Scientific & data skills** (`scanpy`, `rdkit`, `qiskit`, `pytorch-lightning`, and the rest
  of the 147-skill scientific set) — irrelevant to this marketing site; not for web work.

## Notes

- **`ui-ux-pro-max` is fully working** — its `data/` and `scripts/` are real directories with
  the design database and `search.py`, regenerated via the official CLI (see
  [UI/UX Pro Max](#uiux-pro-max--full-working-skill-real-data-and-scripts) above). The
  dangling-symlink issue present in the master-template copy has been **resolved**; zero
  symlinks remain anywhere under `.claude/skills/`.
- **`21ST_DEV_GUIDE.md` was rewritten for this project.** The template's Tailwind-centric guide
  was replaced with a project-specific version: it does **not** assume Tailwind is installed,
  explains how to translate Tailwind classes into this repo's **CSS Modules + CSS-variable
  tokens**, notes that 21st.dev/shadcn components may still be used and substantially adapted,
  combined, or rewritten, and states that Tailwind or shadcn may be initialized later **only**
  via a separate spec + impact report — while preserving the existing design system.
- **Constitution factual count corrected 321 → 322.** `.specify/memory/constitution.md`
  literally read "321 installed skills"; the actual installed total is 322 (including the
  official shadcn skill). This was applied as a **patch-level factual correction only** — no
  principle was changed.
