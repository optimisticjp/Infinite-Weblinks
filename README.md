# Infinite Weblinks

Marketing website for **Infinite Weblinks**, a Digital Growth Partner that helps businesses
plan, build and connect the right digital tools and services around their goals.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **CSS Modules** with a CSS-variable design-token system
- **GSAP** and **motion** for animation
- **Sanity** as the (optional) content source — the site renders reviewed local seed content
  by default; live Sanity reads stay flag-gated
- **Vitest** (unit) and **Playwright** + **axe** (e2e / accessibility) for testing
- **OpenNext** on **Cloudflare Workers** for hosting

## Getting started

Requires Node.js ≥ 20.9.

```bash
npm install
cp .env.example .env   # then fill in any values you need
```

## Local development

```bash
npm run dev        # start the dev server (http://localhost:3000)
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
npm run format     # Prettier
```

## Testing

```bash
npm run test      # unit tests (Vitest)
npm run test:e2e  # end-to-end + accessibility (Playwright + axe)
```

## Production build

```bash
npm run build     # Next.js production build (webpack)
```

## Cloudflare (OpenNext)

```bash
npm run cf:build    # build the Cloudflare Worker bundle
npm run cf:preview  # build and preview locally
npm run cf:deploy   # build and deploy
```

## Design references

The target visual direction lives in [`docs/design-references/`](docs/design-references/) —
the reference images and their `README.md`. Consult these when designing or reworking a
section.
