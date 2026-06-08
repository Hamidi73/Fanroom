import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, SiteFooter, RoomChat, JoinRoomButton, RoomHostControls, RoomVideo } from "@/app/components";
import { getNation } from "@/app/data";
import type { RoomRow, MemberRow, MessageRow, ChatLine } from "@/lib/types";

export const metadata: Metadata = { title: "Fan room | FanRoom Global" };

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: roomData } = await supabase
    .from("rooms")
    .select("id,title,match,nation_slug,language,status,created_at,host_id,host:profiles!rooms_host_id_fkey(display_name)")
    .eq("id", id)
    .maybeSingle();
  const room = roomData as unknown as RoomRow | null;

  if (!room) {
    return (
      <main className="flex-1">
        <AppHeader />
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="display text-3xl">Room not found</h1>
          <p className="mt-3 text-sm text-muted">This room doesn&apos;t exist or was removed.</p>
          <Link href="/rooms" className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black">
            Browse rooms
          </Link>
        </div>
      </main>
    );
  }

  const [{ data: userData }, { data: memberData }, { data: messageData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("room_members").select("user_id,profiles(display_name)").eq("room_id", id),
    supabase
      .from("messages")
      .select("id,body,created_at,user_id,profiles(display_name)")
      .eq("room_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const user = userData.user;
  const members = (memberData ?? []) as unknown as MemberRow[];
  const messages = (messageData ?? []) as unknown as MessageRow[];
  const isMember = !!user && members.some((m) => m.user_id === user.id);
  const isHost = !!user && user.id === room.host_id;
  const isClosed = room.status === "Closed";
  const nation = room.nation_slug ? getNation(room.nation_slug) : undefined;

  const initialChat: ChatLine[] = messages.map((m) => ({
    id: m.id,
    body: m.body,
    created_at: m.created_at,
    user_id: m.user_id,
    name: m.profiles?.display_name ?? "Fan",
  }));

  return (
    <main className="flex-1 bg-ink-deep">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <Link href="/rooms" className="text-sm text-muted hover:text-ink-foreground">← All rooms</Link>

        {/* Hero */}
        <section className="mt-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#06121d] to-[#08131d] p-6 shadow-lg shadow-black/30 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{room.status}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{members.length} joined</span>
            {nation && (
              <Link href={`/nation/${nation.slug}`} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                {nation.flag} {nation.name}
              </Link>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{room.title}</h1>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            {room.match && <p><span className="font-semibold text-white">Match:</span> {room.match}</p>}
            <p><span className="font-semibold text-white">Host:</span> {room.host?.display_name ?? "a creator"}</p>
            {room.language && <p><span className="font-semibold text-white">Language:</span> {room.language}</p>}
          </div>
          {isClosed && (
            <p className="mt-4 rounded-[1rem] border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
              This room has been closed by the host.
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <JoinRoomButton roomId={room.id} isMember={isMember} isLoggedIn={!!user} isClosed={isClosed} />
            <span className="rounded-[1rem] border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">
              Reactions &amp; commentary only — no match footage.
            </span>
          </div>
          {isHost && (
            <div className="mt-4">
              <RoomHostControls roomId={room.id} status={room.status} />
            </div>
          )}
        </section>

        {/* Live video (host broadcasts, members watch) */}
        {!isClosed && (
          <section className="mt-6">
            <RoomVideo roomId={room.id} canWatch={isMember || isHost} />
          </section>
        )}

        {/* Chat + members */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="order-2 rounded-[2rem] border border-white/10 bg-panel shadow-lg shadow-black/25 lg:order-1">
            <RoomChat
              roomId={room.id}
              initial={initialChat}
              currentUserId={user?.id ?? null}
              canPost={isMember && !isClosed}
              closed={isClosed}
            />
          </section>

          <section className="order-1 rounded-[2rem] border border-white/10 bg-panel p-6 shadow-lg shadow-black/25 lg:order-2">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">In this room</p>
            <h2 className="mt-2 text-lg font-black text-white">{members.length} member{members.length === 1 ? "" : "s"}</h2>
            <ul className="mt-4 space-y-2">
              {members.length === 0 ? (
                <li className="text-sm text-slate-400">No one has joined yet.</li>
              ) : (
                members.map((m) => (
                  <li key={m.user_id} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-200">
                      {(m.profiles?.display_name ?? "F").slice(0, 1).toUpperCase()}
                    </span>
                    {m.profiles?.display_name ?? "Fan"}
                    {m.user_id === room.host_id && <span className="text-xs text-accent">host</span>}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
