import { SectionShell } from "@/components/sections/SectionShell";
import { Card } from "@/components/primitives/Card";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { ContactForm } from "@/components/forms/ContactForm";
import type { SelectOption } from "@/components/forms/fields/SelectField";
import { contactTrustPoints } from "@/lib/content/data/contact";
import { supportEmail } from "@/lib/forms/config.public";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ContactFormSection.module.css";

type ContactFormSectionProps = {
  businessTypeOptions: SelectOption[];
  stageOptions: SelectOption[];
  goalOptions: SelectOption[];
  initialGoal?: string;
};

/**
 * ContactFormSection — the V2 form band. A light `SectionShell` with a two-column layout on wide
 * screens (a dominant raised form card + a quieter guidance column) that collapses to one column with
 * the FORM FIRST in DOM order, so it leads on mobile with no decorative delay. The form panel keeps
 * its "Send us your goals" heading and required-field note; the guidance column carries the four real
 * trust points (flat IconTiles, mapped V2 tones) and the always-visible support-email fallback. No
 * glass card, NodeOrb, InfinityMark, GlobeArc, sticky form or dark surface. The form itself is the
 * existing Client Component (unchanged behaviour). Server Component.
 */
export function ContactFormSection({
  businessTypeOptions,
  stageOptions,
  goalOptions,
  initialGoal,
}: ContactFormSectionProps) {
  return (
    <SectionShell surface="light" ariaLabel="Send us your goals" spacing="tight">
      <div className={styles.layout}>
        {/* Form column — first in DOM order so it leads on mobile. */}
        <div className={styles.formCol}>
          <div className={styles.formHead}>
            <h2 className={styles.formTitle}>Send us your goals</h2>
            <p className={styles.formSub}>
              Fields marked <span aria-hidden="true">*</span>
              <span className="iw-visually-hidden">with an asterisk</span> are required. The rest just
              help us reply well.
            </p>
          </div>
          <Card variant="raised" className={styles.formCard}>
            <ContactForm
              businessTypeOptions={businessTypeOptions}
              stageOptions={stageOptions}
              goalOptions={goalOptions}
              initialGoal={initialGoal}
            />
          </Card>
        </div>

        {/* Guidance column — quieter, never a second hero. */}
        <aside className={styles.guide}>
          <h3 className={styles.guideTitle}>What you can expect</h3>
          <ul className={styles.trust}>
            {contactTrustPoints.map((t) => (
              <li key={t.label} className={styles.trustItem}>
                <IconTile color={domainInk(t.tone)} size="sm">
                  <Icon name={t.icon} />
                </IconTile>
                <span className={styles.trustLabel}>{t.label}</span>
              </li>
            ))}
          </ul>
          <p className={styles.fallback}>
            Prefer email directly?{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
        </aside>
      </div>
    </SectionShell>
  );
}
