"use client";

// Real-time room chat backed by Supabase. Seeds from messages fetched on the
// server, then subscribes to new INSERTs on this room. Posting is only enabled
// for members (RLS also enforces this server-side).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ChatLine } from "@/lib/types";

export function RoomChat({
  roomId,
  initial,
  currentUserId,
  canPost,
  closed = false,
}: {
  roomId: string;
  initial: ChatLine[];
  currentUserId: string | null;
  canPost: boolean;
  closed?: boolean;
}) {
  const [messages, setMessages] = useState<ChatLine[]>(initial);
  const [input, setInput] = useState("");
  const supabaseRef = useRef(createClient());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const row = payload.new as { id: number; body: string; created_at: string; user_id: string };
          const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", row.user_id)
            .single();
          setMessages((cur) =>
            cur.some((m) => m.id === row.id)
              ? cur
              : [...cur, { ...row, name: data?.display_name ?? "Fan" }],
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
    // Realtime will echo this back and append it.
    await supabaseRef.current.from("messages").insert({ room_id: roomId, user_id: currentUserId, body });
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
          messages.map((msg) => (
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
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {closed ? (
        <p className="rounded-full bg-white/5 px-4 py-3 text-center text-sm text-muted">
          This room is closed.
        </p>
      ) : canPost ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Send a message…"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-accent/40 focus:bg-white/10"
          />
          <button
            onClick={send}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-soft"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="rounded-full bg-white/5 px-4 py-3 text-center text-sm text-muted">
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
