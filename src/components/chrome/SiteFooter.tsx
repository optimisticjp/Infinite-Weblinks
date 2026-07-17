import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobeArc } from "@/components/viz/GlobeArc";
import type { FooterContent } from "@/lib/content/types";
import styles from "./SiteFooter.module.css";

/** Per-column heading accent, cycled — a small non-glowing tick, not a light source. */
const FOOTER_COL_ACCENTS = ["var(--blue)", "var(--violet)", "var(--pink)", "var(--orange)"];

export function SiteFooter({ footer }: { footer: FooterContent }) {
  // Social links render only once a valid URL exists (brief §23). No phone anywhere.
  const social = footer.social.filter((s) => Boolean(s.url));
  const year = 2026;

  return (
    <footer className={`theme-dark ${styles.footer}`}>
      <div className={styles.globe} aria-hidden="true">
        <GlobeArc />
      </div>

      <div className={`iw-container iw-container--wide ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo href="/" size={30} className={styles.logo} />
          <p className={styles.tagline}>{footer.tagline}</p>
          <a className={styles.email} href={`mailto:${footer.supportEmail}`}>
            <Mail aria-hidden="true" className={styles.emailIcon} />
            {footer.supportEmail}
          </a>
          {social.length > 0 && (
            <ul className={styles.social}>
              {social.map((s) => (
                <li key={s.platform}>
                  <a href={s.url} aria-label={s.platform} className={styles.socialLink}>
                    <span aria-hidden="true">{s.platform[0]}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className={styles.cols} aria-label="Footer">
          {footer.columns.map((col, i) => (
            <div
              key={col.heading}
              className={styles.col}
              style={{ ["--col-accent" as string]: FOOTER_COL_ACCENTS[i % FOOTER_COL_ACCENTS.length] }}
            >
              <p className={styles.colHeading}>{col.heading}</p>
              <ul className={styles.colLinks}>
                {col.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`iw-container iw-container--wide ${styles.bottom}`}>
        <p className={styles.copy}>© {year} Infinite Weblinks. All rights reserved.</p>
        <ul className={styles.legal}>
          {footer.legal.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.legalLink}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
