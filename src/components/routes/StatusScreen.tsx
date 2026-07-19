import type { ReactNode } from "react";
import Link from "next/link";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { CosmicBackground } from "@/components/viz/CosmicBackground";
import styles from "./StatusScreen.module.css";

/**
 * StatusScreen — the shared on-brand full-screen message for the 404 and error pages. It
 * renders its own <main> (both are shown outside the marketing chrome) on the cosmic surface,
 * with the InfinityMark over a connector that breaks and then reconnects (a one-shot animation
 * that is reduced-motion safe: the resting/reduced state is the fully-connected line). A code,
 * an honest message, primary actions, and a row of helpful links back into the site.
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
    <main className={`theme-cosmic ${styles.wrap}`}>
      <CosmicBackground />
      <div className={styles.inner}>
        <div className={styles.mark} aria-hidden="true">
          <InfinityMark size={72} luminous />
          {/* The connector: a track with a lit path that has a gap, closing to reconnect. */}
          <svg className={styles.connector} viewBox="0 0 200 24" fill="none" preserveAspectRatio="none">
            <path className={styles.connTrack} d="M4 12 H196" strokeWidth="2" strokeLinecap="round" />
            <path className={styles.connLit} d="M4 12 H196" strokeWidth="2" strokeLinecap="round" pathLength={1} />
          </svg>
        </div>

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
