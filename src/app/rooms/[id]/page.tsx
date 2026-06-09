import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, SiteFooter, RoomChat, RoomMembers, RoomMemberCount, JoinRoomButton, RoomHostControls, RoomVideo, StreamAlerts } from "@/app/components";
import { getNation } from "@/app/data";
import type { RoomRow, MemberRow, MessageRow, ChatLine } from "@/lib/types";

export const metadata: Metadata = { title: "Fan room | FanRoom Global" };

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
}) {
  const { id } = await params;
  const { paid, canceled } = await searchParams;
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
          <Link href="/rooms" className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white">
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
      .select("id,body,created_at,user_id,highlight,amount_cents,tier,profiles(display_name)")
      .eq("room_id", id)
      .order("created_at", { ascending: true }),
  ]);

  // Paid highlights are available whenever Stripe is configured. If the room's
  // host has connected payouts, their share is split to them automatically
  // (handled in the checkout route); otherwise the charge stays on the platform.
  const paymentsEnabled = !!process.env.STRIPE_SECRET_KEY;
  const cryptoEnabled = false;

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
    highlight: m.highlight ?? false,
    amountCents: m.amount_cents ?? 0,
    tier: m.tier ?? null,
  }));

  return (
    <main className="flex-1 bg-ink-deep">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <Link href="/rooms" className="text-sm text-muted hover:text-ink-foreground">← All rooms</Link>

        {paid && (
          <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-accent-soft">
            ✦ Payment received — your highlighted message will appear in chat momentarily.
          </p>
        )}
        {canceled && (
          <p className="mt-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted">
            Checkout canceled — no charge was made.
          </p>
        )}

        {/* Hero */}
        <section className="mt-4 rounded-xl border border-line bg-surface p-6  sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {isClosed ? (
              <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">Closed</span>
            ) : (
              <span className="live-badge">● Live</span>
            )}
            <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">
              <RoomMemberCount roomId={room.id} initial={members.length} />
            </span>
            {nation && (
              <Link href={`/nation/${nation.slug}`} className="rounded border border-line bg-surface-2 px-2 py-0.5 text-xs text-accent-soft no-underline">
                {nation.flag} {nation.name}
              </Link>
            )}
          </div>
          <h1 className="display mt-4 text-3xl sm:text-4xl">{room.title}</h1>
          <div className="mt-3 space-y-1 text-sm text-muted">
            {room.match && <p><span className="font-semibold text-white">Match:</span> {room.match}</p>}
            <p><span className="font-semibold text-white">Host:</span> {room.host?.display_name ?? "a creator"}</p>
            {room.language && <p><span className="font-semibold text-white">Language:</span> {room.language}</p>}
          </div>
          {isClosed && (
            <p className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm text-muted">
              This room has been closed by the host.
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <JoinRoomButton roomId={room.id} isMember={isMember} isLoggedIn={!!user} isClosed={isClosed} />
            <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">
              Reactions &amp; commentary only — no match footage.
            </span>
          </div>
          {isHost && (
            <div className="mt-4">
              <RoomHostControls roomId={room.id} status={room.status} />
            </div>
          )}
        </section>

        {/* Live video (host broadcasts, members watch). Paid highlighted
            messages pop over it as tier-specific alerts. */}
        {!isClosed && (
          <section className="relative mt-6">
            <RoomVideo roomId={room.id} canWatch={isMember || isHost} />
            <StreamAlerts roomId={room.id} />
          </section>
        )}

        {/* Chat + members */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="order-2 rounded-xl border border-line bg-panel  lg:order-1">
            <RoomChat
              roomId={room.id}
              initial={initialChat}
              currentUserId={user?.id ?? null}
              canPost={isMember && !isClosed}
              closed={isClosed}
              paymentsEnabled={paymentsEnabled}
              cryptoEnabled={cryptoEnabled}
            />
          </section>

          <section className="order-1 rounded-xl border border-line bg-panel p-6  lg:order-2">
            <RoomMembers
              roomId={room.id}
              hostId={room.host_id}
              initial={members.map((m) => ({
                user_id: m.user_id,
                display_name: m.profiles?.display_name ?? null,
              }))}
            />
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
