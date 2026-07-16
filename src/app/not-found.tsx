import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/primitives/Button";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Global 404. Rendered inside the root layout (so the BrandSprite infinity symbol is
 * available) but outside the marketing chrome, so it stays self-contained and light —
 * a clear route back into the site rather than a dead end.
 */
export default function NotFound() {
  const links = [
    { label: "How it works", href: "/how-it-works" },
    { label: "Services", href: "/services" },
    { label: "Tools", href: "/tools" },
    { label: "Resources", href: "/learn" },
  ];

  return (
    <main className={`theme-dark ${styles.wrap}`}>
      <div className={styles.inner}>
        <Logo href="/" size={34} />
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>We couldn&rsquo;t find that page.</h1>
        <p className={styles.body}>
          The link may be old or mistyped. Here are a few good places to pick things back up —
          or start a plan built around your goals.
        </p>
        <div className={styles.actions}>
          <Button href="/" variant="primary">
            Back to home
          </Button>
          <Button href="/growth-plan" variant="secondary">
            Build My Digital Growth Plan
          </Button>
        </div>
        <nav aria-label="Helpful links" className={styles.links}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
