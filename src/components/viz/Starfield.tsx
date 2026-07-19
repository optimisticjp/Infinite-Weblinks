"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/motion";
import styles from "./Starfield.module.css";

type StarfieldProps = {
  /** Star density per 10,000px² of canvas. Kept low so the scene never costs paint. */
  density?: number;
  /** Hard cap on the particle count, whatever the viewport. */
  maxStars?: number;
  className?: string;
};

type Star = {
  x: number;
  y: number;
  r: number;
  base: number; // base opacity
  amp: number; // twinkle amplitude
  phase: number; // twinkle phase
  speed: number; // twinkle speed
  hue: string;
};

const HUES = [
  "255, 255, 255",
  "196, 190, 220",
  "139, 59, 255",
  "34, 211, 238",
  "245, 25, 126",
];

/**
 * Starfield — a lightweight, capped canvas starfield for the deep-space background. It is
 * loaded lazily (never on the critical path) and is purely decorative (aria-hidden). Three
 * cost guards keep it cheap: the particle count is capped and scaled down on small screens,
 * the render loop pauses whenever the canvas scrolls out of view, and under
 * `prefers-reduced-motion` it draws a single static frame with no animation loop at all.
 */
export function Starfield({ density = 0.9, maxStars = 90, className }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = prefersReducedMotion();
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let start = 0;

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function build() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fewer stars on small screens; hard cap regardless of area.
      const area = width * height;
      const mobile = width < 640;
      const target = Math.min(
        maxStars,
        Math.round((area / 10000) * density * (mobile ? 0.55 : 1)),
      );
      stars = Array.from({ length: target }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(0.4, 1.4),
        base: rand(0.15, 0.7),
        amp: rand(0.05, 0.35),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.4, 1.1),
        hue: HUES[Math.floor(rand(0, HUES.length))],
      }));
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      const time = (t - start) / 1000;
      for (const s of stars) {
        const twinkle = reduce ? 0 : Math.sin(time * s.speed + s.phase) * s.amp;
        const alpha = Math.max(0, Math.min(1, s.base + twinkle));
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.hue}, ${alpha})`;
        ctx!.fill();
      }
    }

    function frame(t: number) {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (running || reduce) return;
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    build();
    // Draw one complete static frame immediately, so the field is present even if the
    // animation loop never starts (reduced motion, or paused off-screen).
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else pause();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
    };
  }, [density, maxStars]);

  return (
    <canvas
      ref={canvasRef}
      className={[styles.canvas, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}

export default Starfield;
