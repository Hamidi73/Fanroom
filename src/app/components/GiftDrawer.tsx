"use client";

// The gift tray. A floating 🎁 button opens a bottom-sheet drawer with pack
// tabs (Reactions / Atmosphere / Legendary / Mythic + the six continent packs
// of nation legends), a gift grid, and a ×1/×5/×10 combo multiplier — the
// streaming-app pattern (TikTok/Bigo). The room's own nation legend is pinned
// in a "Featured" tab so its fans see their gift first.

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  activePacks,
  giftsInPack,
  featuredGiftForNation,
  getGift,
  RARITY,
  type Gift,
  type GiftPackId,
} from "@/lib/gifts";
import { emojiArt } from "@/lib/gifts";
import { STICKER_PACKS, stickersInPack, type StickerPackId } from "@/lib/stickers";
import { GiftIcon, Coin } from "./GiftIcon";
import { useRoomGifts } from "./RoomGiftsProvider";

type DrawerTab = GiftPackId | StickerPackId | "featured";

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
  const [tab, setTab] = useState<DrawerTab>(featured ? "featured" : "reactions");

  const tabStripRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (dir: number) => tabStripRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });

  const { balance, canAfford, canAffordSticker, sendGift, sendSticker, openStore, muted, toggleMuted } = useRoomGifts();

  if (isClosed) return null;

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 transition hover:bg-accent-strong lg:left-5 lg:right-auto"
        aria-label="Log in to send gifts"
      >
        <Image src={emojiArt("🎁")} alt="" width={30} height={30} unoptimized />
      </Link>
    );
  }

  const tabs: { id: DrawerTab; label: string; icon: string }[] = [
    ...(featured ? [{ id: "featured" as const, label: "Featured", icon: "⭐" }] : []),
    ...STICKER_PACKS,
    ...activePacks(),
  ];

  const featuredGifts: Gift[] = [
    ...(featured ? [featured] : []),
    ...FEATURED_EXTRAS.map(getGift).filter((g): g is Gift => !!g),
  ];
  const stickerPack = STICKER_PACKS.find((p) => p.id === tab);
  const gifts = stickerPack ? [] : tab === "featured" ? featuredGifts : giftsInPack(tab as GiftPackId);

  return (
    <>
      {/* Desktop: bottom-LEFT so it never covers the chat composer in the
          right-hand rail; mobile keeps the familiar bottom-right spot. */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 transition hover:scale-105 hover:bg-accent-strong lg:left-5 lg:right-auto"
        aria-label="Send a gift"
      >
        <Image src={emojiArt("🎁")} alt="" width={30} height={30} unoptimized />
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center sm:justify-end lg:justify-start" onClick={() => setOpen(false)}>
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl border border-line bg-ink-deep shadow-2xl sm:m-4 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: balance + recharge + mute */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <button onClick={openStore} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-bold text-ink-foreground transition hover:bg-surface">
                <Coin size={18} />
                <span>{balance.toLocaleString()}</span>
                <span className="ml-1 text-accent-soft">+ Recharge</span>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={toggleMuted} aria-label={muted ? "Unmute" : "Mute"} className="rounded-lg px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-ink-foreground">
                  <SpeakerIcon muted={muted} />
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-ink-foreground">
                  ✕
                </button>
              </div>
            </div>

            {/* Pack tabs with scroll controls */}
            <div className="flex items-center gap-1 border-b border-line px-1.5 py-2">
              <button
                onClick={() => scrollTabs(-1)}
                aria-label="Scroll packs left"
                className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink-foreground"
              >
                <Chevron dir="left" />
              </button>
              <div
                ref={tabStripRef}
                className="flex flex-1 gap-1 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      tab === t.id ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-ink-foreground"
                    }`}
                  >
                    <Image src={emojiArt(t.icon)} alt="" width={15} height={15} unoptimized />
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollTabs(1)}
                aria-label="Scroll packs right"
                className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink-foreground"
              >
                <Chevron dir="right" />
              </button>
            </div>

            {/* Sticker grid — real meme images, sent straight into chat + stream */}
            {stickerPack && (
              <div className="grid grid-cols-3 gap-2 overflow-y-auto p-3">
                {stickersInPack(stickerPack.id).map((st) => {
                  const affordable = canAffordSticker(st.id);
                  return (
                    <button
                      key={st.id}
                      onClick={() => sendSticker(st.id)}
                      title={st.name}
                      className="group flex flex-col items-center gap-1 rounded-xl border border-line bg-surface p-1.5 text-center transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface-2"
                    >
                      <Image
                        src={st.image}
                        alt={st.name}
                        width={140}
                        height={140}
                        unoptimized
                        className="h-20 w-full rounded-lg object-cover transition group-hover:scale-[1.04]"
                      />
                      <span className="line-clamp-1 w-full text-[10px] font-semibold text-ink-foreground">{st.name}</span>
                      <span className={`flex items-center gap-1 text-[11px] font-black ${affordable ? "text-accent-soft" : "text-muted"}`}>
                        <Coin size={12} /> {st.priceRoars.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Gift grid */}
            <div className={`grid grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-4 ${stickerPack ? "hidden" : ""}`}>
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
                    {g.kind === "text" ? (
                      <span
                        className="flex h-9 items-center rounded-lg px-2 text-base font-black uppercase italic leading-none text-white transition group-hover:scale-110"
                        style={{ background: g.color }}
                      >
                        {g.icon}
                      </span>
                    ) : (
                      <span className="flex h-9 items-center transition group-hover:scale-110" style={{ filter: `drop-shadow(0 0 6px ${RARITY[g.rarity].glow})` }}>
                        <GiftIcon gift={g} size={34} wave={false} />
                      </span>
                    )}
                    <span className="line-clamp-1 w-full text-[10px] font-semibold text-ink-foreground">{g.name}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-black ${affordable ? "text-accent-soft" : "text-muted"}`}>
                      <Coin size={12} /> {g.priceRoars.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Multiplier (gifts only — stickers always send one at a time) */}
            {!stickerPack && (
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
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6v4h2.5L8 13V3L4.5 6H2Z" fill="currentColor" />
      {muted ? (
        <path d="m10.5 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 4a6 6 0 0 1 0 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={dir === "left" ? "rotate-180" : ""}
    >
      <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
