# claude-web-builder-skills

A reusable **GitHub template** for building websites and web tools with **Claude Code on the web**. It ships with 321 pre-installed skills, a `CLAUDE.md` guide, the official GitHub Spec Kit workflow, and a project constitution.

## Getting started

1. **Create a new project with "Use this template"** on GitHub — do not build directly in this master template. This repo is the source that new projects are cloned from; keep it clean.
2. Open your new project in Claude Code (web).
3. Every new project inherits, out of the box:
   - **321 skills** under `.claude/skills/` (design, frontend, SEO, marketing, security, testing, context, research, and more)
   - **`CLAUDE.md`** — the working guide and default checklist for web tasks
   - **GitHub Spec Kit** — the 10 `speckit-*` skills that drive the spec-driven workflow
   - **The constitution** at `.specify/memory/constitution.md` — the governing project principles

## Normal workflow

Because the template constitution already exists, a new project normally begins at the **specify** stage:

```
/speckit-specify → clarify → plan → checklist → tasks → analyze → implement → converge
```

Run `/speckit-constitution` again only if you want to amend the inherited principles for that specific project. Small, low-risk changes may skip the full cycle. See `CLAUDE.md` for full guidance and `INSTALL_REPORT.md` for the installed-skill inventory.
