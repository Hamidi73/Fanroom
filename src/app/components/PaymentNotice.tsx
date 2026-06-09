"use client";

// One-shot banner for checkout outcomes (?paid=1 / ?canceled=1 / ?coins=1).
// Strips the query params from the URL on mount so a refresh or share of the
// page doesn't replay the banner, and offers a dismiss button.

import { useEffect, useState } from "react";

const STYLES: Record<string, string> = {
  paid: "border-accent/40 bg-accent/10 text-accent-soft",
  coins: "border-online/40 bg-online/10 text-online",
  canceled: "border-line bg-surface text-muted",
};

const COPY: Record<string, string> = {
  paid: "✦ Payment received — your highlighted message will appear on the stream and in chat momentarily.",
  coins: "🪙 Payment received — your Roars are being added to your wallet (a few seconds at most).",
  canceled: "Checkout canceled — no charge was made.",
};

export function PaymentNotice({ kind }: { kind: "paid" | "coins" | "canceled" }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Drop ?paid/?coins/?canceled from the address bar without a navigation.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  if (!show) return null;

  return (
    <div className={`mt-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm ${STYLES[kind]}`}>
      <p>{COPY[kind]}</p>
      <button onClick={() => setShow(false)} aria-label="Dismiss" className="shrink-0 opacity-70 transition hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
