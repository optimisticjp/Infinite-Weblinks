import type { LegalPage } from "@/lib/content/types";

/**
 * Legal pages. Structurally complete plain-English drafts describing the
 * ACTUAL data flow (forms -> Formspree; Cloudflare hosting/Turnstile; Sanity
 * CMS; cookieless Cloudflare Web Analytics; support@infiniteweblinks.com; no
 * visitor auto-copy). Status is "verified" so these render (they're structural
 * and accurate to the stack), but every page carries a reviewNote flagging that
 * a qualified professional must review the actual legal wording before launch.
 * No legal guarantees are invented here.
 */

const REVIEW_NOTE = "Draft structure — requires professional legal review before launch.";
const UPDATED = "14 July 2026";

export const legalPages: LegalPage[] = [
  {
    status: "verified",
    slug: "privacy",
    title: "Privacy Policy",
    updated: UPDATED,
    reviewNote: REVIEW_NOTE,
    intro:
      "This page explains what information we collect when you use this site, and how it's handled. It's written in plain English, and covers the actual systems this site uses.",
    blocks: [
      {
        heading: "Information We Collect",
        paragraphs: [
          "When you use our contact or Growth Plan forms, we collect the details you choose to provide, such as your name, email address, and information about your business and goals.",
          "Form submissions are processed through Formspree, our form-handling provider. Information submitted through a form is not automatically copied to or shared with any other visitor or third party.",
        ],
      },
      {
        heading: "How We Use Analytics",
        paragraphs: [
          "We use Cloudflare Web Analytics, a cookieless analytics service, to understand overall site usage such as page views and general traffic patterns.",
          "This tool does not use tracking cookies, does not collect personal identifiers, and does not track individual visitors across other websites.",
        ],
      },
      {
        heading: "Hosting & Security",
        paragraphs: [
          "This site is hosted on Cloudflare's network. Cloudflare Turnstile may be used to help distinguish real visitors from automated bots on our forms, without intrusive challenges for most visitors.",
        ],
      },
      {
        heading: "Content Management",
        paragraphs: [
          "Editorial content on this site (such as service descriptions and articles) is managed through Sanity, a content management platform used by our team. Sanity is not used to collect information about site visitors.",
        ],
      },
      {
        heading: "Contacting Us",
        paragraphs: [
          "If you have questions about this policy or how your information is handled, contact us at support@infiniteweblinks.com.",
        ],
      },
    ],
  },
  {
    status: "verified",
    slug: "cookies",
    title: "Cookie Policy",
    updated: UPDATED,
    reviewNote: REVIEW_NOTE,
    intro: "This page explains how cookies and similar technologies are used on this site, and why we've kept that use minimal.",
    blocks: [
      {
        heading: "Analytics Without Cookies",
        paragraphs: [
          "Our overall site analytics run through Cloudflare Web Analytics, which is cookieless by design. It does not set tracking cookies and does not build a profile of individual visitors.",
        ],
      },
      {
        heading: "Spam Protection",
        paragraphs: [
          "Our forms are protected using Cloudflare Turnstile, which may use a small amount of technical data to confirm a submission is coming from a real visitor rather than an automated script.",
        ],
      },
      {
        heading: "No Marketing or Advertising Cookies",
        paragraphs: [
          "This site does not use advertising cookies, cross-site tracking pixels, or third-party marketing cookies.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: ["If you have questions about cookies on this site, contact us at support@infiniteweblinks.com."],
      },
    ],
  },
  {
    status: "verified",
    slug: "terms",
    title: "Terms of Use",
    updated: UPDATED,
    reviewNote: REVIEW_NOTE,
    intro: "These terms cover use of this website. Any separate service engagement is governed by its own written agreement, not by this page.",
    blocks: [
      {
        heading: "Use of This Site",
        paragraphs: [
          "This website is provided for information about our services, tools, and approach to digital growth. Content is educational in nature and does not constitute a guarantee of any specific business result.",
        ],
      },
      {
        heading: "No Guaranteed Results",
        paragraphs: [
          "We don't promise overnight results, guaranteed rankings, or a fixed number of sales. Outcomes depend on your market, offer, and budget, and real growth compounds over time rather than arriving instantly.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "The content, design, and branding of this site belong to Infinite Weblinks unless otherwise stated, and may not be reproduced without permission.",
        ],
      },
      {
        heading: "Service Engagements",
        paragraphs: [
          "Where we carry out paid work for a client, the scope, deliverables, and terms of that work are set out in a separate agreement, not in this general-use page.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Questions about these terms can be sent to support@infiniteweblinks.com."],
      },
    ],
  },
  {
    status: "verified",
    slug: "refunds",
    title: "Refunds & Cancellations",
    updated: UPDATED,
    reviewNote: REVIEW_NOTE,
    intro:
      "This page explains, in plain English, how refunds and cancellations work for our services. This site itself does not take payments, so anything to do with money is handled through your separate written agreement.",
    blocks: [
      {
        heading: "No Payments Are Taken on This Site",
        paragraphs: [
          "There is no checkout or payment on this website. You cannot be charged simply by using it, and the Growth Plan builder and all the guidance here are free to use.",
        ],
      },
      {
        heading: "Refunds for Paid Work",
        paragraphs: [
          "Where we carry out paid work for a client, how refunds, deposits, and cancellations are handled is set out in the written agreement for that engagement. That agreement, not this page, governs the terms of your work.",
          "We aim to be fair and clear about this before any work starts, so you know where you stand if plans change.",
        ],
      },
      {
        heading: "Changing or Cancelling Work",
        paragraphs: [
          "If your needs change partway through a project, talk to us. What happens next, including any work already completed or specialist costs already committed on your behalf, follows the terms in your agreement.",
        ],
      },
      {
        heading: "The Free Growth Plan",
        paragraphs: [
          "Building a growth plan on this site is free, so there is nothing to pay and nothing to refund. It is yours to keep whether or not you go on to work with us.",
        ],
      },
      {
        heading: "Questions About Billing",
        paragraphs: [
          "If you have a question about an invoice, a payment, or a refund, contact us at support@infiniteweblinks.com and we will look into it.",
        ],
      },
    ],
  },
  {
    status: "verified",
    slug: "accessibility",
    title: "Accessibility Statement",
    updated: UPDATED,
    reviewNote: REVIEW_NOTE,
    intro: "We aim for this site to be usable by as many people as possible, including people using assistive technology.",
    blocks: [
      {
        heading: "Our Target Standard",
        paragraphs: [
          "We aim to meet WCAG 2.2 at Level AA across this site, covering things like colour contrast, keyboard navigation, and screen-reader compatibility.",
        ],
      },
      {
        heading: "Ongoing Work",
        paragraphs: [
          "Accessibility is an ongoing effort rather than a one-off checkbox. We review and improve this site over time as issues are identified.",
        ],
      },
      {
        heading: "Reporting an Issue",
        paragraphs: [
          "If you experience any difficulty using this site, please contact us at support@infiniteweblinks.com so we can look into it.",
        ],
      },
    ],
  },
];
