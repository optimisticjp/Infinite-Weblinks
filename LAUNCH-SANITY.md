# Sanity CMS — Owner Steps to Go Live

> ## ✅ Completed by the owner
> - **Seed imported** — 166 documents into project `ay705p7x`, dataset `production`.
> - **Studio deployed** — <https://infinite-weblinks.sanity.studio/> (app id `xfsjbzgp9jvzu7htnt03qtvf`,
>   now pinned in `studio/sanity.cli.ts` so future deploys don't prompt).
> - **Both admin accounts verified** — both sign in and can view/edit the content.
>
> The steps below are retained as the repeatable runbook (re-seeding is idempotent; redeploys use
> the pinned host + app id).

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

## 2. Seed the dataset (idempotent — safe to re-run)

```bash
# from studio/
npx sanity dataset import seed/production.ndjson production --replace
```

- `--replace` uses the documents' deterministic ids (`<type>.<slug>`), so re-running **updates in
  place** and never creates duplicates.
- This imports the reviewed taxonomy/content as **Verified**, so the site will read it live once
  step 4 is done. Proof (case studies / testimonials) is **not** seeded — add real ones in Studio
  when you have them; they stay hidden until you set their status to Verified.
- To regenerate the file after editing seed content in code: `npm run seed:export` (repo root).

## 3. Deploy the hosted Studio

```bash
# from studio/
npx sanity deploy
```

- The Studio host (`infinite-weblinks`) and deployment app id (`xfsjbzgp9jvzu7htnt03qtvf`) are now
  pinned in `studio/sanity.cli.ts`, so redeploys don't prompt. (Overridable via
  `SANITY_STUDIO_HOST` if ever needed.)
- After it deploys, add the Studio origin to the project's CORS list in
  [manage.sanity.io](https://www.sanity.io/manage) → API → CORS Origins:
  `https://<your-studio-host>.sanity.studio` (credentials **enabled** for the Studio origin).

## 4. Verify both admins can access the Studio

- Send each admin the `https://<your-studio-host>.sanity.studio` URL; each signs in and confirms
  they can see and edit documents. (Both were already added as project members.)

## 5. Confirm the live site reads from Sanity

The **deployed Cloudflare Worker** can reach Sanity (unlike the build sandbox), so once steps 2–3
are done it serves live content automatically — the Cloudflare build variables
(`NEXT_PUBLIC_SANITY_PROJECT_ID` etc.) are already set. To confirm:

```bash
# a Verified goal you seeded should be returned live:
npx sanity documents query '*[_type=="goal" && contentStatus.status in ["verified","readyToPublish"]][0]{ "slug": slug.current, name }' --dataset production
```

Then load a content page on the deployed site (e.g. `/goals`, `/services`, `/tools`) and edit a
document in Studio — after the page's cache revalidates, the change appears. If Sanity is ever
unreachable or a document is missing, the site silently falls back to seed content (no breakage).

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
