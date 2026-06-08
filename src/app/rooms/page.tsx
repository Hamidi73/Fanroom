import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, SiteFooter } from "@/app/components";
import type { RoomRow } from "@/lib/types";

export const metadata: Metadata = { title: "Fan rooms | FanRoom Global" };

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData.user;

  const { data } = await supabase
    .from("rooms")
    .select("id,title,match,nation_slug,language,status,created_at,host_id,host:profiles!rooms_host_id_fkey(display_name),members:room_members(count)")
    .order("created_at", { ascending: false });
  const rooms = (data ?? []) as unknown as RoomRow[];

  return (
    <main className="flex-1">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Fan rooms</p>
            <h1 className="display mt-2 text-4xl">Live &amp; upcoming rooms</h1>
            <p className="mt-2 text-sm text-muted">
              Creator-led watch parties. Reactions and community only — never match footage.
            </p>
          </div>
          <Link
            href="/rooms/new"
            className="inline-flex shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-bold text-black"
          >
            + Create a room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-surface p-10 text-center">
            <p className="text-sm text-muted">No rooms yet.</p>
            <p className="mt-2 text-sm text-muted">
              {isLoggedIn ? (
                <>Be the first — <Link href="/rooms/new" className="text-accent">create a room</Link>.</>
              ) : (
                <><Link href="/signup" className="text-accent">Sign up</Link> to host the first one.</>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="block rounded-2xl border border-white/10 bg-surface p-5 no-underline transition hover:-translate-y-0.5 hover:border-emerald-400/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{room.status}</span>
                  <span className="text-xs text-muted">{room.members?.[0]?.count ?? 0} joined</span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-white">{room.title}</h2>
                {room.match && <p className="mt-1 text-sm text-slate-300">{room.match}</p>}
                <p className="mt-3 text-xs text-muted">
                  Hosted by {room.host?.display_name ?? "a creator"}
                  {room.language ? ` · ${room.language}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
