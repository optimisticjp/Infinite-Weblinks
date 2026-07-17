"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Mail, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import type { SiteNav } from "@/lib/content/types";
import styles from "./MobileNav.module.css";

const SUPPORT_EMAIL = "support@infiniteweblinks.com";

export function MobileNav({
  nav,
  open,
  onClose,
}: {
  nav: SiteNav;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    // Focus the close button once the dialog is mounted.
    const t = setTimeout(() => closeRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Focus trap.
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  // Primary CTA first, so the growth-plan action is the prominent one at the foot of
  // the sheet (the reference puts the gradient CTA above the quieter secondary link).
  const ctas = useMemo(
    () => [...nav.ctas].sort((a, b) => (a.style === "primary" ? -1 : b.style === "primary" ? 1 : 0)),
    [nav.ctas],
  );

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div
        id="mobile-nav"
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.dialogHead}>
          <Logo href="/" size={26} label="Infinite Weblinks — home" />
          <button type="button" className={styles.close} ref={closeRef} onClick={onClose}>
            <X aria-hidden="true" />
            <span className="iw-visually-hidden">Close menu</span>
          </button>
        </div>

        <nav aria-label="Mobile primary" className={styles.body}>
          <ul className={styles.list}>
            {nav.primary.map((item) => {
              if (!item.megaMenu) {
                return (
                  <li key={item.label}>
                    <Link href={item.href} className={styles.topLink} onClick={onClose}>
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const isOpen = expanded === item.label;
              const panelId = `m-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <li key={item.label} className={styles.group}>
                  <button
                    type="button"
                    className={styles.groupTrigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setExpanded(isOpen ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className={styles.chevron} aria-hidden="true" data-open={isOpen} />
                  </button>
                  {isOpen && (
                    <div id={panelId} className={styles.panel}>
                      <Link href={item.href} className={styles.overviewLink} onClick={onClose}>
                        All {item.label}
                      </Link>
                      {item.megaMenu.columns.map((col) => (
                        <div key={col.heading} className={styles.panelCol}>
                          <p className={styles.panelHeading}>{col.heading}</p>
                          <ul className={styles.panelLinks}>
                            {col.items.map((link) => (
                              <li key={link.label + link.href}>
                                <Link href={link.href} className={styles.subLink} onClick={onClose}>
                                  {link.icon ? (
                                    <span className={styles.subIcon} aria-hidden="true">
                                      <Icon name={link.icon} />
                                    </span>
                                  ) : null}
                                  <span className={styles.subLabel}>{link.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={styles.footer}>
            <div className={styles.ctas}>
              {ctas.map((cta) => (
                <Button
                  key={cta.label}
                  href={cta.route}
                  variant={cta.style === "primary" ? "primary" : "secondary"}
                  size="lg"
                  className={styles.cta}
                >
                  {cta.label}
                </Button>
              ))}
            </div>
            <a className={styles.email} href={`mailto:${SUPPORT_EMAIL}`} onClick={onClose}>
              <Mail aria-hidden="true" className={styles.emailIcon} />
              <span>
                Prefer email? <span className={styles.emailAddr}>{SUPPORT_EMAIL}</span>
              </span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
