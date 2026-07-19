import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { AccountOwnershipSection } from "@/components/sections/AccountOwnershipSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * /account-ownership — the ownership promise as its own page, on the Constellation kit. The
 * cosmic hero (H1 = LCP text) sets up the point; the reused AccountOwnershipSection carries
 * the detail: everything built and connected in your name, the your-accounts / your-data /
 * your-future guarantees, and its own route into the plan. No lock-in, stated plainly.
 */
export const metadata: Metadata = pageMetadata({
  title: "Account ownership",
  description:
    "Your business is built in your name. You own your accounts, tools and data, with clear access and documented ownership, and no lock-in. Continue with us, bring it in-house, or move on.",
  path: "/account-ownership",
});

export default function AccountOwnershipPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Account ownership", path: "/account-ownership" },
        ])}
      />

      <CosmicPageHero
        id="ownership-hero"
        breadcrumbs={[{ name: "Account ownership" }]}
        eyebrow="Owned by you"
        hue="var(--lime)"
        title={
          <>
            Your business is built in <span className="iw-gradient-word">your name</span>
          </>
        }
        lead="We set up and connect your website, tools and data as your business, not ours. You get clear access and documented ownership, so the whole system stays yours, whatever you decide next."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="/how-it-works" variant="ghost" size="lg">
              See how we work
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--lime)" size={128} emphasis="bright">
              <Icon name="shield" />
            </NodeOrb>
          </span>
        }
      />

      <AccountOwnershipSection anchorId="ownership" />
    </>
  );
}
