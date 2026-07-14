import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { IndexCard } from "@/components/routes/IndexCard";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getToolCategories, getTools } from "@/lib/content";
import styles from "./tools.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Tools",
  description:
    "Examples of the tools we can help you choose, configure and connect. We're not tied to any one platform and we don't sell software — you keep the account, the data, and the login.",
  path: "/tools",
});

export default async function ToolsIndexPage() {
  const [categories, tools] = await Promise.all([getToolCategories(), getTools()]);

  const grouped = categories
    .map((category) => ({
      category,
      items: tools.filter((t) => t.categorySlug === category.slug),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          "Tools",
          tools.map((t) => ({ name: t.name, path: `/tools/${t.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
        ])}
      />

      <PageHero
        eyebrow="Tools"
        title="Tools we can help you choose, configure and connect"
        intro="These are examples of tools we can help you pick, set up, and connect to the rest of your system. We're not tied to any one platform, and we don't sell software — whatever we set up sits in your name."
        breadcrumbs={[{ name: "Tools" }]}
        aside={
          <p className={styles.note}>
            More tools is not better — we set up a few that talk to each other cleanly, in your name.
          </p>
        }
      />

      {grouped.map(({ category, items }, i) => {
        const theme = i % 2 === 0 ? "theme-band" : "theme-dark";
        const headingId = `cat-${category.slug}`;
        return (
          <section
            key={category.slug}
            id={category.slug}
            className={`${theme} iw-section ${styles.catSection}`}
            aria-labelledby={headingId}
          >
            <div className="iw-container">
              <div className={styles.catHead}>
                <IconTile color={category.color} variant="filled" size={52}>
                  <Icon name={category.icon} />
                </IconTile>
                <div className={styles.catHeadText}>
                  <h2 id={headingId} className={styles.catName}>
                    {category.name}
                  </h2>
                  <p className={styles.catIntro}>{category.intro}</p>
                </div>
              </div>

              <ul className={styles.grid}>
                {items.map((tool) => (
                  <li key={tool.slug}>
                    <IndexCard
                      href={`/tools/${tool.slug}`}
                      title={tool.name}
                      description={tool.whatItDoes}
                      color={category.color}
                      footer={
                        tool.exampleTools.length > 0
                          ? `Examples: ${tool.exampleTools.slice(0, 3).join(", ")}`
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="theme-dark iw-section" aria-label="Next steps">
        <div className="iw-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>A stack that fits your goals, not a longer list</h2>
            <p className={styles.ctaBody}>
              The right tools depend on your size, budget, and what you&apos;re trying to do next. Tell us
              your goals and we&apos;ll suggest a small, connected set — and set them up in your name.
            </p>
            <Button href="/growth-plan" variant="primary">
              Build My Digital Growth Plan
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
