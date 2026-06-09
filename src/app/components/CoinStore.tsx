"use client";

// Roar recharge store. Shows the coin bundles with their bonus tiers (the bonus
// scales up to pull buyers toward the bigger packs).
//
// DEMO: there is no Stripe wiring yet, so "buy" just credits the local demo
// wallet. Real money requires a backend (Stripe Checkout → webhook → wallet
// table) — wired separately. The banner makes that explicit so nothing on the
// live site looks like it's charging a card.

import { COIN_BUNDLES, ECONOMY, type CoinBundle } from "@/lib/gifts";
import { playCoinSound } from "@/lib/giftSound";

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CoinStore({
  balance,
  onClose,
  onCredit,
}: {
  balance: number;
  onClose: () => void;
  onCredit: (roars: number) => void;
}) {
  const buy = (b: CoinBundle) => {
    // PAYMENT SEAM — replace with a Stripe Checkout call that credits the wallet
    // on webhook confirmation. For now (demo) we credit locally.
    playCoinSound();
    onCredit(b.totalRoars);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl border border-line bg-ink-deep p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="display text-xl">Get {ECONOMY.coinName}</h2>
            <p className="text-xs text-muted">
              Balance: <span className="font-bold text-ink-foreground">{ECONOMY.coinSymbol} {balance.toLocaleString()}</span>
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg px-2 py-1 text-muted hover:bg-surface-2 hover:text-ink-foreground">
            ✕
          </button>
        </div>

        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-200/90">
          Demo — no card is charged yet. {ECONOMY.coinName} are a one-way virtual currency (not cashable). Purchases require 18+ once payments go live.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {COIN_BUNDLES.map((b) => (
            <button
              key={b.id}
              onClick={() => buy(b)}
              className="relative flex flex-col items-center gap-1 rounded-xl border border-line bg-surface p-3 text-center transition hover:border-accent/60 hover:bg-surface-2"
            >
              {b.badge && (
                <span className="absolute -top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                  {b.badge === "popular" ? "Popular" : "Best value"}
                </span>
              )}
              <span className="text-2xl">{ECONOMY.coinSymbol}</span>
              <span className="text-sm font-black text-ink-foreground">{b.totalRoars.toLocaleString()}</span>
              {b.bonusPct > 0 && <span className="text-[10px] font-bold text-accent-soft">+{Math.round(b.bonusPct * 100)}% bonus</span>}
              <span className="mt-0.5 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-soft">{usd(b.usdPriceCents)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
