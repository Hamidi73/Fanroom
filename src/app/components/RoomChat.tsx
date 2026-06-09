"use client";

// Real-time room chat backed by Supabase. Seeds from messages fetched on the
// server, then subscribes to new INSERTs on this room. Posting is only enabled
// for members (RLS also enforces this server-side).
//
// Paid "highlighted" messages (Twitch Hype Chat style): a member can pay a
// preset tier to have their message stand out. The pay button starts a Checkout
// session (Stripe card, or Coinbase Commerce crypto); the message is posted by
// the server webhook once payment is confirmed, then arrives over realtime like
// any other message — only with `highlight` set, so it renders prominently.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ChatLine } from "@/lib/types";
import { TIERS, getTier, formatAmount } from "@/lib/tiers";

type NewRow = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  highlight?: boolean;
  amount_cents?: number;
  tier?: string | null;
};

export function RoomChat({
  roomId,
  initial,
  currentUserId,
  canPost,
  closed = false,
  paymentsEnabled = false,
  cryptoEnabled = false,
}: {
  roomId: string;
  initial: ChatLine[];
  currentUserId: string | null;
  canPost: boolean;
  closed?: boolean;
  paymentsEnabled?: boolean;
  cryptoEnabled?: boolean;
}) {
  const [messages, setMessages] = useState<ChatLine[]>(initial);
  const [input, setInput] = useState("");
  const [showHighlight, setShowHighlight] = useState(false);
  const [tierId, setTierId] = useState(TIERS[0].id);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const bottomRef = useRef<HTMLDivElement>(null);

  const canHighlight = canPost && (paymentsEnabled || cryptoEnabled);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const row = payload.new as NewRow;
          const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", row.user_id)
            .single();
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
                    name: data?.display_name ?? "Fan",
                    highlight: row.highlight ?? false,
                    amountCents: row.amount_cents ?? 0,
                    tier: row.tier ?? null,
                  },
                ],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = input.trim();
    if (!body || !currentUserId) return;
    setInput("");
    await supabaseRef.current.from("messages").insert({ room_id: roomId, user_id: currentUserId, body });
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
      window.location.href = data.url; // off to Stripe / Coinbase
    } catch {
      setPayError("Could not start checkout.");
      setPayBusy(false);
    }
  };

  return (
    <div className="space-y-4 p-6 sm:p-8">
      <h2 className="display flex items-center gap-2 text-lg">
        <span className="live-dot" /> Live chat
      </h2>

      <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg bg-white/5 p-4">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) =>
            msg.highlight ? (
              <HighlightedMessage key={msg.id} msg={msg} isYou={msg.user_id === currentUserId} />
            ) : (
              <div key={msg.id} className="space-y-1 border-b border-white/5 pb-3 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-accent-soft">
                    {msg.name}
                    {msg.user_id === currentUserId && <span className="text-muted"> · you</span>}
                  </p>
                  <p className="text-xs text-muted">{new Date(msg.created_at).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm text-muted">{msg.body}</p>
              </div>
            ),
          )
        )}
        <div ref={bottomRef} />
      </div>

      {closed ? (
        <p className="rounded-lg bg-white/5 px-4 py-3 text-center text-sm text-muted">This room is closed.</p>
      ) : canPost ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Send a message…"
              maxLength={300}
              className="flex-1 rounded-lg border border-line bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-accent/40 focus:bg-white/10"
            />
            <button
              onClick={send}
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Send
            </button>
          </div>

          {canHighlight && (
            <div className="rounded-lg border border-line bg-white/[0.03]">
              <button
                onClick={() => setShowHighlight((s) => !s)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-accent-soft"
              >
                <span>✦ Highlight your message</span>
                <span className="text-muted">{showHighlight ? "−" : "+"}</span>
              </button>

              {showHighlight && (
                <div className="space-y-3 border-t border-line px-4 py-3">
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
  );
}

function HighlightedMessage({ msg, isYou }: { msg: ChatLine; isYou: boolean }) {
  const tier = getTier(msg.tier);
  return (
    <div className={`rounded-lg border p-3 ${tier?.ring ?? "border-accent/40 bg-accent/5"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${tier?.badge ?? "bg-accent/20 text-accent-soft"}`}>
          ✦ {formatAmount(msg.amountCents)}
          {tier ? ` · ${tier.label}` : ""}
        </span>
        <p className="text-xs text-muted">{new Date(msg.created_at).toLocaleTimeString()}</p>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-ink-foreground">
        {msg.name}
        {isYou && <span className="text-muted"> · you</span>}
      </p>
      <p className="text-sm text-ink-foreground/90">{msg.body}</p>
    </div>
  );
}
