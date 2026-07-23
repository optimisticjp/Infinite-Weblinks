import type { PricingFaq } from "@/lib/content/data/pricing";
import styles from "./PricingFaqList.module.css";

type PricingFaqListProps = {
  /** The pricing FAQs, in source order (the SAME array that feeds the FAQPage JSON-LD). */
  faqs: PricingFaq[];
  className?: string;
};

/**
 * PricingFaqList — a semantic definition list of the pricing FAQs: one `<div>` per FAQ, the question
 * as `<dt>`, the answer as `<dd>`, all in source order. Every answer is server-rendered and always
 * visible — no accordion, no search input, no client state, no hidden/interaction-gated content. The
 * caller passes the same exported `pricingFaqs` array it hands to `faqJsonLd`, so the visible copy and
 * the structured data can never diverge. Server Component; readable with CSS disabled.
 */
export function PricingFaqList({ faqs, className }: PricingFaqListProps) {
  return (
    <dl className={[styles.faq, className].filter(Boolean).join(" ")}>
      {faqs.map((faq) => (
        <div key={faq.question} className={styles.item}>
          <dt className={styles.question}>{faq.question}</dt>
          <dd className={styles.answer}>{faq.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
