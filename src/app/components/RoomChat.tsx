"use client";

// Real-time room chat backed by Supabase. Seeds from messages fetched on the
// server, then subscribes to new INSERTs on this room. Posting is only enabled
// for members (RLS also enforces this server-side).
//
// Twitch-style behaviours:
//   - The column flexes to fill its container (full-height rail on desktop).
//   - Auto-scroll only sticks when the reader is at the bottom; scrolling up
//     pauses it and a "new messages" pill jumps back down.
//   - The room's host gets a HOST badge on their lines.
//
// Paid "highlighted" messages (Twitch Hype Chat style): a member can pay a
// preset tier to have their message stand out. The pay button starts a Checkout
// session (Stripe card, or Coinbase Commerce crypto); the message is posted by
// the server webhook once payment is confirmed, then arrives over realtime like
// any other message — only with `highlight` set, so it renders prominently.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ChatLine } from "@/lib/types";
import { TIERS, getTier, formatAmount } from "@/lib/tiers";
import { parseStickerBody, parseGiftBody } from "@/lib/stickers";
import { getGift } from "@/lib/gifts";

type NewRow = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  highlight?: boolean;
  amount_cents?: number;
  tier?: string | null;
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function RoomChat({
  roomId,
  initial,
  currentUserId,
  hostId = null,
  canPost,
  closed = false,
  paymentsEnabled = false,
  cryptoEnabled = false,
}: {
  roomId: string;
  initial: ChatLine[];
  currentUserId: string | null;
  hostId?: string | null;
  canPost: boolean;
  closed?: boolean;
  paymentsEnabled?: boolean;
  cryptoEnabled?: boolean;
}) {
  const [messages, setMessages] = useState<ChatLine[]>(initial);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const [tierId, setTierId] = useState(TIERS[0].id);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [unseen, setUnseen] = useState(0); // messages that arrived while scrolled up
  const supabaseRef = useRef(createClient());
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true); // is the reader at (or near) the bottom?
  // Author names already resolved — avoids a profiles fetch per message.
  const namesRef = useRef<Map<string, string>>(new Map(initial.map((m) => [m.user_id, m.name])));

  const canHighlight = canPost && (paymentsEnabled || cryptoEnabled);

  // Pure DOM scroll — safe to call from effects (no state updates).
  const scrollDown = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
    pinnedRef.current = true;
  }, []);

  const jumpToLatest = useCallback(() => {
    scrollDown();
    setUnseen(0);
  }, [scrollDown]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    pinnedRef.current = nearBottom;
    if (nearBottom) setUnseen(0);
  };

  useEffect(() => {
    const supabase = supabaseRef.current;
    const names = namesRef.current;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const row = payload.new as NewRow;
          let name = names.get(row.user_id);
          if (!name) {
            const { data } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", row.user_id)
              .single();
            const resolved: string = data?.display_name ?? "Fan";
            names.set(row.user_id, resolved);
            name = resolved;
          }
          setMessages((cur) =>
            cur.some((m) => m.id === row.id)
              ? cur
              : [
                  ...cur,
                  {
                    id: row.id,
                    body: row.body,
                    created_at: row.created_at,
                    user_id: row.user_id,
                    name,
                    highlight: row.highlight ?? false,
                    amountCents: row.amount_cents ?? 0,
                    tier: row.tier ?? null,
                  },
                ],
          );
          if (!pinnedRef.current) setUnseen((n) => n + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // First paint lands at the bottom of history; after that, only follow new
  // messages while the reader is pinned there. A reader who has scrolled up
  // instead gets the "new messages" pill (count bumped where messages arrive).
  useEffect(() => {
    scrollDown("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pinnedRef.current) scrollDown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const send = async () => {
    const body = input.trim();
    if (!body || !currentUserId) return;
    setSendError(null);
    setInput("");
    const { error } = await supabaseRef.current
      .from("messages")
      .insert({ room_id: roomId, user_id: currentUserId, body });
    if (error) {
      setInput(body); // give the message back instead of losing it
      setSendError("Couldn't send — try again.");
    }
  };

  const startCheckout = async (provider: "stripe" | "crypto") => {
    const body = input.trim();
    setPayError(null);
    if (!body) {
      setPayError("Type your message first.");
      return;
    }
    setPayBusy(true);
    try {
      const res = await fetch(`/api/payments/${provider}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, body, tierId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPayError(data.error ?? "Could not start checkout.");
        setPayBusy(false);
        return;
      }
      window.location.assign(data.url); // off to Stripe / Coinbase
    } catch {
      setPayError("Could not start checkout.");
      setPayBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="live-dot" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-foreground">Live chat</h2>
      </div>

      {/* Message list */}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={onScroll} className="h-full space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) =>
              msg.highlight ? (
                <HighlightedMessage key={msg.id} msg={msg} isYou={msg.user_id === currentUserId} isHost={msg.user_id === hostId} />
              ) : (
                <div key={msg.id} className="space-y-0.5 border-b border-white/5 pb-2.5 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-accent-soft">
                      <span className="truncate">{msg.name}</span>
                      {msg.user_id === hostId && <HostBadge />}
                      {msg.user_id === currentUserId && <span className="shrink-0 font-normal text-muted">· you</span>}
                    </p>
                    <p className="shrink-0 text-xs text-muted">{timeLabel(msg.created_at)}</p>
                  </div>
                  <MessageBody body={msg.body} />
                </div>
              ),
            )
          )}
        </div>

        {unseen > 0 && (
          <button
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition hover:bg-accent-strong"
          >
            ↓ {unseen} new message{unseen === 1 ? "" : "s"}
          </button>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line px-4 py-3">
        {closed ? (
          <p className="rounded-lg bg-white/5 px-4 py-3 text-center text-sm text-muted">This room is closed.</p>
        ) : canPost ? (
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Send a message…"
                maxLength={300}
                className="min-w-0 flex-1 rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-accent/40 focus:bg-white/10"
              />
              <button
                onClick={send}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Send
              </button>
            </div>
            {sendError && <p className="text-xs text-red-400">{sendError}</p>}

            {canHighlight && (
              <div className="rounded-lg border border-line bg-white/[0.03]">
                <button
                  onClick={() => setShowHighlight((s) => !s)}
                  className="flex w-full items-center justify-between px-3.5 py-2 text-sm font-semibold text-accent-soft"
                >
                  <span>✦ Highlight your message</span>
                  <span className="text-muted">{showHighlight ? "−" : "+"}</span>
                </button>

                {showHighlight && (
                  <div className="space-y-3 border-t border-line px-3.5 py-3">
                    <p className="text-xs text-muted">
                      Pay to pin your message in a bright banner so the host and room see it.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {TIERS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTierId(t.id)}
                          className={`rounded-lg border px-2 py-2 text-center transition ${
                            tierId === t.id
                              ? "border-accent bg-accent/10"
                              : "border-line bg-white/[0.02] hover:bg-white/5"
                          }`}
                        >
                          <span className="block text-sm font-bold text-ink-foreground">{t.label}</span>
                          <span className="block text-xs text-muted">{formatAmount(t.amountCents)}</span>
                        </button>
                      ))}
                    </div>
                    {payError && <p className="text-xs text-red-400">{payError}</p>}
                    <div className="flex flex-wrap gap-2">
                      {paymentsEnabled && (
                        <button
                          onClick={() => startCheckout("stripe")}
                          disabled={payBusy}
                          className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
                        >
                          {payBusy ? "Starting…" : "Pay with card"}
                        </button>
                      )}
                      {cryptoEnabled ? (
                        <button
                          onClick={() => startCheckout("crypto")}
                          disabled={payBusy}
                          className="flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-foreground transition hover:bg-surface-2 disabled:opacity-60"
                        >
                          {payBusy ? "Starting…" : "Pay with crypto"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Crypto payments are coming soon"
                          className="flex-1 cursor-not-allowed rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-muted opacity-70"
                        >
                          Crypto · coming soon
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-white/5 px-4 py-3 text-center text-sm text-muted">
            {currentUserId ? (
              "Join the room to chat."
            ) : (
              <>
                <Link href="/login" className="text-accent-soft">Log in</Link> and join to chat.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// Message bodies can encode sticker/gift sends (written by the gift layer):
//   [sticker:<id>]  → render the actual meme image inline (WhatsApp-style)
//   [gift:<id>:<n>] → render a compact "sent a gift" line
// Anything else renders as plain text.
function MessageBody({ body }: { body: string }) {
  const sticker = parseStickerBody(body);
  if (sticker) {
    return (
      <Image
        src={sticker.image}
        alt={sticker.name}
        title={sticker.name}
        width={180}
        height={180}
        unoptimized
        className="mt-1 h-auto w-40 rounded-lg border border-white/10 shadow-md"
      />
    );
  }

  const giftSend = parseGiftBody(body);
  const gift = giftSend ? getGift(giftSend.giftId) : undefined;
  if (giftSend && gift) {
    return (
      <p className="mt-0.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-ink-foreground/90">
        <span aria-hidden="true">🎁</span>
        <span className="truncate">
          sent {gift.kind === "text" ? "" : `${gift.icon} `}
          <span className="font-bold" style={{ color: gift.color }}>{gift.name}</span>
          {giftSend.mult > 1 && <span className="font-black"> ×{giftSend.mult}</span>}
        </span>
      </p>
    );
  }

  return <p className="break-words text-sm text-ink-foreground/85">{body}</p>;
}

function HostBadge() {
  return (
    <span className="shrink-0 rounded bg-live px-1 py-px text-[9px] font-black uppercase tracking-wide text-white">
      Host
    </span>
  );
}

function HighlightedMessage({ msg, isYou, isHost }: { msg: ChatLine; isYou: boolean; isHost: boolean }) {
  const tier = getTier(msg.tier);
  return (
    <div className={`rounded-lg border p-3 ${tier?.ring ?? "border-accent/40 bg-accent/5"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${tier?.badge ?? "bg-accent/20 text-accent-soft"}`}>
          ✦ {formatAmount(msg.amountCents)}
          {tier ? ` · ${tier.label}` : ""}
        </span>
        <p className="text-xs text-muted">{timeLabel(msg.created_at)}</p>
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink-foreground">
        {msg.name}
        {isHost && <HostBadge />}
        {isYou && <span className="font-normal text-muted">· you</span>}
      </p>
      <p className="break-words text-sm text-ink-foreground/90">{msg.body}</p>
    </div>
  );
}
