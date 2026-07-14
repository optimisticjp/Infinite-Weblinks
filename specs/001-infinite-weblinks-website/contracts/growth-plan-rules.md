# Contract — Growth Plan Builder Recommendation Rules

Phase 1 contract. Defines the **reviewed, rule-based** logic that turns Growth Plan Builder inputs into a
structured recommendation. This is the site's most business-critical logic and the **primary TDD target**
(see `design/testing.md`).

## Hard rules (brief §15)
- The builder is a **guided form, not a free AI recommendation engine**.
- Recommendations come from **reviewed rules stored as structured content/data** (`growthPlanRuleSet` in
  the CMS — see `data-model.md`).
- **AI may later phrase an approved result** (rewording the human-approved output), but MUST NOT decide
  the recommendation logic or invent services/tools.
- Outputs are **illustrative, not guarantees** (Growth Guide "What we don't do" voice — no promised
  numbers).

## Inputs → Output

**Inputs** (validated per `contracts/forms-and-email.md`):
`businessType`, `currentStage` (one of 8), `mainGoal`, `existingSetup`, `engagementPreference`
(6 neutral ranges), `timeline`.

**Output** — `GrowthPlanResult` (exact fields, brief §15):
| Field | Meaning |
|---|---|
| `startHere[]` | The immediate first step(s) — stage(s)/service(s) to begin with |
| `connectNext[]` | What to connect once the foundation is in place |
| `addLater[]` | What can wait |
| `relevantCapabilities[]` | Capabilities/services that apply to their situation |
| `exampleTools[]` | Example tools "we can connect" (never "partners") |
| `expectedOutcomes[]` | The *kind* of result the work is built to produce (not promised numbers) |
| `howWeHelp` | Plain-English statement incl. the relevant delivery model(s) + ownership line |
| `matchedRuleId` | Which rule produced this (traceability / testing) |

## Rule engine behaviour (deterministic, pure)
```
resolve(inputs, ruleSet):
  candidates = ruleSet.rules
    .filter(r => matches(r.when, inputs))     # each `when` key omitted = wildcard
    .sort(by specificity desc, then priority desc)
  chosen = candidates[0] ?? ruleSet.fallback  # fallback = "prefer to discuss by email"
  return compose(chosen.then, inputs)         # dereference stage/service/tool refs → labels
```
- **Pure function**: same inputs + same rule set → same output. No randomness, no network, no AI at
  decision time. Lives in `src/lib/growth-plan/` and is unit-tested exhaustively.
- **Specificity**: a rule matching more input keys wins over a broader one; ties broken by explicit
  `priority`. Documented ordering so results are predictable and reviewable.
- **Fallback**: if nothing matches (or `engagementPreference = "Prefer to discuss by email"` /
  `"Not sure yet"`), return a safe, encouraging default that routes to the email-led contact path — never
  an empty or guessed result.
- **Grounding**: `startHere/connectNext/addLater/exampleTools` reference **real** CMS documents
  (`growthStage`, `service`, `tool`); the engine only surfaces what editors have created and Verified.

## Rule shape (in CMS, `growthPlanRuleSet.rules[]`)
```
{
  id: "ecom-traffic-no-sales",
  when: { businessType: "ecommerce", currentStage: "get-discovered", mainGoal: "turn-visitors-into-buyers" },
  then: {
    startHere:   [ref:service "CRO, Conversion Rate Optimization", ref:stage "Build Trust"],
    connectNext: [ref:service "Email Marketing & Automation", ref:service "Cart Recovery"],
    addLater:    [ref:service "Loyalty Program Setup"],
    capabilities:[ "Conversion work on pages & funnel", "Reviews & proof", "Lifecycle email" ],
    exampleTools:[ref:tool "Hotjar", ref:tool "VWO", ref:tool "Klaviyo"],
    expectedOutcomes:[ "A higher share of visitors taking action", "More repeat orders over time" ],
    howWeHelp: "We handle CRO in-house (We Do the Work) and set up your email tools (You Run It After). You own every account.",
  },
  priority: 10
}
```
The example values above are **derived from the Growth Guide** taxonomy (goals→services→tools mapping,
pp.5–13) and are seed content for editors to review and Verify — not hard-coded in the app.

## Seeding source (Growth Guide → rules)
Initial rule seeds map the Guide's goal table (p.5), starting-point table (p.4) and roadmaps (p.20–21)
into `when → then` rules, covering at minimum:
- Ecommerce brand paths (store build → traffic → convert → retain → scale).
- Creator paths (brand/site + email → grow one platform → monetise course/membership).
- Service/local business paths (site + local SEO + CRM → funnel/ads/booking-by-form → reviews/automation).
- Established brand paths (audit + tracking → CRO + retention → automation/new markets).
- "Running ads but not profitable" (audit + fix tracking → fix funnel/offer → rebuild campaigns).
- "Needs automation" and "brand new / still an idea" paths.
Every seed is stored as `contentStatus: placeholder/approvalRequired` until the team **reviews and
Verifies** it — so no unreviewed advice ships.

## Governance
- The rule set has a `status` (reviewed/approved) and `version`; only approved sets are used in
  production. Editing rules is a content task (in Studio), not a code change.
- Changing labels/tools/outcomes is a CMS edit; changing the *engine* (matching/specificity) is a code
  change guarded by unit tests.

## Testing (see `design/testing.md`)
- **Unit (Vitest), near-complete coverage**: matching, specificity ordering, wildcard `when`, fallback,
  reference dereferencing, and a table of representative input combinations → expected `matchedRuleId`.
- **Property checks**: any valid input combination yields a non-empty, well-formed result (never throws,
  never empty).
- **Content integrity**: referenced stages/services/tools exist and are Verified before a rule is
  marked approved (build-time or CI check).
