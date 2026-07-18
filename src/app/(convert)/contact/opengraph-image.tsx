import { brandOgImage } from "@/lib/seo/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Contact — Infinite Weblinks";

export default function Image() {
  return brandOgImage({
    eyebrow: "Let's connect",
    title: "Tell us where you are and what you want to achieve.",
    subtitle: "Real people review your message and reply by email with a practical next step.",
    accent: "pink",
  });
}
