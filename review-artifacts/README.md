# Layout QA — Review Artifacts

Screenshots captured against the styled production build (webpack `next build` +
`next start`) during the site-wide alignment correction pass. Widths follow the required
responsive set: **1440 / 1024 / 768 / 390 / 360**.

## Full-page, by width
- `home-1440.png`, `home-1024.png`, `home-768.png`, `home-390.png`, `home-360.png`

## Focused — chrome
- `header-closed-1440.png` — closed desktop header (logo/nav/CTA alignment)
- `megamenu-how-it-works-1280.png`, `megamenu-solutions-1280.png`,
  `megamenu-services-1280.png`, `megamenu-resources-1280.png` — each desktop mega-menu open
- `mobile-nav-open-390.png` — full-screen mobile menu (post-fix; was trapped in the header)
- `mobile-faq-390.png` — mobile FAQ expanded

## Routes @ 1440 (page-hero, breadcrumbs, container width, footer)
- Information: `how-it-works-1440.png`, `about-1440.png`, `solutions-1440.png`,
  `resources-1440.png`, `faq-1440.png`
- Conversion: `growth-plan-1440.png`, `contact-1440.png`
- Listings: `services-1440.png`, `tools-1440.png`, `business-types-1440.png`,
  `starting-points-1440.png`
- Details: `service-detail-1440.png`, `tool-detail-1440.png`, `roadmap-detail-1440.png`,
  `article-detail-1440.png`, `goal-detail-1440.png`
- Legal / system: `privacy-1440.png`, `404-1440.png`
- Mobile gutters: `service-detail-390.png`, `growth-plan-390.png`

## What the visual review confirmed
- Header, hero and mega-menus are now inset and centred on the shared grid (logo left edge
  lines up with the hero eyebrow and section content); footer no longer flush-left.
- Mega-menu inner content aligns with the header bar, three balanced columns + promo card.
- Homepage section rhythm (alternating dark/band), hidden proof leaves no gaps.
- Mobile menu covers the full viewport with accordions + both CTAs.
- No horizontal overflow at any width; container widths within tokens.
