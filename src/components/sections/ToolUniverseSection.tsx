import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getToolCategories, getTools } from "@/lib/content";
import type { Tool, ToolCategory } from "@/lib/content/types";
import styles from "./ToolUniverseSection.module.css";

const PREVIEW_COUNT = 3;

/**
 * ToolUniverseSection — tools we help choose, configure and connect (theme-band).
 *
 * Deliberately no logo wall: every tool name is plain text, grouped by category,
 * with the exact language required — we help *choose, configure and connect*
 * tools the client already owns, never a partnership claim.
 */
export async function ToolUniverseSection({ anchorId }: { anchorId?: string }) {
  const [categories, tools] = await Promise.all([getToolCategories(), getTools()]);

  const grouped: { category: ToolCategory; items: Tool[] }[] = categories
    .map((category) => ({ category, items: tools.filter((t) => t.categorySlug === category.slug) }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-band iw-section ${styles.section}`}
      aria-labelledby="tool-universe-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="tool-universe-heading"
          eyebrow="Tools we work with"
          title="Tools we can help you choose, configure and connect"
          intro="We're not tied to any one platform, and we don't sell software. These are examples of tools we can help you pick, set up, and connect to the rest of your system — you keep the account, the data, and the login."
        />

        <ul className={styles.list}>
          {grouped.map(({ category, items }) => (
            <li key={category.slug} className={styles.row}>
              <div className={styles.rowHead}>
                <IconTile color={category.color} variant="filled" size={48}>
                  <Icon name={category.icon} />
                </IconTile>
                <div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryIntro}>{category.intro}</p>
                </div>
              </div>

              <ul className={styles.toolList}>
                {items.slice(0, PREVIEW_COUNT).map((tool) => (
                  <li key={tool.slug} className={styles.toolItem}>
                    <Link href={`/tools/${tool.slug}`} className={styles.toolLink}>
                      {tool.name}
                    </Link>
                    <p className={styles.toolWhat}>{tool.whatItDoes}</p>
                    {tool.exampleTools.length > 0 && (
                      <p className={styles.examples}>Examples: {tool.exampleTools.join(", ")}</p>
                    )}
                  </li>
                ))}
              </ul>

              {items.length > PREVIEW_COUNT && (
                <Link href={`/tools#${category.slug}`} className={styles.moreLink}>
                  See all {items.length} tools in {category.name}
                  <ArrowRight aria-hidden="true" size={14} />
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <Button href="/tools" variant="secondary">
            Browse all tools
          </Button>
        </div>
      </div>
    </section>
  );
}
