import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell, SiteFooter, RoomCard, type RoomCardData } from "@/app/components";

export const metadata: Metadata = { title: "Browse rooms | FanRoom Global" };
export const dynamic = "force-dynamic";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData.user;

  const { data } = await supabase
    .from("rooms")
    .select("id,title,match,nation_slug,language,status,created_at,host_id,host:profiles!rooms_host_id_fkey(display_name),members:room_members(count)")
    .order("created_at", { ascending: false });
  let rooms = (data ?? []) as unknown as RoomCardData[];

  if (term) {
    rooms = rooms.filter((r) =>
      [r.title, r.match, r.host?.display_name, r.nation_slug]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term)),
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-2xl sm:text-3xl">
              {term ? `Results for “${q}”` : "Browse rooms"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Creator-led watch parties. Reactions and community only — never match footage.
            </p>
          </div>
          <Link
            href="/rooms/new"
            className="inline-flex shrink-0 items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-accent-strong"
          >
            + Create a room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="mt-8 rounded-lg border border-line bg-surface p-10 text-center">
            <p className="text-sm font-semibold text-ink-foreground">
              {term ? "No rooms match your search." : "No rooms yet."}
            </p>
            <p className="mt-2 text-sm text-muted">
              {term ? (
                <>Try a different search, or <Link href="/rooms" className="text-accent-soft">see all rooms</Link>.</>
              ) : isLoggedIn ? (
                <>Be the first — <Link href="/rooms/new" className="text-accent-soft">create a room</Link>.</>
              ) : (
                <><Link href="/signup" className="text-accent-soft">Sign up</Link> to host the first one.</>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </AppShell>
  );
}
