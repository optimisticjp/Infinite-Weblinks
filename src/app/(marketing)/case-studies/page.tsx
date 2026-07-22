import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { CardGrid } from "@/components/primitives/CardGrid";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { Callout } from "@/components/primitives/Callout";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseScenarios } from "@/lib/content";

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

      <PageHeader
        id="case-studies-hero"
        breadcrumbs={[{ name: "Case studies" }]}
        eyebrow="Worked examples"
        title="How a connected system fits together"
        lead="Worked examples of how the pieces connect for different kinds of business: the challenge, the parts of the system that solve it, and the outcome. Real client stories will appear here once they're published."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="#examples" variant="secondary">
              See the examples
            </Button>
          </>
        }
        trustNote="Every entry below is an illustrative scenario, not a real client."
      />

      <SectionShell
        surface="alt"
        id="examples"
        eyebrow="By situation"
        title="Example scenarios"
        lead="Each is an illustrative example, not a real client. Open one to see the challenge, the connected approach, and the qualitative outcome."
        align="start"
      >
        <Callout
          tone="information"
          title="These are illustrative examples, not real clients."
          style={{ marginBottom: "var(--space-8)" }}
        >
          They show how a connected system fits together for a kind of business. No client
          names, logos, testimonials or specific numeric results are shown, because none of
          these are real projects.
        </Callout>

        <CardGrid layout="equal" aria-label="Example scenarios">
          {scenarios.map((scenario) => (
            <CaseStudyCard
              key={scenario.slug}
              href={`/case-studies/${scenario.slug}`}
              title={scenario.title}
              forWho={scenario.forWho}
              summary={scenario.summary}
              tone={scenario.hue}
              status="illustrative"
            />
          ))}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Want a plan mapped to your situation?"
        lead="These are worked examples — build one around your own goals, or talk it through with us first. No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
