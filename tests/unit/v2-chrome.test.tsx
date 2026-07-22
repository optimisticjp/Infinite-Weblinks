// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { SiteNav, FooterContent } from "@/lib/content/types";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { MobileNav } from "@/components/chrome/MobileNav";
import { SiteFooter } from "@/components/chrome/SiteFooter";

const { pathState } = vi.hoisted(() => ({ pathState: { current: "/" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathState.current,
  useRouter: () => ({ push: () => {} }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, prefetch: _p, ...rest }: { href: unknown; children: unknown; prefetch?: unknown }) => {
    void _p;
    return (
      <a href={typeof href === "string" ? href : "#"} {...(rest as Record<string, unknown>)}>
        {children as never}
      </a>
    );
  },
}));

beforeAll(() => {
  // jsdom has no matchMedia; SiteHeader queries "(hover: hover) and (pointer: fine)".
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

const NAV: SiteNav = {
  primary: [
    { label: "Your goal", href: "/goals" },
    {
      label: "Services",
      href: "/services",
      megaMenu: {
        title: "Services",
        columns: [{ heading: "Build", items: [{ label: "Websites", href: "/services/web", icon: "monitor" }] }],
      },
    },
    {
      label: "Resources",
      href: "/resources",
      megaMenu: {
        title: "Resources",
        columns: [{ heading: "Learn", items: [{ label: "Guides", href: "/learn" }] }],
      },
    },
  ],
  ctas: [
    { label: "See how it all works", route: "/how-it-works", style: "secondary" },
    { label: "Build my growth plan", route: "/growth-plan", style: "primary" },
  ],
};

const FOOTER: FooterContent = {
  supportEmail: "support@infiniteweblinks.com",
  tagline: "Connected systems. Smarter growth.",
  columns: [
    { heading: "Services", links: [{ label: "Websites", href: "/services/web" }] },
    { heading: "Company", links: [{ label: "About", href: "/about" }] },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  social: [{ platform: "Facebook" }],
};

describe("SiteHeader (V2 light chrome)", () => {
  it("renders the light theme surface (never a dark/cosmic class)", () => {
    pathState.current = "/resources";
    const { container } = render(<SiteHeader nav={NAV} />);
    const header = container.querySelector("header")!;
    expect(header.className).toContain("theme-light");
    expect(header.className).not.toMatch(/theme-(dark|cosmic)/);
  });

  it("marks a simple link current with aria-current=page", () => {
    pathState.current = "/goals";
    render(<SiteHeader nav={NAV} />);
    expect(screen.getByRole("link", { name: "Your goal" })).toHaveAttribute("aria-current", "page");
  });

  it("marks the mega-menu parent current when a child route is active (aria-current=location)", () => {
    pathState.current = "/services/web";
    render(<SiteHeader nav={NAV} />);
    const services = screen.getByRole("button", { name: /^Services$/ });
    // The section is an ANCESTOR of the current route, so it reads as a location, not the page.
    expect(services).toHaveAttribute("aria-current", "location");
    // a non-matching section is not marked current
    expect(screen.getByRole("button", { name: /^Resources$/ })).not.toHaveAttribute("aria-current");
  });

  it("marks the mega-menu parent aria-current=page when the hub itself is the current page", () => {
    pathState.current = "/services";
    render(<SiteHeader nav={NAV} />);
    expect(screen.getByRole("button", { name: /^Services$/ })).toHaveAttribute("aria-current", "page");
  });

  it("mega trigger exposes aria-expanded (closed initially)", () => {
    pathState.current = "/";
    render(<SiteHeader nav={NAV} />);
    expect(screen.getByRole("button", { name: /^Services$/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("has an accessible mobile menu button with expanded/controls wiring", () => {
    pathState.current = "/";
    render(<SiteHeader nav={NAV} />);
    const menu = screen.getByRole("button", { name: "Open menu" });
    expect(menu).toHaveAttribute("aria-controls", "mobile-nav");
    expect(menu).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps both header CTA labels", () => {
    pathState.current = "/";
    render(<SiteHeader nav={NAV} />);
    expect(screen.getByRole("link", { name: "Build my growth plan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See how it all works" })).toBeInTheDocument();
  });
});

describe("MobileNav (V2 light drawer)", () => {
  it("is a labelled modal dialog with id mobile-nav, on the light surface", () => {
    pathState.current = "/";
    const { container } = render(<MobileNav nav={NAV} open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "Site menu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("id", "mobile-nav");
    expect(dialog.className).toContain("theme-light");
    expect(within(container).getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("marks the active parent group when a child route is current (aria-current=location)", () => {
    pathState.current = "/services/web";
    render(<MobileNav nav={NAV} open onClose={() => {}} />);
    // the accordion trigger for the section carries aria-current=location (ancestor, not page)
    expect(screen.getByRole("button", { name: /^Services$/ })).toHaveAttribute("aria-current", "location");
  });

  it("marks a direct link current with aria-current=page", () => {
    pathState.current = "/goals";
    render(<MobileNav nav={NAV} open onClose={() => {}} />);
    expect(screen.getByRole("link", { name: "Your goal" })).toHaveAttribute("aria-current", "page");
  });

  it("expands an accordion group to reveal its overview + sub links", async () => {
    pathState.current = "/";
    render(<MobileNav nav={NAV} open onClose={() => {}} />);
    const trigger = screen.getByRole("button", { name: /^Services$/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    trigger.click();
    expect(await screen.findByRole("link", { name: "All Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Websites" })).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    pathState.current = "/";
    const { container } = render(<MobileNav nav={NAV} open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SiteFooter (V2 light chrome)", () => {
  it("is a light footer with a named footer nav, email, and legal links", () => {
    const { container } = render(<SiteFooter footer={FOOTER} />);
    const footer = container.querySelector("footer")!;
    expect(footer.className).toContain("theme-light");
    expect(footer.className).not.toMatch(/theme-(dark|cosmic)/);
    expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /support@infiniteweblinks\.com/ })).toHaveAttribute(
      "href",
      "mailto:support@infiniteweblinks.com",
    );
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
  });

  it("hides social links until a URL exists, and shows the current year", () => {
    const { rerender } = render(<SiteFooter footer={FOOTER} />);
    // Facebook has no url → not rendered
    expect(screen.queryByRole("link", { name: "Facebook" })).toBeNull();
    // copyright uses the current (build-time) year, not a hardcoded future date
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();

    rerender(<SiteFooter footer={{ ...FOOTER, social: [{ platform: "Facebook", url: "https://x.example/fb" }] }} />);
    expect(screen.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", "https://x.example/fb");
  });

  it("renders no GlobeArc/cosmic decoration (no canvas)", () => {
    const { container } = render(<SiteFooter footer={FOOTER} />);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
