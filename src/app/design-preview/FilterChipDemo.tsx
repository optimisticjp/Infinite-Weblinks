"use client";

import { useState } from "react";
import { FilterChip } from "@/components/primitives/FilterChip";

const OPTIONS = ["Websites", "SEO & Content", "Paid Ads", "Automation"];

/** Small interactive demo of FilterChip toggling (aria-pressed) for the preview board. */
export function FilterChipDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["SEO & Content"]));
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
      {OPTIONS.map((o) => (
        <FilterChip
          key={o}
          selected={selected.has(o)}
          onClick={() =>
            setSelected((prev) => {
              const next = new Set(prev);
              if (next.has(o)) next.delete(o);
              else next.add(o);
              return next;
            })
          }
        >
          {o}
        </FilterChip>
      ))}
    </div>
  );
}
