import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { FooterContent } from "@/lib/content/types";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ footer }: { footer: FooterContent }) {
  // Social links render only once a valid URL exists (brief §23). No phone anywhere.
  const social = footer.social.filter((s) => Boolean(s.url));
  const year = 2026;

  return (
    <footer className={`theme-dark ${styles.footer}`}>
      <div className={`iw-container iw-container--wide ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo href="/" size={30} className={styles.logo} />
          <p className={styles.tagline}>{footer.tagline}</p>
          <p className={styles.contactLabel}>Prefer email?</p>
          <a className={styles.email} href={`mailto:${footer.supportEmail}`}>
            {footer.supportEmail}
          </a>
        </div>

        <nav className={styles.cols} aria-label="Footer">
          {footer.columns.map((col) => (
            <div key={col.heading} className={styles.col}>
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
        {social.length > 0 && (
          <ul className={styles.social}>
            {social.map((s) => (
              <li key={s.platform}>
                <a href={s.url} aria-label={s.platform} className={styles.socialLink}>
                  {s.platform[0]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
