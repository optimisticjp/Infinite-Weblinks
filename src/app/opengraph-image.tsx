import { ImageResponse } from "next/og";

/**
 * Default social-share (Open Graph / Twitter) image, generated at build time so it ships as a
 * static asset — no runtime image rendering on the Cloudflare Worker. Uses the locked brand copy
 * and the V3 "Instrument" palette. The owner can replace this with a designed asset later without
 * any code change elsewhere: routes inherit it automatically via the Next.js file convention.
 *
 * The colours are LITERAL because this renders to a static PNG — CSS custom properties can't
 * resolve here. Each is copied from src/styles/tokens/v3.css; keep them in sync with that file:
 *   #08080A  --v3-ink-950     canvas
 *   #F3F3F6  --v3-on-strong   heading         (18.07:1 on the canvas)
 *   #B9B9C6  --v3-on-body     body            (10.31:1 on the canvas)
 *   #9A9AA8  --v3-on-muted    secondary / url (7.21:1 on the canvas)
 *   #8B6BFF  --v3-brand-text  accent          (5.38:1 on the canvas)
 * V3 keeps the canvas a flat neutral dark — no decorative glow or gradient (those are the retired
 * Constellation register); colour appears only as the small brand accent.
 */
export const dynamic = "force-static";
export const alt = "Infinite Weblinks — Digital growth, built around your goals.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#08080A", // --v3-ink-950 (flat neutral canvas)
          color: "#F3F3F6", // --v3-on-strong (heading ink; inherited by the title below)
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: "26px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#8B6BFF", // --v3-brand-text (accent)
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: "#8B6BFF", // --v3-brand-text (accent)
            }}
          />
          Infinite Weblinks
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "84px",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            maxWidth: "980px",
          }}
        >
          Digital growth, built around your goals.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "30px",
            color: "#B9B9C6", // --v3-on-body (body)
          }}
        >
          <div style={{ display: "flex", maxWidth: "760px" }}>
            A smarter way to plan and grow your business online.
          </div>
          {/* --v3-on-muted (dimmer than body, still 7.21:1 on the canvas) */}
          <div style={{ display: "flex", color: "#9A9AA8" }}>infiniteweblinks.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
