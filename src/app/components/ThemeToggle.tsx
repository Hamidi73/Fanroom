"use client";

// Light / dark theme switch. The active theme is a `data-theme` attribute on
// <html>; an inline script in app/layout.tsx sets it before first paint from
// localStorage. This button flips that attribute and persists the choice.
//
// We read the current theme with useSyncExternalStore so the server snapshot
// (dark, the brand default) matches SSR with no hydration mismatch, and the UI
// re-syncs to the real value right after hydration and on every toggle.

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}
function getSnapshot(): Theme {
  return (document.documentElement.getAttribute("data-theme") as Theme) === "light" ? "light" : "dark";
}
function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable (private mode) — theme still applies for the session */
    }
    window.dispatchEvent(new Event("themechange"));
  }, []);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-surface-2 hover:text-ink-foreground"
    >
      {isLight ? (
        // Sun — currently light, tap for dark
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9 13 13M13 3l-1.1 1.1M4.1 11.9 3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : (
        // Moon — currently dark, tap for light
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13.5 9.3A5.5 5.5 0 0 1 6.7 2.5a5.5 5.5 0 1 0 6.8 6.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
