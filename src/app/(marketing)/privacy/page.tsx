import type { Metadata } from "next";
import { LegalPageView } from "@/components/routes/LegalPageView";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What information we collect on this site and how it's handled — in plain English.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPageView slug="privacy" />;
}
