import { ImageResponse } from "next/og";

/**
 * Default social-share (Open Graph / Twitter) image, generated at build time so it ships as a
 * static asset — no runtime image rendering on the Cloudflare Worker. Uses the locked brand
 * copy and palette. The owner can replace this with a designed asset later without any code
 * change elsewhere: routes inherit it automatically via the Next.js file convention.
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
          background:
            "radial-gradient(1000px 600px at 78% 8%, rgba(181,113,255,0.22), rgba(7,5,15,0) 60%), linear-gradient(160deg, #0a0715 0%, #07050f 100%)",
          color: "#f6f4ff",
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
            color: "#b571ff",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: "#b571ff",
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
            color: "#c4bedc",
          }}
        >
          <div style={{ display: "flex", maxWidth: "760px" }}>
            A smarter way to plan and grow your business online.
          </div>
          <div style={{ display: "flex", color: "#928bb0" }}>infiniteweblinks.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
