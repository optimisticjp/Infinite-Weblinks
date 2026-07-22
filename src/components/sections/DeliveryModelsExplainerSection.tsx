import { Shield } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { DeliveryModelCard } from "@/components/cards/DeliveryModelCard";
import { getDeliveryModels } from "@/lib/content";
import styles from "./DeliveryModelsExplainerSection.module.css";

/** Ownership assurances — plain restatements of the locked ownership line (verbatim from the
 *  legacy section). */
const ASSURANCES = [
  { label: "Your accounts stay yours", icon: "users" },
  { label: "Full access, always", icon: "shield" },
  { label: "Your data stays yours", icon: "database" },
  { label: "Export anytime, no lock-in", icon: "git-branch" },
];

/**
 * DeliveryModelsExplainerSection — the V2 delivery-model section. SectionShell (an explicit V2
 * surface, the existing eyebrow/title/intro) with the four DeliveryModelCards in source order —
 * each carrying id="delivery-<key>" — plus, by default, the ownership statement and its four
 * assurances as a semantic list. Icon/ink come from the central DELIVERY_MODEL_META (no raw
 * DELIVERY_COLOR, no duplicated icon map, no filled legacy tiles, no theme-band-bright, no
 * hard-coded shared heading id).
 *
 * The section id defaults to "delivery" (its /how-it-works contract) and the ownership strip
 * defaults to on, so /how-it-works stays byte-for-byte unchanged. The homepage passes
 * id="ways-of-working" and showOwnership={false} (ownership lives in the merged trust section
 * there). Server Component.
 */
export async function DeliveryModelsExplainerSection({
  surface = "light",
  id = "delivery",
  showOwnership = true,
}: {
  surface?: "light" | "alt";
  id?: string;
  showOwnership?: boolean;
}) {
  const models = await getDeliveryModels();
  if (models.length === 0) return null;

  return (
    <SectionShell
      surface={surface}
      id={id}
      align="start"
      eyebrow="Four ways we can work together"
      title="Choose the way of working that fits your business"
      lead="The plan stays connected. The level of support is flexible — every service on this site uses exactly one of these, so it's always clear who does the work."
    >
      <CardGrid layout="equal" aria-label="The four ways we can work together">
        {models.map((model, i) => (
          <DeliveryModelCard
            key={model.key}
            order={i + 1}
            modelKey={model.key}
            tagline={model.tagline}
            description={model.description}
          />
        ))}
      </CardGrid>

      {showOwnership ? (
        <div className={styles.ownership}>
          <p className={styles.ownershipLead}>
            <IconTile color="var(--v2-brand-strong)" size="sm">
              <Shield aria-hidden="true" />
            </IconTile>
            You own your accounts, tools and data.
          </p>
          <ul className={styles.assurances}>
            {ASSURANCES.map((a) => (
              <li key={a.label} className={styles.assurance}>
                <Icon name={a.icon} className={styles.assuranceIcon} />
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionShell>
  );
}
