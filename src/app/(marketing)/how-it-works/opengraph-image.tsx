import { brandOgImage } from "@/lib/seo/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "How it works — Infinite Weblinks";

export default function Image() {
  return brandOgImage({
    eyebrow: "How it works",
    title: "One connected system, built around your growth.",
    subtitle: "A clear sequence — plan, build, connect and support — with no lock-in.",
    accent: "violet",
  });
}
