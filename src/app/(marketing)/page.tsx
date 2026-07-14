import { Hero } from "@/components/hero/Hero";
import { EditorialStatement } from "@/components/sections/EditorialStatement";
import { HomepageSections } from "@/components/sections/registry";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomepageOpening, getHomepageSections } from "@/lib/content";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

export default async function HomePage() {
  const { hero, editorial } = await getHomepageOpening();
  const sections = getHomepageSections();

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      {/* The approved GATE-1 opening — rendered explicitly and preserved exactly. */}
      <Hero hero={hero} />
      <EditorialStatement data={editorial} />

      {/* Everything after the opening is data-driven; each section self-gates. */}
      <HomepageSections sections={sections} />
    </>
  );
}
