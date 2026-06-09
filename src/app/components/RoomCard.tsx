// Room tile, styled like a streaming app's channel card: a 16:9 "preview"
// (we never show match footage, so it's a branded panel with the match + nation),
// a LIVE / status badge and member count, then host avatar + title below.

import Link from "next/link";
import { getNation } from "@/app/data";

export type RoomCardData = {
  id: string;
  title: string;
  match: string | null;
  nation_slug: string | null;
  language: string | null;
  status: string;
  host: { display_name: string } | null;
  members: { count: number }[] | null;
};

export function RoomCard({ room }: { room: RoomCardData }) {
  const nation = room.nation_slug ? getNation(room.nation_slug) : undefined;
  const isClosed = room.status === "Closed";
  const isLive = room.status === "Live" || room.status === "Live Soon";
  const count = room.members?.[0]?.count ?? 0;
  const hostName = room.host?.display_name ?? "a creator";

  return (
    <Link href={`/rooms/${room.id}`} className="group block no-underline">
      {/* Preview */}
      <div className="relative">
        <div
          className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line transition group-hover:border-accent/60"
          style={{
            backgroundImage: nation
              ? `radial-gradient(circle at 25% 20%, ${nation.theme.accent}, transparent 60%), linear-gradient(150deg, ${nation.theme.border}, #0e0e10 90%)`
              : "linear-gradient(150deg, #26263a, #0e0e10 90%)",
          }}
        >
          <div className="text-center">
            {nation && <div className="text-4xl drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]">{nation.flag}</div>}
            <p className="mt-1 px-4 text-xs font-semibold text-white/70">{room.match ?? "Watch-along"}</p>
          </div>
        </div>
        {/* Top-left status */}
        <span className="absolute left-2 top-2">
          {isClosed ? (
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white/80">Closed</span>
          ) : isLive ? (
            <span className="live-badge">● Live</span>
          ) : (
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white/90">{room.status}</span>
          )}
        </span>
        {/* Bottom-left viewers */}
        <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {count} {count === 1 ? "member" : "members"}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-2.5 flex gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent-soft">
          {hostName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink-foreground transition group-hover:text-accent-soft">
            {room.title}
          </p>
          <p className="truncate text-xs text-muted">{hostName}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {nation && (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{nation.name}</span>
            )}
            {room.language && (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{room.language}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
