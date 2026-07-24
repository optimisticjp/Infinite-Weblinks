import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { SectionShell } from "@/components/sections/SectionShell";
import { Callout } from "@/components/primitives/Callout";
import { CustomerJourneyList } from "@/components/routes/CustomerJourneyList";
import { ConnectedGrowthExamplesSection } from "@/components/sections/ConnectedGrowthExamplesSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCustomerJourney } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./connected-growth.module.css";

/**
 * /connected-growth — how the pieces work together, as illustrative examples (not real clients).
 * The V2 PageHeader (server H1 = LCP text) frames it; CustomerJourneyList shows one person's path
 * across the connected system as a vertical ordered list, and ConnectedGrowthExamplesSection shows
 * simple combinations built around a clear goal. Each is clearly labelled an example. Closes into
 * the plan builder. No cosmic hero, GlowButton, NodeOrb, PhoneFrame, horizontal strip or gradient
 * word. (Distinct from /examples, which is the gated proof index.) Server Component.
 */
export const metadata: Metadata = pageMetadata({
  title: "Connected growth",
  description:
    "How the pieces fit together, shown as simple examples built around a clear goal. Illustrative combinations, not real clients, so you can see how a connected system compounds.",
  path: "/connected-growth",
});

export default async function ConnectedGrowthPage() {
  const journey = await getCustomerJourney();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Connected growth", path: "/connected-growth" },
        ])}
      />

      <PageHeader
        id="connected-growth-hero"
        breadcrumbs={[{ name: "Connected growth" }]}
        eyebrow="How it fits together"
        title="Simple combinations that compound"
        lead="A few connected pieces, built around one clear goal, go further than a pile of separate tools. These are illustrative examples of how it fits together, not real clients, so you can see the shape of a connected system before you build your own."
        actions={
          <>
            <Button href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#examples" variant="secondary" size="lg">
              See the combinations
            </Button>
          </>
        }
        trustNote={
          <>
            <Badge tone="information">Illustrative examples</Badge> These show how the pieces fit
            together, not real clients.
          </>
        }
      />

      {journey.length > 0 ? (
        <SectionShell
          surface="alt"
          id="journey"
          eyebrow="Customer journey"
          title="How everything connects for one customer."
          lead="Follow a single customer from the first advert to a repeat purchase. Every step hands off to the next — that hand-off is the whole point of a connected system."
          align="start"
        >
          <Callout tone="information" className={styles.note}>
            This is a generic, illustrative path. It is not a real customer record or a measured case
            study.
          </Callout>

          <CustomerJourneyList steps={journey} />

          <div className={styles.cta}>
            <Button href="/how-it-works" variant="secondary" iconRight={<ArrowUpRight size={16} aria-hidden="true" />}>
              Explore the full journey
            </Button>
          </div>
        </SectionShell>
      ) : null}

      <ConnectedGrowthExamplesSection surface="light" />

      <FinalCtaSection
        id="get-started"
        title="Build a connected plan for your own situation."
        lead="These are illustrative combinations. Tell us your goal and where you are, and we'll map the connected steps that fit your business."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/how-it-works", label: "See how it all works" }}
      />
    </>
  );
}
