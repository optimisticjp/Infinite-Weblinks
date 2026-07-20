"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const inSection = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  // Reset any stale expanded accordion state once the drawer is closed.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (!open) setExpanded(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    // Focus the close button once the dialog is mounted.
    const t = setTimeout(() => closeRef.current?.focus(), 0);

    // Neutralise everything behind the dialog for assistive tech: aria-modal only guarantees
    // the Tab-trap below, but some AT virtual-cursor/swipe navigation can still reach
    // background content. The overlay is a sibling of the page landmarks (header/main/footer),
    // so mark each sibling inert while open, then restore on close. The dialog itself uses
    // plain <div>s (not header/footer elements), so nothing inside it is affected.
    const overlay = dialogRef.current?.parentElement ?? null;
    const inerted: HTMLElement[] = [];
    if (overlay?.parentElement) {
      for (const el of Array.from(overlay.parentElement.children)) {
        if (el !== overlay && el instanceof HTMLElement && !el.hasAttribute("inert")) {
          el.setAttribute("inert", "");
          inerted.push(el);
        }
      }
    }

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
      inerted.forEach((el) => el.removeAttribute("inert"));
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
        className={`theme-light ${styles.dialog}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
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
                const current = pathname === item.href;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`${styles.topLink} ${current ? styles.topLinkActive : ""}`}
                      aria-current={current ? "page" : undefined}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const isOpen = expanded === item.label;
              const panelId = `m-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
              const sectionCurrent =
                inSection(item.href) ||
                item.megaMenu.columns.some((c) => c.items.some((l) => inSection(l.href)));
              return (
                <li key={item.label} className={styles.group}>
                  <button
                    type="button"
                    className={`${styles.groupTrigger} ${sectionCurrent ? styles.groupTriggerActive : ""}`}
                    aria-current={sectionCurrent ? "true" : undefined}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setExpanded(isOpen ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className={styles.chevron} aria-hidden="true" data-open={isOpen} />
                  </button>
                  {isOpen && (
                    <div id={panelId} className={styles.panel}>
                      <Link
                        href={item.href}
                        className={styles.overviewLink}
                        aria-current={pathname === item.href ? "page" : undefined}
                        onClick={onClose}
                      >
                        All {item.label}
                      </Link>
                      {item.megaMenu.columns.map((col) => (
                        <div key={col.heading} className={styles.panelCol}>
                          <p className={styles.panelHeading}>{col.heading}</p>
                          <ul className={styles.panelLinks}>
                            {col.items.map((link) => {
                              const subCurrent = pathname === link.href;
                              return (
                                <li key={link.label + link.href}>
                                  <Link
                                    href={link.href}
                                    className={`${styles.subLink} ${subCurrent ? styles.subLinkActive : ""}`}
                                    aria-current={subCurrent ? "page" : undefined}
                                    onClick={onClose}
                                  >
                                    {link.icon ? (
                                      <span className={styles.subIcon} aria-hidden="true">
                                        <Icon name={link.icon} />
                                      </span>
                                    ) : null}
                                    <span className={styles.subLabel}>{link.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
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
