#!/usr/bin/env node
// @ts-check
/**
 * Read-only Cloudflare production-readiness verifier. It NEVER deploys, mutates, or contacts the
 * Cloudflare API — it only reads repo files (wrangler.jsonc, open-next.config.ts, the rate-limit
 * adapter) and cross-checks them. Each finding is classified:
 *
 *   - "verified-locally"              — provable from the repo alone (binding names, flags, consistency)
 *   - "external-verification-required" — needs an operator with Cloudflare access (real resource ids,
 *                                        secrets, a live dry-run) — EXPECTED for a repo without secrets
 *   - "blocker"                       — a config/code defect that must be fixed before deploy
 *
 * Output is machine-readable JSON (with --json) or a human summary + JSON. Exit code is non-zero only
 * when a blocker is found; external-verification-required items are normal and do not fail the check.
 *
 * The optional --bundle flag additionally runs `wrangler deploy --dry-run` (a NON-mutating validation
 * + bundle) when the OpenNext worker bundle exists — still never a real deploy.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

/**
 * @typedef {"verified-locally" | "external-verification-required" | "blocker"} CheckStatus
 * @typedef {{ id: string, title: string, status: CheckStatus, detail: string }} Check
 * @typedef {{ ok: boolean, summary: { verifiedLocally: number, externalRequired: number, blockers: number }, checks: Check[] }} CloudflareReport
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The D1 id shipped in the repo for LOCAL emulation — must be confirmed/replaced before production. */
const LOCAL_PLACEHOLDER_D1_ID = "29042ec8-77c6-4185-9d82-9f3936975b5f";

/**
 * Strip // line and block comments from JSONC without touching string contents.
 * @param {string} text
 * @returns {string}
 */
function stripJsonc(text) {
  let out = "";
  let inString = false;
  let inLine = false;
  let inBlock = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inLine) {
      if (c === "\n") {
        inLine = false;
        out += c;
      }
      continue;
    }
    if (inBlock) {
      if (c === "*" && n === "/") {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (inString) {
      out += c;
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      continue;
    }
    if (c === "/" && n === "/") {
      inLine = true;
      i++;
      continue;
    }
    if (c === "/" && n === "*") {
      inBlock = true;
      i++;
      continue;
    }
    out += c;
  }
  return out.replace(/,(\s*[}\]])/g, "$1"); // tolerate trailing commas
}

/**
 * @param {string} rel
 * @returns {string}
 */
function read(rel) {
  return readFileSync(join(REPO_ROOT, rel), "utf8");
}

/**
 * Analyse the repo's Cloudflare configuration and return a structured report. Pure/read-only —
 * takes no action. `runBundleDryRun` is opt-in and only runs the non-mutating wrangler dry-run.
 * @param {{ runBundleDryRun?: boolean }} [options]
 * @returns {CloudflareReport}
 */
export function analyzeCloudflareConfig({ runBundleDryRun = false } = {}) {
  /** @type {Check[]} */
  const checks = [];
  /** @type {(id: string, title: string, status: CheckStatus, detail: string) => void} */
  const add = (id, title, status, detail) => {
    checks.push({ id, title, status, detail });
  };

  // ---- Parse wrangler.jsonc ----
  let wrangler;
  try {
    wrangler = JSON.parse(stripJsonc(read("wrangler.jsonc")));
    add("wrangler-parse", "wrangler.jsonc parses", "verified-locally", "Config is valid JSONC.");
  } catch (err) {
    add(
      "wrangler-parse",
      "wrangler.jsonc parses",
      "blocker",
      `Could not parse wrangler.jsonc: ${err}`,
    );
    return finalize(checks);
  }

  // ---- Worker entry + compatibility ----
  add(
    "worker-main",
    "Worker entry points at the OpenNext bundle",
    wrangler.main === ".open-next/worker.js" ? "verified-locally" : "blocker",
    `main = ${JSON.stringify(wrangler.main)} (expected ".open-next/worker.js").`,
  );
  const flags = wrangler.compatibility_flags ?? [];
  add(
    "compat-nodejs",
    "nodejs_compat flag is set",
    flags.includes("nodejs_compat") ? "verified-locally" : "blocker",
    `compatibility_flags = ${JSON.stringify(flags)}.`,
  );
  add(
    "compat-date",
    "compatibility_date is present and well-formed",
    /^\d{4}-\d{2}-\d{2}$/.test(wrangler.compatibility_date ?? "") ? "verified-locally" : "blocker",
    `compatibility_date = ${JSON.stringify(wrangler.compatibility_date)}.`,
  );

  // ---- Assets binding ----
  const assets = wrangler.assets ?? {};
  add(
    "assets-binding",
    "Static assets binding + directory are correct",
    assets.binding === "ASSETS" && assets.directory === ".open-next/assets"
      ? "verified-locally"
      : "blocker",
    `assets = ${JSON.stringify(assets)} (expected binding ASSETS, directory .open-next/assets).`,
  );

  // ---- OpenNext ↔ wrangler consistency ----
  const openNext = read("open-next.config.ts");
  const usesR2 = /r2IncrementalCache|r2-incremental-cache/.test(openNext);
  const usesD1 = /d1NextTagCache|d1-next-tag-cache/.test(openNext);
  const usesKvOverride = /kvIncrementalCache|kv-incremental-cache/.test(openNext);

  const r2 = (wrangler.r2_buckets ?? []).find(
    (/** @type {any} */ b) => b.binding === "NEXT_INC_CACHE_R2_BUCKET",
  );
  add(
    "r2-inc-cache",
    "R2 incremental-cache binding matches the OpenNext override",
    usesR2 && r2 ? "verified-locally" : "blocker",
    usesR2
      ? r2
        ? `open-next uses r2IncrementalCache and wrangler binds NEXT_INC_CACHE_R2_BUCKET (bucket ${r2.bucket_name}).`
        : "open-next uses r2IncrementalCache but wrangler has no NEXT_INC_CACHE_R2_BUCKET r2 binding."
      : "open-next.config.ts does not use the r2 incremental cache override.",
  );

  const d1 = (wrangler.d1_databases ?? []).find(
    (/** @type {any} */ d) => d.binding === "NEXT_TAG_CACHE_D1",
  );
  add(
    "d1-tag-cache",
    "D1 tag-cache binding matches the OpenNext override",
    usesD1 && d1 ? "verified-locally" : "blocker",
    usesD1
      ? d1
        ? `open-next uses d1NextTagCache and wrangler binds NEXT_TAG_CACHE_D1 (database ${d1.database_name}).`
        : "open-next uses d1NextTagCache but wrangler has no NEXT_TAG_CACHE_D1 d1 binding."
      : "open-next.config.ts does not use the d1 tag cache override.",
  );

  const hasKvNamespaces =
    Array.isArray(wrangler.kv_namespaces) && wrangler.kv_namespaces.length > 0;
  add(
    "no-kv",
    "No Workers KV (owner decision: R2 + D1, not KV)",
    !usesKvOverride && !hasKvNamespaces ? "verified-locally" : "blocker",
    hasKvNamespaces || usesKvOverride
      ? "Unexpected KV usage found — the owner-locked design uses R2 + D1, not KV."
      : "Neither open-next nor wrangler references Workers KV.",
  );

  // ---- Rate limiter binding: code name must match wrangler ----
  const adapter = read("src/lib/forms/rate-limit-adapter.ts");
  const codeBindingMatch = adapter.match(/DEFAULT_BINDING\s*=\s*"([^"]+)"/);
  const codeBinding = codeBindingMatch?.[1];
  const rl = (wrangler.ratelimits ?? []).find((/** @type {any} */ r) => r.name === codeBinding);
  add(
    "rate-limiter-binding",
    "Rate-limit binding name in code matches wrangler",
    codeBinding && rl ? "verified-locally" : "blocker",
    codeBinding
      ? rl
        ? `code expects "${codeBinding}" and wrangler defines a matching ratelimit rule (limit ${rl.simple?.limit}/${rl.simple?.period}s).`
        : `code expects rate-limit binding "${codeBinding}" but wrangler has no matching ratelimits rule.`
      : "Could not read DEFAULT_BINDING from rate-limit-adapter.ts.",
  );

  // ---- External resources: real ids / existence (need Cloudflare access) ----
  if (r2) {
    add(
      "r2-bucket-exists",
      "R2 bucket exists in the account",
      "external-verification-required",
      `Confirm the R2 bucket "${r2.bucket_name}" exists in the target account (wrangler r2 bucket list).`,
    );
  }
  if (d1) {
    const isPlaceholder = d1.database_id === LOCAL_PLACEHOLDER_D1_ID;
    add(
      "d1-id-real",
      "D1 database_id is the production database",
      "external-verification-required",
      isPlaceholder
        ? `database_id is the documented LOCAL-emulation placeholder (${d1.database_id}); replace with the real production D1 id (wrangler d1 list) before deploy.`
        : `Confirm database_id ${d1.database_id} refers to the intended production D1 database.`,
    );
  }
  if (rl) {
    add(
      "rate-limit-namespace",
      "Rate-limit namespace_id is unique for the account",
      "external-verification-required",
      `namespace_id ${JSON.stringify(rl.namespace_id)} is a locally-assigned unique integer; confirm it does not collide with another rate-limit rule in the account.`,
    );
  }

  // ---- Secrets / runtime vars (never in the repo, by design) ----
  add(
    "worker-secrets",
    "Production secrets and runtime vars are set on the Worker",
    "external-verification-required",
    "Set (as Worker secrets/vars, never in the repo): TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY, " +
      "FORMSPREE_CONTACT_ID, FORMSPREE_GROWTH_PLAN_ID, APP_ENV=production, NEXT_PUBLIC_SITE_URL, and (optional) " +
      "TURNSTILE_ALLOWED_HOSTNAMES. FORMS_ALLOW_INSECURE_BYPASS must NOT be set in production.",
  );

  // ---- Bundle dry-run (optional, non-mutating) ----
  const bundleExists = existsSync(join(REPO_ROOT, ".open-next", "worker.js"));
  if (runBundleDryRun && bundleExists) {
    try {
      execFileSync("npx", ["wrangler", "deploy", "--dry-run", "--outdir", ".wrangler/dry-run"], {
        cwd: REPO_ROOT,
        stdio: "pipe",
      });
      add(
        "bundle-dry-run",
        "wrangler deploy --dry-run succeeds",
        "verified-locally",
        "Non-mutating dry-run bundled the Worker without error.",
      );
    } catch (err) {
      const out = /** @type {any} */ (err)?.stderr?.toString?.() ?? String(err);
      add(
        "bundle-dry-run",
        "wrangler deploy --dry-run succeeds",
        "blocker",
        `Dry-run failed: ${out.slice(0, 500)}`,
      );
    }
  } else {
    add(
      "bundle-dry-run",
      "OpenNext bundle validates against wrangler",
      "external-verification-required",
      bundleExists
        ? "Run this verifier with --bundle to execute `wrangler deploy --dry-run` (non-mutating)."
        : "Run `npm run cf:build` then `npx wrangler deploy --dry-run` (non-mutating) to validate the bundle.",
    );
  }

  return finalize(checks);
}

/**
 * @param {Check[]} checks
 * @returns {CloudflareReport}
 */
function finalize(checks) {
  const summary = {
    verifiedLocally: checks.filter((c) => c.status === "verified-locally").length,
    externalRequired: checks.filter((c) => c.status === "external-verification-required").length,
    blockers: checks.filter((c) => c.status === "blocker").length,
  };
  return { ok: summary.blockers === 0, summary, checks };
}

// ---- CLI ----
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  const jsonOnly = process.argv.includes("--json");
  const runBundleDryRun = process.argv.includes("--bundle");
  const report = analyzeCloudflareConfig({ runBundleDryRun });

  if (jsonOnly) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    /** @type {Record<CheckStatus, string>} */
    const icon = { "verified-locally": "✓", "external-verification-required": "⋯", blocker: "✗" };
    console.log("Cloudflare production-readiness (read-only, no deploy):\n");
    for (const c of report.checks) {
      console.log(`  ${icon[c.status]} [${c.status}] ${c.title}`);
      console.log(`      ${c.detail}`);
    }
    console.log(
      `\nSummary: ${report.summary.verifiedLocally} verified locally, ` +
        `${report.summary.externalRequired} need Cloudflare access, ${report.summary.blockers} blocker(s).`,
    );
    console.log(
      report.summary.blockers === 0
        ? "No blockers. Complete the external-verification steps (see docs/operations/cloudflare-production-readiness.md) before deploy."
        : "BLOCKERS present — fix before any deploy.",
    );
    console.log("\n" + JSON.stringify(report, null, 2));
  }
  process.exit(report.ok ? 0 : 1);
}
