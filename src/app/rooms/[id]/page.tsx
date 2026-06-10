import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  AppHeader,
  SiteFooter,
  RoomChat,
  RoomMembers,
  RoomMemberCount,
  JoinRoomButton,
  RoomHostControls,
  RoomVideo,
  StreamAlerts,
  RoomGiftsProvider,
  GiftDrawer,
  PaymentNotice,
  ShareRoomButton,
  AutoJoinRoom,
} from "@/app/components";
import { getNation } from "@/app/data";
import type { RoomRow, MemberRow, MessageRow, ChatLine } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ? `${data.title} | FanRoom Global` : "Fan room | FanRoom Global" };
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string; coins?: string }>;
}) {
  const { id } = await params;
  const { paid, canceled, coins } = await searchParams;
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
  const hostName = room.host?.display_name ?? "a creator";

  // Gift overlays show the sender's CURRENT display name (the profiles row is
  // the source of truth — auth metadata can go stale after a rename).
  let senderName = "A fan";
  if (user) {
    const { data: me } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    senderName = me?.display_name ?? (user.user_metadata?.display_name as string | undefined) ?? "A fan";
  }

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
    <RoomGiftsProvider
      roomId={room.id}
      senderName={senderName}
      loggedIn={!!user}
      paymentsEnabled={paymentsEnabled}
    >
    <main className="flex-1 bg-ink-deep">
      <AppHeader />
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        <Link href="/rooms" className="text-sm text-muted no-underline hover:text-ink-foreground">← All rooms</Link>

        {/* Clicking into an open room joins it instantly — no second click. */}
        {!!user && !isMember && !isHost && !isClosed && <AutoJoinRoom roomId={room.id} />}

        {paid && <PaymentNotice kind="paid" />}
        {coins && <PaymentNotice kind="coins" />}
        {canceled && <PaymentNotice kind="canceled" />}

        {/* Twitch-style stage: video + info on the left, full-height chat rail
            on the right. On mobile: video → title → chat → members. */}
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr] lg:items-start">
          {/* Video + title bar */}
          <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
            {isClosed ? (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-line bg-black px-6 text-center">
                <div>
                  <p className="text-sm font-bold text-white/80">This room has been closed by the host.</p>
                  <Link href="/rooms" className="mt-3 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white no-underline">
                    Find another room
                  </Link>
                </div>
              </div>
            ) : (
              <section className="relative">
                {/* Anyone can peek (muted preview); members get sound. Paid
                    highlighted messages pop over it as tier-specific alerts. */}
                <RoomVideo roomId={room.id} canWatch={isMember || isHost} />
                <StreamAlerts roomId={room.id} />
              </section>
            )}

            {/* Title bar under the player (Twitch pattern) */}
            <section className="mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-base font-bold text-accent-soft ring-2 ring-accent/30">
                    {hostName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h1 className="display truncate text-xl sm:text-2xl">{room.title}</h1>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      <span className="font-semibold text-ink-foreground">{hostName}</span>
                      {room.match && <> · {room.match}</>}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {isClosed ? (
                        <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">Closed</span>
                      ) : (
                        <span className="rounded bg-online/15 px-2 py-0.5 text-xs font-bold text-online">● Open</span>
                      )}
                      <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">
                        <RoomMemberCount roomId={room.id} initial={members.length} />
                      </span>
                      {nation && (
                        <Link href={`/nation/${nation.slug}`} className="rounded border border-line bg-surface-2 px-2 py-0.5 text-xs text-accent-soft no-underline">
                          {nation.flag} {nation.name}
                        </Link>
                      )}
                      {room.language && (
                        <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">{room.language}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <ShareRoomButton title={room.title} />
                  <JoinRoomButton
                    roomId={room.id}
                    isMember={isMember}
                    isLoggedIn={!!user}
                    isClosed={isClosed}
                    joining={!!user && !isMember && !isHost}
                  />
                </div>
              </div>

              <p className="mt-3 inline-flex rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">
                Reactions &amp; commentary only — no match footage.
              </p>

              {isHost && (
                <div className="mt-3">
                  <RoomHostControls roomId={room.id} status={room.status} />
                </div>
              )}
            </section>
          </div>

          {/* Chat rail — sticky and full height on desktop */}
          <section className="order-2 flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-xl border border-line bg-panel lg:sticky lg:top-[4.25rem] lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[calc(100vh-5.5rem)]">
            <RoomChat
              roomId={room.id}
              initial={initialChat}
              currentUserId={user?.id ?? null}
              hostId={room.host_id}
              canPost={isMember && !isClosed}
              closed={isClosed}
              paymentsEnabled={paymentsEnabled}
              cryptoEnabled={cryptoEnabled}
            />
          </section>

          {/* Members */}
          <section className="order-3 rounded-xl border border-line bg-panel p-5 lg:col-start-1 lg:row-start-2">
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
      <GiftDrawer nationSlug={room.nation_slug} isLoggedIn={!!user} isClosed={isClosed} />
    </RoomGiftsProvider>
  );
}
