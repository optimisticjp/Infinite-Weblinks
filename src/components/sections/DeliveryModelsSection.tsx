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

/**
 * DeliveryModelsSection — the four exact delivery models (theme-dark), plus the
 * ownership statement: clients always own their accounts, data and tools.
 */
export async function DeliveryModelsSection({ anchorId }: { anchorId?: string }) {
  const models = await getDeliveryModels();
  if (models.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="delivery-models-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="delivery-models-heading"
          eyebrow="How we deliver"
          title="Four ways we can be involved"
          intro="Every service on this site uses exactly one of these. It's always clear who is doing the work."
        />

        <ul className={styles.grid}>
          {models.map((model) => (
            <li key={model.key} className={styles.card}>
              <IconTile color={DELIVERY_COLOR[model.key]} variant="filled" size={52}>
                <Icon name={MODEL_ICON[model.key] ?? "settings"} />
              </IconTile>
              <div className={styles.cardHead}>
                <h3 className={styles.name}>{model.name}</h3>
                {model.key === "we-do" && (
                  <Badge color={DELIVERY_COLOR[model.key]}>Our default</Badge>
                )}
              </div>
              <p className={styles.tagline}>{model.tagline}</p>
              <p className={styles.description}>{model.description}</p>
            </li>
          ))}
        </ul>

        <div className={styles.ownership}>
          <Icon name="shield" className={styles.ownershipIcon} />
          <p className={styles.ownershipText}>
            Whichever model applies, clients own their accounts, data and tools. Nothing is locked
            to Infinite Weblinks.
          </p>
        </div>
      </div>
    </section>
  );
}
