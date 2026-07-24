import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { Card } from "@/components/primitives/Card";
import { Button } from "@/components/primitives/Button";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { ConnectedSystemFlow } from "@/components/routes/ConnectedSystemFlow";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./HomepageConnectedSystemSection.module.css";

/**
 * Three bridge cards that carry the homepage's #growth-journey / #customer-journey / #services
 * fragments on meaningful visible content and route onward to the full pages (rather than
 * duplicating the journey, the phone strip or the services constellation on the homepage).
 */
const BRIDGES = [
  {
    id: "growth-journey",
    icon: "compass",
    title: "The eight-stage growth journey",
    description:
      "A useful map of the whole path, from the first plan to long-term growth. You start where you are — most plans touch only the stages that matter now.",
    href: "/how-it-works#growth-journey",
    cta: "See the full journey",
    tone: "var(--domain-strategy)",
  },
  {
    id: "customer-journey",
    icon: "users",
    title: "How it connects for one customer",
    description:
      "Follow a single customer from the first advert to a repeat purchase — every step hands off to the next.",
    href: "/connected-growth",
    cta: "Follow the journey",
    tone: "var(--domain-convert)",
  },
  {
    id: "services",
    icon: "layers",
    title: "Explore the service catalogue",
    description:
      "Every service, selected and sequenced around your goal rather than sold as a menu to pick from.",
    href: "/services",
    cta: "Browse services",
    tone: "var(--domain-build)",
  },
];

/**
 * HomepageConnectedSystemSection — the homepage "one system, not silos" section (id="how-it-connects",
 * explicit light surface), reusing the legacy OneSystemSection's eyebrow, title meaning and lead.
 * It renders the ConnectedSystemFlow (five parts), a clear CTA to /how-it-works, then three compact
 * whole-card bridges that preserve the homepage's growth-journey / customer-journey / services
 * fragments on real content. It does NOT render the full eight-stage journey, a PhoneFrame or a
 * services constellation. Server Component.
 */
export function HomepageConnectedSystemSection() {
  return (
    <SectionShell
      surface="light"
      id="how-it-connects"
      eyebrow="One system, not silos"
      title="Separate parts leak effort. Connected, they compound."
      lead="Most businesses run their website, marketing and tools as separate pieces. When they feed each other, the same effort goes further every month."
      align="start"
    >
      <ConnectedSystemFlow />

      <div className={styles.cta}>
        <Button href="/how-it-works" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
          See how it all connects
        </Button>
      </div>

      <CardGrid layout="equal" aria-label="Explore the connected system in more depth">
        {BRIDGES.map((b) => {
          const ink = domainInk(b.tone);
          return (
            <Card key={b.id} href={b.href} id={b.id} variant="raised" accent={ink} className={styles.bridge}>
              <span className={styles.bridgeHead}>
                <IconTile color={ink} size="md">
                  <Icon name={b.icon} />
                </IconTile>
              </span>
              <h3 className={styles.bridgeTitle}>{b.title}</h3>
              <p className={styles.bridgeDesc}>{b.description}</p>
              <span className={styles.more} aria-hidden="true">
                {b.cta}
                <ArrowUpRight className={styles.moreIcon} />
              </span>
            </Card>
          );
        })}
      </CardGrid>
    </SectionShell>
  );
}
