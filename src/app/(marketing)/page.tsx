import { Hero } from "@/components/hero/Hero";
import { EditorialStatement } from "@/components/sections/EditorialStatement";
import { getHomepageOpening } from "@/lib/content";

export default async function HomePage() {
  const { hero, editorial } = await getHomepageOpening();
  return (
    <>
      <Hero hero={hero} />
      <EditorialStatement data={editorial} />
    </>
  );
}
