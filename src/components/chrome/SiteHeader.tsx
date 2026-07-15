"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/primitives/Button";
import type { NavItem, SiteNav } from "@/lib/content/types";
import { MobileNav } from "./MobileNav";
import styles from "./SiteHeader.module.css";

function MegaPanel({ item, panelId }: { item: NavItem; panelId: string }) {
  const menu = item.megaMenu!;
  return (
    <div id={panelId} className={styles.megaPanel} role="group" aria-label={menu.title}>
      <div className={`iw-container iw-container--wide ${styles.megaInner}`}>
        <div className={styles.megaColumns}>
          {menu.columns.map((col) => (
            <div key={col.heading} className={styles.megaColumn}>
              <p className={styles.megaHeading}>{col.heading}</p>
              <ul className={styles.megaLinks}>
                {col.items.map((link) => (
                  <li key={link.label + link.href}>
                    <Link href={link.href} className={styles.megaLink}>
                      <span className={styles.megaLinkLabel}>{link.label}</span>
                      {link.description && (
                        <span className={styles.megaLinkDesc}>{link.description}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {menu.promo && (
          <div className={styles.megaPromo}>
            <p className={styles.megaPromoHeading}>{menu.promo.heading}</p>
            <p className={styles.megaPromoBody}>{menu.promo.body}</p>
            <Button href={menu.promo.cta.route} variant="primary" size="sm">
              {menu.promo.cta.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SiteHeader({ nav }: { nav: SiteNav }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Desktop-first default (SSR-safe); corrected on mount by matchMedia below.
  const [hoverCapable, setHoverCapable] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True when the imminent click came from a pointer (pointerdown fired first);
  // a keyboard-activated click has no preceding pointerdown. Robust, no UA sniffing.
  const clickFromPointer = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close any open menu when the route changes (sync navigation → transient UI).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setOpenKey(null);
    setMobileOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detect hover capability (never UA sniffing). Governs whether a trigger opens
  // on hover and navigates on click, or acts as tap-to-open / tap-again-to-navigate.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    const sync = (matches: boolean) => setHoverCapable(matches);
    sync(mq.matches);
    const onChange = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Clear any pending close timer on unmount.
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Esc closes the open mega-menu and returns focus to its trigger.
  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const key = openKey;
        setOpenKey(null);
        triggerRefs.current[key]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openKey]);

  // Pointer/focus leaving the whole nav closes the open mega-menu.
  useEffect(() => {
    if (!openKey) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openKey]);

  const clearClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), 140);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`iw-container iw-container--wide ${styles.bar}`}>
          <Logo href="/" size={28} className={styles.logo} />

          <nav
            className={styles.desktopNav}
            aria-label="Primary"
            ref={navRef}
            onMouseLeave={scheduleClose}
            onFocusCapture={clearClose}
            onBlurCapture={(e) => {
              if (navRef.current && !navRef.current.contains(e.relatedTarget as Node)) {
                setOpenKey(null);
              }
            }}
          >
            <ul className={styles.navList}>
              {nav.primary.map((item) => {
                const isOpen = openKey === item.label;
                if (!item.megaMenu) {
                  return (
                    <li key={item.label} className={styles.navItem}>
                      <Link href={item.href} className={styles.navLink}>
                        {item.label}
                      </Link>
                    </li>
                  );
                }
                const panelId = `mega-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
                return (
                  <li
                    key={item.label}
                    className={styles.navItem}
                    // Hover opens only on hover-capable devices; on touch the click
                    // handler owns open/navigate so a tap doesn't open-then-navigate.
                    onMouseEnter={
                      hoverCapable
                        ? () => {
                            clearClose();
                            setOpenKey(item.label);
                          }
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      className={styles.navTrigger}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      ref={(el) => {
                        triggerRefs.current[item.label] = el;
                      }}
                      onKeyDown={(e) => {
                        // Keyboard (Enter/Space): toggle here, not in onClick — a
                        // key press doesn't reliably emit a click, and this is the
                        // only way to open the panel by keyboard.
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenKey(isOpen ? null : item.label);
                        }
                      }}
                      onPointerDown={() => {
                        clickFromPointer.current = true;
                      }}
                      onClick={() => {
                        // Only genuine pointer clicks act here; a keyboard-activated
                        // click (no preceding pointerdown) was already handled above.
                        if (!clickFromPointer.current) return;
                        clickFromPointer.current = false;
                        // Pointer on a hover device: hover already opened the panel,
                        // so the click navigates to the hub — it never toggles closed.
                        if (hoverCapable) {
                          clearClose();
                          setOpenKey(null);
                          router.push(item.href);
                          return;
                        }
                        // Touch (no hover): first tap opens, second tap navigates.
                        if (isOpen) {
                          router.push(item.href);
                        } else {
                          setOpenKey(item.label);
                        }
                      }}
                    >
                      {item.label}
                      <ChevronDown
                        className={styles.chevron}
                        aria-hidden="true"
                        data-open={isOpen}
                      />
                    </button>
                    {isOpen && <MegaPanel item={item} panelId={panelId} />}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <div className={styles.ctaGroup}>
              {nav.ctas.map((cta) => (
                <Button
                  key={cta.label}
                  href={cta.route}
                  variant={cta.style === "primary" ? "primary" : "secondary"}
                  size="sm"
                  className={cta.style === "secondary" ? styles.secondaryCta : undefined}
                >
                  {cta.label}
                </Button>
              ))}
            </div>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu aria-hidden="true" />
              <span className="iw-visually-hidden">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Rendered OUTSIDE <header>: the header's `backdrop-filter` establishes a
          containing block for position:fixed descendants, which would otherwise trap the
          full-screen overlay inside the 72px header bar. */}
      <MobileNav nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
