import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { GrowthTroubleshooter } from "@/components/troubleshooter/GrowthTroubleshooter";
import { getTroubleshooterProblems } from "@/lib/content";
import { canonical } from "@/lib/seo/metadata";

// A conversion utility, like the growth-plan builder — crawlable but noindex.
export const metadata: Metadata = {
  title: "Growth Troubleshooter — find where to look first",
  description:
    "Tell us what is not working and we'll show you where to look first — a plain explanation, useful checks and a sensible next step. No email required.",
  alternates: { canonical: canonical("/troubleshooter") },
  robots: { index: false, follow: true },
};

/**
 * /troubleshooter — the Digital Growth Troubleshooter, on the V2 light-first system. `noindex, follow`
 * (a conversion tool kept out of the index; link equity still flows). A server-rendered PageHeader
 * (breadcrumb + plain H1 + lead + two CTAs + a no-email trust note) opens the page; the interactive
 * GrowthTroubleshooter (the one Client Component) renders the selector + the active problem's
 * guidance. No cosmic hero/starfield, GlobeArc, broken-journey diagram, gradient accent word, glow or
 * SVG gradient. Server Component.
 */
export default async function TroubleshooterPage() {
  const problems = await getTroubleshooterProblems();

  return (
    <>
      <PageHeader
        id="troubleshooter-hero"
        surface="light"
        breadcrumbs={[{ name: "Growth troubleshooter" }]}
        eyebrow="The digital growth troubleshooter"
        title="Tell us what is not working. We'll show you where to look first."
        lead="Choose a business problem and get a simple explanation, useful checks and a sensible next step — built around the connected growth journey."
        actions={
          <>
            <Button href="#diagnose" size="lg" iconRight={<ArrowDown size={18} aria-hidden="true" />}>
              Diagnose my growth problem
            </Button>
            <Button href="/growth-plan" variant="secondary" size="lg">
              Build my growth plan
            </Button>
          </>
        }
        trustNote="Useful guidance without entering an email address — a practical place to look first, not a guaranteed diagnosis."
      />

      <GrowthTroubleshooter problems={problems} />
    </>
  );
}
