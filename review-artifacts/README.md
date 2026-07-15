# Review artifacts

Tracked, human-viewable outputs from the review loop. Unlike `artifacts/`
(gitignored), everything here is committed so it shows up in a PR.

## Layout

| Path | What it is |
|---|---|
| `baseline/` | The **frozen before-picture**. Captured once per phase boundary and committed. Every later phase diffs its own screenshots against this. Do not overwrite it casually — it is the reference. |
| `screenshots/` | **Default output** of `npm run screenshots`. Each phase regenerates its "after" shots here and compares them against `baseline/`. Starts empty (just a `.gitkeep`). |
| `e2e-capability.json` | Machine-readable output of `npm run probe:e2e` — this session's Playwright tier and every check. See also `../docs/ENVIRONMENT-CAPABILITIES.md`. |

## Regenerating the screenshots

```bash
# 1. Build (webpack) and serve on the Playwright port. Screenshots do NOT start
#    a server — point them at a running one.
npm run build
PORT=3101 npm run start        # serves http://127.0.0.1:3101

# 2a. Capture the current phase's set (default → review-artifacts/screenshots/):
npm run screenshots

# 2b. Or (re)capture the frozen baseline:
npm run screenshots -- --out review-artifacts/baseline

# Override the target server if it runs elsewhere:
BASE_URL=http://127.0.0.1:3000 npm run screenshots
```

Run `npm run probe:e2e` first to confirm this session can launch Chromium at all
(see `../docs/ENVIRONMENT-CAPABILITIES.md`). TIER 3/4 sessions cannot capture here.

## Port

Defaults to **3101**, matching `playwright.config.ts` (`PW_PORT`). This is
deliberate: the old script defaulted to 3100 while Playwright used 3101, so the
two tools could never share one running server. Override with `PW_PORT` or
`BASE_URL`.

## Which browser, and why

The script launches with
`executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium"` — the
**exact** resolution `playwright.config.ts` uses. In the sandbox, that is the
pre-installed Chromium (its build differs from the pinned Playwright, so
Playwright must not download its own there). Set `PW_CHROMIUM` to point elsewhere
(e.g. a CI-provisioned managed browser). Do **not** run `playwright install` in
the sandbox.

## What is captured

Every route in the list below × widths **1440 / 1280 / 1024 / 390**, full-page,
at `deviceScaleFactor: 2`, after a 1900ms settle for the hero intro:

`/` · `/how-it-works` · `/services` · `/services/{slug}` (a real service detail)
· `/growth-plan` · `/about` · `/contact` · `/faq` · a 404 (not-found) page.

Plus three focused shots:

- `home-reduced-motion-1440` — the `prefers-reduced-motion` static end-state.
- `megamenu-how-it-works-1280` — desktop mega-menu open (hover).
- `mobile-nav-open-390` — full-screen mobile menu open.
