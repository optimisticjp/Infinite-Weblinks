"use client";

import { useEffect } from "react";

/**
 * Root error boundary (brief §P4-04). Catches errors in the ROOT layout itself, where the
 * normal layout/chrome/CSS-module tree is unavailable — so this file must render its own
 * <html>/<body> and cannot rely on CSS Modules or design tokens. It uses inline styles only.
 *
 * Same privacy contract as error.tsx: never render `error.message`; log the digest only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(`Unhandled root error${error?.digest ? ` (digest: ${error.digest})` : ""}`);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#07050f",
          color: "#f6f4ff",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.5rem" }}>Something went wrong.</h1>
          <p style={{ color: "#c4bedc", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            Sorry — an unexpected error occurred. Please try again, or email{" "}
            <a href="mailto:support@infiniteweblinks.com" style={{ color: "#b571ff" }}>
              support@infiniteweblinks.com
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "44px",
              padding: "0 24px",
              borderRadius: "999px",
              border: 0,
              cursor: "pointer",
              color: "#fff",
              fontWeight: 700,
              backgroundImage: "linear-gradient(90deg, #d1005f 0%, #c94f00 100%)",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
