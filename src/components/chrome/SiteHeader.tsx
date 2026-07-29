"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, ChevronRight, Compass, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/IconButton";
import { Icon } from "@/components/primitives/Icon";
import type { NavItem, SiteNav } from "@/lib/content/types";
import { ariaCurrent, isCurrent, routeCurrentState, sectionCurrentState } from "@/lib/nav/currentRoute";
import { MobileNav } from "./MobileNav";
import styles from "./SiteHeader.module.css";
import btn from "@/components/primitives/Button.module.css";

/** Per-column wayfinding accent, cycled — V2 domain inks (build → discover → convert →
    operate). Decorative only; used for the flat link-icon tiles. */
const MEGA_COL_ACCENTS = [
  "var(--v2-domain-build-ink)",
  "var(--v2-domain-discover-ink)",
  "var(--v2-domain-convert-ink)",
  "var(--v2-domain-operate-ink)",
];

/** Every child href a mega item points at (its hub links live in the columns). */
function childHrefsOf(item: NavItem): string[] {
  return (item.megaMenu?.columns ?? []).flatMap((c) => c.items.map((l) => l.href));
}

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

/** A purely PRESENTATIONAL clone of a header CTA — a `<span>` carrying Button's own
 *  (element-agnostic) box classes, so it measures identically to the real Button without being
 *  an anchor, a button, a Link or focusable. */
function ProbeCta({ label, primary }: { label: string; primary: boolean }) {
  return (
    <span className={`${btn.btn} ${primary ? btn.primary : btn.secondary} ${btn.sm}`}>
      <span className={btn.label}>{label}</span>
    </span>
  );
}

/** Non-interactive width probe for one desktop layout (logo + nav + a set of CTAs). It mirrors
 *  the real elements' typography/padding/gaps so its natural width equals the real bar's, but
 *  it is built ENTIRELY from presentational markup — no anchor, no button, no Link, no href, no
 *  focusable descendant and no navigation landmark. Combined with the aria-hidden + inert
 *  wrapper and the 0-height clip, it never enters the a11y tree, never takes focus and never
 *  affects the document's dimensions. The `<Logo>` renders without `href`, so it is a
 *  non-interactive role="img" span, not a link. */
function FitProbe({
  nav,
  ctas,
  probeRef,
}: {
  nav: SiteNav;
  ctas: SiteNav["ctas"];
  probeRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={styles.probeRow} ref={probeRef}>
      <Logo size={28} />
      {/* A plain <ul>, NOT a <nav>, so the probe never duplicates the Primary landmark. */}
      <ul className={styles.navList}>
        {nav.primary.map((item) => (
          <li key={item.label} className={styles.navItem}>
            {item.megaMenu ? (
              <span className={styles.navTrigger}>
                {item.label}
                <ChevronDown className={styles.chevron} aria-hidden="true" />
              </span>
            ) : (
              <span className={styles.navLink}>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
      <span className={styles.probeActions}>
        {ctas.map((cta) => (
          <ProbeCta key={cta.label} label={cta.label} primary={cta.style === "primary"} />
        ))}
      </span>
    </div>
  );
}

type Mode = "desktop" | "compact";

export function SiteHeader({ nav }: { nav: SiteNav }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Desktop-first default (SSR-safe); corrected on mount by matchMedia below.
  const [hoverCapable, setHoverCapable] = useState(true);
  // Adaptive header: null until measured (SSR/no-JS falls back to the CSS media queries).
  const [mode, setMode] = useState<Mode | null>(null);
  const [showSecondary, setShowSecondary] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const probeMinRef = useRef<HTMLDivElement | null>(null);
  const probeFullRef = useRef<HTMLDivElement | null>(null);
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
    // Require BOTH a hover-capable AND a fine pointer, so coarse hybrid devices (a touch
    // laptop reporting one hover input) aren't treated as desktop hover devices.
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = (matches: boolean) => setHoverCapable(matches);
    sync(mq.matches);
    const onChange = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Adaptive compact header (measured fit). The probes always carry the DESKTOP content, so
  // the fit result is independent of the current mode — there is no measurement feedback loop
  // and no flicker/oscillation after hydration. Desktop is only chosen at ≥1160px (the mega
  // layout's floor); above that, the header collapses to logo + hamburger whenever the nav +
  // CTAs don't fit (e.g. 200% text zoom), and returns to desktop when the room is restored.
  useEffect(() => {
    const bar = barRef.current;
    const probeMin = probeMinRef.current;
    const probeFull = probeFullRef.current;
    if (!bar || !probeMin || !probeFull) return;

    const desktopMQ = window.matchMedia("(min-width: 1160px)");
    const wideMQ = window.matchMedia("(min-width: 1400px)");

    const measure = () => {
      const avail = bar.clientWidth;
      if (avail <= 0) return; // not laid out yet (or a no-layout test env)
      const minW = probeMin.scrollWidth;
      const fullW = probeFull.scrollWidth;
      if (minW <= 0) return;
      const canDesktop = desktopMQ.matches && minW <= avail;
      const nextMode: Mode = canDesktop ? "desktop" : "compact";
      // The secondary CTA keeps its ≥1400 home, but only if it genuinely fits there.
      const nextSecondary = nextMode === "desktop" && wideMQ.matches && fullW <= avail;
      setMode((m) => (m === nextMode ? m : nextMode));
      setShowSecondary((s) => (s === nextSecondary ? s : nextSecondary));
    };

    let raf = 0;
    if (typeof requestAnimationFrame === "function") raf = requestAnimationFrame(measure);
    else measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(bar);
      ro.observe(probeFull);
    } else {
      window.addEventListener("resize", measure);
    }
    desktopMQ.addEventListener("change", measure);
    wideMQ.addEventListener("change", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      // Re-measure once webfonts swap in (their metrics change the natural width).
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      if (raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
      desktopMQ.removeEventListener("change", measure);
      wideMQ.removeEventListener("change", measure);
    };
  }, [nav]);

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

  // The CTAs always shown in desktop mode (the secondary one hides below the wide breakpoint).
  const minCtas = nav.ctas.filter((c) => c.style !== "secondary");

  return (
    <>
      <header
        className={`theme-deep ${styles.header} ${scrolled ? styles.scrolled : ""}`}
        data-mode={mode ?? undefined}
        data-secondary={mode == null ? undefined : showSecondary ? "true" : "false"}
      >
        {/* Off-screen fit probes: aria-hidden + inert (not focusable, not in the a11y tree,
            no duplicate landmark), clipped by a 0-height wrapper (no layout, no overflow).
            They measure the desktop nav's natural width so the header can collapse to compact
            when it would otherwise overflow. */}
        <div className={styles.probeWrap} aria-hidden="true" inert>
          <FitProbe nav={nav} ctas={minCtas} probeRef={probeMinRef} />
          <FitProbe nav={nav} ctas={nav.ctas} probeRef={probeFullRef} />
        </div>

        <div className={`iw-container iw-container--wide ${styles.bar}`} ref={barRef}>
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
                  const linkState = routeCurrentState(item.href, pathname);
                  return (
                    <li key={item.label} className={styles.navItem}>
                      <Link
                        href={item.href}
                        className={`${styles.navLink} ${isCurrent(linkState) ? styles.navLinkActive : ""}`}
                        aria-current={ariaCurrent(linkState)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }
                const panelId = `mega-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
                // exact hub → "page"; a child/under-hub route → "location"; else none.
                const sectionState = sectionCurrentState(item.href, childHrefsOf(item), pathname);
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
                      className={`${styles.navTrigger} ${isCurrent(sectionState) ? styles.navTriggerActive : ""}`}
                      // Section wayfinding for AT — the current route lives under this
                      // menu; the visible cue is the indicator bar, not colour alone.
                      aria-current={ariaCurrent(sectionState)}
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
            <span className={styles.menuButtonSlot}>
              <IconButton
                label="Open menu"
                icon={<Menu aria-hidden="true" />}
                appearance="secondary"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                onClick={() => setMobileOpen(true)}
              />
            </span>
          </div>
        </div>
      </header>

      {/* Rendered OUTSIDE <header> so the full-screen overlay is a sibling of the page
          landmarks (header / main / footer) and covers the whole viewport, rather than being
          confined to the header bar. */}
      <MobileNav nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
