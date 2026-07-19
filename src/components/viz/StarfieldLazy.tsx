"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary for the starfield's lazy load. `next/dynamic` with `ssr:false` is only
 * allowed inside a Client Component, so this thin wrapper keeps CosmicBackground (and the
 * sections that use it) as Server Components while still loading the canvas as a separate
 * client-only chunk that never touches the server render or the critical path.
 */
const Starfield = dynamic(() => import("./Starfield").then((m) => m.Starfield), {
  ssr: false,
});

export function StarfieldLazy({ density }: { density?: number }) {
  return <Starfield density={density} />;
}
