import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/routes/PageHero";
import { RelatedLinks } from "@/components/routes/RelatedLinks";
import { Button } from "@/components/primitives/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getGoal, getGoals, getServices, getStages } from "@/lib/content";
import styles from "./goal.module.css";

export async function generateStaticParams() {
  const goals = await getGoals();
  return goals.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const goal = await getGoal(slug);
  if (!goal) return { title: "Goal not found" };
  return pageMetadata({
    title: goal.title,
    description: goal.outcome,
    path: `/goals/${goal.slug}`,
  });
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [goal, services, stages] = await Promise.all([getGoal(slug), getServices(), getStages()]);
  if (!goal) notFound();

  const relatedServices = goal.serviceSlugs
    .map((s) => services.find((sv) => sv.slug === s))
    .filter((sv): sv is NonNullable<typeof sv> => Boolean(sv))
    .map((sv) => ({ name: sv.name, href: `/services/${sv.slug}`, hint: sv.plainDescription }));

  const relatedStages = goal.stageSlugs
    .map((s) => stages.find((st) => st.slug === s))
    .filter((st): st is NonNullable<typeof st> => Boolean(st))
    .map((st) => ({ name: st.name, href: `/how-it-works#${st.slug}`, hint: st.summary }));

  const story = [
    { label: "What you need", body: goal.whatYouNeed },
    { label: "How we help", body: goal.howWeHelp },
    { label: "What you can expect", body: goal.outcome },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Goals", path: "/goals" },
          { name: goal.title, path: `/goals/${goal.slug}` },
        ])}
      />

      <PageHero
        eyebrow={goal.audienceHint ?? "Goal"}
        title={goal.title}
        intro={goal.outcome}
        breadcrumbs={[{ name: "Goals", path: "/goals" }, { name: goal.title }]}
        actions={
          <Button href="/growth-plan" variant="primary">
            Build My Digital Growth Plan
          </Button>
        }
      />

      <section className="theme-band iw-section" aria-labelledby="goal-body-heading">
        <div className="iw-container">
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2 id="goal-body-heading" className={styles.h2}>
                How we&apos;d approach this
              </h2>
              <ol className={styles.story}>
                {story.map((part) => (
                  <li key={part.label} className={styles.storyStep}>
                    <span className={styles.storyLabel}>{part.label}</span>
                    <p className={styles.storyBody}>{part.body}</p>
                  </li>
                ))}
              </ol>

              {goal.exampleTools.length > 0 && (
                <div className={styles.tools}>
                  <h3 className={styles.h3}>Example tools we can connect</h3>
                  <p className={styles.toolsNote}>
                    Example tools we can connect — set up in your name, never locked to us.
                  </p>
                  <ul className={styles.chips}>
                    {goal.exampleTools.map((example) => (
                      <li key={example} className={styles.chip}>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className={styles.side}>
              <RelatedLinks title="Services that help" links={relatedServices} columns={1} />
              <RelatedLinks title="Where it fits" links={relatedStages} columns={1} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
