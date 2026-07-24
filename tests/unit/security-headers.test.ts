import { describe, it, expect, beforeAll } from "vitest";
import nextConfig from "../../next.config";

/**
 * Phase 3A (§G) — the Content-Security-Policy and security headers configured in next.config.ts.
 * These lock the tightened policy at the source: Formspree removed from the browser-facing directives
 * (the browser posts same-origin; the server forwards to Formspree out of band), the added
 * script-src-attr / media-src / manifest-src, a Turnstile-only frame-src, and the full security-header
 * set applied to every route. The end-to-end suite additionally asserts the headers on live responses.
 */

interface HeaderKV {
  key: string;
  value: string;
}
interface HeaderGroup {
  source: string;
  headers: HeaderKV[];
}

let group: HeaderGroup;
let headerMap: Map<string, string>;
let directives: Map<string, string>;

beforeAll(async () => {
  const groups = (await nextConfig.headers?.()) as HeaderGroup[];
  const found = groups.find((g) => g.source === "/:path*");
  if (!found) throw new Error("expected a security-header group applied to /:path*");
  group = found;
  headerMap = new Map(group.headers.map((h) => [h.key, h.value]));
  const csp = headerMap.get("Content-Security-Policy") ?? "";
  directives = new Map(
    csp
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...rest] = d.split(/\s+/);
        return [name, rest.join(" ")] as const;
      }),
  );
});

describe("security headers — applied to every route", () => {
  it("applies the header set to /:path* (all routes, pages and API alike)", () => {
    expect(group.source).toBe("/:path*");
  });

  it("sets HSTS with a long max-age, includeSubDomains and preload", () => {
    const hsts = headerMap.get("Strict-Transport-Security") ?? "";
    expect(hsts).toMatch(/max-age=\d{7,}/);
    expect(hsts).toContain("includeSubDomains");
    expect(hsts).toContain("preload");
  });

  it("sets the remaining hardening headers", () => {
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    const pp = headerMap.get("Permissions-Policy") ?? "";
    for (const feature of ["camera=()", "microphone=()", "geolocation=()", "payment=()"]) {
      expect(pp, feature).toContain(feature);
    }
  });

  it("does NOT add COOP/CORP (not proven necessary — kept out deliberately)", () => {
    expect(headerMap.has("Cross-Origin-Opener-Policy")).toBe(false);
    expect(headerMap.has("Cross-Origin-Embedder-Policy")).toBe(false);
    expect(headerMap.has("Cross-Origin-Resource-Policy")).toBe(false);
  });
});

describe("Content-Security-Policy — tightened", () => {
  it("locks the baseline directives", () => {
    expect(directives.get("default-src")).toBe("'self'");
    expect(directives.get("object-src")).toBe("'none'");
    expect(directives.get("base-uri")).toBe("'self'");
    expect(directives.get("frame-ancestors")).toBe("'none'");
    expect(directives.has("upgrade-insecure-requests")).toBe(true);
  });

  it("adds script-src-attr 'none', media-src 'self' and manifest-src 'self'", () => {
    expect(directives.get("script-src-attr")).toBe("'none'");
    expect(directives.get("media-src")).toBe("'self'");
    expect(directives.get("manifest-src")).toBe("'self'");
  });

  it("removes Formspree from the browser-facing directives (server-to-server, not a browser request)", () => {
    const csp = headerMap.get("Content-Security-Policy") ?? "";
    expect(csp).not.toContain("formspree.io");
    expect(directives.get("connect-src")).not.toContain("formspree");
    expect(directives.get("form-action")).toBe("'self'");
  });

  it("keeps connect-src to same-origin, Sanity, Turnstile and the analytics beacon only", () => {
    const connect = directives.get("connect-src") ?? "";
    expect(connect).toContain("'self'");
    expect(connect).toContain("https://*.sanity.io");
    expect(connect).toContain("https://challenges.cloudflare.com");
    expect(connect).toContain("https://cloudflareinsights.com");
  });

  it("embeds only the Turnstile challenge iframe (frame-src is Turnstile-only)", () => {
    expect(directives.get("frame-src")).toBe("https://challenges.cloudflare.com");
  });

  it("retains 'unsafe-inline' in script-src only (documented Next.js bootstrap requirement)", () => {
    const scriptSrc = directives.get("script-src") ?? "";
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(scriptSrc).toContain("https://challenges.cloudflare.com");
    expect(scriptSrc).toContain("https://static.cloudflareinsights.com");
  });
});
