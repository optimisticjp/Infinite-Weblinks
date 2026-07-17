import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getDeliveryModels } from "@/lib/content";
import styles from "./DeliveryModelsSection.module.css";

/** Fixed icon per delivery-model key — the type carries no icon field of its own. */
const MODEL_ICON: Record<string, string> = {
  "we-do": "settings",
  "we-expert": "users",
  "we-run": "workflow",
  "you-run": "folder",
};

/** Ownership assurances — plain restatements of the locked ownership line. */
const ASSURANCES = [
  { label: "Your accounts stay yours", icon: "users" },
  { label: "Full access, always", icon: "shield" },
  { label: "Your data stays yours", icon: "database" },
  { label: "Export anytime, no lock-in", icon: "git-branch" },
];

/**
 * DeliveryModelsSection — the four exact delivery models (theme-band-bright, ref 01),
 * each a numbered card in its own accent, plus the ownership strip: clients always own
 * their accounts, data and tools. Daylight band, so glow-free.
 */
export async function DeliveryModelsSection({ anchorId }: { anchorId?: string }) {
  const models = await getDeliveryModels();
  if (models.length === 0) return null;

  return (
    <section
      id={anchorId}
      className="theme-band-bright iw-section"
      aria-labelledby="delivery-models-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="delivery-models-heading"
          eyebrow="Four ways we can work together"
          title="Choose the way of working that fits your business"
          intro="The plan stays connected. The level of support is flexible — every service on this site uses exactly one of these, so it's always clear who does the work."
        />

        <ul className={styles.grid}>
          {models.map((model, i) => (
            // Per-model anchor so the "How we deliver" mega-menu links can each land on
            // their own card (/how-it-works#delivery-<key>), not all on the section #delivery.
            <li
              key={model.key}
              id={`delivery-${model.key}`}
              className={styles.card}
              style={{ ["--accent" as string]: DELIVERY_COLOR[model.key] }}
            >
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <IconTile color={DELIVERY_COLOR[model.key]} variant="filled" size={52}>
                <Icon name={MODEL_ICON[model.key] ?? "settings"} />
              </IconTile>
              <div className={styles.cardHead}>
                <h3 className={styles.name}>{model.name}</h3>
                {model.key === "we-do" && <Badge color={DELIVERY_COLOR[model.key]}>Our default</Badge>}
              </div>
              <p className={styles.tagline}>{model.tagline}</p>
              <p className={styles.description}>{model.description}</p>
            </li>
          ))}
        </ul>

        <div className={styles.ownership}>
          <div className={styles.ownershipLead}>
            <IconTile color="var(--violet)" variant="filled" size={48}>
              <Icon name="shield" />
            </IconTile>
            <p className={styles.ownershipText}>You own your accounts, tools and data.</p>
          </div>
          <ul className={styles.assurances}>
            {ASSURANCES.map((a) => (
              <li key={a.label} className={styles.assurance}>
                <Icon name={a.icon} className={styles.assuranceIcon} />
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
