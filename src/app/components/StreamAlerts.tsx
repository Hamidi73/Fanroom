"use client";

// On-stream alerts for paid (highlighted) chat messages — the Twitch-style
// banner that pops over the live video when someone pays to highlight a message.
//
// Self-contained: it opens its OWN realtime subscription on this room's messages
// (separate channel from RoomChat) and, when a highlighted message arrives, shows
// a tier-specific animated banner over the video — with a confetti burst.
//
// Timing rules (requested):
//   - A highlighted message waits PRE_DELAY (10s) before it appears on the feed.
//   - Alerts play strictly one at a time: a message is shown in full, and only
//     after it leaves do we wait another 10s before the next queued one appears.
//
// Bigger tiers look bolder, throw more confetti, and linger longer (durations
// from src/lib/tiers.ts). Visual styles/animations live in globals.css
// (.stream-alert--{tier}, .fr-confetti). Decorative + read-only (pointer-events
// off) so it never blocks the video controls; respects prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTier, formatAmount } from "@/lib/tiers";

type ConfettiPiece = {
  id: number;
  left: number; // %
  delay: number; // s
  duration: number; // s
  color: string;
  w: number; // px
  h: number; // px
};

type AlertItem = {
  key: number; // message id — unique render key
  name: string;
  body: string;
  amountCents: number;
  tier: string | null;
  leaving: boolean;
  confetti: ConfettiPiece[];
};

type NewRow = {
  id: number;
  body: string;
  user_id: string;
  highlight?: boolean;
  amount_cents?: number;
  tier?: string | null;
};

// Per-tier presentation. Class strings are literal so Tailwind/our CSS keep them.
const TIER_UI: Record<string, { cls: string; icon: string; sparkles: boolean; confetti: number }> = {
  spotlight: { cls: "stream-alert--spotlight", icon: "✦", sparkles: false, confetti: 14 },
  featured: { cls: "stream-alert--featured", icon: "★", sparkles: false, confetti: 22 },
  headliner: { cls: "stream-alert--headliner", icon: "👑", sparkles: true, confetti: 36 },
};

const CONFETTI_COLORS = ["#9147ff", "#bf94ff", "#e0a3ff", "#ffffff", "#ffd56b", "#5ce1e6"];

const PRE_DELAY = 10000; // wait before an alert appears on the feed (and between alerts)
const EXIT_MS = 450; // must match the fr-alert-out duration in globals.css

function makeConfetti(tier: string | null): ConfettiPiece[] {
  const count = TIER_UI[tier ?? ""]?.confetti ?? 14;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 1.8 + Math.random() * 1.6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    w: 5 + Math.random() * 4,
    h: 8 + Math.random() * 6,
  }));
}

export function StreamAlerts({ roomId }: { roomId: string }) {
  const [current, setCurrent] = useState<AlertItem | null>(null);
  const queueRef = useRef<AlertItem[]>([]);
  const busyRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const timers = timersRef.current;
    const seen = new Set<number>();

    const playNext = () => {
      const next = queueRef.current.shift();
      if (!next) {
        busyRef.current = false;
        return;
      }
      busyRef.current = true;

      // Hold for PRE_DELAY before showing (initial delay + gap between alerts).
      timers.push(
        setTimeout(() => {
          setCurrent({ ...next, leaving: false });
          const duration = getTier(next.tier)?.alertDurationMs ?? 12000;
          timers.push(
            setTimeout(() => {
              setCurrent((c) => (c ? { ...c, leaving: true } : c));
              timers.push(
                setTimeout(() => {
                  setCurrent(null);
                  playNext();
                }, EXIT_MS),
              );
            }, duration),
          );
        }, PRE_DELAY),
      );
    };

    const channel = supabase
      .channel(`alerts-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const row = payload.new as NewRow;
          if (!row.highlight || seen.has(row.id)) return;
          seen.add(row.id);

          const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", row.user_id)
            .single();

          queueRef.current.push({
            key: row.id,
            name: data?.display_name ?? "Fan",
            body: row.body,
            amountCents: row.amount_cents ?? 0,
            tier: row.tier ?? null,
            leaving: false,
            confetti: makeConfetti(row.tier ?? null),
          });
          if (!busyRef.current) playNext();
        },
      )
      .subscribe();

    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
      queueRef.current = [];
      busyRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  if (!current) return null;

  const ui = TIER_UI[current.tier ?? ""] ?? TIER_UI.spotlight;
  const tier = getTier(current.tier);
  const isHeadliner = current.tier === "headliner";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md">
        {/* Confetti burst (rains over and past the banner; behind the card so
            the text stays readable). Hidden while leaving. */}
        {!current.leaving && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 overflow-visible">
            {current.confetti.map((p) => (
              <span
                key={p.id}
                className="fr-confetti"
                style={{
                  left: `${p.left}%`,
                  width: `${p.w}px`,
                  height: `${p.h}px`,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}
          </div>
        )}

        <div
          key={current.key}
          className={`stream-alert ${ui.cls} ${current.leaving ? "is-leaving" : ""} px-4 py-3`}
        >
          {ui.sparkles && (
            <>
              <span className="stream-alert__sparkle right-3 top-2" style={{ animationDelay: "0s" }}>
                ✨
              </span>
              <span className="stream-alert__sparkle bottom-2 left-3" style={{ animationDelay: "0.7s" }}>
                ✨
              </span>
            </>
          )}
          <div className="relative flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide ${
                isHeadliner ? "text-white" : "text-accent-soft"
              }`}
            >
              <span className="text-sm">{ui.icon}</span>
              {tier?.label ?? "Highlight"}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                isHeadliner ? "bg-white/25 text-white" : "bg-accent/25 text-accent-soft"
              }`}
            >
              {formatAmount(current.amountCents)}
            </span>
          </div>
          <p className="relative mt-1 text-sm font-bold text-white">{current.name}</p>
          <p className={`relative text-sm ${isHeadliner ? "text-white/95" : "text-ink-foreground/90"}`}>
            {current.body}
          </p>
        </div>
      </div>
    </div>
  );
}
