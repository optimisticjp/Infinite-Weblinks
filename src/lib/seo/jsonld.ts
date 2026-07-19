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

/**
 * Article / BlogPosting node. `type` selects the schema.org subtype ("Article" by default,
 * "BlogPosting" for the blog). Author defaults to the Organization (these are house-written
 * guides — no fabricated personal bylines). Only supplied dates/images are emitted.
 */
export function articleJsonLd(a: {
  title: string;
  description: string;
  path: string;
  type?: "Article" | "BlogPosting";
  datePublished?: string;
  dateModified?: string;
  image?: string;
  author?: string;
}) {
  const url = canonical(a.path);
  return {
    "@context": "https://schema.org",
    "@type": a.type ?? "Article",
    headline: a.title,
    description: a.description,
    url,
    mainEntityOfPage: url,
    inLanguage: "en-GB",
    publisher: { ...ORG },
    author: a.author ? { "@type": "Organization", name: a.author } : { ...ORG },
    ...(a.datePublished ? { datePublished: a.datePublished } : {}),
    ...(a.dateModified ? { dateModified: a.dateModified } : {}),
    ...(a.image ? { image: a.image } : {}),
  };
}

/** BlogPosting convenience wrapper over articleJsonLd for the learn/blog articles. */
export function blogPostingJsonLd(a: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  author?: string;
}) {
  return articleJsonLd({ ...a, type: "BlogPosting" });
}

/**
 * HowTo node for step-based guides (each step a HowToStep). Only emit when the page actually
 * presents ordered, followable steps — otherwise use Article. No fabricated times or costs.
 */
export function howToJsonLd(h: {
  name: string;
  description: string;
  path: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: h.name,
    description: h.description,
    url: canonical(h.path),
    publisher: { ...ORG },
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
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
