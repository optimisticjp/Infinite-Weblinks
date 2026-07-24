import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { Button } from "@/components/primitives/Button";
import { SectionShell } from "@/components/sections/SectionShell";
import { Callout } from "@/components/primitives/Callout";
import { OwnershipDetails } from "@/components/routes/OwnershipDetails";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAccountOwnership } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./account-ownership.module.css";

/**
 * /account-ownership — the ownership promise as its own V2 light-first page. PageHeader (server
 * H1 = LCP text) frames it; the reusable OwnershipDetails carries the real account-ownership data
 * (everything built and connected in your name, the your-accounts / your-data / your-future
 * guarantees, and the closing statement), and its own route into the plan. No lock-in, stated
 * plainly. No cosmic hero, GlowButton, shield NodeOrb or gradient word. Server Component.
 */
export const metadata: Metadata = pageMetadata({
  title: "Account ownership",
  description:
    "Your business is built in your name. You own your accounts, tools and data, with clear access and documented ownership, and no lock-in. Continue with us, bring it in-house, or move on.",
  path: "/account-ownership",
});

export default async function AccountOwnershipPage() {
  const ownership = await getAccountOwnership();
  const heading = `${ownership.heading.pre}${ownership.heading.accent}${ownership.heading.post}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Account ownership", path: "/account-ownership" },
        ])}
      />

      <PageHeader
        id="ownership-hero"
        breadcrumbs={[{ name: "Account ownership" }]}
        eyebrow="Owned by you"
        title="Your business is built in your name"
        lead="We set up and connect your website, tools and data as your business, not ours. You get clear access and documented ownership, so the whole system stays yours, whatever you decide next."
        actions={
          <>
            <Button
              href="/growth-plan"
              size="lg"
              iconRight={<ArrowRight size={18} aria-hidden="true" />}
            >
              Build my growth plan
            </Button>
            <Button href="/how-it-works" variant="secondary" size="lg">
              See how we work
            </Button>
          </>
        }
        trustNote="No lock-in. Your accounts, tools and data stay under your control."
      />

      <SectionShell
        surface="alt"
        id="ownership"
        eyebrow={ownership.eyebrow}
        title={heading}
        lead={ownership.body}
        align="start"
      >
        <OwnershipDetails data={ownership} />

        <Callout
          tone="information"
          title="Why documented ownership matters"
          className={styles.note}
        >
          Documented access and ownership matter most when a supplier changes. Because everything is
          set up in your name, you can continue with Infinite Weblinks, bring the work in-house, or
          move on. The choice is yours.
        </Callout>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Build a system that stays yours."
        lead="Tell us where you are and what you want to achieve, and we'll map the next connected step — all set up in your name."
        primary={{ href: ownership.primaryCta.route, label: ownership.primaryCta.label }}
        secondary={{ href: ownership.secondaryCta.route, label: ownership.secondaryCta.label }}
      />
    </>
  );
}
