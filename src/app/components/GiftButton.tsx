"use client";

// Inline gift trigger for the room action bar. Twitch places gifting right next
// to Follow/Subscribe under the player, so this sits there too and opens the
// shared gift tray (state lives in RoomGiftsProvider). Logged-out viewers get a
// link to sign in; closed rooms hide it entirely.

import Link from "next/link";
import { useRoomGifts } from "./RoomGiftsProvider";

function GiftGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 7.5h11v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2 5.5h12v2H2zM8 5.5v9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 5.5C8 3.5 6.8 2 5.5 2S3.5 3 4 4c.4.8 2 1.5 4 1.5Zm0 0c0-2 1.2-3.5 2.5-3.5S12.5 3 12 4c-.4.8-2 1.5-4 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function GiftButton({ isLoggedIn, isClosed }: { isLoggedIn: boolean; isClosed: boolean }) {
  const { toggleDrawer } = useRoomGifts();

  if (isClosed) return null;

  const className =
    "inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent-soft transition hover:bg-accent/25";

  if (!isLoggedIn) {
    return (
      <Link href="/login" className={`${className} no-underline`} aria-label="Log in to send a gift">
        <GiftGlyph /> Gift
      </Link>
    );
  }

  return (
    <button type="button" onClick={toggleDrawer} className={className} aria-label="Send a gift">
      <GiftGlyph /> Gift
    </button>
  );
}
