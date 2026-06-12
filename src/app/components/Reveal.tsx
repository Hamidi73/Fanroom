"use client";

// Scroll-reveal wrapper: children fade-and-rise into place as they scroll
// into view. Built to never cost functionality:
//
//   - Server HTML renders fully visible — if JS fails, nothing is hidden.
//   - Elements already on screen at mount never animate (no load flicker).
//   - prefers-reduced-motion disables it entirely.
//   - Animates once, then disconnects — the 30s LiveRefresh re-render keeps
//     client state, so content doesn't re-animate on data updates.
//
// `delay` (ms) staggers items in a grid: delay={i * 60}.

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already in (or near) the viewport — show as-is, no animation.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState("hidden");
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState("shown");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${
        state === "hidden" ? "reveal-hidden" : state === "shown" ? "reveal-shown" : ""
      } ${className}`}
      style={delay && state !== "idle" ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
