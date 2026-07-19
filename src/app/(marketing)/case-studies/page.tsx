import type { Metadata } from "next";
import { ArrowRight, Info } from "lucide-react";
import { CosmicPageHero } from "@/components/routes/CosmicPageHero";
import { SectionShell } from "@/components/sections/SectionShell";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { FinalCtaBannerSection } from "@/components/sections/FinalCtaBannerSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseScenarios } from "@/lib/content";
import styles from "./case.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Case studies",
  description:
    "Worked examples of how a connected system fits together for different kinds of business. These are illustrative scenarios, clearly labelled as examples and not real clients, with no invented names or figures.",
  path: "/case-studies",
});

/**
 * /case-studies — currently populated with illustrative EXAMPLE scenarios, each clearly
 * labelled as an example rather than a real client. Real, verified client case studies use
 * the status-gated CaseStudy content type and would render here unlabelled once published;
 * until then, no client name, logo, testimonial or numeric result is presented as real.
 */
export default async function CaseStudiesIndexPage() {
  const scenarios = await getCaseScenarios();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/case-studies" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          "Case study examples",
          scenarios.map((c) => ({ name: c.title, path: `/case-studies/${c.slug}` })),
        )}
      />

      <CosmicPageHero
        id="case-studies-hero"
        breadcrumbs={[{ name: "Case studies" }]}
        eyebrow="Worked examples"
        hue="var(--domain-convert)"
        title={
          <>
            How a connected system <span className="iw-gradient-word">fits together</span>
          </>
        }
        lead="Worked examples of how the pieces connect for different kinds of business: the challenge, the parts of the system that solve it, and the outcome. Real client stories will appear here once they're published."
        actions={
          <>
            <GlowButton href="/growth-plan" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
              Build my growth plan
            </GlowButton>
            <GlowButton href="#examples" variant="ghost" size="lg">
              See the examples
            </GlowButton>
          </>
        }
        aside={
          <span aria-hidden="true">
            <NodeOrb hue="var(--domain-convert)" size={128} emphasis="bright">
              <Icon name="git-branch" />
            </NodeOrb>
          </span>
        }
      />

      <SectionShell
        id="examples"
        eyebrow="By situation"
        title="Example scenarios"
        lead="Each is an illustrative example, not a real client. Open one to see the challenge, the connected approach, and the qualitative outcome."
        align="start"
      >
        <div className={styles.notice}>
          <Info className={styles.noticeIcon} size={20} aria-hidden="true" />
          <p className={styles.noticeText}>
            <strong>These are illustrative examples, not real clients.</strong> They show how a
            connected system fits together for a kind of business. No client names, logos,
            testimonials or specific numeric results are shown, because none of these are real
            projects.
          </p>
        </div>

        <BentoGrid>
          {scenarios.map((scenario, i) => (
            <BentoCard
              key={scenario.slug}
              href={`/case-studies/${scenario.slug}`}
              hue={scenario.hue}
              icon="git-branch"
              eyebrow={`Example · ${scenario.forWho}`}
              title={scenario.title}
              blurb={scenario.summary}
              variant={i === 0 ? "featured" : "medium"}
            />
          ))}
        </BentoGrid>
      </SectionShell>

      <FinalCtaBannerSection anchorId="get-started" />
    </>
  );
}
