"use client";

// Follow / unfollow a creator (the room host). This is the free relationship —
// distinct from any paid action — so a viewer can follow without spending.
// Writes go through the toggle_follow RPC (server-authoritative; self-follow and
// auth are enforced there). The follower count updates optimistically and is
// then reconciled with the value the server returns.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M8 13.5S2 9.8 2 5.9A3.1 3.1 0 0 1 8 4.4a3.1 3.1 0 0 1 6 1.5C14 9.8 8 13.5 8 13.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Compact display: 1234 -> "1.2K", 1_200_000 -> "1.2M".
function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`.replace(".0", "");
  return `${(n / 1_000_000).toFixed(1)}M`.replace(".0", "");
}

export function FollowButton({
  creatorId,
  roomId,
  isLoggedIn,
  initialFollowing,
  initialFollowers,
}: {
  creatorId: string;
  /** When set, a new follow posts a "started following" notice in this room's chat. */
  roomId?: string;
  isLoggedIn: boolean;
  initialFollowing: boolean;
  initialFollowers: number;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  // Re-seed from the server when the room page re-renders with fresh props
  // (LiveRefresh calls router.refresh), so the follower count reflects follows
  // by other viewers. Skipped while our own toggle is in flight so we never
  // clobber the optimistic update with a stale value.
  useEffect(() => {
    if (pending.current) return;
    setFollowing(initialFollowing);
    setFollowers(initialFollowers);
  }, [initialFollowing, initialFollowers]);

  const countLabel = (
    <span className="text-xs text-muted">
      {formatCount(followers)} {followers === 1 ? "follower" : "followers"}
    </span>
  );

  if (!isLoggedIn) {
    return (
      <span className="inline-flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-black no-underline transition hover:bg-accent-soft"
          aria-label="Log in to follow this creator"
        >
          <Heart filled={false} /> Follow
        </Link>
        {countLabel}
      </span>
    );
  }

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    pending.current = true;
    const prevFollowing = following;
    const prevFollowers = followers;
    const next = !following;
    // Optimistic — flip immediately, reconcile with the server's count after.
    setFollowing(next);
    setFollowers((c) => Math.max(0, c + (next ? 1 : -1)));

    const { data, error } = await createClient().rpc("toggle_follow", {
      p_creator_id: creatorId,
      ...(roomId ? { p_room_id: roomId } : {}),
    });
    setBusy(false);
    pending.current = false;
    if (error) {
      setFollowing(prevFollowing);
      setFollowers(prevFollowers);
      return;
    }
    if (data) {
      setFollowing(Boolean((data as { following: boolean }).following));
      setFollowers(Number((data as { followers: number }).followers));
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={following}
        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
          following
            ? "border border-line bg-surface-2 text-accent-soft hover:bg-surface"
            : "bg-accent text-black hover:bg-accent-soft"
        }`}
      >
        <Heart filled={following} /> {following ? "Following" : "Follow"}
      </button>
      {countLabel}
    </span>
  );
}
