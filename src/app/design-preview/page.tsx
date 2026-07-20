import type { Metadata } from "next";
import { Badge } from "@/components/primitives/Badge";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Icon } from "@/components/primitives/Icon";
import styles from "./design-preview.module.css";

/**
 * INTERNAL V2 foundation preview — TEMPORARY.
 *
 * A visual board for the "Clear Systems" (Stripe ~70% / Clay ~30%) V2 foundation:
 * light / light-alt / night surfaces, type, colour, borders, shadows, radii, button
 * visual targets, badges/chips, icon tiles, cards, form fields, focus + status states,
 * and section spacing. It opts into the V2 themes explicitly and is excluded from the
 * sitemap and nav. Not the final component library. Remove before production
 * (see docs/design/phase-1-implementation-report.md).
 */
export const metadata: Metadata = {
  title: "V2 Foundation Preview (internal)",
  robots: { index: false, follow: false },
};

const DOMAINS = [
  { key: "strategy", label: "Strategy", icon: "compass", ratio: "7.10:1 / 6.15:1" },
  { key: "build", label: "Build & Launch", icon: "monitor", ratio: "6.70:1 / 5.81:1" },
  { key: "discover", label: "Get Discovered", icon: "search", ratio: "5.36:1 / 4.76:1" },
  { key: "convert", label: "Convert", icon: "git-branch", ratio: "6.04:1 / 5.24:1" },
  { key: "operate", label: "Deliver & Operate", icon: "settings", ratio: "5.18:1 / 4.57:1" },
  { key: "retain", label: "Retain", icon: "heart", ratio: "5.43:1 / 4.86:1" },
  { key: "ai", label: "AI & Data", icon: "zap", ratio: "5.47:1 / 4.82:1" },
] as const;

const STATUSES = [
  { key: "success", label: "Success", icon: "check", ratio: "5.43:1 / 4.86:1" },
  { key: "warning", label: "Warning", icon: "shield", ratio: "6.26:1 / 5.52:1" },
  { key: "danger", label: "Danger", icon: "help-circle", ratio: "6.29:1 / 5.44:1" },
  { key: "info", label: "Information", icon: "sparkles", ratio: "6.70:1 / 5.81:1" },
] as const;

export default function DesignPreviewPage() {
  return (
    <main id="main" className={`theme-light ${styles.wrap}`}>
      <div className={styles.banner}>
        <span className={styles.bannerTag}>Internal · noindex</span>
        <span>
          V2 “Clear Systems” foundation preview — not a production page. Visual board only; contrast
          ratios shown are measured (WCAG 2.2 AA).
        </span>
      </div>

      <div className="iw-container">
        {/* 1 · Intro */}
        <section className={styles.section}>
          <SectionHeader
            as="h1"
            eyebrow="V2 Foundation · Phase 1"
            title="Clear Systems — light-first foundation"
            intro="Stripe-style structure and restraint (~70%) warmed with Clay colour, bento and character (~30%), as original Infinite Weblinks identity. Everything below reads the semantic theme tokens, so components re-theme by wrapper class alone."
          />
        </section>

        {/* 2 · Surfaces */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Surfaces</h2>
          <div className={styles.gridWide}>
            <div className={`theme-light ${styles.card}`}>
              <span className={styles.cardTitle}>theme-light</span>
              <span className={styles.cardBody}>Base near-white canvas (paper). Default V2 surface.</span>
            </div>
            <div className={`theme-light-alt ${styles.card}`}>
              <span className={styles.cardTitle}>theme-light-alt</span>
              <span className={styles.cardBody}>Alternating band (paper-2); cards lift to pure white.</span>
            </div>
            <div className={`theme-night ${styles.card}`}>
              <span className={styles.cardTitle}>theme-night</span>
              <span className={styles.cardBody}>Reserved dark signature surface — final CTA, one meaningful section. Never a fallback.</span>
            </div>
          </div>
        </section>

        {/* 3 · Typography */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Display · Sora 700</span>
            <span className={styles.display}>Digital growth, built around your goals</span>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>H1</span>
            <h1 style={{ margin: 0 }}>A smarter way to plan and grow</h1>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>H2</span>
            <h2 style={{ margin: 0 }}>One connected system, in the right order</h2>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>H3</span>
            <h3 style={{ margin: 0 }}>Start where you are</h3>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>H4</span>
            <h4 style={{ margin: 0 }}>What you get</h4>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Lead</span>
            <p className={styles.lead}>
              We help you choose the right digital tools and services, build what you need, and make
              everything work together around your goals.
            </p>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Body · 10.1:1</span>
            <p className={styles.body}>
              Growth online works as one connected system, where each part feeds the next — and the
              order usually matters more than the number of tools you use.
            </p>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Muted · 5.35:1</span>
            <p className={styles.muted}>Secondary and caption text stays readable on every surface.</p>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Mono / eyebrow</span>
            <span className={styles.mono}>THE CONNECTED PICTURE</span>
          </div>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Link · 6.12:1</span>
            <span>
              <a className={styles.link} href="#main">Build my growth plan</a>
            </span>
          </div>
        </section>

        {/* 4 · Brand & domain colour */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Colour</h2>
          <p className={styles.subTitle}>Brand</p>
          <div className={styles.grid}>
            {[
              { name: "brand", v: "var(--v2-brand)", note: "6.12:1 vs white" },
              { name: "brand-strong", v: "var(--v2-brand-strong)", note: "7.87:1 vs white" },
              { name: "brand-tint", v: "var(--v2-brand-tint)", note: "selected surface" },
              { name: "signature grad", v: "var(--v2-grad-signature)", note: "CTAs / rare only" },
            ].map((s) => (
              <div key={s.name} className={styles.swatch}>
                <div className={styles.swatchChip} style={{ background: s.v }} />
                <div className={styles.swatchMeta}>
                  <span className={styles.swatchName}>{s.name}</span>
                  <span className={styles.swatchNote}>{s.note}</span>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.subTitle}>Domain wayfinding (ink on white / on tint)</p>
          <div className={styles.grid}>
            {DOMAINS.map((d) => (
              <div key={d.key} className={styles.swatch}>
                <div
                  className={styles.swatchChip}
                  style={{ background: `var(--v2-domain-${d.key}-tint)` }}
                >
                  <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
                    <span
                      style={{
                        color: `var(--v2-domain-${d.key}-ink)`,
                        fontWeight: 700,
                        fontSize: "var(--fs-sm)",
                      }}
                    >
                      {d.label}
                    </span>
                  </div>
                </div>
                <div className={styles.swatchMeta}>
                  <span className={styles.swatchName}>domain-{d.key}</span>
                  <span className={styles.swatchNote}>{d.ratio}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 · Borders */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Borders</h2>
          <div className={styles.grid}>
            <div className={styles.card} style={{ border: "1px solid var(--hairline)" }}>
              <span className={styles.cardTitle}>hairline</span>
              <span className={styles.cardBody}>Decorative divider (separator only).</span>
            </div>
            <div className={styles.card} style={{ border: "1px solid var(--hairline-strong)" }}>
              <span className={styles.cardTitle}>hairline-strong · 3.66:1</span>
              <span className={styles.cardBody}>Functional boundary — input / control edge.</span>
            </div>
          </div>
        </section>

        {/* 6 · Shadows */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Elevation (neutral shadows, no glow)</h2>
          <div className={styles.grid}>
            {[
              ["xs", "var(--v2-shadow-xs)"],
              ["sm", "var(--v2-shadow-sm)"],
              ["md", "var(--v2-shadow-md)"],
              ["lg", "var(--v2-shadow-lg)"],
              ["card-hover", "var(--v2-shadow-card-hover)"],
            ].map(([n, v]) => (
              <div key={n} className={styles.shadowTile} style={{ boxShadow: v }}>
                shadow-{n}
              </div>
            ))}
          </div>
        </section>

        {/* 7 · Radii */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Radii</h2>
          <div className={styles.grid}>
            {[
              ["sm 8", "var(--v2-radius-sm)"],
              ["md 12", "var(--v2-radius-md)"],
              ["lg 16", "var(--v2-radius-lg)"],
              ["xl 24", "var(--v2-radius-xl)"],
              ["pill", "var(--v2-radius-pill)"],
            ].map(([n, v]) => (
              <div key={n} className={styles.radiusTile} style={{ borderRadius: v }}>
                {n}
              </div>
            ))}
          </div>
        </section>

        {/* 8 · Buttons (visual targets) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons (V2 visual targets)</h2>
          <div className={styles.btnRow}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
              Build my growth plan
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}>
              See how it works
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`}>
              Explore services
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnText}`}>
              Contact us →
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSignature}`}>
              Signature CTA
            </button>
          </div>
          <p className={styles.muted} style={{ marginTop: "var(--space-4)" }}>
            Tab to any control to see the V2 focus ring (surface-gap + brand ring, ≥ 3:1).
          </p>
        </section>

        {/* 9 · Badges & chips */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges &amp; chips</h2>
          <div className={styles.btnRow}>
            <Badge color="var(--v2-domain-strategy-ink)">We Do the Work</Badge>
            <Badge color="var(--v2-domain-build-ink)">We Bring an Expert</Badge>
            <Badge color="var(--v2-domain-operate-ink)" variant="outline">
              We Run It
            </Badge>
            <Badge color="var(--v2-domain-retain-ink)" variant="outline">
              You Run It
            </Badge>
          </div>
          <div className={styles.btnRow} style={{ marginTop: "var(--space-4)" }}>
            <span className={styles.chip}>
              <Icon name="check" /> Custom quote
            </span>
            <span className={styles.chip}>
              <Icon name="link" /> Connected
            </span>
            <span className={styles.chip}>
              <Icon name="shield" /> You own it
            </span>
          </div>
        </section>

        {/* 10 · Icon tiles */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Icon tiles (flat)</h2>
          <div className={styles.tileRow}>
            {DOMAINS.map((d) => (
              <span
                key={d.key}
                className={styles.tile}
                style={{
                  ["--tile-tint" as string]: `var(--v2-domain-${d.key}-tint)`,
                  ["--tile-ink" as string]: `var(--v2-domain-${d.key}-ink)`,
                }}
              >
                <Icon name={d.icon} />
              </span>
            ))}
          </div>
        </section>

        {/* 11 · Cards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Card surfaces</h2>
          <div className={styles.gridWide}>
            <div className={styles.card}>
              <span className={styles.cardTitle}>Raised card</span>
              <span className={styles.cardBody}>Paper + hairline + soft shadow. The default panel.</span>
            </div>
            <div className={`${styles.card} ${styles.cardInteractive}`}>
              <span className={styles.cardTitle}>Interactive</span>
              <span className={styles.cardBody}>Hover lifts with a neutral shadow — no colour glow.</span>
            </div>
            <div
              className={`${styles.card} ${styles.cardFeatured} ${styles.cardInteractive}`}
              style={{ ["--card-line" as string]: "var(--v2-domain-convert-line)" }}
            >
              <span className={styles.cardTitle}>Featured bento tile</span>
              <span className={styles.cardBody}>One domain accent rail. Clay warmth, Stripe restraint.</span>
            </div>
          </div>
        </section>

        {/* 12 · Form fields */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Form-field surfaces &amp; focus</h2>
          <div className={styles.gridWide}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Your name</span>
              <input className={styles.control} type="text" placeholder="Jordan Miles" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>What do you sell?</span>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Choose one…
                </option>
                <option>Products</option>
                <option>Services</option>
                <option>Both</option>
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Anything else?</span>
              <textarea className={styles.control} rows={3} placeholder="Tell us about your goals" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email (error state)</span>
              <input
                className={`${styles.control} ${styles.controlError}`}
                type="email"
                defaultValue="not-an-email"
                aria-invalid="true"
                aria-describedby="preview-email-err"
              />
              <span id="preview-email-err" className={styles.fieldError}>
                Enter a valid email address.
              </span>
            </label>
          </div>
        </section>

        {/* 13 · Status states */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Status states</h2>
          <div className={styles.gridWide}>
            {STATUSES.map((s) => (
              <div
                key={s.key}
                className={styles.note}
                style={{
                  ["--note-tint" as string]: `var(--v2-${s.key}-tint)`,
                  ["--note-ink" as string]: `var(--v2-${s.key})`,
                }}
              >
                <Icon name={s.icon} className={styles.noteIcon} />
                <span>
                  <strong>{s.label}.</strong> Colour on white / on its own tint measures {s.ratio}.
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 14 · Night surface in context */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Night surface in context</h2>
          <div className={`theme-night ${styles.nightBlock}`}>
            <h3 style={{ marginTop: 0 }}>Start where you are</h3>
            <p className={styles.body} style={{ marginBottom: "var(--space-5)" }}>
              The reserved dark signature moment — final CTA or one meaningful product idea. Text and
              links stay ≥ 4.5:1; the ring adapts to the dark surface.
            </p>
            <div className={styles.btnRow}>
              <button type="button" className={`${styles.btn} ${styles.btnSignature}`}>
                Build my growth plan
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}>
                See how it works
              </button>
              <a className={styles.link} href="#main">
                A link on night
              </a>
            </div>
          </div>
        </section>

        {/* 15 · Spacing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing &amp; section rhythm</h2>
          {[
            ["space-4 · 16", "16px"],
            ["space-6 · 24", "24px"],
            ["space-8 · 32", "32px"],
            ["space-12 · 48", "48px"],
            ["section-y-tight", "var(--section-y-tight)"],
            ["section-y", "var(--section-y)"],
          ].map(([label, w]) => (
            <div key={label} className={styles.spaceRow}>
              <span className={styles.spaceBar} style={{ width: w }} />
              <span className={styles.spaceLabel}>{label}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
