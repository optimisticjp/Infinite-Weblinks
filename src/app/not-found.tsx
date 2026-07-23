import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { StatusScreen } from "@/components/routes/StatusScreen";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Global 404. Rendered inside the root layout (so the brand fonts and sprite are available)
 * but outside the marketing chrome, so it stays self-contained: the calm V2 StatusScreen — a
 * restrained brand mark, a plain message, and clear ways back into the site.
 */
export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="We couldn't find that page"
      body="The link may be old or mistyped. Here are a few good places to pick things back up, or start a plan built around your goals."
      actions={
        <>
          <Button href="/" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
            Back to home
          </Button>
          <Button href="/growth-plan" variant="secondary" size="lg">
            Build my growth plan
          </Button>
        </>
      }
      links={[
        { label: "How it works", href: "/how-it-works" },
        { label: "Services", href: "/services" },
        { label: "Tools", href: "/tools" },
        { label: "Contact", href: "/contact" },
      ]}
    />
  );
}
