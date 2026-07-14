"use client";

import { useCallback, useEffect, useRef } from "react";
import { turnstileSiteKey } from "@/lib/forms/config";
import styles from "./Turnstile.module.css";

export interface TurnstileFieldProps {
  /** Called with the solved token, or `null` when it expires/errors. */
  onToken: (token: string | null) => void;
  /** Called once if the widget can't render at all (no site key, or the script failed to
   * load) — callers treat the submission as "skipped" client-side; the server makes the
   * real decision either way via `verifyTurnstile`. */
  onSkipped?: () => void;
  className?: string;
}

/** Minimal typing for the parts of the Cloudflare Turnstile browser API we use. */
interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
    },
  ) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loaderPromise: Promise<TurnstileApi | null> | null = null;

/**
 * Load Cloudflare's official Turnstile script once and resolve with the browser API.
 * Using the vanilla script (rather than a bundled React wrapper) keeps Turnstile a pure
 * runtime, credential-gated integration: no npm dependency to install, nothing for the
 * bundler to resolve, and the whole thing is inert until a site key is configured.
 */
function loadTurnstile(): Promise<TurnstileApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<TurnstileApi | null>((resolve) => {
    const settleWhenReady = () => {
      let tries = 0;
      const tick = () => {
        if (window.turnstile) return resolve(window.turnstile);
        if (tries++ > 50) return resolve(null); // ~5s cap, then give up gracefully
        window.setTimeout(tick, 100);
      };
      tick();
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (existing) {
      if (window.turnstile) resolve(window.turnstile);
      else existing.addEventListener("load", settleWhenReady, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.addEventListener("load", settleWhenReady, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

  return loaderPromise;
}

/**
 * Cloudflare Turnstile widget. Renders nothing (and reports `onSkipped`) whenever no
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is configured or the script can't load, so the forms
 * stay fully usable on a preview without keys. The server never trusts the client's token
 * alone — see `src/lib/forms/turnstile.ts`.
 */
export function TurnstileField({ onToken, onSkipped, className }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);
  const skip = useCallback(() => {
    if (!reported.current) {
      reported.current = true;
      onSkipped?.();
    }
  }, [onSkipped]);

  useEffect(() => {
    const siteKey = turnstileSiteKey;
    if (!siteKey) {
      skip();
      return;
    }

    let cancelled = false;
    let widgetId: string | null = null;

    loadTurnstile().then((api) => {
      if (cancelled) return;
      if (!api || !containerRef.current) {
        skip();
        return;
      }
      try {
        widgetId = api.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
          theme: "auto",
        });
      } catch {
        skip();
      }
    });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* widget already gone */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!turnstileSiteKey) return null;

  return <div ref={containerRef} className={[styles.wrap, className].filter(Boolean).join(" ")} />;
}
