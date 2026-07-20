import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";
import { Button } from "@/components/primitives/Button";
import { Card } from "@/components/primitives/Card";
import { BentoGrid } from "@/components/primitives/BentoGrid";
import { BentoCard } from "@/components/primitives/BentoCard";
import layout from "../design-preview.module.css";

/**
 * INTERNAL V2 shells preview — TEMPORARY.
 *
 * Demonstrates PageHeader (the route's only H1) and the V2 SectionShell surfaces
 * (light / alt / night) with no cosmic layers. noindex/nofollow, off-nav, off-sitemap.
 * Remove before production (see docs/design/phase-2b-implementation-report.md).
 */
export const metadata: Metadata = {
  title: "V2 Shells Preview (internal)",
  robots: { index: false, follow: false },
};

export default function ShellsPreviewPage() {
  return (
    <main className={`theme-light ${layout.wrap}`}>
      <div className={layout.banner}>
        <span className={layout.bannerTag}>Internal · noindex</span>
        <span>
          V2 shells preview — PageHeader + SectionShell surfaces, no cosmic layers.{" "}
          <a href="/design-preview">← Back to component preview</a>
        </span>
      </div>

      {/* 1 · Light PageHeader — the single H1 */}
      <PageHeader
        id="main"
        breadcrumbs={[{ name: "Design preview", path: "/design-preview" }, { name: "Shells" }]}
        eyebrow="V2 · Page shells"
        title="A structured, light-first page header"
        lead="Breadcrumb, eyebrow, H1, lead, actions and a trust note on the left; a controlled-width aside on the right. On mobile the H1 and primary CTA come before the visual."
        actions={
          <>
            <Button href="/growth-plan" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href="/design-preview" variant="secondary">
              See how it works
            </Button>
          </>
        }
        trustNote={
          <>
            <ShieldCheck size={16} aria-hidden="true" /> No sales pressure — you own everything.
          </>
        }
        aside={
          <BentoGrid>
            <BentoCard
              variant="medium"
              hue="var(--v2-domain-strategy-ink)"
              icon="compass"
              title="Explore by goal"
              blurb="Restrained aside built from real V2 BentoCards."
              href="/design-preview"
            />
            <BentoCard
              variant="medium"
              hue="var(--v2-domain-build-ink)"
              icon="monitor"
              title="Websites"
              blurb="Flat tile, one accent rail, soft hover."
              href="/design-preview"
            />
          </BentoGrid>
        }
      />

      {/* 2 · Light-alt SectionShell */}
      <SectionShell
        surface="alt"
        id="alt"
        eyebrow="Surface · alt"
        title="Light-alt band"
        lead="Pale neutral section (paper-2) with white raised cards. No cosmic layer, plain accent eyebrow."
        align="start"
      >
        <div className={layout.gridWide}>
          <Card variant="raised">
            <span className={layout.cardTitle}>Raised on alt</span>
            <span className={layout.cardBody}>White card lifts off the pale band.</span>
          </Card>
          <Card variant="outlined">
            <span className={layout.cardTitle}>Outlined</span>
            <span className={layout.cardBody}>Crisp functional border, no shadow.</span>
          </Card>
          <Card variant="tinted" accent="var(--v2-domain-convert-ink)" railed>
            <span className={layout.cardTitle}>Tinted + rail</span>
            <span className={layout.cardBody}>One restrained domain accent.</span>
          </Card>
        </div>
      </SectionShell>

      {/* 3 · Standard light SectionShell */}
      <SectionShell
        surface="light"
        id="light"
        eyebrow="Surface · light"
        title="Standard light section"
        lead="The default V2 content surface — near-white, restrained, token-driven rhythm."
        align="start"
      >
        <div className={layout.gridWide}>
          <Card variant="plain">
            <span className={layout.cardTitle}>Plain</span>
            <span className={layout.cardBody}>A padded grouping block, no border/shadow.</span>
          </Card>
          <Card as="article" variant="raised" interactive accent="var(--v2-domain-build-ink)">
            <span className={layout.cardTitle}>
              <a href="/design-preview">Interactive</a>
            </span>
            <span className={layout.cardBody}>Hover/focus lift ≤ 2px, neutral shadow.</span>
          </Card>
        </div>
      </SectionShell>

      {/* 4 · Compact vs standard spacing */}
      <SectionShell
        surface="alt"
        id="compact"
        eyebrow="Spacing · compact"
        title="Compact spacing (tight rhythm)"
        lead="Same shell, tighter vertical rhythm for denser pages."
        align="start"
        spacing="tight"
      >
        <p className={layout.muted}>Section rhythm comes from tokens (tight vs default vs loose).</p>
      </SectionShell>

      {/* 5 · Night SectionShell + night-safe BentoCard */}
      <SectionShell
        surface="night"
        id="night"
        eyebrow="Surface · night"
        title="Night emphasis band"
        lead="A reserved dark band — no starfield or globe. BentoCard accents re-map to the accessible night token, not the light-only domain ink."
        align="start"
      >
        <BentoGrid>
          <BentoCard
            variant="medium"
            hue="var(--v2-domain-strategy-ink)"
            icon="compass"
            eyebrow="Night-safe"
            title="Accent re-mapped"
            blurb="Eyebrow, icon, arrow and rail use the night accent token."
            href="/design-preview"
          />
          <BentoCard
            variant="medium"
            hue="var(--v2-domain-convert-ink)"
            icon="git-branch"
            title="Convert"
            blurb="The domain hue survives only as non-text decoration."
            href="/design-preview"
          />
        </BentoGrid>
        <div style={{ marginTop: "var(--space-8)" }}>
          <Button variant="signature" href="/growth-plan">
            Signature CTA on night
          </Button>
        </div>
      </SectionShell>
    </main>
  );
}
