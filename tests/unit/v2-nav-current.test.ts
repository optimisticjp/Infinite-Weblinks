import { describe, it, expect } from "vitest";
import {
  routeCurrentState,
  sectionCurrentState,
  ariaCurrent,
  isCurrent,
} from "@/lib/nav/currentRoute";

/** The shared route-matching helper: exact -> page, ancestor/section -> location, else none. */

describe("routeCurrentState", () => {
  it("marks an exact match as the page", () => {
    expect(routeCurrentState("/learn", "/learn")).toBe("page");
    expect(routeCurrentState("/case-studies", "/case-studies")).toBe("page");
  });

  it("marks an ancestor of the current route as a location", () => {
    expect(routeCurrentState("/learn", "/learn/example-article")).toBe("location");
    expect(routeCurrentState("/case-studies", "/case-studies/example-scenario")).toBe("location");
    expect(routeCurrentState("/tools", "/tools/example-tool")).toBe("location");
    expect(routeCurrentState("/services", "/services/example-category")).toBe("location");
  });

  it("normalises trailing slashes and ignores hash/query", () => {
    expect(routeCurrentState("/learn/", "/learn")).toBe("page");
    expect(routeCurrentState("/learn", "/learn/")).toBe("page");
    expect(routeCurrentState("/learn", "/learn?ref=nav")).toBe("page");
    expect(routeCurrentState("/how-it-works", "/how-it-works#convert")).toBe("page");
  });

  it("does not treat unrelated or sibling routes as current", () => {
    expect(routeCurrentState("/learn", "/case-studies")).toBe(false);
    // sibling prefix collision: /service must NOT match /services
    expect(routeCurrentState("/service", "/services")).toBe(false);
    // /learn must not match /learning
    expect(routeCurrentState("/learn", "/learning")).toBe(false);
  });

  it("only marks Home current on an exact match, never as an ancestor of everything", () => {
    expect(routeCurrentState("/", "/")).toBe("page");
    expect(routeCurrentState("/", "/learn")).toBe(false);
  });
});

describe("sectionCurrentState (mega / accordion parent)", () => {
  const services = "/services";
  const children = ["/services/web", "/services/seo-content", "/services/paid-ads"];

  it("is the page only when the hub itself is current", () => {
    expect(sectionCurrentState(services, children, "/services")).toBe("page");
  });

  it("is a location when a child (or under the hub) is current — never the page", () => {
    expect(sectionCurrentState(services, children, "/services/web")).toBe("location");
    expect(sectionCurrentState(services, children, "/services/web/sub")).toBe("location");
  });

  it("matches a child that lives outside the hub path as a location", () => {
    // e.g. a Resources mega whose children include /learn and /how-it-works
    expect(sectionCurrentState("/resources", ["/learn", "/how-it-works"], "/learn/foo")).toBe("location");
  });

  it("does not falsely mark a sibling section current", () => {
    expect(sectionCurrentState(services, children, "/resources")).toBe(false);
    expect(sectionCurrentState(services, children, "/")).toBe(false);
  });
});

describe("ariaCurrent / isCurrent", () => {
  it("maps state to the aria-current attribute value", () => {
    expect(ariaCurrent("page")).toBe("page");
    expect(ariaCurrent("location")).toBe("location");
    expect(ariaCurrent(false)).toBeUndefined();
  });
  it("isCurrent is true for page and location, false otherwise", () => {
    expect(isCurrent("page")).toBe(true);
    expect(isCurrent("location")).toBe(true);
    expect(isCurrent(false)).toBe(false);
  });
});
