import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getFaqs } from "@/lib/content";
import type { Faq } from "@/lib/content/types";
import styles from "./FaqSection.module.css";

/**
 * FaqSection (theme-dark) — a homepage FAQ preview built on native
 * `<details>`/`<summary>`, so every question is keyboard-operable and readable
 * with no JavaScript at all. Grouped by category only when the data actually
 * uses categories; otherwise a flat, ungrouped list. Returns null when there
 * are no verified FAQs. The dedicated `/faq` page (not this component) emits
 * FAQPage JSON-LD.
 */
export async function FaqSection({ anchorId }: { anchorId?: string }) {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  const categories = Array.from(
    new Set(faqs.map((f) => f.category).filter((c): c is string => Boolean(c))),
  );

  const groups: { label: string | null; items: Faq[] }[] =
    categories.length > 0
      ? [
          ...categories.map((category) => ({
            label: category,
            items: faqs.filter((f) => f.category === category),
          })),
          ...(faqs.some((f) => !f.category)
            ? [{ label: "More questions", items: faqs.filter((f) => !f.category) }]
            : []),
        ]
      : [{ label: null, items: faqs }];

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="faq-heading"
    >
      <div className="iw-container">
        <SectionHeader
          eyebrow="Common questions"
          id="faq-heading"
          title="Frequently asked questions"
          intro="A few of the questions we hear most often. The full FAQ page has more."
        />

        <div className={styles.groups}>
          {groups.map((group, gi) => (
            <div key={group.label ?? "flat"} className={styles.group}>
              {group.label && <h3 className={styles.groupLabel}>{group.label}</h3>}
              <div className={styles.list}>
                {group.items.map((faq, i) => (
                  <details
                    key={faq.slug}
                    className={styles.item}
                    name={`faq-group-${gi}`}
                    open={gi === 0 && i === 0}
                  >
                    <summary className={styles.summary}>
                      <span>{faq.question}</span>
                      <ChevronDown aria-hidden="true" className={styles.chevron} />
                    </summary>
                    <p className={styles.answer}>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
