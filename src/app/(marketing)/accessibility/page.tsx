import type { Metadata } from "next";
import { LegalPageView } from "@/components/routes/LegalPageView";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Accessibility Statement",
  description: "Our commitment to WCAG 2.2 AA and how to report an accessibility issue on this site.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return <LegalPageView slug="accessibility" />;
}
