"use client";

// Realtime gift layer for a room. Owns:
//   • a Supabase broadcast channel (`room-gifts-<id>`) so a gift sent by anyone
//     animates on EVERYONE's screen — the whole point of live gifting;
//   • a local demo Roar wallet + combo tracking;
//   • the on-screen overlay: flying gifts, the combo meter, and full-screen
//     "whale" takeovers.
//
// Gifts broadcast is EPHEMERAL — no DB write, no RLS surface. Charging real
// money for Roars is a separate backend step (Stripe + a wallet table); until
// then the wallet here is a local demo balance (see CoinStore). Sending never
// touches money — it only emits an animation event to the room.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGift, COMBO, type Gift } from "@/lib/gifts";
import { playGiftSound, setGiftSoundMuted } from "@/lib/giftSound";
import { CoinStore } from "./CoinStore";

const WELCOME_ROARS = 500; // demo wallet seed so the tray is instantly playable

type GiftEvent = { giftId: string; sender: string; mult: number; combo: number };

type FlyingGift = { key: string; gift: Gift; combo: number; left: number; sender: string };
type Takeover = { key: string; gift: Gift; sender: string };

type RoomGiftsContextValue = {
  balance: number;
  combo: { giftId: string; count: number } | null;
  muted: boolean;
  sendGift: (giftId: string, mult?: number) => void;
  canAfford: (giftId: string, mult?: number) => boolean;
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
  children,
}: {
  roomId: string;
  senderName: string;
  children: ReactNode;
}) {
  const [balance, setBalance] = useState(WELCOME_ROARS);
  const [flying, setFlying] = useState<FlyingGift[]>([]);
  const [takeover, setTakeover] = useState<Takeover | null>(null);
  const [combo, setCombo] = useState<{ giftId: string; count: number } | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const supabaseRef = useRef(createClient());
  const sendRef = useRef<((event: GiftEvent) => void) | null>(null);
  const comboRef = useRef<{ giftId: string; count: number; at: number }>({ giftId: "", count: 0, at: 0 });
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keySeq = useRef(0);

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

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`room-gifts-${roomId}`, { config: { broadcast: { self: true } } });
    channel.on("broadcast", { event: "gift" }, ({ payload }) => render(payload as GiftEvent)).subscribe();
    sendRef.current = (event) => {
      void channel.send({ type: "broadcast", event: "gift", payload: event });
    };
    return () => {
      sendRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, render]);

  const canAfford = useCallback(
    (giftId: string, mult = 1) => {
      const gift = getGift(giftId);
      return !!gift && balance >= gift.priceRoars * mult;
    },
    [balance],
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
      setBalance((b) => b - cost);

      // Combo: consecutive sends of the same gift within the window stack up.
      const now = Date.now();
      const prev = comboRef.current;
      const count = prev.giftId === giftId && now - prev.at < COMBO.windowMs ? prev.count + 1 : 1;
      comboRef.current = { giftId, count, at: now };
      setCombo({ giftId, count });
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(null), COMBO.windowMs);

      sendRef.current?.({ giftId, sender: senderName, mult, combo: count });
    },
    [balance, senderName],
  );

  const openStore = useCallback(() => setStoreOpen(true), []);
  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      setGiftSoundMuted(!m);
      return !m;
    });
  }, []);

  return (
    <Ctx.Provider value={{ balance, combo, muted, sendGift, canAfford, openStore, toggleMuted }}>
      {children}

      {/* Overlay — floats over everything, ignores clicks. */}
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        {flying.map((f) => (
          <div
            key={f.key}
            className={`absolute bottom-24 flex flex-col items-center ${CELEBRATION_ANIM[f.gift.celebration].cls}`}
            style={{ left: `${f.left}%` }}
          >
            <span className="text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" style={{ filter: `drop-shadow(0 0 14px ${f.gift.color})` }}>
              {f.gift.icon}
            </span>
            {f.combo > 1 && (
              <span className="mt-1 rounded-full px-2 py-0.5 text-sm font-black text-white" style={{ background: f.gift.color }}>
                ×{f.combo}
              </span>
            )}
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

      {storeOpen && <CoinStore balance={balance} onClose={() => setStoreOpen(false)} onCredit={(roars) => setBalance((b) => b + roars)} />}
    </Ctx.Provider>
  );
}
