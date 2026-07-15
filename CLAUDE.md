# Infinite Weblinks

A **Digital Growth Partner**. We help businesses understand what they need
online, choose the right tools and services, build what's needed, and connect
everything around their goals.

India-based. Clients in the UK, US, Canada, Australia and Europe. Six years in
business. Contact: support@infiniteweblinks.com

- **Slogan:** Digital growth, built around your goals.
- **Hero:** A smarter way to plan and grow your business online.
- **Primary CTA:** Build My Digital Growth Plan
- **The promise:** You focus on what you're great at. We take care of the digital side.

We are NOT a SaaS platform. We are NOT a service catalogue. **Never use the word
"agency" for ourselves.** The old tagline "Everything you need, linked to grow"
is retired — do not reintroduce it.

---

## THE ONE RULE: light is a budget

A universe is almost entirely dark with a few points of extreme light. That
contrast is the premium signal, not the amount of colour. If everything glows,
nothing does.

**Every section gets exactly ONE element that owns the brightest value on
screen. Everything else in that section runs at 40% of it or less.**

Consequences, all non-negotiable:

- Gradient text appears **twice** on the entire site: the hero H1, and the final
  CTA headline. Every other heading is `var(--text-1)`. Emphasis elsewhere comes
  from weight, never colour.
- Maximum two accent colours per section.
- One signature motion per section. Everything else is ambient, or nothing.
- One dominant element per viewport.

If a section already has a glow, a gradient, or a signature motion and you are
about to add another, the answer is no. Turn the surroundings down instead.

## The mark is a link, not a loop

`BrandSprite.tsx` holds the "Signature Crossover" infinity. Read it: there is a
mask that cuts the centre so **one strand passes under the other**. It is not an
infinity symbol. It is two strands crossing — a knot, a link.

The company is called Web**links**. The positioning is "we connect the right
pieces." The mark is structurally a connection.

So the crossover point — where one strand passes under the other — is the most
on-brand pixel on the site. When light travels the mark, it passes through the
place where two things become connected. **That is where the light lives.** This
governs every future decision about the hero, the logo, and the loading states.

## Mobile is its own art direction

Not a degraded desktop. Desktop says *everything is connected at once*. Mobile
says *follow one connected path at a time*. Same thesis, different choreography,
neither is the lesser version. Never shrink a desktop diagram into a phone.

---

## The tokens are law

Every value comes from `src/styles/tokens/`. Read them before writing any CSS.
Every time.

- `colors.css` — the palette. It documents its own contrast ratios. Respect them.
- `typography.css` — the type scale
- `spacing.css` — 4px scale, radii, container, section rhythm
- `effects.css` — shadows, glows, blur, easing, durations

**Never write an arbitrary value.** No `padding: 52px`. No `#8B3BFF`. No
`transition: 300ms`. If the scale does not have it, the design is wrong, not the
scale. Raise it instead of working around it.

### Section rhythm

- `--section-y-loose` — signature sections ONLY (connectedSystem, finalCtaBanner)
- `--section-y` — default
- `--section-y-tight` — rest beats (testimonials, learning resources)

One rhythm on every section is tidy, not designed. Air is how we signal
importance; spending it everywhere signals nothing.

### Typography

Fonts are **Sora** (display) and **Plus Jakarta Sans** (body). This was decided.
Do not swap them.

- Body weight is **450**, not 400. Light-on-dark reads optically thinner
  (irradiation). Deliberate.
- Every paragraph gets `max-width: var(--measure)`. No exceptions.
- **Tracking tightens as size grows.** Never apply one `letter-spacing` value
  across a fluid `clamp()` size range — it cannot be correct at both ends.

---

## Voice

Plain. Calm. Confident. Written for someone smart who is not technical. Must read
identically in the US, UK, Canada, Australia and Europe.

**Global English throughout:** personalise, prioritise, optimise, fulfilment,
recognisable, organised.

- Explain the **result**, not the tool. "See which ads actually make you money,"
  never "conversion tracking."
- Short sentences. One idea each.
- **Banned words:** leverage, ecosystem, tech stack, omnichannel, full-funnel,
  growth hacking, seamless, unlock, supercharge, cutting-edge, revolutionary,
  game-changing, robust, "solutions" as a noun.
- **Banned framing:** leak, stuck, failing, bleeding money. Never make the reader
  feel behind.
- **Never** promise guaranteed rankings, guaranteed sales, or overnight results.
  The honest-expectations promise is load-bearing.

## Proof: never fabricate. Ever.

Proof content lives in `src/lib/content/data/proof.ts` and every item is
status-gated. Read the comment at the top of that file — it is correct and it is
deliberate. Nothing renders publicly until its status says so.

Real case studies, testimonials and metrics exist (six years of them) and will
arrive via Sanity later, gated by a "Permission to Publicize" field that maps
directly onto `status`. Until then:

**Never invent a client name, a quote, a logo, a number, a percentage, or a
result. Not as a placeholder. Not "for layout testing." Not with a TODO.** If a
component needs realistic content length to design against, use the existing
obviously-non-real placeholders, which are non-real by design.

---

## Motion rules

Motion must answer a question the user is already asking: *where am I, what
connects to what, did that work, what happens next.* Motion that answers no
question is a gimmick and gets deleted in review.

- Hover 140–240ms. Entrance 480–900ms. Ambient loops 8–130s.
- `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`) for anything user-triggered.
- **Transform and opacity only.** Never animate `filter`/`blur` per frame. Never
  animate width, height, top, or left.
- Ambient motion belongs in the background, never the foreground. A headline that
  pulses forever is a bug.
- **Motion never gates content.** Nobody waits to read.
- `prefers-reduced-motion` → the complete static end-state, never a broken
  half-state. `src/lib/motion/motion.ts` already handles this correctly. Use it.
- Pause anything expensive when it leaves the viewport (IntersectionObserver).

## Performance budget: hard limits

- LCP < 2.5s, and **the LCP element must be the H1 text.** A canvas as LCP is a
  blocker, not a nit.
- Initial route JS < 300kb gzip. When `three` arrives it lives in its own lazy
  chunk and never touches the initial route.
- CLS < 0.05. Reserve boxes before they load.
- 60fps on an M1 Air. 30fps floor on mid-range Android.
- One bloom pass maximum, only around the hero infinity. Fake the rest with
  sprites and gradients — the difference is invisible and the cost is not.
- No object allocation inside `useFrame`.
- Every 3D scene needs: `ssr: false`, a static image fallback, a WebGL-absent
  path, and a reduced-motion path that skips the canvas entirely.

---

## Stack: do not add to it

Next 16 (App Router) · React 19 · TypeScript · CSS Modules + tokens ·
`motion` v12 (UI) · GSAP + ScrollTrigger (scroll timelines, lazy) · Sanity
(gated off) · OpenNext on Cloudflare Workers · Playwright + axe · Vitest

- **`motion` IS Framer Motion** (post-rebrand). Never install `framer-motion`
  alongside it.
- **Never add Lenis** or any smooth-scroll library. It hijacks native scroll,
  breaks `prefers-reduced-motion` in ways the axe suite won't catch, and fights
  ScrollTrigger.
- Only approved future addition: `three`, `@react-three/fiber`, `@react-three/drei`.
- No Tailwind. This project uses CSS Modules and tokens.

## Sanity: do not touch

`NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED` is unset (false) **deliberately**. The
public site renders reviewed local seed content for launch safety. The Studio and
dataset are live but unused by the site.

- Never recommend enabling live reads.
- Never re-import the dataset — `--replace` would overwrite Studio edits.
- This changes only after a controlled preview test, late in the project.

---

## Anti-patterns: reject on sight

We are in a locked cosmic visual direction. The ceiling of that direction is very
high and the floor is a 2011 crypto landing page. These are the things that take
us to the floor:

- Gradient text on more than the two approved headings
- Any glow on the cream editorial band. It is **daylight**. Its entire job is to
  make the dark sections read as dark.
- Space imagery that is space for its own sake — astronauts, floating rocks,
  shooting stars. The direction is about tools connecting around a centre. Every
  visual earns its place against that idea or it goes.
- Uniform section padding
- Card padding smaller than radius + 12px
- Paragraphs at full container width
- More than 5 nodes in the hero
- More than 3 stats in a stat band
- Broken grids (7 cards in a 4-column layout)
- Stock photography
- Fabricated proof of any kind

---

## Definition of done

```
npm run lint          # 0
npm run typecheck     # 0
npm run test          # green
npm run test:e2e      # green (see docs/ENVIRONMENT-CAPABILITIES.md first)
npm run build         # webpack — Turbopack serves broken CSS chunks here
```

Plus, for any visual phase:
- Screenshots per `docs/ENVIRONMENT-CAPABILITIES.md` tier
- Reduced-motion path verified
- Keyboard path verified
- The light budget checked: exactly one bright thing per section

**If the environment cannot run Playwright (TIER 3/4), say the visual result is
UNVERIFIED. Do not claim it looks correct. You cannot see it.**

## Working style

- Read `src/styles/tokens/` before writing CSS. Every time.
- Plan before any change touching more than 2 files.
- Update `SESSION_NOTES.md` at the end of every session: what shipped, what
  remains, what surprised you.
- Screenshot before claiming a visual task is complete.
- One phase per session. Never two.

---

## Skills

Invoke only what is relevant to the task. Do not activate speculatively. This is
a routing table, not an inventory — reach for a skill only when the "when" column
matches what you are actually doing. The full 300+ starter set was pruned to
these; the rest lives in `.claude/skills-archive/` and is recoverable from git.

| Skill | When to reach for it |
|---|---|
| `ui-ux-pro-max` | Designing or reworking a whole section/page — hierarchy, layout, interaction model. Start here for anything visual and non-trivial. |
| `frontend-design` | Implementing layout, components, and responsive patterns in React + CSS Modules. The build half of a design task. |
| `design-system` | Working the tokens in `src/styles/tokens/`, or keeping components consistent with the token system. Read the tokens first regardless. |
| `copywriting` | Writing or rewriting on-page copy — headings, body, CTAs. Apply the Voice rules above; they override generic copy advice. |
| `humanizer` | Copy reads robotic, generic, or AI-flat. Makes it natural. Pair with the banned-words list. |
| `cro` | Conversion work on the growth-plan and contact flows, or any CTA-bearing section. Respects the light budget — persuasion, not glow. |
| `seo` | On-page SEO strategy: titles, headings, internal linking, content structure across the marketing routes. |
| `seo-technical` | Technical SEO: metadata, sitemaps, canonical/robots, structured-data plumbing in the Next.js app. |
| `owasp-security` | Before shipping ANY form handler or API route (`/api/forms/*`, contact, growth-plan). Required for those, not optional. |
| `test-driven-development` | Logic-heavy work — form validation, data transforms, API integrations. Write the failing test first. |
| `write-tests` | Scaffolding a test suite for existing code that lacks coverage. |
| `context-engineering` | Before a large or ambiguous task: planning, scoping, and structuring context. Pairs with the Spec Kit stages when they apply. |
| `review-local-changes` | Reviewing the working-tree diff before a commit or PR. Run it on visual phases against the light budget and anti-patterns. |
| `commit` | Crafting a well-structured, conventional commit message. |
| `create-pr` | Opening a structured pull request. |
