import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { FooterContent } from "@/lib/content/types";
import styles from "./SiteFooter.module.css";

/** Per-column heading accent, cycled — a small flat V2 domain tick, not a light source. */
const FOOTER_COL_ACCENTS = [
  "var(--v2-domain-build-ink)",
  "var(--v2-domain-strategy-ink)",
  "var(--v2-domain-convert-ink)",
  "var(--v2-domain-operate-ink)",
];

export function SiteFooter({ footer }: { footer: FooterContent }) {
  // Social links render only once a valid URL exists (brief §23). No phone anywhere.
  const social = footer.social.filter((s) => Boolean(s.url));
  // Current year, computed at render (build time for static routes) — no future hardcoded date.
  const year = new Date().getFullYear();

  return (
    <footer className={`theme-deep ${styles.footer}`}>
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
