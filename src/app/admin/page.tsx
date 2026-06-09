// Admin home — a LIVE dashboard. Every number here is read from the database at
// request time (no hardcoded content). The /admin layout already guarantees only
// admins reach this page.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/app/components";

export const dynamic = "force-dynamic";

type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
};
type RoomRow = { id: string; title: string; status: string; created_at: string };

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(1, Math.round((now - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { data: usersData },
    { data: roomsData },
    { count: messageCount },
    { count: memberCount },
  ] = await Promise.all([
    supabase.rpc("admin_list_users"),
    supabase.from("rooms").select("id,title,status,created_at").order("created_at", { ascending: false }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("room_members").select("room_id", { count: "exact", head: true }),
  ]);

  const users = (usersData ?? []) as AdminUser[];
  const rooms = (roomsData ?? []) as RoomRow[];

  const admins = users.filter((u) => u.is_admin).length;
  const liveRooms = rooms.filter((r) => r.status !== "Closed").length;
  const closedRooms = rooms.length - liveRooms;
  const recentUsers = users
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);
  const recentRooms = rooms.slice(0, 6);

  const stats = [
    { label: "Members", value: users.length, sub: `${admins} admin${admins === 1 ? "" : "s"}` },
    { label: "Rooms", value: rooms.length, sub: `${liveRooms} live · ${closedRooms} closed` },
    { label: "Chat messages", value: messageCount ?? 0, sub: "across all rooms" },
    { label: "Room joins", value: memberCount ?? 0, sub: "total memberships" },
  ];

  return (
    <main className="flex-1">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-5 py-10">
        <span className="text-xs uppercase tracking-wide text-muted">Admin</span>
        <h1 className="display mt-2 text-3xl sm:text-4xl">Command Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Live overview of FanRoom Global. Every figure below is read straight from the
          database on each load.
        </p>

        {/* Live stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-line bg-panel p-5">
              <p className="text-xs uppercase tracking-wider text-muted">{s.label}</p>
              <p className="display mt-2 text-4xl text-white">{s.value}</p>
              <p className="mt-1 text-xs text-muted">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Manage entry point */}
        <Link
          href="/admin/manage"
          className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-accent/30 bg-accent/10 p-5 transition hover:bg-accent/15"
        >
          <div>
            <p className="text-base font-bold text-white">Members &amp; Rooms</p>
            <p className="mt-1 text-sm text-muted">Delete accounts, and close, reopen, or delete any room.</p>
          </div>
          <span className="shrink-0 text-accent">Manage →</span>
        </Link>

        {/* Recent activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="display text-xl">Newest members</h2>
              <Link href="/admin/manage" className="text-xs text-accent">View all</Link>
            </div>
            <ul className="mt-4 space-y-2">
              {recentUsers.length === 0 ? (
                <li className="text-sm text-muted">No members yet.</li>
              ) : (
                recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {u.display_name}
                        {u.is_admin && (
                          <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">admin</span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">{u.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(u.created_at)}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="display text-xl">Newest rooms</h2>
              <Link href="/admin/manage" className="text-xs text-accent">View all</Link>
            </div>
            <ul className="mt-4 space-y-2">
              {recentRooms.length === 0 ? (
                <li className="text-sm text-muted">No rooms yet.</li>
              ) : (
                recentRooms.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <Link href={`/rooms/${r.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-white hover:text-accent">
                      {r.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                        r.status === "Closed"
                          ? "bg-white/10 text-muted"
                          : "bg-accent/15 text-accent-soft"
                      }`}
                    >
                      {r.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        {/* Compliance reminder */}
        <div className="mt-8 rounded-lg border border-line bg-surface p-5">
          <p className="text-sm text-muted">
            <span className="font-semibold text-white">No match footage.</span>{" "}
            Creator rooms are only for reactions, commentary, live chat, and community.
          </p>
        </div>
      </div>
    </main>
  );
}
