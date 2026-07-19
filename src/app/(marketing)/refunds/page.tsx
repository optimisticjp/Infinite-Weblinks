import type { Metadata } from "next";
import { LegalPageView } from "@/components/routes/LegalPageView";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Refunds & Cancellations",
  description:
    "How refunds and cancellations work for our services, in plain English. This site takes no payments; paid work is handled through your separate written agreement.",
  path: "/refunds",
});

export default function RefundsPage() {
  return <LegalPageView slug="refunds" />;
}
