import { SectionShell } from "@/components/sections/SectionShell";
import { ConnectedSystemFlow } from "@/components/routes/ConnectedSystemFlow";

/**
 * ConnectedSystemExplainerSection — the V2 replacement for the legacy OneSystemSection on
 * /how-it-works (the legacy homepage section is left untouched). SectionShell (id="how-it-connects",
 * explicit V2 surface, plain title with no gradient word, the existing lead) wrapping the
 * ConnectedSystemFlow. It preserves the meaning — separate parts leak effort; connected, they feed
 * one another; the loop strengthens when the pieces work together — WITHOUT the fake floating
 * dashboard cards. Server Component.
 */
export function ConnectedSystemExplainerSection({ surface = "light" }: { surface?: "light" | "alt" }) {
  return (
    <SectionShell
      surface={surface}
      id="how-it-connects"
      align="start"
      eyebrow="One system, not silos"
      title="Separate parts leak effort. Connected, they compound."
      lead="Most businesses run their website, marketing and tools as separate pieces. When they feed each other, the same effort goes further every month."
    >
      <ConnectedSystemFlow />
    </SectionShell>
  );
}
