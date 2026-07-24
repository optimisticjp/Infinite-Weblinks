"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { StatusScreen } from "@/components/routes/StatusScreen";

/**
 * Route error boundary. Catches render/data errors in the app segments and shows the same
 * calm V2 status screen as the 404, with a "Try again" that re-runs the failed segment. Kept
 * self-contained (no chrome), like the 404, so it always renders even when a layout's data is
 * the thing that failed. Client Component (the boundary + reset() require it).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to logging/telemetry in the browser console for diagnosis.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="Something went wrong"
      title="That didn't load as it should"
      body="A hiccup on our side, not yours. Try again in a moment, or head back and pick things up from a page that's working."
      actions={
        <>
          <Button onClick={() => reset()} size="lg" iconRight={<RotateCcw size={18} aria-hidden="true" />}>
            Try again
          </Button>
          <Button href="/" variant="secondary" size="lg">
            Back to home
          </Button>
        </>
      }
      links={[
        { label: "How it works", href: "/how-it-works" },
        { label: "Services", href: "/services" },
        { label: "Growth plan", href: "/growth-plan" },
        { label: "Contact", href: "/contact" },
      ]}
    />
  );
}
