# Cross-Artifact Analysis (spec ↔ plan ↔ tasks ↔ traceability)

## Consistency checks
- **Coverage:** every traceability IMPLEMENT row maps to at least one task (T-code) and one affected-file set. ✅
- **No orphan tasks:** every task cites a traceability ID. ✅
- **No contradiction:** preservation rows (§C) and avoid rows (§D) are consistent with plan's "additive, no foundation swap" approach. ✅
- **Truth invariant:** proof/pricing/location/metrics requirements resolve to either honest interim implementation or BLOCKED — never fabrication. Enforced by content gating + `content-integrity`/`sitemap-consistency` tests. ✅
- **Sequencing:** regression protection (visual + gating tests) precedes visual redesign, per review §16/§17 and P0-05. ✅

## Risk hot-spots flagged for implement/verify
1. CTA gradient change touches many consumers (Button primary/brand, header promo, header CTAs, mobile-nav CTAs, active-nav underline) — verify all via axe + visual.
2. Homepage compression must not regress overflow/heading order — guarded by layout/homepage e2e.
3. New motion must keep reduced-motion e2e green and never opacity-fade text — transform-only rule.
4. Builder step changes must not break `growth-plan` unit tests or deterministic recompute in the API route.

## Ambiguities → resolutions (autonomous where normal)
- Builder length → 6 (D-04). Hero → REF-07 (D-03). Proof → interim (D-01). Pricing → qualification (D-02). Geography → blocked (D-05). Sanity → documented (D-06).

No blocking inconsistencies. Cleared to implement.
