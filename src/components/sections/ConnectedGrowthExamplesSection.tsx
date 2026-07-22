import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Callout } from "@/components/primitives/Callout";
import { Button } from "@/components/primitives/Button";
import { ConnectedExampleCard } from "@/components/cards/ConnectedExampleCard";
import { getConnectedExamples } from "@/lib/content";
import styles from "./ConnectedGrowthExamplesSection.module.css";

/**
 * ConnectedGrowthExamplesSection — the V2 "see what works together" section (id="examples", explicit
 * V2 surface). A prominent information Callout makes the framing unmistakable, then every connected
 * example renders in source order as a ConnectedExampleCard (no featured first card, no dark/band
 * theming from the data, no false "See how it works" affordance, no implication the combinations
 * were delivered). One section-level primary CTA to /growth-plan and a secondary to /how-it-works.
 * No Review/result schema. Server Component.
 */
export async function ConnectedGrowthExamplesSection({ surface = "light" }: { surface?: "light" | "alt" }) {
  const examples = await getConnectedExamples();
  if (examples.length === 0) return null;

  return (
    <SectionShell
      surface={surface}
      id="examples"
      eyebrow="Connected growth examples"
      title="See what works together."
      lead="Results rarely come from one service alone. These are simple combinations, each built around a clear business goal — you can start with one and connect the rest as you grow."
      align="start"
    >
      <Callout tone="information" title="Illustrative examples, not real clients." className={styles.note}>
        These combinations show how the pieces fit together around a goal. They are examples, not case
        studies, and carry no client names, logos or results.
      </Callout>

      <CardGrid layout="equal" aria-label="Connected growth example combinations">
        {examples.map((example) => (
          <ConnectedExampleCard
            key={example.slug}
            title={example.title}
            summary={example.summary}
            goalHint={example.goalHint}
            services={example.services}
            tone={example.color}
          />
        ))}
      </CardGrid>

      <div className={styles.footer}>
        <p className={styles.footerNote}>
          You do not need everything at once — start where it counts, connect the rest as you grow.
        </p>
        <div className={styles.actions}>
          <Button href="/growth-plan" size="lg" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
            Build my growth plan
          </Button>
          <Button href="/how-it-works" variant="secondary" size="lg" iconRight={<ArrowUpRight size={16} aria-hidden="true" />}>
            See how it all works
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}
