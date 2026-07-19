import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { CustomerJourneySection } from "@/components/sections/CustomerJourneySection";
import { ConnectedExamplesSection } from "@/components/sections/ConnectedExamplesSection";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * /connected-growth — how the pieces work together, as illustrative examples (not real
 * clients). The cosmic hero (H1 = LCP text) frames it; the reused customer-journey phones
 * show one person's path across the connected system, and the connected-example cards show
 * simple combinations built around a clear goal. Each is clearly labelled an example. Closes
 * into the plan builder. (Distinct from /examples, which is the gated proof index.)
 */
export const metadata: Metadata = pageMetadata({
  title: "Connected growth",
  description:
    "How the pieces fit together, shown as simple examples built around a clear goal. Illustrative combinations, not real clients, so you can see how a connected system compounds.",
  path: "/connected-growth",
});

export default function ConnectedGrowthPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Connected growth", path: "/connected-growth" },
        ])}
      />

      <CosmicPageHero
        id="connected-growth-hero"
        breadcrumbs={[{ name: "Connected growth" }]}
        eyebrow="How it fits together"
        hue="var(--cyan)"
        title={
          <>
            Simple combinations that <span className="iw-gradient-word">compound</span>
          </>
        }
        lead="A few connected pieces, built around one clear goal, go further than a pile of separate tools. These are illustrative examples of how it fits together, not real clients, so you can see the shape of a connected system before you build your own."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#examples" variant="ghost" size="lg">
              See the combinations
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--cyan)" size={128} emphasis="bright">
              <Icon name="git-branch" />
            </NodeOrb>
          </span>
        }
      />

      {/* One person's path across the connected system (the phones). */}
      <CustomerJourneySection anchorId="journey" />

      {/* Simple combinations built around a clear goal — each labelled an example. */}
      <ConnectedExamplesSection anchorId="examples" />

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
