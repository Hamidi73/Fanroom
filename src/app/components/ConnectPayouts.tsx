"use client";

// Button a host clicks to set up (or finish setting up) Stripe payouts. Calls
// /api/payments/connect/start and redirects to Stripe's hosted onboarding. The
// parent decides the wording via `hasAccount` (start vs. continue).

import { useState } from "react";

export function ConnectPayouts({ hasAccount }: { hasAccount: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/connect/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start payout setup.");
        setBusy(false);
        return;
      }
      window.location.href = data.url; // off to Stripe onboarding
    } catch {
      setError("Could not start payout setup.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={start}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
      >
        {busy ? "Opening Stripe…" : hasAccount ? "Finish payout setup" : "Set up payouts with Stripe"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
