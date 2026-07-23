import "server-only";

/**
 * Bounded, streaming JSON body reader for the two form API routes — Web-standard `Request` /
 * `ReadableStream` only (no Node-only stream APIs), so it runs unchanged on Cloudflare Workers.
 *
 * It accepts `application/json` (a charset parameter is tolerated), enforces a small explicit byte
 * cap BEFORE reading (via Content-Length) and again WHILE streaming (when Content-Length is absent or
 * lies), and distinguishes unsupported-media-type / payload-too-large / invalid-json. It never logs
 * the body, cancels the stream the moment the cap is exceeded, and treats an empty body honestly.
 */

/** Generous for the two forms: growth-plan's largest field is a 2000-char message. */
export const MAX_FORM_BYTES = 16 * 1024; // 16 KiB

export type ReadJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; kind: "unsupported-media-type" | "payload-too-large" | "invalid-json" };

/** Accept exactly `application/json`, tolerating a normal `; charset=…` parameter. */
function isJsonContentType(header: string | null): boolean {
  if (!header) return false;
  const type = header.split(";")[0]?.trim().toLowerCase();
  return type === "application/json";
}

function concat(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

export async function readJsonBody(req: Request, maxBytes: number = MAX_FORM_BYTES): Promise<ReadJsonResult> {
  if (!isJsonContentType(req.headers.get("content-type"))) {
    return { ok: false, kind: "unsupported-media-type" };
  }

  // Reject an oversized DECLARED length before reading a single byte.
  const declared = req.headers.get("content-length");
  if (declared) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > maxBytes) return { ok: false, kind: "payload-too-large" };
  }

  const body = req.body;
  let text: string;
  if (!body) {
    text = "";
  } else {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          total += value.byteLength;
          // Enforce the cap while streaming (Content-Length absent or false) and stop reading.
          if (total > maxBytes) {
            await reader.cancel();
            return { ok: false, kind: "payload-too-large" };
          }
          chunks.push(value);
        }
      }
    } catch {
      // A read/transport error leaves nothing parseable — treat as invalid JSON, never log the body.
      return { ok: false, kind: "invalid-json" };
    }
    text = new TextDecoder().decode(concat(chunks, total));
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) return { ok: false, kind: "invalid-json" }; // empty body, honestly

  try {
    return { ok: true, data: JSON.parse(trimmed) };
  } catch {
    return { ok: false, kind: "invalid-json" };
  }
}

/** A per-request correlation id (safe to log; contains no visitor data). Returned as X-Request-ID. */
export function newRequestId(): string {
  return crypto.randomUUID();
}
