"use client";

// Roar recharge store. Shows the coin bundles with their bonus tiers (the bonus
// scales up to pull buyers toward the bigger packs).
//
// Buying is REAL: it starts a Stripe Checkout session (server-priced) and the
// wallet is credited by the webhook once payment confirms — the same flow as
// paid highlights. In test mode use card 4242 4242 4242 4242.

import { useState } from "react";
import { COIN_BUNDLES, ECONOMY, type CoinBundle } from "@/lib/gifts";
import { Coin } from "./GiftIcon";

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CoinStore({
  balance,
  paymentsEnabled,
  onClose,
}: {
  balance: number;
  paymentsEnabled: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buy = async (b: CoinBundle) => {
    if (!paymentsEnabled) {
      setError("Coin purchases aren't available yet.");
      return;
    }
    setBusy(b.id);
    setError(null);
    try {
      const res = await fetch("/api/payments/coins/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId: b.id, returnTo: window.location.pathname }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setBusy(null);
        return;
      }
      window.location.assign(data.url); // off to Stripe Checkout
    } catch {
      setError("Could not start checkout.");
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border border-line bg-ink-deep p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="display text-xl">Get {ECONOMY.coinName}</h2>
            <p className="text-xs text-muted">
              Balance: <span className="font-bold text-ink-foreground"><Coin size={13} /> {balance.toLocaleString()}</span>
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg px-2 py-1 text-muted hover:bg-surface-2 hover:text-ink-foreground">
            ✕
          </button>
        </div>

        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-200/90">
          Test mode — use card 4242 4242 4242 4242 (any future expiry / CVC). {ECONOMY.coinName} are a one-way virtual
          currency (not cashable). Purchases require 18+ once live.
        </p>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {COIN_BUNDLES.map((b) => (
            <button
              key={b.id}
              onClick={() => buy(b)}
              disabled={busy !== null}
              className="relative flex flex-col items-center gap-1 rounded-xl border border-line bg-surface p-3 text-center transition hover:border-accent/60 hover:bg-surface-2 disabled:opacity-60"
            >
              {b.badge && (
                <span className="absolute -top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-black">
                  {b.badge === "popular" ? "Popular" : "Best value"}
                </span>
              )}
              <Coin size={28} />
              <span className="text-sm font-black text-ink-foreground">{b.totalRoars.toLocaleString()}</span>
              {b.bonusPct > 0 && <span className="text-[10px] font-bold text-accent-soft">+{Math.round(b.bonusPct * 100)}% bonus</span>}
              <span className="mt-0.5 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-soft">
                {busy === b.id ? "Opening…" : usd(b.usdPriceCents)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
