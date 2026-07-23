import { describe, it, expect } from "vitest";
import { readJsonBody, newRequestId, MAX_FORM_BYTES } from "@/lib/forms/request";

/**
 * Phase 3A (§C) — the bounded, streaming JSON reader. application/json only; a small byte cap enforced
 * before reading (Content-Length) and while streaming (no/false Content-Length); honest
 * unsupported-media-type / payload-too-large / invalid-json outcomes; empty body handled; per-request
 * correlation id generated. Never reads or logs the body beyond the cap.
 */

function jsonRequest(body: string, contentType: string | null = "application/json"): Request {
  const headers = new Headers();
  if (contentType !== null) headers.set("content-type", contentType);
  return new Request("https://example.test/api/forms/contact", { method: "POST", headers, body });
}

/** A streamed request with NO Content-Length (chunked), so the cap must be enforced while reading. */
function streamedJsonRequest(totalBytes: number): Request {
  const chunk = new TextEncoder().encode("x".repeat(1024));
  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= totalBytes) return controller.close();
      controller.enqueue(chunk);
      sent += chunk.byteLength;
    },
  });
  const headers = new Headers({ "content-type": "application/json" });
  return new Request("https://example.test/api/forms/contact", {
    method: "POST",
    headers,
    body: stream,
    // Node's undici requires duplex when the body is a stream.
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

describe("readJsonBody", () => {
  it("parses valid JSON with a charset parameter", async () => {
    const req = jsonRequest('{"name":"Jo"}', "application/json; charset=utf-8");
    const r = await readJsonBody(req);
    expect(r).toEqual({ ok: true, data: { name: "Jo" } });
  });

  it("rejects a non-JSON content type as unsupported-media-type", async () => {
    const r = await readJsonBody(jsonRequest('{"a":1}', "text/plain"));
    expect(r).toEqual({ ok: false, kind: "unsupported-media-type" });
  });

  it("rejects a missing content type", async () => {
    const r = await readJsonBody(jsonRequest('{"a":1}', null));
    expect(r).toEqual({ ok: false, kind: "unsupported-media-type" });
  });

  it("rejects malformed JSON as invalid-json", async () => {
    const r = await readJsonBody(jsonRequest("{not valid"));
    expect(r).toEqual({ ok: false, kind: "invalid-json" });
  });

  it("treats an empty body honestly as invalid-json", async () => {
    const r = await readJsonBody(jsonRequest(""));
    expect(r).toEqual({ ok: false, kind: "invalid-json" });
  });

  it("rejects an oversized Content-Length before reading (payload-too-large)", async () => {
    // A body larger than the cap ⇒ the runtime sets Content-Length > cap ⇒ rejected up front.
    const big = JSON.stringify({ m: "z".repeat(MAX_FORM_BYTES + 500) });
    const r = await readJsonBody(jsonRequest(big));
    expect(r).toEqual({ ok: false, kind: "payload-too-large" });
  });

  it("enforces the cap while streaming when Content-Length is absent (payload-too-large)", async () => {
    const r = await readJsonBody(streamedJsonRequest(MAX_FORM_BYTES + 4096));
    expect(r).toEqual({ ok: false, kind: "payload-too-large" });
  });

  it("accepts a boundary-sized valid payload just under the cap", async () => {
    const filler = "a".repeat(MAX_FORM_BYTES - 64); // leaves room for the JSON envelope
    const body = JSON.stringify({ message: filler });
    expect(body.length).toBeLessThanOrEqual(MAX_FORM_BYTES);
    const r = await readJsonBody(jsonRequest(body));
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.data as { message: string }).message).toBe(filler);
  });
});

describe("newRequestId", () => {
  it("generates a unique UUID with no visitor data", () => {
    const a = newRequestId();
    const b = newRequestId();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(a).not.toBe(b);
  });
});
