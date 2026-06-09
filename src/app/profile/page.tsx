// A signed-in user's own profile / account page. Server component: gates to
// logged-in users, loads their profile + the rooms they host and have joined,
// and hands editable bits to the client form. Admins get a shortcut to /admin.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, SiteFooter } from "@/app/components";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Your profile | FanRoom Global" };
export const dynamic = "force-dynamic";

type RoomRef = { id: string; title: string; status: string };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const [{ data: profile }, { data: hostedData }, { data: joinedData }] = await Promise.all([
    supabase.from("profiles").select("display_name,is_admin,created_at").eq("id", user.id).single(),
    supabase.from("rooms").select("id,title,status").eq("host_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("room_members")
      .select("rooms(id,title,status)")
      .eq("user_id", user.id),
  ]);

  const hosted = (hostedData ?? []) as RoomRef[];
  const hostedIds = new Set(hosted.map((r) => r.id));
  const joined = ((joinedData ?? []) as unknown as { rooms: RoomRef | null }[])
    .map((j) => j.rooms)
    .filter((r): r is RoomRef => !!r && !hostedIds.has(r.id));

  const displayName = profile?.display_name ?? user.user_metadata?.display_name ?? "Fan";
  const isAdmin = !!profile?.is_admin;
  const joinedSite = profile?.created_at ?? user.created_at;
  const provider = user.app_metadata?.provider ?? "email";

  return (
    <main className="flex-1 bg-ink-deep">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        {/* Header */}
        <section className="rounded-xl border border-line bg-panel p-6  sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{displayName}</h1>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Joined {new Date(joinedSite).toLocaleDateString()}</span>
                <span>·</span>
                <span>Signed in via {provider === "email" ? "email" : provider}</span>
                {isAdmin && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">admin</span>
                )}
              </div>
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-accent-strong"
            >
              Open admin dashboard
            </Link>
          )}
        </section>

        {/* Account settings */}
        <section className="mt-6 rounded-xl border border-line bg-panel p-6  sm:p-8">
          <h2 className="display text-xl">Account settings</h2>
          <p className="mt-1 text-sm text-muted">Update your display name or change your password.</p>
          <div className="mt-5">
            <ProfileForm initialName={displayName} canSetPassword={provider === "email"} />
          </div>
        </section>

        {/* My rooms */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <RoomList title="Rooms I host" rooms={hosted} emptyHref="/rooms/new" emptyCta="Create a room" />
          <RoomList title="Rooms I've joined" rooms={joined} emptyHref="/rooms" emptyCta="Browse rooms" />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

function RoomList({
  title,
  rooms,
  emptyHref,
  emptyCta,
}: {
  title: string;
  rooms: RoomRef[];
  emptyHref: string;
  emptyCta: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-6 ">
      <h2 className="display text-lg">{title}</h2>
      {rooms.length === 0 ? (
        <div className="mt-3">
          <p className="text-sm text-muted">Nothing here yet.</p>
          <Link href={emptyHref} className="mt-3 inline-flex text-sm font-semibold text-accent">
            {emptyCta} →
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {rooms.map((r) => (
            <li key={r.id}>
              <Link
                href={`/rooms/${r.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{r.title}</span>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                    r.status === "Closed" ? "bg-white/10 text-muted" : "bg-accent/15 text-accent-soft"
                  }`}
                >
                  {r.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
