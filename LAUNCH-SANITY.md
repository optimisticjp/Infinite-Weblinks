# Sanity CMS — Owner Steps to Go Live

> ## ✅ Completed by the owner
> - **Seed imported** — 166 documents into project `ay705p7x`, dataset `production`.
> - **Studio deployed** — <https://infinite-weblinks.sanity.studio/> (app id `xfsjbzgp9jvzu7htnt03qtvf`,
>   now pinned in `studio/sanity.cli.ts` so future deploys don't prompt).
> - **Both admin accounts verified** — both sign in and can view/edit the content.
>
> The steps below are retained as the runbook. Re-seeding is a deliberate **reset** (it overwrites
> Studio edits — see step 2), not a routine action; redeploys use the pinned host + app id.

The Sanity integration is complete in code on branch `integration/sanity-cms`: the app and Studio
are wired to project **`ay705p7x`** / dataset **`production`**, the Studio schema is reconciled to
the reviewed content, the read adapters + GROQ are done (with seed fallback and status gating), and
a ready-to-import seed dataset is generated at **`studio/seed/production.ndjson`** (166 documents,
every reference resolved, no duplicates, no fake proof).

Four things genuinely need **your** Sanity login / approval and cannot be done from the build
sandbox (its network cannot reach `*.api.sanity.io`, and seeding + Studio deploy both require
authentication). Each is a copy-paste command.

> The site already renders correctly **without** any of this — it falls back to the built-in seed
> content. These steps switch it over to editor-managed content in Sanity.

---

## 1. Log in to Sanity (once)

```bash
cd studio
npm install
npx sanity login      # opens a browser; sign in as one of the two admins
```

## 2. Seed the dataset (one-time bootstrap / deliberate reset)

```bash
# from studio/
npx sanity dataset import seed/production.ndjson production --replace
```

> ⚠️ **This is a bootstrap or deliberate-reset operation, not a routine "safe to re-run" step.**
> `--replace` overwrites any document with the same id (`<type>.<slug>`) — so once editors have
> made changes in Studio, re-running it will **overwrite their edits** with the seed content.
> After editorial work has begun, only re-run it as an intentional reset, and first:
> 1. **export a backup** — `npx sanity dataset export production backup-YYYYMMDD.tar.gz`, and
> 2. get **explicit owner approval** for the reset.

- Deterministic ids mean the import never creates **duplicates** (that is what re-import is safe
  from) — but it is not safe from clobbering later edits, hence the warning above.
- This imports the reviewed taxonomy/content as **Verified**, so the site reads it live once the
  build variables are set. Proof (case studies / testimonials) is **not** seeded — add real ones in
  Studio when you have them; they stay hidden until you set their status to Verified.
- To regenerate the file after editing seed content in code: `npm run seed:export` (repo root).

## 3. Deploy the hosted Studio

```bash
# from studio/
npx sanity deploy
```

- The Studio host (`infinite-weblinks`) and deployment app id (`xfsjbzgp9jvzu7htnt03qtvf`) are now
  pinned in `studio/sanity.cli.ts`, so redeploys don't prompt. (Overridable via
  `SANITY_STUDIO_HOST` if ever needed.)
- **CORS is not a required step for the hosted Studio.** Sanity manages CORS for its own
  `*.sanity.studio` origins automatically (confirmed working — both admins already sign in and
  edit), and the Next.js app reads Sanity **server-side** from the Worker, which browser CORS does
  not apply to. _Troubleshooting only:_ add an explicit CORS origin in
  [manage.sanity.io](https://www.sanity.io/manage) → API → CORS Origins only if you later run the
  Studio on a **custom domain** or need **local dev** (`http://localhost:3333`, `:3000`).

## 4. Verify both admins can access the Studio

- Send each admin the `https://<your-studio-host>.sanity.studio` URL; each signs in and confirms
  they can see and edit documents. (Both were already added as project members.)

## 5. Confirm the live site reads from Sanity (controlled owner-side test)

The **deployed Cloudflare Worker** can reach Sanity (unlike the build sandbox), so once the
Cloudflare build variables (`NEXT_PUBLIC_SANITY_PROJECT_ID` etc.) are set it serves live content.

> **CI does not prove live reads.** CI and the build sandbox run **without** the Sanity environment
> variables, so they only exercise the **seed-fallback** path. Confirming that live Sanity content
> actually reaches the site is a deliberate owner-side test against the deployed Worker (or the
> branch's Cloudflare preview), described below.

```bash
# a Verified goal you seeded should be returned live:
npx sanity documents query '*[_type=="goal" && contentStatus.status in ["verified","readyToPublish"]][0]{ "slug": slug.current, name }' --dataset production
```

Then, on the deployed site / branch preview:

1. Load a content page — goals surface through **`/solutions`** and their detail routes
   (e.g. `/solutions`, a `/goals/<slug>` detail page), plus `/services` and `/tools`.
2. Edit a document in Studio (e.g. tweak a goal's name) and **publish**. Content routes are ISR
   with a ~30s revalidate window, so wait up to ~30s, then reload and confirm the change appears —
   this proves the read is live, not seed. (For instant updates, wire a Sanity webhook to an
   on-demand `revalidateTag` route — a recommended production follow-up.)
3. Optionally set every document of one type to Draft and confirm that type goes empty (does **not**
   revert to seed) — proving the authoritative-empty behaviour.

If Sanity is ever unreachable, the site silently falls back to seed content (no breakage).

---

## What is and isn't in Sanity

| In Sanity (editor-managed) | Code / seed only (by design) |
|---|---|
| Growth stages, service & tool categories, services, tools, goals, business types, starting points, roadmaps, learn articles, FAQs | Cross-cutting systems, delivery models, process steps, value props (structural reference data — seeded as reference targets but rendered from code) |
| Real proof once you add + Verify it | Header/footer/hero/editorial chrome and the growth-plan rules (brand-locked) |
| | Legal pages (privacy/cookies/terms) — lawyer-reviewed, rendered from code |

## Status gating (unchanged, enforced everywhere)

Only documents whose `contentStatus.status` is **Verified** or **Ready to publish** are ever
queried publicly — enforced in every GROQ query **and** re-checked in the adapter. Draft,
Placeholder, and Approval-required documents never appear on the site.
