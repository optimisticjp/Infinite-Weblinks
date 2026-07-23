import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { ExampleCard } from "@/components/cards/ExampleCard";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";

type ExampleItem = { slug: string; title: string; summary: string };

/**
 * ExamplesIndex — the V2 presentation for the gated /examples index. A pure component (it takes the
 * already-gated records as a prop and does no fetching), so the latent template can be exercised with
 * fixtures while the production route stays 404 until a verified record exists. Light-first: a
 * PageHeader (whose Breadcrumbs emits the single Home → Examples BreadcrumbList), a light SectionShell
 * with a CardGrid of restrained ExampleCards, and the reserved-night FinalCtaSection. No cosmic hero,
 * theme-band, HubGrid, IndexCard, glow or fabricated proof.
 */
export function ExamplesIndex({ examples }: { examples: ExampleItem[] }) {
  return (
    <>
      <PageHeader
        id="examples-hero"
        surface="light"
        breadcrumbs={[{ name: "Examples", path: "/examples" }]}
        eyebrow="Proof"
        title="Examples"
        lead="A look at the kind of work we do and the outcomes it's built to produce."
      />

      <SectionShell
        surface="light"
        id="examples-list"
        ariaLabel="All examples"
        spacing="tight"
      >
        <CardGrid layout="equal" aria-label="All examples">
          {examples.map((ex) => (
            <ExampleCard
              key={ex.slug}
              title={ex.title}
              summary={ex.summary}
              href={`/examples/${ex.slug}`}
            />
          ))}
        </CardGrid>
      </SectionShell>

      <FinalCtaSection
        id="get-started"
        title="Want work like this built around your goals?"
        lead="Answer a few guided questions and see what to do first, what connects next, and what can wait."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk it through" }}
      />
    </>
  );
}
