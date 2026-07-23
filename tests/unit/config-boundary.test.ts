import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  deploymentEnv,
  isProductionLike,
  insecureBypassAllowed,
  rateLimiterRequired,
} from "@/lib/forms/config.server";

/**
 * Phase 3A (§B/§K) — the public/server form-config boundary and the fail-closed deployment policy.
 * The client-safe module holds only public values; the server module is `import "server-only"` and
 * carries the secret + the server-only Formspree ids; and production/preview fail closed with no
 * honourable bypass.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const pub = read("../../src/lib/forms/config.public.ts");
const server = read("../../src/lib/forms/config.server.ts");

describe("public/server config module boundary", () => {
  it("the client-safe module's CODE contains no server secret / server-only names", () => {
    const code = strip(pub); // the doc comment may name the server module; the CODE must not
    for (const banned of ["TURNSTILE_SECRET_KEY", "FORMSPREE_CONTACT_ID", "FORMSPREE_GROWTH_PLAN_ID"]) {
      expect(code, `config.public code must not mention ${banned}`).not.toContain(banned);
    }
    // It never imports server-only, and the only env it reads is the public site key.
    expect(code).not.toMatch(/import ["']server-only["']/);
    expect(code).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(code).not.toMatch(/process\.env\.(?!NEXT_PUBLIC_)/);
  });

  it("the server module is marked server-only and uses server-only Formspree ids (not NEXT_PUBLIC_)", () => {
    expect(server).toMatch(/^import "server-only";/m);
    expect(server).toContain("FORMSPREE_CONTACT_ID");
    expect(server).toContain("FORMSPREE_GROWTH_PLAN_ID");
    expect(server).not.toContain("NEXT_PUBLIC_FORMSPREE");
  });

  it("Client Components import ONLY the client-safe config, never the server config or the secret", () => {
    for (const rel of [
      "../../src/components/forms/Turnstile.tsx",
      "../../src/components/forms/ContactForm.tsx",
      "../../src/components/builder/PlanBuilder.tsx",
    ]) {
      const src = read(rel);
      expect(src).toMatch(/^"use client";/);
      expect(src, `${rel} must import config.public`).toContain("forms/config.public");
      expect(src, `${rel} must not import config.server`).not.toContain("forms/config.server");
      expect(src, `${rel} must not reference the secret`).not.toContain("TURNSTILE_SECRET_KEY");
      expect(src, `${rel} must not reference a Formspree id`).not.toContain("FORMSPREE_");
    }
  });

  it("the deprecated NEXT_PUBLIC_ Formspree vars are gone from the server config", () => {
    expect(server).not.toMatch(/NEXT_PUBLIC_FORMSPREE_(CONTACT|GROWTH_PLAN)_ID/);
  });
});

describe("deployment-environment fail-closed policy", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("classifies APP_ENV and treats an unrecognised environment as production", () => {
    vi.stubEnv("APP_ENV", "production");
    expect(deploymentEnv()).toBe("production");
    expect(isProductionLike()).toBe(true);
    vi.stubEnv("APP_ENV", "preview");
    expect(deploymentEnv()).toBe("preview");
    expect(isProductionLike()).toBe(true);
    // Unrecognised APP_ENV, no vitest/dev markers ⇒ production (fail-closed default).
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("VITEST", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(deploymentEnv()).toBe("production");
  });

  it("honours an explicit dev/test bypass but REJECTS any bypass in production/preview", () => {
    vi.stubEnv("FORMS_ALLOW_INSECURE_BYPASS", "true");
    vi.stubEnv("APP_ENV", "development");
    expect(insecureBypassAllowed()).toBe(true);
    vi.stubEnv("APP_ENV", "test");
    expect(insecureBypassAllowed()).toBe(true);
    // Same flag set, but production/preview must ignore it.
    vi.stubEnv("APP_ENV", "production");
    expect(insecureBypassAllowed()).toBe(false);
    expect(rateLimiterRequired()).toBe(true);
    vi.stubEnv("APP_ENV", "preview");
    expect(insecureBypassAllowed()).toBe(false);
    expect(rateLimiterRequired()).toBe(true);
  });

  it("without the explicit flag, dev/test do not bypass", () => {
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("FORMS_ALLOW_INSECURE_BYPASS", "");
    expect(insecureBypassAllowed()).toBe(false);
  });
});
