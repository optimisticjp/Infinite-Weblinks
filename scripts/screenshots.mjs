// scripts/screenshots.mjs
//
// Review-loop screenshots for Infinite Weblinks.
//
// Writes to review-artifacts/screenshots/ (TRACKED) so the shots survive into
// the PR — the old target, artifacts/screenshots, is gitignored (.gitignore),
// so every image it produced was discarded.
//
// Defaults to port 3101 to match playwright.config.ts (PW_PORT). The browser is
// resolved exactly as the config resolves it, via PW_CHROMIUM, so the two tools
// agree on which Chromium runs.
//
// This script does NOT start a server — point BASE_URL at a running one, or
// build + `PORT=3101 npm run start` first (see docs/ENVIRONMENT-CAPABILITIES.md).
//
// Usage:
//   npm run screenshots                 # -> review-artifacts/screenshots, port 3101
//   BASE_URL=http://127.0.0.1:3000 npm run screenshots
//   node scripts/screenshots.mjs --out review-artifacts/phase-1

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// ── config ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const OUT = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : "review-artifacts/screenshots";

// Default port 3101 matches playwright.config.ts. BASE_URL overrides everything.
const PORT = process.env.PW_PORT ?? "3101";
const BASE = (process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`).replace(/\/$/, "");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Route list — not just the homepage. One valid service-detail slug is included.
const ROUTES = [
  { name: "home", path: "/" },
  { name: "how-it-works", path: "/how-it-works" },
  { name: "services", path: "/services" },
  { name: "service-detail", path: "/services/discovery-requirements-workshop" },
  { name: "growth-plan", path: "/growth-plan" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "faq", path: "/faq" },
  // A deliberately non-existent path renders the 404 (not-found) page.
  { name: "404", path: "/__intentionally-missing__" },
];

// Viewport widths mirror the tracked set: 1440 / 1280 / 1024 / 768 / 390 / 360.
const VIEWPORTS = [
  { w: 1440, h: 900 },
  { w: 1280, h: 900 },
  { w: 1024, h: 800 },
  { w: 768, h: 900 },
  { w: 390, h: 844 },
  { w: 360, h: 780 },
];

// ── browser ─────────────────────────────────────────────────────────────────
// Resolve Chromium exactly as playwright.config.ts does. Do not change this.
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
  headless: true,
});

await mkdir(OUT, { recursive: true });

let ok = 0;
let failed = 0;

/**
 * Capture one screenshot. Never lets a single failure abort the run.
 */
async function shot(name, { path = "/", width, height, reducedMotion = false, full = true, action } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    // Full-page shots answer "did a section move or disappear" — 1x is plenty and
    // ~4x smaller on a 22k-px page. Viewport crops judge type/spacing, so 2x there.
    deviceScaleFactor: full ? 1 : 2,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + path, { waitUntil: "load", timeout: 30000 });
    // Let the hero intro settle; reduced-motion has no intro to wait for.
    await wait(reducedMotion ? 300 : 1900);
    if (action) await action(page);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    ok++;
    console.log("✓", name);
  } catch (err) {
    failed++;
    console.warn("✗", name, "—", String(err && err.message ? err.message : err).split("\n")[0]);
  } finally {
    await ctx.close();
  }
}

// ── every route at every viewport (full-page baseline) ──────────────────────
for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    await shot(`${route.name}-${vp.w}`, { path: route.path, width: vp.w, height: vp.h });
  }
}

// ── kept special shots ──────────────────────────────────────────────────────

// Reduced-motion variant (home, desktop) — verifies the static end-state.
await shot("home-reduced-motion-1440", { path: "/", width: 1440, height: 900, reducedMotion: true });

// Desktop mega-menu open (hover "How It Works") at 1280.
await shot("megamenu-how-it-works-1280", {
  path: "/",
  width: 1280,
  height: 900,
  full: false,
  action: async (page) => {
    await page.getByRole("button", { name: "How It Works" }).hover();
    await wait(450);
  },
});

// Mobile nav open (full-screen menu) at 390.
await shot("mobile-nav-open-390", {
  path: "/",
  width: 390,
  height: 844,
  full: false,
  action: async (page) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await wait(400);
  },
});

await browser.close();
console.log(`\ndone — ${ok} captured, ${failed} failed → ${OUT}`);
// Non-zero exit if anything failed, so CI/callers notice, but only after all
// shots are attempted.
process.exit(failed > 0 ? 1 : 0);
