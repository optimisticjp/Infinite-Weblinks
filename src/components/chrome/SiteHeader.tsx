"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, ChevronRight, Compass, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import type { NavItem, SiteNav } from "@/lib/content/types";
import { MobileNav } from "./MobileNav";
import styles from "./SiteHeader.module.css";

/** Per-column accent, cycled — matches the four-phase colour story in the reference
    mega-menu (build → discover → convert → operate). Decorative only; the promo CTA
    owns the panel's one bright element (the light budget). */
const MEGA_COL_ACCENTS = ["var(--blue)", "var(--violet)", "var(--pink)", "var(--orange)"];

type Pt = { x: number; y: number };

/** Standard point-in-triangle (barycentric sign test). */
function pointInTriangle(p: Pt, a: Pt, b: Pt, c: Pt) {
  const sign = (p1: Pt, p2: Pt, p3: Pt) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function MegaPanel({ item, panelId }: { item: NavItem; panelId: string }) {
  const menu = item.megaMenu!;
  return (
    <div id={panelId} className={styles.megaPanel} role="group" aria-label={menu.title}>
      {/* Keep `.megaInner` as the panel's DIRECT child grid: its track count (1 without a
          promo, 2 with) is a contract exercised by the nav e2e suite, and its content box
          shares the header's left edge. Only the styling + inner markup change here. */}
      <div
        className={`iw-container iw-container--wide ${styles.megaInner} ${
          menu.promo ? styles.megaInnerPromo : ""
        }`}
      >
        <div
          className={styles.megaColumns}
          style={{ ["--mega-cols" as string]: menu.columns.length }}
        >
          {menu.columns.map((col, i) => (
            <div
              key={col.heading}
              className={styles.megaColumn}
              style={{ ["--col-accent" as string]: MEGA_COL_ACCENTS[i % MEGA_COL_ACCENTS.length] }}
            >
              <p className={styles.megaHeading}>{col.heading}</p>
              <ul className={styles.megaLinks}>
                {col.items.map((link) => (
                  <li key={link.label + link.href}>
                    <Link href={link.href} className={styles.megaLink}>
                      {link.icon ? (
                        <span className={styles.megaLinkIcon} aria-hidden="true">
                          <Icon name={link.icon} />
                        </span>
                      ) : null}
                      <span className={styles.megaLinkText}>
                        <span className={styles.megaLinkLabel}>{link.label}</span>
                        {link.description ? (
                          <span className={styles.megaLinkDesc}>{link.description}</span>
                        ) : null}
                      </span>
                      <ChevronRight className={styles.megaLinkChevron} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {menu.promo && (
          <aside className={styles.megaPromo}>
            <span className={styles.megaPromoGlyph} aria-hidden="true">
              <Compass />
            </span>
            <p className={styles.megaPromoHeading}>{menu.promo.heading}</p>
            <p className={styles.megaPromoBody}>{menu.promo.body}</p>
            <div className={styles.megaPromoActions}>
              <Button
                href={menu.promo.cta.route}
                variant="primary"
                size="sm"
                iconRight={<ArrowUpRight aria-hidden="true" />}
              >
                {menu.promo.cta.label}
              </Button>
              <Link href={item.href} className={styles.megaPromoLink}>
                View all {menu.title}
                <ChevronRight aria-hidden="true" />
              </Link>
            </div>
          </aside>
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
  // Safe-corridor (aim) state for Defect 3: the previous pointer position, and a pending
  // "switch to a neighbour" fallback timer.
  const pointerPrev = useRef<Pt | null>(null);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const clearSwitch = () => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
  };

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

  // Clear any pending timers on unmount.
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (switchTimer.current) clearTimeout(switchTimer.current);
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
            // Hover is a continuous geometric fact, so drive the open panel from a
            // continuous event. On every mouse move we hit-test which nav item is
            // under the pointer and sync openKey. The state is self-healing: the
            // instant the cursor twitches, it corrects — no dead window after a
            // click, because there is no one-shot boundary event to miss. Do not
            // throttle (a closest() per frame on a nav bar is nothing); throttling
            // reintroduces the lag this removes. See CLAUDE.md "Hover is not state".
            onPointerMove={(e) => {
              if (!hoverCapable || e.pointerType !== "mouse") return;
              // The pointer is inside the nav subtree. Cancel any scheduled close —
              // UNCONDITIONALLY (moving within the open menu toward a link must never let
              // a close timer armed on the way in survive). See CLAUDE.md "Hover is not state".
              clearClose();
              const el = (e.target as Element).closest?.("[data-nav-item]");
              const label = el?.getAttribute("data-nav-item") ?? null;
              const now = { x: e.clientX, y: e.clientY };
              const prev = pointerPrev.current;
              pointerPrev.current = now;

              if (!label) return; // in the nav, but not over a trigger or an open panel
              if (label === openKey) {
                clearSwitch(); // over the open trigger or its own panel — stay open
                return;
              }
              if (openKey === null) {
                setOpenKey(label); // nothing open yet → open on contact, instantly
                return;
              }

              // A DIFFERENT trigger while another panel is open. Safe corridor (Defect 3):
              // if the pointer is descending toward the open panel — inside the triangle
              // from its previous position to the panel's two top corners — it is still
              // reaching for a link, so keep the panel and DON'T switch. Crossing a
              // neighbour on that path no longer swaps menus. A deliberate sideways move
              // to another trigger falls outside the triangle → switch at once, never sluggish.
              const panelTop = navRef.current?.getBoundingClientRect().bottom ?? 0;
              const aiming =
                prev !== null &&
                pointInTriangle(now, prev, { x: 0, y: panelTop }, { x: window.innerWidth, y: panelTop });
              if (aiming) {
                // Arm a fallback so parking on the neighbour still switches — never stuck
                // open. Re-validated at fire time against the live pointer position, so a
                // move away (or an Esc/outside close) can't let a stale switch reopen it.
                clearSwitch();
                const target = label;
                switchTimer.current = setTimeout(() => {
                  const p = pointerPrev.current;
                  const over = p
                    ? document.elementFromPoint(p.x, p.y)?.closest?.("[data-nav-item]")?.getAttribute("data-nav-item")
                    : null;
                  if (over === target) setOpenKey(target);
                }, 220);
              } else {
                clearSwitch();
                setOpenKey(label);
              }
            }}
            onMouseLeave={() => {
              scheduleClose();
              clearSwitch();
              pointerPrev.current = null;
            }}
            onFocusCapture={clearClose}
            onClick={(e) => {
              // Any link click closes the panel — regardless of whether the pathname, the
              // hash, or the URL changes at all (useEffect[pathname] can't see a hash-only
              // or same-URL navigation, so on its own it leaves the panel open over the
              // section just requested). Generalises MobileNav's onClick={onClose}. Trigger
              // buttons aren't <a>, so they keep their own hover/click behaviour.
              if ((e.target as Element).closest?.("a")) {
                clearSwitch();
                setOpenKey(null);
              }
            }}
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
                  const isCurrent =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                  return (
                    <li key={item.label} className={styles.navItem}>
                      <Link
                        href={item.href}
                        className={`${styles.navLink} ${isCurrent ? styles.navLinkActive : ""}`}
                        aria-current={isCurrent ? "page" : undefined}
                      >
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
                    // Opening is driven by the nav's continuous onPointerMove (see
                    // below), not a one-shot onMouseEnter here — mouseenter cannot
                    // re-fire while the cursor is already inside the item, which is
                    // exactly the state after clicking the trigger.
                    data-nav-item={item.label}
                  >
                    <button
                      type="button"
                      className={styles.navTrigger}
                      aria-expanded={isOpen}
                      // Only reference the panel while it's actually in the DOM (it renders
                      // only when open), so aria-controls never dangles at a missing id.
                      aria-controls={isOpen ? panelId : undefined}
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
                        // so the click just navigates to the hub. Do NOT setOpenKey(null)
                        // here — the cursor is still on the trigger, and closing the
                        // panel now leaves it dead (mouseenter/pointermove won't refire
                        // without a move). Route changes close it via useEffect([pathname]);
                        // if the route is unchanged, staying open is the correct state.
                        if (hoverCapable) {
                          clearClose();
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
