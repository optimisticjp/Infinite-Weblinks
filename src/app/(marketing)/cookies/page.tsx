import type { Metadata } from "next";
import { LegalPageView } from "@/components/routes/LegalPageView";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How cookies and similar technologies are used on this site — kept deliberately minimal.",
  path: "/cookies",
});

export default function CookiesPage() {
  return <LegalPageView slug="cookies" />;
}
