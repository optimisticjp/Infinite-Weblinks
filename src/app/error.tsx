"use client";

import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/primitives/Button";
import styles from "./not-found.module.css";

/**
 * Route-level error boundary (brief §P4-04). Catches unhandled render/data errors below the
 * root layout and shows a production-safe, on-brand recovery screen instead of a raw crash.
 *
 * Privacy: we NEVER render `error.message` (it can carry request/user detail). Only the
 * framework-provided `digest` (a hash, no PII) is logged, so a production error stays
 * traceable in server logs without leaking anything. There is no fake success and no data
 * collection here — just a clear way back.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Digest only — no message body, no PII.
    console.error(`Unhandled route error${error?.digest ? ` (digest: ${error.digest})` : ""}`);
  }, [error]);

  return (
    <main className={`theme-dark ${styles.wrap}`}>
      <div className={styles.inner}>
        <Logo href="/" size={34} />
        <p className={styles.code}>Error</p>
        <h1 className={styles.title}>Something went wrong on our end.</h1>
        <p className={styles.body}>
          Sorry about that. You can try again, head back home, or email us at{" "}
          <a href="mailto:support@infiniteweblinks.com">support@infiniteweblinks.com</a> and
          we&rsquo;ll help.
        </p>
        <div className={styles.actions}>
          <Button type="button" variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}
