import { brandOgImage } from "@/lib/seo/og";

// Literal exports (Next's OG route analyzer needs these statically, not re-exported).
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Explore by goal — Infinite Weblinks";

export default function Image() {
  return brandOgImage({
    eyebrow: "Explore by goal",
    title: "Start from what you want to achieve.",
    subtitle: "Pick your goal and see the path, tools and services that get you there.",
    accent: "orange",
  });
}
