# Environment Capabilities — E2E / Playwright

_Generated 2026-07-15T16:57:23.771Z by `npm run probe:e2e` (`scripts/probe-e2e.mjs`)._

Regenerate any time: `npm run probe:e2e`. The probe is non-destructive, never
throws, always exits 0, and never installs or downloads anything. Because cloud
sessions are isolated VMs, this answer can change between sessions — re-run it.

## Result: TIER 2 — BROWSER-ONLY

**launch OK, no build/server — run `npm run build`, then retry**

| Tier | Meaning |
|---|---|
| 1 FULL | launch OK + localhost OK → e2e and screenshots run here |
| **2 BROWSER-ONLY** | launch OK, no build/server → run `npm run build`, then retry |
| 3 NO-BROWSER | launch fails → Playwright cannot run here |
| 4 NO-PLAYWRIGHT | package unresolvable |

## Which browser the config selects

`playwright.config.ts` will use **sandbox**: `/opt/pw-browsers/chromium`. This is derived by mirroring the config's own logic (`existsSync(PW_CHROMIUM ?? "/opt/pw-browsers/chromium") ? that : Playwright's own`).

## Checks

| # | Check | Status | Reason |
|---|---|---|---|
| 1 | @playwright/test resolvable | ✅ PASS | version 1.61.1 |
| 2 | Sandbox Chromium present | ✅ PASS | /opt/pw-browsers/chromium — Chromium 141.0.7390.37 |
| 3 | Playwright-managed browser resolvable | ⏭️ SKIP | resolves to /opt/pw-browsers/chromium-1228/chrome-linux64/chrome but that binary is not installed (no `playwright install` here — by design) |
| 4 | Executable playwright.config.ts will select | ✅ PASS | sandbox: /opt/pw-browsers/chromium |
| 5 | Headless Chromium launches | ✅ PASS | launched → about:blank → 1+1=2 → closed |
| 6 | Playwright CDN reachable (HEAD only) | ✅ PASS | reachable — HTTP 403 |
| 7 | Production build present (.next/) | ⏭️ SKIP | .next/ not found — the Playwright webServer runs `npm run start`, which needs a prior `npm run build` |
| 8 | Local server reachable | ⏭️ SKIP | no server on 3101 (playwright.config) or 3100 (screenshots.mjs) — the probe does not start one |
| 9 | External network reachable | ✅ PASS | reachable — HTTP 403 |

## Remediation

- Browser launches, but no local server is serving the site, so e2e/screenshots have no target.
- 1. `npm run build`   (webpack build — Turbopack serves broken CSS chunks here)
- 2. Start it on the Playwright port: `PORT=3101 npm run start` (or let `npm run test:e2e` start it).
- 3. Then `npm run test:e2e` and/or `npm run screenshots`.

## Raw facts

```json
{
  "playwrightResolvable": true,
  "playwrightVersion": "1.61.1",
  "sandboxPath": "/opt/pw-browsers/chromium",
  "sandboxExists": true,
  "managedPath": "/opt/pw-browsers/chromium-1228/chrome-linux64/chrome",
  "configSelected": "/opt/pw-browsers/chromium",
  "configSelectionKind": "sandbox",
  "launchOK": true,
  "cdn": "reachable",
  "buildPresent": false,
  "localhostReachable": false,
  "localhostPort": null,
  "externalReachable": true
}
```
