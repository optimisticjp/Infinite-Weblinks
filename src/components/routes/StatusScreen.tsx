import type { ReactNode } from "react";
import Link from "next/link";
import { InfinityMark } from "@/components/brand/InfinityMark";
import styles from "./StatusScreen.module.css";

/**
 * StatusScreen — the shared V2 message surface for the 404 and error pages. Both render outside the
 * marketing chrome, so this owns its own `<main id="main">` (the root skip link targets `#main`) on a
 * calm light surface: a restrained, non-luminous brand mark, a small code label, one H1, an honest
 * message, the caller's primary/secondary actions (V2 Buttons), and a row of helpful links back into
 * the site. No cosmic background, starfield, globe, node-orb, glow or reconnect animation — nothing
 * motion-gated, so it is identical with or without a motion preference. The panel stays compact even
 * though the chrome-less `<main>` fills the viewport; it must never read as a full-screen scene.
 */
export function StatusScreen({
  code,
  title,
  body,
  actions,
  links,
}: {
  code: string;
  title: string;
  body: string;
  actions: ReactNode;
  links: { label: string; href: string }[];
}) {
  return (
    <main id="main" className={`theme-light ${styles.wrap}`}>
      <div className={styles.inner}>
        <InfinityMark size={56} glow={false} className={styles.mark} />

        <p className={styles.code}>{code}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>

        <div className={styles.actions}>{actions}</div>

        <nav aria-label="Helpful links" className={styles.links}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
