import { canonical } from "./metadata";

/**
 * JSON-LD builders. Only factually-supported fields are emitted — no Review /
 * AggregateRating / fabricated data. Organization `sameAs` stays empty until social
 * URLs are verified.
 */

const ORG = {
  "@type": "Organization",
  name: "Infinite Weblinks",
  url: canonical("/"),
  email: "support@infiniteweblinks.com",
} as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...ORG,
    description:
      "Infinite Weblinks is a Digital Growth Partner — a full-stack web development and digital marketing services company that helps businesses choose the right digital tools and services and connect everything around their goals.",
    slogan: "Digital growth, built around your goals.",
    sameAs: [] as string[], // populated only when verified
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Infinite Weblinks",
    url: canonical("/"),
    publisher: { ...ORG },
  };
}

/** ContactPage node for /contact — carries the Organization and a support ContactPoint
 * (email only; no phone exists to claim), with the areas actually served. Factually
 * grounded: nothing here asserts a response time or any unverifiable proof. */
export function contactPageJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Infinite Weblinks",
    url: canonical("/contact"),
    description,
    mainEntity: {
      ...ORG,
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@infiniteweblinks.com",
        contactType: "customer support",
        areaServed: ["GB", "US", "CA", "AU", "EU"],
        availableLanguage: ["English"],
      },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  };
}

export function serviceJsonLd(s: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    provider: { ...ORG },
    url: canonical(s.path),
    areaServed: ["GB", "US", "CA", "AU", "EU"],
  };
}

export function articleJsonLd(a: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url: canonical(a.path),
    publisher: { ...ORG },
    ...(a.datePublished ? { datePublished: a.datePublished } : {}),
  };
}

/**
 * Case-study schema. Modelled as an Article/CreativeWork about a real project — deliberately
 * NO Review, AggregateRating, or fabricated metric fields (brief truth rules, review §7/§16).
 * Only emitted for verified/readyToPublish case studies (the gate + 404 guarantee this), so a
 * placeholder can never produce structured data. Metrics, when present, are real and are shown
 * on-page as plain text, not encoded as ratings.
 */
export function caseStudyJsonLd(c: {
  title: string;
  description: string;
  path: string;
  client?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    url: canonical(c.path),
    publisher: { ...ORG },
    ...(c.client ? { about: c.client } : {}),
  };
}

/** Only emit when the FAQ is actually rendered on the page (brief §21). */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: canonical(it.path),
    })),
  };
}
