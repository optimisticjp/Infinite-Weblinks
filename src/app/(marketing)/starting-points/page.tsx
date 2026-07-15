import type { Metadata } from "next";
import { PageHero } from "@/components/routes/PageHero";
import { HubGrid, HubGridItem } from "@/components/routes/HubGrid";
import { IndexCard } from "@/components/routes/IndexCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getStartingPoints } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Start from where you are",
  description:
    "Whether you're starting from nothing, have traffic but few sales, or are established and scaling — find your situation and the smallest next step that moves you forward.",
  path: "/starting-points",
});

export default async function StartingPointsIndexPage() {
  const startingPoints = await getStartingPoints();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Starting points", path: "/starting-points" },
        ])}
      />
      {startingPoints.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            "Starting points",
            startingPoints.map((p) => ({ name: p.label, path: `/starting-points/${p.slug}` })),
          )}
        />
      )}

      <PageHero
        eyebrow="By where you are now"
        title="Start from where you actually are"
        intro="You don't need to have it all figured out. Pick the situation that sounds most like yours and we'll point you to the smallest next step — not a giant to-do list."
        breadcrumbs={[{ name: "Starting points" }]}
      />

      <section className="theme-band iw-section" aria-labelledby="sp-index-heading">
        <div className="iw-container">
          <h2 id="sp-index-heading" className="iw-visually-hidden">
            All starting points
          </h2>
          <HubGrid>
            {startingPoints.map((point) => (
              <HubGridItem key={point.slug}>
                <IndexCard
                  href={`/starting-points/${point.slug}`}
                  title={point.label}
                  description={point.situation}
                  icon={point.icon}
                  color={point.color}
                />
              </HubGridItem>
            ))}
          </HubGrid>
        </div>
      </section>
    </>
  );
}
