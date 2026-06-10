"use client";

// Realtime gift layer for a room. Owns:
//   • a Supabase broadcast channel (`room-gifts-<id>`) so a gift sent by anyone
//     animates on EVERYONE's screen — the whole point of live gifting;
//   • the user's Roar wallet (real, server-backed) + combo tracking;
//   • the on-screen overlay: flying gifts, the combo meter, and full-screen
//     "whale" takeovers.
//
// Money model: Roars are bought for real via Stripe (CoinStore → webhook credits
// the `wallets` table). The balance here is loaded from that wallet; sending a
// gift debits it atomically through the `spend_roars` RPC (optimistic UI, then
// reconciled). Gift broadcasts themselves are EPHEMERAL — no DB write.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getGift, COMBO, type Gift } from "@/lib/gifts";
import { getSticker, stickerBody, giftBody, type Sticker } from "@/lib/stickers";
import { playGiftSound, setGiftSoundMuted } from "@/lib/giftSound";
import { CoinStore } from "./CoinStore";

type GiftEvent = { giftId: string; sender: string; mult: number; combo: number };
type StickerEvent = { stickerId: string; sender: string };

type FlyingGift = { key: string; gift: Gift; combo: number; left: number; sender: string };
type FlyingSticker = { key: string; sticker: Sticker; left: number; sender: string };
type Takeover = { key: string; gift: Gift; sender: string };

type RoomGiftsContextValue = {
  balance: number;
  combo: { giftId: string; count: number } | null;
  muted: boolean;
  sendGift: (giftId: string, mult?: number) => void;
  sendSticker: (stickerId: string) => void;
  canAfford: (giftId: string, mult?: number) => boolean;
  canAffordSticker: (stickerId: string) => boolean;
  openStore: () => void;
  toggleMuted: () => void;
};

const Ctx = createContext<RoomGiftsContextValue | null>(null);

export function useRoomGifts(): RoomGiftsContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useRoomGifts must be used inside <RoomGiftsProvider>");
  return value;
}

const CELEBRATION_ANIM: Record<Gift["celebration"], { cls: string; ms: number }> = {
  pop: { cls: "gift-anim-pop", ms: 2600 },
  rise: { cls: "gift-anim-rise", ms: 3000 },
  "spin-jump": { cls: "gift-anim-spin", ms: 2800 },
  "knee-slide": { cls: "gift-anim-slide", ms: 2600 },
  dribble: { cls: "gift-anim-sway", ms: 3000 },
  bicycle: { cls: "gift-anim-arc", ms: 2800 },
  header: { cls: "gift-anim-pop", ms: 2600 },
  dance: { cls: "gift-anim-sway", ms: 3200 },
  charge: { cls: "gift-anim-charge", ms: 2800 },
  roar: { cls: "gift-anim-pulse", ms: 2800 },
  takeover: { cls: "gift-anim-rise", ms: 3000 },
};

export function RoomGiftsProvider({
  roomId,
  senderName,
  loggedIn = false,
  paymentsEnabled = false,
  children,
}: {
  roomId: string;
  senderName: string;
  loggedIn?: boolean;
  paymentsEnabled?: boolean;
  children: ReactNode;
}) {
  const [balance, setBalance] = useState(0);
  const [flying, setFlying] = useState<FlyingGift[]>([]);
  const [flyingStickers, setFlyingStickers] = useState<FlyingSticker[]>([]);
  const [takeover, setTakeover] = useState<Takeover | null>(null);
  const [combo, setCombo] = useState<{ giftId: string; count: number } | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const supabaseRef = useRef(createClient());
  const userIdRef = useRef<string | null>(null);
  const sendRef = useRef<((event: GiftEvent) => void) | null>(null);
  const sendStickerRef = useRef<((event: StickerEvent) => void) | null>(null);
  const comboRef = useRef<{ giftId: string; count: number; at: number }>({ giftId: "", count: 0, at: 0 });
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keySeq = useRef(0);

  // Load (and seed) the wallet balance from the server. Refetch when the tab
  // regains focus so a coin purchase made on the Stripe tab shows up.
  useEffect(() => {
    if (!loggedIn) return;
    const supabase = supabaseRef.current;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) userIdRef.current = data.user?.id ?? null;
    });
    const refresh = async () => {
      const { data, error } = await supabase.rpc("get_or_seed_wallet");
      if (active && !error && data != null) setBalance(Number(data));
    };
    void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loggedIn]);

  // Render an incoming gift event (fired for every client, including the sender).
  const render = useCallback((evt: GiftEvent) => {
    const gift = getGift(evt.giftId);
    if (!gift) return;
    playGiftSound(gift.sound, evt.combo);

    const isTakeover = gift.fullScreen || evt.combo >= COMBO.takeoverStreak;
    if (isTakeover) {
      const key = `t${keySeq.current++}`;
      setTakeover({ key, gift, sender: evt.sender });
      window.setTimeout(() => setTakeover((t) => (t?.key === key ? null : t)), 4200);
    }

    // Spawn one flyer per unit sent (capped so a ×99 combo doesn't melt the DOM).
    const units = Math.min(evt.mult, 12);
    const spawned: FlyingGift[] = Array.from({ length: units }, () => {
      const key = `g${keySeq.current++}`;
      const left = 8 + Math.random() * 78;
      const item: FlyingGift = { key, gift, combo: evt.combo, left, sender: evt.sender };
      const ms = CELEBRATION_ANIM[gift.celebration].ms;
      window.setTimeout(() => setFlying((list) => list.filter((f) => f.key !== key)), ms);
      return item;
    });
    setFlying((list) => [...list, ...spawned].slice(-40));
  }, []);

  // Render an incoming sticker event — a real meme image flies up the stream.
  const renderSticker = useCallback((evt: StickerEvent) => {
    const sticker = getSticker(evt.stickerId);
    if (!sticker) return;
    playGiftSound("pop", 1);
    const key = `s${keySeq.current++}`;
    const left = 12 + Math.random() * 60;
    setFlyingStickers((list) => [...list, { key, sticker, left, sender: evt.sender }].slice(-12));
    window.setTimeout(() => setFlyingStickers((list) => list.filter((f) => f.key !== key)), 3000);
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`room-gifts-${roomId}`, { config: { broadcast: { self: true } } });
    channel
      .on("broadcast", { event: "gift" }, ({ payload }) => render(payload as GiftEvent))
      .on("broadcast", { event: "sticker" }, ({ payload }) => renderSticker(payload as StickerEvent))
      .subscribe();
    sendRef.current = (event) => {
      void channel.send({ type: "broadcast", event: "gift", payload: event });
    };
    sendStickerRef.current = (event) => {
      void channel.send({ type: "broadcast", event: "sticker", payload: event });
    };
    return () => {
      sendRef.current = null;
      sendStickerRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, render, renderSticker]);

  const canAfford = useCallback(
    (giftId: string, mult = 1) => {
      const gift = getGift(giftId);
      return !!gift && balance >= gift.priceRoars * mult;
    },
    [balance],
  );

  const canAffordSticker = useCallback(
    (stickerId: string) => {
      const sticker = getSticker(stickerId);
      return !!sticker && balance >= sticker.priceRoars;
    },
    [balance],
  );

  // Persist a send into the room's chat history (gifts/stickers shouldn't be
  // screen-only moments — they show up as chat lines like on TikTok/Twitch).
  const postChatLine = useCallback(
    (body: string) => {
      const userId = userIdRef.current;
      if (!userId) return;
      void supabaseRef.current.from("messages").insert({ room_id: roomId, user_id: userId, body });
    },
    [roomId],
  );

  const sendGift = useCallback(
    (giftId: string, mult = 1) => {
      const gift = getGift(giftId);
      if (!gift) return;
      const cost = gift.priceRoars * mult;
      if (balance < cost) {
        setStoreOpen(true); // out of Roars → recharge
        return;
      }

      // Optimistic debit for snappy UX; the server is the source of truth.
      setBalance((b) => b - cost);
      void supabaseRef.current.rpc("spend_roars", { amount: cost }).then(({ error }) => {
        if (error) {
          setBalance((b) => b + cost); // refund on failure (e.g. insufficient)
          setStoreOpen(true);
        }
      });

      // Combo: consecutive sends of the same gift within the window stack up.
      const now = Date.now();
      const prev = comboRef.current;
      const count = prev.giftId === giftId && now - prev.at < COMBO.windowMs ? prev.count + 1 : 1;
      comboRef.current = { giftId, count, at: now };
      setCombo({ giftId, count });
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(null), COMBO.windowMs);

      sendRef.current?.({ giftId, sender: senderName, mult, combo: count });
      postChatLine(giftBody(giftId, mult));
    },
    [balance, senderName, postChatLine],
  );

  const sendSticker = useCallback(
    (stickerId: string) => {
      const sticker = getSticker(stickerId);
      if (!sticker) return;
      if (balance < sticker.priceRoars) {
        setStoreOpen(true);
        return;
      }
      setBalance((b) => b - sticker.priceRoars);
      void supabaseRef.current.rpc("spend_roars", { amount: sticker.priceRoars }).then(({ error }) => {
        if (error) {
          setBalance((b) => b + sticker.priceRoars);
          setStoreOpen(true);
        }
      });
      sendStickerRef.current?.({ stickerId, sender: senderName });
      postChatLine(stickerBody(stickerId)); // the sticker lives on in chat
    },
    [balance, senderName, postChatLine],
  );

  const openStore = useCallback(() => setStoreOpen(true), []);
  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      setGiftSoundMuted(!m);
      return !m;
    });
  }, []);

  return (
    <Ctx.Provider
      value={{ balance, combo, muted, sendGift, sendSticker, canAfford, canAffordSticker, openStore, toggleMuted }}
    >
      {children}

      {/* Overlay — floats over everything, ignores clicks. */}
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        {flying.map((f) => (
          <div
            key={f.key}
            className={`absolute bottom-24 flex flex-col items-center ${CELEBRATION_ANIM[f.gift.celebration].cls}`}
            style={{ left: `${f.left}%` }}
          >
            {f.gift.kind === "text" ? (
              <span
                className="display rounded-2xl px-5 py-2 text-4xl font-black uppercase italic tracking-tight text-white"
                style={{ background: f.gift.color, boxShadow: `0 6px 26px ${f.gift.color}` }}
              >
                {f.gift.icon}
              </span>
            ) : (
              <span className="text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" style={{ filter: `drop-shadow(0 0 14px ${f.gift.color})` }}>
                {f.gift.icon}
              </span>
            )}
            {f.combo > 1 && (
              <span className="mt-1 rounded-full px-2 py-0.5 text-sm font-black text-white" style={{ background: f.gift.color }}>
                ×{f.combo}
              </span>
            )}
          </div>
        ))}

        {flyingStickers.map((f) => (
          <div
            key={f.key}
            className="absolute bottom-24 flex flex-col items-center gift-anim-rise"
            style={{ left: `${f.left}%` }}
          >
            <Image
              src={f.sticker.image}
              alt={f.sticker.name}
              width={160}
              height={160}
              unoptimized
              className="h-auto w-36 rotate-[-3deg] rounded-xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:w-44"
            />
            <span className="mt-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white">{f.sender}</span>
          </div>
        ))}

        {takeover && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gift-takeover" style={{ background: `radial-gradient(circle at center, ${takeover.gift.color}33, transparent 70%)` }}>
            <span className="text-[9rem] leading-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.7)]">{takeover.gift.icon}</span>
            <span className="mt-2 display text-3xl text-white drop-shadow">{takeover.gift.name}</span>
            <span className="mt-1 text-sm font-bold uppercase tracking-wider" style={{ color: takeover.gift.color }}>
              sent by {takeover.sender}
            </span>
          </div>
        )}
      </div>

      {/* Combo meter (sender's own streak). */}
      {combo && combo.count > 1 && (
        <div key={combo.count} className="pointer-events-none fixed bottom-28 left-1/2 z-[61] -translate-x-1/2 gift-combo-pop">
          <span className="display text-6xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            <span className="text-accent">×{combo.count}</span> COMBO
          </span>
        </div>
      )}

      {storeOpen && <CoinStore balance={balance} paymentsEnabled={paymentsEnabled} onClose={() => setStoreOpen(false)} />}
    </Ctx.Provider>
  );
}
