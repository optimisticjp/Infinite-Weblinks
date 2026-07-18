<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR. Backward-incompatible governance shift from restriction-first
  to capability-first. Two governing principles were redefined to remove blanket
  technology, dependency, and library bans in favour of outcome-based rules
  (III Performance; V Skill Use), one new principle was added (XV Technical Freedom,
  Outcome-Bound), and a new governance section (Authorized Actions & Boundaries)
  now draws the line between decisions Claude may make and act on itself and the
  small set of actions that still require explicit user authorization. Prior wording
  that forbade Tailwind/shadcn adoption, "heavy" libraries, or "unnecessary"
  dependencies as categorical rules has been removed; the quality outcomes those
  rules were meant to protect (performance, mobile, accessibility, security, SEO,
  maintainability, secret protection, green checks) are preserved and strengthened
  as validation requirements.

Modified principles:
  I.    Spec Before Code → Spec Before Code, Right-Sized (clarified: full process
        when it adds value, lean when the requirement is already clear)
  III.  Speed Is Non-Negotiable → Performance Is a Validation Outcome (redefined:
        removed the bans on "heavy animation libraries" and "unnecessary
        dependencies"; kept Core Web Vitals / Lighthouse targets and mobile motion
        scaling as mandatory outcomes; dependencies now judged by result, not
        forbidden by category)
  V.    Selective Skill Activation → Capability-First Skill Use (redefined:
        automatically select and combine any relevant skills, no permission needed
        merely to use one; the only retained limit is not padding with unrelated
        skills)
  XI.   Spec Kit Workflow → Right-Sized Spec Kit Workflow (clarified: use the full
        workflow when it adds value; a lighter workflow is expected for small or
        already-clear work)
  XIII. Preview Without Deployment (aligned: temporary dev/preview servers may be
        run to verify work and MUST be stopped afterward)

Added principles:
  XV.   Technical Freedom, Outcome-Bound

Added sections:
  Governance → Authorized Actions & Boundaries

Removed sections: None (no principle deleted; restrictive clauses within principles
  were rewritten as outcomes)

Templates / dependent guidance requiring updates:
  ✅ .specify/templates/plan-template.md — "Constitution Check" reads dynamically
     from this file ("[Gates determined based on constitution file]"); no edit needed.
  ✅ .specify/templates/spec-template.md — no constitution-specific tokens; aligned.
  ✅ .specify/templates/tasks-template.md — no constitution-specific tokens; aligned.
  ✅ .specify/templates/checklist-template.md — generic; aligned.
  ✅ CLAUDE.md — updated in the same change to a capability-first, outcome-based
     policy; aligned with these principles.
  ✅ 21ST_DEV_GUIDE.md — updated in the same change to permit Tailwind/shadcn/21st.dev
     adoption when it produces a better result; aligned.
  ✅ README.md — user-facing; no AI-policy tokens; no edit required.

Follow-up TODOs: None. No placeholders deferred.
-->

# Web Builder Constitution

This constitution defines the permanent governing principles for this website and
web-tool project. Principles are **outcome-based**: they state the results that must
hold, not a fixed list of permitted tools. Within those outcomes Claude has broad
freedom to choose, combine, introduce, or replace skills, libraries, frameworks,
components, services, and architecture to produce the best result. Deviations from a
principle require an explicit, documented justification recorded in the relevant
project artifact (spec, plan, or Complexity Tracking). This constitution supersedes
ad-hoc preferences expressed only in chat.

## Core Principles

### I. Spec Before Code, Right-Sized
Meaningful implementation SHOULD start from a clear understanding of the outcome,
target users, requirements, constraints, and success criteria — captured in a
durable artifact so decisions are not repeatedly re-explained. The depth of that
capture MUST match the work: a real feature or a new site warrants a written spec
and plan; small or already-clear work does not. Ambiguity that could materially
change the product MUST be resolved (by asking or by a documented assumption) before
building on it; normal implementation decisions MUST NOT be blocked waiting for
permission.
Rationale: A written spec is the cheapest place to catch a wrong assumption — but
forcing heavy process onto obvious work wastes the very clarity it aims to protect.

### II. Mobile-First Is Non-Negotiable
Interfaces MUST be designed from small screens upward and MUST work correctly at
approximately 360px, 390px, 768px, 1024px, and large desktop. There MUST be no
horizontal overflow and no desktop-only interactions. Touch targets MUST be
practical. Navigation, forms, tables, pricing sections, accordions, cards, and media
MUST work cleanly on mobile.
Rationale: Most real traffic is mobile; a layout that only works on desktop is not
done.

### III. Performance Is a Validation Outcome
The delivered experience MUST meet its performance bar: Core Web Vitals green where
realistically possible, and Lighthouse mobile performance of 90+ where realistic
(95+ as a best-effort target). Images, fonts, icons, and media MUST be optimized;
non-critical assets lazy-loaded; layout shift prevented; and heavy motion, parallax,
or scroll effects scaled down or simplified on mobile and under
`prefers-reduced-motion` rather than deleted. There is **no ban on any library,
dependency, or technique by category** — animation runtimes, 3D/WebGL, canvas, and
rich effects are all fair game when they serve the design. Each dependency MUST earn
its place by the result it enables and MUST NOT regress the performance bar; weight
that buys nothing SHOULD be removed.
Rationale: Performance is a feature and a ranking factor. The goal is a fast result,
achieved with whatever tools deliver it — not a shorter dependency list for its own
sake.

### IV. Deliberate Design, Not Generic
A coherent visual direction MUST be chosen and held: a primary aesthetic (with at
most one secondary accent), a primary emotional feel, a primary layout system, a
deliberate animation vocabulary, and clear typography and color systems. Unrelated
trends MUST NOT be mixed into "style soup," and generic, unconsidered defaults MUST
NOT be the fallback. Ambitious, vibrant, experimental, animated interfaces are
encouraged where the direction calls for them.
Rationale: A chosen, constrained direction reads as intentional; unconstrained
mixing reads as generic. This constrains coherence, not ambition.

### V. Capability-First Skill Use
Claude MUST automatically select and use any skills directly relevant to the task,
and SHOULD combine multiple skills when that produces a better result. No permission
is required merely to use a skill — skills are tools, not gated actions. The only
limit is relevance: unrelated skills MUST NOT be activated just to increase count or
pad a response, because that wastes context and degrades output.
Rationale: Relevance beats both scarcity and volume; the right skills, used freely
and combined, raise quality, while speculative activation lowers it.

### VI. Human-Sounding Content
Copy MUST avoid generic AI language, inflated marketing claims, excessive em dashes,
repeated rule-of-three phrasing, and vague hype. Clear meaning MUST be preserved, and
tone MUST match the actual audience and brand.
Rationale: Trust comes from copy that sounds like a real person who understands the
reader, not a template.

### VII. SEO Is Part of the Build
Every public website MUST consider, where relevant: semantic page structure; titles
and meta descriptions; heading hierarchy; crawlability; canonical strategy;
structured data; sitemap and robots handling; internal linking; image alt text;
performance; and AI-search / GEO / AEO considerations.
Rationale: SEO decisions are cheapest at build time and expensive to retrofit.

### VIII. Accessibility Is Part of the Build
Builds MUST use semantic HTML, keyboard-accessible interactions, visible focus
states, proper labels, meaningful alternative text, sufficient contrast,
reduced-motion support, and accessible forms and error handling. WCAG 2.1 AA is the
default baseline where practical.
Rationale: Accessibility is a correctness and inclusion requirement, not an optional
polish step.

### IX. Security Is Part of the Build
OWASP-style thinking MUST be applied where relevant: validate inputs; protect
secrets and keep them out of the client and out of `.env.example`; never hardcode
credentials; review authentication and authorization; secure forms and APIs;
minimize permissions; review third-party scripts; handle environment variables
correctly; assess dependency risk; and perform a pre-launch security check. New
server surfaces (endpoints, form handlers) MUST get a security review.
Rationale: A single exposed secret or unvalidated input can undo an entire build.

### X. Test Important Behavior
Test-driven development SHOULD be used when practical for logic-heavy code. For
meaningful functionality, acceptance criteria SHOULD be defined first, critical user
flows tested, and regressions prevented. Trivial presentation details need not be
over-tested. The relevant checks for a change — lint, typecheck, unit, end-to-end +
accessibility, and build — MUST pass before it is considered done.
Rationale: Tests protect the behavior that matters; testing everything equally wastes
effort and slows delivery.

### XI. Right-Sized Spec Kit Workflow
For new production websites and meaningful features, the Spec Kit workflow
(constitution → specify → clarify → plan → checklist → tasks → analyze → implement →
converge) is the default and SHOULD be used when it adds value; `implement` MUST NOT
run before the spec and plan are sufficiently clear. A lighter workflow is expected
for small, low-risk, or already-clear work — a long planning cycle MUST NOT be forced
onto obvious changes.
Rationale: The workflow front-loads clarity when clarity is scarce; forcing it where
the answer is already clear is process for its own sake.

### XII. Efficient Context
Concise artifacts MUST be preferred over repeatedly re-explaining the project in
chat. Full file contents MUST NOT be pasted unless requested. Summaries MUST focus on
decisions, changed files, checks, blockers, and next actions. Large builds SHOULD be
broken into phases with handoff notes kept for future sessions.
Rationale: Context is a finite resource; spending it on repetition starves the work
that needs it.

### XIII. Preview Without Deployment
The user works entirely in the cloud. Reviewing progress MUST NOT require Codespaces,
a local-machine workflow, or a production deployment. Temporary development or
preview servers MAY be started to build and verify work and MUST be stopped after
verification. When a live preview is unavailable, a concise build report and the
safest cloud-based review path MUST be provided.
Rationale: Review must fit the user's actual environment, and verification should not
depend on shipping to production.

### XIV. Definition of Done
A website is not done merely because it builds. Before completion the following MUST
be verified: requirements implemented; mobile behavior correct; visual direction
coherent; important copy humanized; SEO basics present; accessibility basics present;
security checks complete; relevant tests passing; build and lint checks passing where
available; no obvious unfinished placeholders remaining; performance bar met and any
notable performance trade-offs documented; and remaining gaps identified through
convergence.
Rationale: "Done" is a verified checklist, not a successful build command.

### XV. Technical Freedom, Outcome-Bound
Claude MAY use or introduce any suitable skill, library, framework, component source,
service, API, database, testing tool, build tool, architecture, or refactor when the
task justifies it — including Tailwind, shadcn/ui, 21st.dev components, CSS Modules,
new npm packages, client and server components, GSAP, Motion, Three.js/WebGL/canvas/
shaders/SVG, and external component sources. The current stack MUST NOT be preserved
merely because it already exists; it SHOULD be preserved when it remains the best
choice for the result and changed when a better result clearly justifies the change.
Major architectural choices SHOULD be explained briefly and then acted on; they do
not require prior permission. This freedom is bound by, and never overrides, the
quality outcomes in Principles II–X and XIV: a tool choice that regresses mobile
quality, performance, accessibility, security, SEO, correctness, maintainability, or
secret protection is not justified by freedom.
Rationale: The result is what matters. Blanket technology bans optimize for a stack
instead of an outcome; outcome-bound freedom lets the best tool win while the quality
bar stays fixed.

## Governance

Authority: This constitution supersedes ad-hoc practices and chat-only preferences.
When a principle conflicts with a convenience, the principle wins unless a documented,
approved exception exists.

Compliance: Every plan produced via the Spec Kit workflow MUST pass the Constitution
Check gate before Phase 0 research and be re-checked after Phase 1 design. Any
violation MUST be recorded in the plan's Complexity Tracking table with the reason it
is needed and why a simpler, compliant alternative was rejected. Unjustified
violations MUST be resolved before implementation.

### Authorized Actions & Boundaries
To produce working, verified results without needless friction, Claude MAY, as part
of normal work and without asking permission first: create branches; edit files; add
or remove dependencies; run temporary development or preview servers (stopping them
after verification); run migrations in safe development or throwaway environments;
run lint, typecheck, tests, and builds; commit changes; push branches; and open pull
requests. Claude SHOULD optimize for the requested result rather than the smallest
possible change, and SHOULD explain a major architectural choice briefly, then
proceed.

Explicit user authorization IS required before: deploying to production; making
destructive changes to production data; rotating, exposing, or otherwise handling
secrets in exposure-sensitive ways; any paid purchase or action that creates a
charge; and deleting important remote resources (repositories, branches with
unmerged work, releases, remote environments). When in doubt about whether an action
crosses one of these lines, ask.

Amendment procedure: Amendments MUST be proposed as an edit to this file with a Sync
Impact Report describing the change, the version bump, and any dependent templates or
guidance requiring updates. Dependent artifacts (`.specify/templates/*`, `CLAUDE.md`,
`21ST_DEV_GUIDE.md`, and runtime guidance) MUST be re-checked for alignment when
principles are added, removed, or materially changed.

Versioning policy: This constitution follows semantic versioning.
- MAJOR: backward-incompatible governance changes or principle removals/redefinitions.
- MINOR: a new principle or section, or materially expanded guidance.
- PATCH: clarifications, wording, and non-semantic refinements.

Scope: These principles are defaults for web builds. Data-heavy, scientific, or
research work MAY invoke additional skills and standards, but MUST NOT weaken the
security, accessibility, performance, and Definition-of-Done requirements above.

**Version**: 2.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-18
