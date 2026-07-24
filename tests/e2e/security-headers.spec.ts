import { test, expect, type APIResponse } from "@playwright/test";

/**
 * Phase 3A (§G) — security headers on LIVE responses. The next.config header set is applied to
 * /:path* (every page, the 404, and the form API routes alike). These assertions hit real responses
 * and check the tightened CSP (Formspree gone from the browser-facing directives, script-src-attr
 * locked) plus the HSTS / nosniff / frame / referrer / permissions headers. Complementary to the
 * source-level lock in tests/unit/security-headers.test.ts.
 */

function assertSecurityHeaders(res: APIResponse, label: string) {
  const h = res.headers();
  const csp = h["content-security-policy"] ?? "";
  expect(csp, `${label}: CSP present`).toContain("default-src 'self'");
  expect(csp, `${label}: script-src-attr locked`).toContain("script-src-attr 'none'");
  expect(csp, `${label}: object-src none`).toContain("object-src 'none'");
  expect(csp, `${label}: frame-ancestors none`).toContain("frame-ancestors 'none'");
  // Formspree is a server-to-server call, so it must not appear in any browser-facing directive.
  expect(csp, `${label}: no Formspree in CSP`).not.toContain("formspree");

  expect(h["strict-transport-security"], `${label}: HSTS`).toContain("max-age=");
  expect(h["x-content-type-options"], `${label}: nosniff`).toBe("nosniff");
  expect(h["x-frame-options"], `${label}: frame options`).toBe("DENY");
  expect(h["referrer-policy"], `${label}: referrer policy`).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"], `${label}: permissions policy`).toContain("geolocation=()");
}

test.describe("security headers on page responses", () => {
  for (const path of ["/", "/contact", "/growth-plan", "/troubleshooter", "/privacy"]) {
    test(`${path} carries the tightened CSP and security headers`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should not error`).toBeLessThan(400);
      assertSecurityHeaders(res, path);
    });
  }

  test("the 404 response also carries the security headers", async ({ request }) => {
    const res = await request.get("/this-page-does-not-exist");
    expect(res.status()).toBe(404);
    assertSecurityHeaders(res, "404");
  });
});

test.describe("security headers on the form API responses", () => {
  // A minimal invalid body fails validation (400) — no email is ever sent — while still exercising the
  // real route so we can assert the headers and the per-request correlation id it returns.
  for (const path of ["/api/forms/contact", "/api/forms/growth-plan"]) {
    test(`${path} carries the security headers and an X-Request-ID`, async ({ request }) => {
      const res = await request.post(path, { data: { note: "header-check" } });
      // A validation error (or another gate) — never a 2xx success for this bogus body.
      expect(res.status(), `${path} rejects the bogus body`).toBeGreaterThanOrEqual(400);
      assertSecurityHeaders(res, path);
      expect(res.headers()["x-request-id"], `${path}: correlation id`).toBeTruthy();
    });
  }
});
