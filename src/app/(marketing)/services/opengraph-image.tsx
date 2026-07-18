import { brandOgImage } from "@/lib/seo/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Services — Infinite Weblinks";

export default function Image() {
  return brandOgImage({
    eyebrow: "Services",
    title: "Everything your business needs, connected.",
    subtitle: "Websites, marketing, customer tools, analytics and automation — around your goals.",
    accent: "cyan",
  });
}
