# Infinite Weblinks — Sanity Studio

This is the **content editing workspace** for the Infinite Weblinks site. It is a **separate,
Sanity-hosted deploy** — it is **NOT embedded in the Next.js app** and the site has no `/studio`
route. Its source lives in this repo (under `studio/`) purely so schema types are versioned
alongside the app that consumes them; it is built and published independently with
`sanity deploy` to a `*.sanity.studio` URL (e.g. `https://infinite-weblinks.sanity.studio`).

See `/specs/001-infinite-weblinks-website/data-model.md`, `design/deployment.md`, and
`design/security-privacy.md` for the full rationale.

## Prerequisites

- Node.js 18+
- A Sanity project (create one at <https://www.sanity.io/manage> if one does not exist yet) with
  two editor/administrator seats for the two admin users (brief §14/§22).

## Setup

```bash
cd studio
npm install
cp .env.example .env
# edit .env: set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET
```

`SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` must equal the site's
`NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` (see
`/specs/001-infinite-weblinks-website/design/environment.md` §2) — the Studio and the Next.js app
read and write the same Sanity project/dataset; only the editing UI runs separately.

## Running locally

```bash
npm run dev
```

Starts the Studio at `http://localhost:3333` (Sanity's local dev server, not the Next.js app).

## Deploying (hosted Studio)

```bash
npm run deploy
```

Runs `sanity deploy`, which builds the Studio and publishes it to
`https://<studioHost>.sanity.studio`. The hosted subdomain (`studioHost`, set in
`sanity.cli.ts`) is chosen **once**, interactively, on the very first deploy, and then stays fixed
for the life of the project — see the comment in `sanity.cli.ts` for how to pin it non-interactively
(`SANITY_STUDIO_HOST`) for a CI-driven deploy.

`npm run build` (`sanity build`) alone produces a static build in `dist/` without publishing it, if
you need to inspect the build output first.

## CORS — origins to add in the Sanity project

In [manage.sanity.io](https://www.sanity.io/manage) → your project → API → CORS Origins, add:

- The production site origin: `https://infiniteweblinks.com`
- The hosted Studio origin: `https://<studioHost>.sanity.studio`
- Cloudflare preview deployment origin(s) for the Next.js app (per PR/branch)
- `http://localhost:3000` (Next.js local dev) and `http://localhost:3333` (Studio local dev)

No wildcard (`*`) origin. The site's **preview** routes additionally allow being framed by the
hosted Studio origin via CSP `frame-ancestors` (see `design/security-privacy.md` §3.1) so Sanity's
Presentation tool can live-preview the site inside the Studio.

## Environment variables

See `.env.example`. Only two non-secret values are needed here — project ID and dataset — plus an
optional `SANITY_STUDIO_HOST` for non-interactive deploys. **No secret ever belongs in this
workspace's env files**: Studio access control is Sanity's own project-membership authentication,
not a token stored here (see `design/security-privacy.md` §4.2).

## Schema layout

```
studio/
├── schemaTypes/
│   ├── index.ts          # combined export consumed by sanity.config.ts
│   ├── objects/           # shared reusable field groups (contentStatus, seo, cta, link, ...)
│   ├── documents/         # site config singletons + taxonomy + page + rule set
│   └── sections/          # approved CMS page-builder section types (component-inventory.md §4)
├── structure/index.ts     # desk structure — singletons pinned at top, then document lists
├── sanity.config.ts       # defineConfig — structureTool + visionTool
└── sanity.cli.ts          # defineCliConfig — project/dataset + studioHost
```

This is the **initial schema slice** (Milestone M3 — see `data-model.md` → "Progressive
implementation"). `roadmap` lands with M7; `article`/`resource`/`example`/`caseStudy`/
`testimonial`/`legalPage` land with M8. The three section types that reference them
(`roadmapShowcase`, `caseStudyShowcase`, `testimonialWall`) already exist in
`schemaTypes/sections/` for schema completeness but ship with `enabled: false` and must stay
hidden on the frontend until their document types and Verified content exist.

## Content status workflow

Every publishable document type carries a `contentStatus` object (`draft` → `placeholder` →
`approvalRequired` → `verified` → `readyToPublish`). Only `verified`/`readyToPublish` content is
ever queried by the public site — this is enforced on the frontend's GROQ queries, not by Studio
permissions, so seeding taxonomy as Draft/Placeholder here is expected and safe.
