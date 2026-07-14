import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/routes/PageHero";
import { RelatedLinks } from "@/components/routes/RelatedLinks";
import { Badge, DELIVERY_COLOR } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getDeliveryModels,
  getGoals,
  getService,
  getServiceCategories,
  getServices,
  getStages,
  getTools,
} from "@/lib/content";
import styles from "./service.module.css";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  return pageMetadata({
    title: service.name,
    description: service.plainDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, categories, deliveryModels, tools, goals, stages] = await Promise.all([
    getService(slug),
    getServiceCategories(),
    getDeliveryModels(),
    getTools(),
    getGoals(),
    getStages(),
  ]);
  if (!service) notFound();

  const category = categories.find((c) => c.slug === service.categorySlug);
  const delivery = deliveryModels.find((d) => d.key === service.deliveryModel);

  const relatedTools = service.relatedToolSlugs
    .map((s) => tools.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ name: t.name, href: `/tools/${t.slug}`, hint: t.whatItDoes }));

  const relatedGoals = service.goalSlugs
    .map((s) => goals.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ name: g.title, href: `/goals/${g.slug}`, hint: g.outcome }));

  const relatedStages = service.stageSlugs
    .map((s) => stages.find((st) => st.slug === s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st))
    .map((st) => ({ name: st.name, href: `/how-it-works#${st.slug}`, hint: st.summary }));

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.plainDescription,
          path: `/services/${service.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />

      <PageHero
        eyebrow={category ? category.name : "Service"}
        title={service.name}
        intro={service.plainDescription}
        breadcrumbs={[
          { name: "Services", path: "/services" },
          ...(category ? [{ name: category.name, path: `/services#${category.slug}` }] : []),
          { name: service.name },
        ]}
        aside={
          delivery && (
            <div className={styles.deliveryAside}>
              <Badge color={DELIVERY_COLOR[delivery.key]}>{delivery.name}</Badge>
              <p className={styles.deliveryTag}>{delivery.tagline}</p>
            </div>
          )
        }
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="service-body-heading">
        <div className="iw-container">
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2 id="service-body-heading" className={styles.h2}>
                What you get
              </h2>
              <ul className={styles.checklist}>
                {service.whatYouGet.map((item) => (
                  <li key={item} className={styles.checkItem}>
                    <Check className={styles.checkIcon} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {service.outcome && (
                <p className={styles.outcome}>
                  <span className={styles.outcomeLabel}>What it's built to do</span>
                  {service.outcome}
                </p>
              )}

              {service.exampleTools.length > 0 && (
                <div className={styles.tools}>
                  <h3 className={styles.h3}>Tools we can connect</h3>
                  <p className={styles.toolsNote}>
                    Examples of tools this work often involves — chosen to fit your setup, set up in
                    your name, and never locked to us.
                  </p>
                  <ul className={styles.chips}>
                    {service.exampleTools.map((tool) => (
                      <li key={tool} className={styles.chip}>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className={styles.side}>
              {delivery && (
                <div className={styles.sideCard}>
                  <h3 className={styles.sideTitle}>How it's delivered</h3>
                  <Badge color={DELIVERY_COLOR[delivery.key]}>{delivery.name}</Badge>
                  <p className={styles.sideBody}>{delivery.description}</p>
                </div>
              )}
              <RelatedLinks title="Related tools" links={relatedTools} columns={1} />
              <RelatedLinks title="Helps you" links={relatedGoals} columns={1} />
              <RelatedLinks title="Where it fits" links={relatedStages} columns={1} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
