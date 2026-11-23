"use client";

import { useEffect, useRef, useState } from "react";

/** Stagger index for `.st` children of a deck slide or a `.reveal-group` section. */
export const st = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** Keeps heavy content mounted briefly after it stops being shown, so it can fade out. */
export function useLinger(active: boolean, ms = 700) {
  const [on, setOn] = useState(active);
  useEffect(() => {
    if (active) return setOn(true);
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [active, ms]);
  return on;
}

/** Counts toward a number once active; exponential ease-out, optionally on a log scale for huge ranges. */
export function useCount(active: boolean, from: number, to: number, ms: number, delay = 300, log = false) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!active) return setV(from);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(to);
    let raf = 0;
    const t0 = performance.now() + delay;
    const loop = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setV(log ? from * Math.pow(to / from, e) : from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, from, to, ms, delay, log]);
  return v;
}

/** A highlighter that sweeps across once active. */
export function Swept({ active, delay, tone = "var(--mark-caution)", children }: { active: boolean; delay: number; tone?: string; children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active) return setOn(false);
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return (
    <span className="sweep" data-on={on} style={{ "--sweep": tone } as React.CSSProperties}>
      {children}
    </span>
  );
}

/**
 * `seen` turns on the first time the element scrolls into view and stays on (entrance motion plays once);
 * `near` tracks whether it is close to the viewport, so WebGL scenes only run while they can be seen.
 */
export function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const once = new IntersectionObserver(([e]) => e?.isIntersecting && setSeen(true), { threshold });
    const around = new IntersectionObserver(([e]) => setNear(Boolean(e?.isIntersecting)), { rootMargin: "200px 0px" });
    once.observe(el);
    around.observe(el);
    return () => {
      once.disconnect();
      around.disconnect();
    };
  }, [threshold]);
  return { ref, seen, near };
}
