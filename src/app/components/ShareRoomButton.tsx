"use client";

// Copy-the-room-link button (Twitch-style share). Uses the native share sheet
// on devices that have one, otherwise copies to the clipboard.

import { useState } from "react";

export function ShareRoomButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} — FanRoom Global`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  };

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-foreground transition hover:bg-surface"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M12 5.5a2 2 0 1 0-1.9-2.6L6 5a2 2 0 1 0 0 2.9l4.1 2.1a2 2 0 1 0 .5-1.2L6.5 6.7a2 2 0 0 0 0-.5L10.6 4c.36.4.86.66 1.4.7z" fill="currentColor" />
      </svg>
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
