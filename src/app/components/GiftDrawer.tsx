"use client";

// The gift tray. A floating 🎁 button opens a bottom-sheet drawer with pack
// tabs (Reactions / Atmosphere / Legendary / Mythic + the six continent packs
// of nation legends), a gift grid, and a ×1/×5/×10 combo multiplier — the
// streaming-app pattern (TikTok/Bigo). The room's own nation legend is pinned
// in a "Featured" tab so its fans see their gift first.

import { useState } from "react";
import Link from "next/link";
import {
  activePacks,
  giftsInPack,
  featuredGiftForNation,
  getGift,
  RARITY,
  ECONOMY,
  type Gift,
  type GiftPackId,
} from "@/lib/gifts";
import { useRoomGifts } from "./RoomGiftsProvider";

const MULTIPLIERS = [1, 5, 10] as const;

// A few crowd-pleasers to round out the Featured tab alongside the room's nation.
const FEATURED_EXTRAS = ["vuvuzela", "confetti-burst", "stadium-roar", "golden-goal"];

export function GiftDrawer({
  nationSlug,
  isLoggedIn,
  isClosed,
}: {
  nationSlug: string | null;
  isLoggedIn: boolean;
  isClosed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mult, setMult] = useState<(typeof MULTIPLIERS)[number]>(1);
  const featured = featuredGiftForNation(nationSlug);
  const [tab, setTab] = useState<GiftPackId | "featured">(featured ? "featured" : "reactions");

  const { balance, canAfford, sendGift, openStore, muted, toggleMuted } = useRoomGifts();

  if (isClosed) return null;

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl shadow-lg shadow-accent/30 transition hover:bg-accent-strong"
        aria-label="Log in to send gifts"
      >
        🎁
      </Link>
    );
  }

  const tabs: { id: GiftPackId | "featured"; label: string; icon: string }[] = [
    ...(featured ? [{ id: "featured" as const, label: "Featured", icon: "⭐" }] : []),
    ...activePacks(),
  ];

  const featuredGifts: Gift[] = [
    ...(featured ? [featured] : []),
    ...FEATURED_EXTRAS.map(getGift).filter((g): g is Gift => !!g),
  ];
  const gifts = tab === "featured" ? featuredGifts : giftsInPack(tab);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl shadow-lg shadow-accent/30 transition hover:scale-105 hover:bg-accent-strong"
        aria-label="Send a gift"
      >
        🎁
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center sm:justify-end" onClick={() => setOpen(false)}>
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl border border-line bg-ink-deep shadow-2xl sm:m-4 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: balance + recharge + mute */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <button onClick={openStore} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-bold text-ink-foreground transition hover:bg-surface">
                <span>{ECONOMY.coinSymbol}</span>
                <span>{balance.toLocaleString()}</span>
                <span className="ml-1 text-accent-soft">+ Recharge</span>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={toggleMuted} aria-label={muted ? "Unmute" : "Mute"} className="rounded-lg px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-ink-foreground">
                  {muted ? "🔇" : "🔊"}
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-ink-foreground">
                  ✕
                </button>
              </div>
            </div>

            {/* Pack tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2 [scrollbar-width:none]">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    tab === t.id ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-ink-foreground"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Gift grid */}
            <div className="grid grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-4">
              {gifts.map((g) => {
                const affordable = canAfford(g.id, mult);
                return (
                  <button
                    key={g.id}
                    onClick={() => sendGift(g.id, mult)}
                    title={g.name}
                    className="group flex flex-col items-center gap-1 rounded-xl border bg-surface p-2 text-center transition hover:-translate-y-0.5 hover:bg-surface-2"
                    style={{ borderColor: `${RARITY[g.rarity].color}55` }}
                  >
                    <span className="text-3xl transition group-hover:scale-110" style={{ filter: `drop-shadow(0 0 6px ${RARITY[g.rarity].glow})` }}>
                      {g.icon}
                    </span>
                    <span className="line-clamp-1 w-full text-[10px] font-semibold text-ink-foreground">{g.name}</span>
                    <span className={`flex items-center gap-0.5 text-[11px] font-black ${affordable ? "text-accent-soft" : "text-muted"}`}>
                      {ECONOMY.coinSymbol} {g.priceRoars.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Multiplier */}
            <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
              <span className="text-xs font-semibold text-muted">Combo</span>
              <div className="flex gap-1.5">
                {MULTIPLIERS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMult(m)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-black transition ${
                      mult === m ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-ink-foreground"
                    }`}
                  >
                    ×{m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
