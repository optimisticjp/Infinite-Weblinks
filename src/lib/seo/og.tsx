import { ImageResponse } from "next/og";

/**
 * Shared builder for route-aware Open Graph / Twitter images (brief §P3-02, review §7).
 * Generated at build time (`force-static`) so no runtime image rendering happens on the
 * Cloudflare Worker. On-brand (space background + one accent glow), readable at social preview
 * sizes, and — critically — carries NO proof, metrics or unsupported claims: just the section's
 * own title. The owner can swap in designed assets later without touching callers.
 */
export const ogDynamic = "force-static";
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const ACCENTS: Record<string, string> = {
  violet: "#b571ff",
  pink: "#ff2e93",
  orange: "#ff9538",
  cyan: "#22d3ee",
  lime: "#4ade80",
};

export function brandOgImage({
  eyebrow,
  title,
  subtitle,
  accent = "violet",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: keyof typeof ACCENTS | string;
}) {
  const glow = ACCENTS[accent] ?? ACCENTS.violet;
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
          background: `radial-gradient(1000px 600px at 78% 8%, ${glow}38, rgba(7,5,15,0) 60%), linear-gradient(160deg, #0a0715 0%, #07050f 100%)`,
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
            color: glow,
            fontWeight: 600,
          }}
        >
          <div style={{ width: "16px", height: "16px", borderRadius: "999px", background: glow }} />
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "80px",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
          }}
        >
          {title}
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
          <div style={{ display: "flex", maxWidth: "820px" }}>{subtitle}</div>
          <div style={{ display: "flex", color: "#928bb0" }}>infiniteweblinks.com</div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
