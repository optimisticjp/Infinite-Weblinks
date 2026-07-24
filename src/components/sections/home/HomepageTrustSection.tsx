import { SectionShell } from "@/components/sections/SectionShell";
import { OwnershipDetails } from "@/components/routes/OwnershipDetails";
import { HonestExpectationsPanel } from "@/components/routes/HonestExpectationsPanel";
import { getAccountOwnership } from "@/lib/content";
import styles from "./HomepageTrustSection.module.css";

/**
 * HomepageTrustSection — the merged trust section (id="ownership", explicit light surface, plain
 * H2). It composes the two reusable building blocks: OwnershipDetails (the vault, build flow,
 * guarantees and closing statement from the real account-ownership data) and HonestExpectationsPanel
 * (id="honest", the "what we won't do" / "what we do promise" columns). The account-ownership
 * closing sentence is shown; its old CTA button pair is NOT repeated (the FinalCtaSection follows).
 * Server Component. Structurally identical to the Phase 2K section — same id, H2, ownership fields,
 * #honest subsection, heading hierarchy (H2 → H3 → H4), order and CTA destinations — the markup is
 * just factored into shared components so /about and /account-ownership reuse it verbatim.
 */
export async function HomepageTrustSection({ surface = "light" }: { surface?: "light" | "alt" }) {
  const ownership = await getAccountOwnership();
  const heading = `${ownership.heading.pre}${ownership.heading.accent}${ownership.heading.post}`;

  return (
    <SectionShell
      surface={surface}
      id="ownership"
      eyebrow={ownership.eyebrow}
      title={heading}
      lead={ownership.body}
      align="start"
    >
      <OwnershipDetails data={ownership} />

      <HonestExpectationsPanel
        id="honest"
        heading="Honest expectations"
        intro="We sell honesty as much as we sell growth. Here's the plain version, so there are no surprises later."
        columnLevel={4}
        className={styles.honestDivider}
      />
    </SectionShell>
  );
}
