import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi, afterEach } from "vitest";
import { logFormEvent } from "@/lib/forms/observability";

/**
 * Phase 3A (§F) — the PII-safe form observability sink. Two guarantees:
 *  1. Runtime: every line is a single structured JSON object with ONLY the whitelisted operational
 *     fields (form / requestId / event / outcome / status / durationMs) — nothing else is serialised.
 *  2. Source: visitor PII / secrets are branded `never`, so a caller literally cannot pass them
 *     (a compile error), and the module is server-only.
 */

const MODULE = "../../src/lib/forms/observability.ts";
const read = () => readFileSync(fileURLToPath(new URL(MODULE, import.meta.url)), "utf8");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logFormEvent — runtime output", () => {
  it("emits one structured JSON line tagged 'form' with only the whitelisted fields", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logFormEvent({
      form: "contact",
      requestId: "11111111-2222-3333-4444-555555555555",
      event: "delivered",
      outcome: "delivered",
      status: 200,
      durationMs: 42,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);
    expect(parsed).toEqual({
      tag: "form",
      form: "contact",
      requestId: "11111111-2222-3333-4444-555555555555",
      event: "delivered",
      outcome: "delivered",
      status: 200,
      durationMs: 42,
    });
  });

  it("omits optional fields when not provided (received event carries no outcome/status/duration)", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logFormEvent({ form: "growth-plan", requestId: "abc", event: "received" });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed).toEqual({ tag: "form", form: "growth-plan", requestId: "abc", event: "received" });
    expect(parsed).not.toHaveProperty("outcome");
    expect(parsed).not.toHaveProperty("status");
    expect(parsed).not.toHaveProperty("durationMs");
  });
});

describe("observability module — PII-safe by construction (source lock)", () => {
  const code = read();

  it("is server-only", () => {
    expect(code).toMatch(/import ["']server-only["']/);
  });

  it("brands known PII/secret fields as never so they cannot be logged", () => {
    // The forbidden-field union is the type-level guard behind `NoPii<T>`.
    expect(code).toContain("type ForbiddenLogField");
    for (const forbidden of ["name", "email", "message", "turnstileToken", "matchedRuleId", "ip", "secret"]) {
      expect(code, `forbids ${forbidden}`).toContain(`| "${forbidden}"`);
    }
    expect(code).toContain("[K in ForbiddenLogField]?: never");
  });

  it("only serialises the whitelisted operational fields", () => {
    // Destructure whitelist — a future edit adding a raw payload spread would break this lock.
    expect(code).toContain("const { form, requestId, event, outcome, status, durationMs } = record;");
    expect(code).not.toMatch(/\.\.\.record/);
  });
});
