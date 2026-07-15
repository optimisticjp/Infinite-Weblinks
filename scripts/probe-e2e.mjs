// scripts/probe-e2e.mjs
//
// Non-destructive probe of this session's Playwright / E2E capability.
//
// CONTRACT (do not weaken):
//   - Never throws. Every check is wrapped so a failure is *recorded*, not fatal.
//   - Always exits 0. A probe that fails the session is a broken probe.
//   - Never installs, downloads, or launches a server. It only observes.
//
// Why this exists: cloud sessions are isolated VMs. Whether the sandbox
// Chromium can actually LAUNCH here (not merely exist) can change between
// sessions, and `playwright.config.ts` silently picks a different executable
// depending on what is present. This probe answers, for THIS session, which
// executable the config will select and whether it runs — in ~10 seconds.
//
// Run: npm run probe:e2e

import { existsSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

// A fixed, injected timestamp keeps re-runs deterministic in CI diffs if
// desired; default to real time otherwise.
const NOW = process.env.PROBE_NOW ?? new Date().toISOString();

/** @type {Array<{id:string,name:string,status:'PASS'|'FAIL'|'SKIP',reason:string,detail:unknown}>} */
const checks = [];
function record(id, name, status, reason, detail = null) {
  checks.push({ id, name, status, reason, detail });
}

// Facts other checks / the tier classifier depend on.
const facts = {
  playwrightResolvable: false,
  playwrightVersion: null,
  sandboxPath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
  sandboxExists: false,
  managedPath: null,
  configSelected: null,
  configSelectionKind: null,
  launchOK: false,
  cdn: "unknown",
  buildPresent: false,
  localhostReachable: false,
  localhostPort: null,
  externalReachable: false,
};

async function fetchWithTimeout(url, ms, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── 1. Is @playwright/test resolvable? ──────────────────────────────────────
try {
  const pkg = require("@playwright/test/package.json");
  facts.playwrightResolvable = true;
  facts.playwrightVersion = pkg.version;
  record("playwright-pkg", "@playwright/test resolvable", "PASS", `version ${pkg.version}`, {
    version: pkg.version,
  });
} catch (err) {
  record("playwright-pkg", "@playwright/test resolvable", "FAIL", "cannot resolve @playwright/test", {
    error: String(err && err.stack ? err.stack : err),
  });
}

// ── 2. Does the sandbox Chromium exist? ─────────────────────────────────────
try {
  facts.sandboxExists = existsSync(facts.sandboxPath);
  if (facts.sandboxExists) {
    let version = null;
    try {
      version = execFileSync(facts.sandboxPath, ["--version"], {
        encoding: "utf8",
        timeout: 5000,
      }).trim();
    } catch (e) {
      version = `(--version failed: ${e && e.message ? e.message : e})`;
    }
    record("sandbox-chromium", "Sandbox Chromium present", "PASS", `${facts.sandboxPath} — ${version}`, {
      path: facts.sandboxPath,
      version,
    });
  } else {
    record(
      "sandbox-chromium",
      "Sandbox Chromium present",
      "SKIP",
      `not found at ${facts.sandboxPath} (expected outside the sandbox — e.g. GitHub Actions)`,
      { path: facts.sandboxPath },
    );
  }
} catch (err) {
  record("sandbox-chromium", "Sandbox Chromium present", "FAIL", "existence check threw", {
    error: String(err && err.stack ? err.stack : err),
  });
}

// ── 3. Is a Playwright-managed browser resolvable? ──────────────────────────
if (facts.playwrightResolvable) {
  try {
    const { chromium } = await import("@playwright/test");
    const p = chromium.executablePath();
    facts.managedPath = p || null;
    if (p && existsSync(p)) {
      record("managed-browser", "Playwright-managed browser resolvable", "PASS", p, {
        path: p,
        exists: true,
      });
    } else if (p) {
      record(
        "managed-browser",
        "Playwright-managed browser resolvable",
        "SKIP",
        `resolves to ${p} but that binary is not installed (no \`playwright install\` here — by design)`,
        { path: p, exists: false },
      );
    } else {
      record("managed-browser", "Playwright-managed browser resolvable", "SKIP", "executablePath() returned empty", {
        path: null,
      });
    }
  } catch (err) {
    record("managed-browser", "Playwright-managed browser resolvable", "FAIL", "executablePath() threw", {
      error: String(err && err.stack ? err.stack : err),
    });
  }
} else {
  record("managed-browser", "Playwright-managed browser resolvable", "SKIP", "@playwright/test unresolvable");
}

// ── 4. Which executable will playwright.config.ts actually select? ──────────
// Mirror the config's logic exactly:
//   sandboxChromium = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium"
//   executablePath  = existsSync(sandboxChromium) ? sandboxChromium : undefined
// undefined => Playwright resolves its own managed executable.
if (facts.sandboxExists) {
  facts.configSelectionKind = "sandbox";
  facts.configSelected = facts.sandboxPath;
} else {
  facts.configSelectionKind = "playwright-managed";
  facts.configSelected = facts.managedPath ?? "(Playwright default — not installed here)";
}
record(
  "config-selection",
  "Executable playwright.config.ts will select",
  "PASS",
  `${facts.configSelectionKind}: ${facts.configSelected}`,
  { kind: facts.configSelectionKind, path: facts.configSelected },
);

// ── 5. Can headless Chromium LAUNCH? ────────────────────────────────────────
// Existence ≠ launchability. A present binary with missing system libraries
// still fails; the stderr names the package needed.
if (facts.playwrightResolvable) {
  try {
    const { chromium } = await import("@playwright/test");
    const launchOpts = { headless: true };
    if (facts.sandboxExists) launchOpts.executablePath = facts.sandboxPath;
    const browser = await chromium.launch(launchOpts);
    try {
      const page = await browser.newPage();
      await page.goto("about:blank");
      const sum = await page.evaluate(() => 1 + 1);
      if (sum === 2) {
        facts.launchOK = true;
        record("launch", "Headless Chromium launches", "PASS", "launched → about:blank → 1+1=2 → closed", {
          executablePath: launchOpts.executablePath ?? "(playwright-managed)",
        });
      } else {
        record("launch", "Headless Chromium launches", "FAIL", `evaluate returned ${sum}, expected 2`, {
          executablePath: launchOpts.executablePath ?? "(playwright-managed)",
        });
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    // Missing-.so errors ("error while loading shared libraries: libXXX.so")
    // land in this message — keep it raw so the remediation is exact.
    record("launch", "Headless Chromium launches", "FAIL", "launch failed — see raw error for missing libs", {
      error: String(err && err.stack ? err.stack : err),
      message: String(err && err.message ? err.message : err),
    });
  }
} else {
  record("launch", "Headless Chromium launches", "SKIP", "@playwright/test unresolvable");
}

// ── 6. Are browser downloads permitted? (DO NOT DOWNLOAD — HEAD only) ────────
try {
  const res = await fetchWithTimeout("https://cdn.playwright.dev", 5000, { method: "HEAD" });
  facts.cdn = "reachable";
  record("cdn", "Playwright CDN reachable (HEAD only)", "PASS", `reachable — HTTP ${res.status}`, {
    status: res.status,
    note: "CI-style `playwright install` would be able to fetch here",
  });
} catch (err) {
  const timedOut = err && err.name === "AbortError";
  facts.cdn = timedOut ? "timeout" : "blocked";
  record(
    "cdn",
    "Playwright CDN reachable (HEAD only)",
    "SKIP",
    timedOut ? "timeout after 5s" : "blocked / unreachable",
    { error: String(err && err.message ? err.message : err) },
  );
}

// ── 7. Is a production build present? ───────────────────────────────────────
facts.buildPresent = existsSync(resolve(ROOT, ".next"));
if (facts.buildPresent) {
  record("build", "Production build present (.next/)", "PASS", ".next/ exists");
} else {
  record(
    "build",
    "Production build present (.next/)",
    "SKIP",
    ".next/ not found — the Playwright webServer runs `npm run start`, which needs a prior `npm run build`",
  );
}

// ── 8. Is localhost reachable? (probe does NOT start a server) ──────────────
for (const port of [3101, 3100]) {
  try {
    const res = await fetchWithTimeout(`http://127.0.0.1:${port}`, 2000);
    facts.localhostReachable = true;
    facts.localhostPort = port;
    record("localhost", "Local server reachable", "PASS", `port ${port} responding (HTTP ${res.status})`, {
      port,
      status: res.status,
    });
    break;
  } catch {
    // try the next port
  }
}
if (!facts.localhostReachable) {
  record(
    "localhost",
    "Local server reachable",
    "SKIP",
    "no server on 3101 (playwright.config) or 3100 (screenshots.mjs) — the probe does not start one",
  );
}

// ── 9. Is external network reachable? ───────────────────────────────────────
try {
  const res = await fetchWithTimeout("https://infiniteweblinks.com", 5000);
  facts.externalReachable = true;
  record("external", "External network reachable", "PASS", `reachable — HTTP ${res.status}`, { status: res.status });
} catch (err) {
  const timedOut = err && err.name === "AbortError";
  record("external", "External network reachable", "FAIL", timedOut ? "timeout after 5s" : "blocked / unreachable", {
    error: String(err && err.message ? err.message : err),
  });
}

// ── Tier classification ─────────────────────────────────────────────────────
let tier, tierName, tierMeaning;
if (!facts.playwrightResolvable) {
  tier = 4;
  tierName = "NO-PLAYWRIGHT";
  tierMeaning = "package unresolvable";
} else if (!facts.launchOK) {
  tier = 3;
  tierName = "NO-BROWSER";
  tierMeaning = "launch fails — Playwright cannot run here";
} else if (facts.localhostReachable) {
  tier = 1;
  tierName = "FULL";
  tierMeaning = "launch OK + localhost OK — e2e and screenshots run here";
} else {
  tier = 2;
  tierName = "BROWSER-ONLY";
  tierMeaning = "launch OK, no build/server — run `npm run build`, then retry";
}

// ── Remediation (only meaningful when not TIER 1) ───────────────────────────
function remediation() {
  const lines = [];
  if (tier === 1) {
    lines.push("None. This session can run the full e2e + screenshot suite.");
    return lines;
  }
  if (tier === 4) {
    lines.push("`@playwright/test` is not resolvable. Install dependencies from the lockfile: `npm ci`.");
    lines.push("Do NOT add a new dependency — it is already pinned in package.json / package-lock.json.");
    return lines;
  }
  if (tier === 3) {
    const launch = checks.find((c) => c.id === "launch");
    const raw = launch && launch.detail && launch.detail.error ? String(launch.detail.error) : "";
    const libMatch = raw.match(/lib[\w.+-]+\.so[\w.]*/g);
    lines.push("Chromium is present/resolvable but will not launch in this VM.");
    if (libMatch && libMatch.length) {
      lines.push(`Missing shared libraries reported: ${[...new Set(libMatch)].join(", ")}.`);
      lines.push(
        "These come from OS packages (e.g. libnss3, libnspr4, libatk1.0-0, libatk-bridge2.0-0, " +
          "libcups2, libdrm2, libgbm1, libasound2, libxkbcommon0, libpango-1.0-0, libcairo2). " +
          "Installing them needs root + apt, which cloud sessions do not have.",
      );
    } else {
      lines.push("See the raw launch error in the checks below for the specific failure.");
    }
    lines.push(
      "Remediation is environment-level, not code: run the e2e/screenshot suite in GitHub Actions " +
        "(where `playwright install --with-deps chromium` provisions a working browser) or on a local " +
        "machine with the system libraries present. Do NOT run `playwright install` here.",
    );
    return lines;
  }
  // tier === 2
  lines.push("Browser launches, but no local server is serving the site, so e2e/screenshots have no target.");
  if (!facts.buildPresent) {
    lines.push("1. `npm run build`   (webpack build — Turbopack serves broken CSS chunks here)");
  } else {
    lines.push("1. Build already present (.next/ exists).");
  }
  lines.push("2. Start it on the Playwright port: `PORT=3101 npm run start` (or let `npm run test:e2e` start it).");
  lines.push("3. Then `npm run test:e2e` and/or `npm run screenshots`.");
  if (facts.cdn === "blocked") {
    lines.push(
      "Note: cdn.playwright.dev was unreachable. If a future session needs Playwright to self-provision " +
        "a browser, allowlist `cdn.playwright.dev`.",
    );
  }
  return lines;
}
const remediationLines = remediation();

// ── Output: stdout summary table ────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log("");
console.log(`E2E capability probe — ${NOW}`);
console.log("");
console.log(`  ${pad("CHECK", 42)} ${pad("STATUS", 6)} REASON`);
console.log(`  ${"-".repeat(42)} ${"-".repeat(6)} ${"-".repeat(30)}`);
for (const c of checks) {
  console.log(`  ${pad(c.name, 42)} ${pad(c.status, 6)} ${c.reason}`);
}
console.log("");
console.log(`  ==> TIER ${tier} ${tierName} — ${tierMeaning}`);
console.log("");
if (tier !== 1) {
  console.log("  Remediation:");
  for (const l of remediationLines) console.log(`    - ${l}`);
  console.log("");
}

// ── Output: machine-readable JSON ───────────────────────────────────────────
const json = {
  generatedAt: NOW,
  tier,
  tierName,
  tierMeaning,
  facts,
  checks,
  remediation: remediationLines,
};

// ── Output: human-readable markdown ─────────────────────────────────────────
function statusEmoji(s) {
  return s === "PASS" ? "✅" : s === "FAIL" ? "❌" : "⏭️";
}
function mdDetail(detail) {
  if (detail == null) return "";
  const err = detail.error ?? detail.message;
  if (err) {
    const oneLine = String(err).split("\n")[0];
    return `<br>\`${oneLine.replace(/`/g, "'")}\``;
  }
  return "";
}
const md = [];
md.push("# Environment Capabilities — E2E / Playwright");
md.push("");
md.push(`_Generated ${NOW} by \`npm run probe:e2e\` (\`scripts/probe-e2e.mjs\`)._`);
md.push("");
md.push("Regenerate any time: `npm run probe:e2e`. The probe is non-destructive, never");
md.push("throws, always exits 0, and never installs or downloads anything. Because cloud");
md.push("sessions are isolated VMs, this answer can change between sessions — re-run it.");
md.push("");
md.push(`## Result: TIER ${tier} — ${tierName}`);
md.push("");
md.push(`**${tierMeaning}**`);
md.push("");
md.push("| Tier | Meaning |");
md.push("|---|---|");
md.push(`| ${tier === 1 ? "**1 FULL**" : "1 FULL"} | launch OK + localhost OK → e2e and screenshots run here |`);
md.push(
  `| ${tier === 2 ? "**2 BROWSER-ONLY**" : "2 BROWSER-ONLY"} | launch OK, no build/server → run \`npm run build\`, then retry |`,
);
md.push(`| ${tier === 3 ? "**3 NO-BROWSER**" : "3 NO-BROWSER"} | launch fails → Playwright cannot run here |`);
md.push(`| ${tier === 4 ? "**4 NO-PLAYWRIGHT**" : "4 NO-PLAYWRIGHT"} | package unresolvable |`);
md.push("");
md.push("## Which browser the config selects");
md.push("");
md.push(
  `\`playwright.config.ts\` will use **${facts.configSelectionKind}**: \`${facts.configSelected}\`. ` +
    "This is derived by mirroring the config's own logic " +
    "(`existsSync(PW_CHROMIUM ?? \"/opt/pw-browsers/chromium\") ? that : Playwright's own`).",
);
md.push("");
md.push("## Checks");
md.push("");
md.push("| # | Check | Status | Reason |");
md.push("|---|---|---|---|");
checks.forEach((c, i) => {
  md.push(`| ${i + 1} | ${c.name} | ${statusEmoji(c.status)} ${c.status} | ${c.reason}${mdDetail(c.detail)} |`);
});
md.push("");
md.push("## Remediation");
md.push("");
for (const l of remediationLines) md.push(`- ${l}`);
md.push("");
md.push("## Raw facts");
md.push("");
md.push("```json");
md.push(JSON.stringify(facts, null, 2));
md.push("```");
md.push("");

// ── Write outputs (best-effort; never fatal) ────────────────────────────────
try {
  await mkdir(resolve(ROOT, "review-artifacts"), { recursive: true });
  await writeFile(resolve(ROOT, "review-artifacts/e2e-capability.json"), JSON.stringify(json, null, 2) + "\n", "utf8");
} catch (err) {
  console.error("  (warning) could not write review-artifacts/e2e-capability.json:", String(err));
}
try {
  await mkdir(resolve(ROOT, "docs"), { recursive: true });
  await writeFile(resolve(ROOT, "docs/ENVIRONMENT-CAPABILITIES.md"), md.join("\n"), "utf8");
} catch (err) {
  console.error("  (warning) could not write docs/ENVIRONMENT-CAPABILITIES.md:", String(err));
}

// Always exit 0 — regardless of tier. A probe never fails the session.
process.exit(0);
