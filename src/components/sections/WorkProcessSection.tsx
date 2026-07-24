import { SectionShell } from "@/components/sections/SectionShell";
import { ProcessStepList } from "@/components/routes/ProcessStepList";
import { getProcessSteps } from "@/lib/content";

/**
 * WorkProcessSection — the V2 replacement for the legacy ProcessStepsSection on /how-it-works
 * (the legacy section stays for its registry mapping; it is not enabled on the homepage). It loads
 * the real process steps and renders them as a ProcessStepList inside a SectionShell
 * (id="process", explicit V2 surface, the existing eyebrow/title/intro). SectionShell derives its
 * heading id from the section id, so there is no hard-coded duplicate heading id. Server Component.
 */
export async function WorkProcessSection({ surface = "light" }: { surface?: "light" | "alt" }) {
  const steps = await getProcessSteps();
  if (steps.length === 0) return null;

  return (
    <SectionShell
      surface={surface}
      id="process"
      align="start"
      eyebrow="How we work"
      title="One connected process, start to finish"
      lead="The same sequence runs behind every project, whether it covers one stage or the whole journey."
    >
      <ProcessStepList
        steps={steps.map((s) => ({
          order: s.order,
          title: s.title,
          description: s.description,
          icon: s.icon,
        }))}
      />
    </SectionShell>
  );
}
