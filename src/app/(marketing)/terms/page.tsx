import type { Metadata } from "next";
import { LegalPageView } from "@/components/routes/LegalPageView";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms covering use of this website. Service engagements have their own written agreement.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPageView slug="terms" />;
}
