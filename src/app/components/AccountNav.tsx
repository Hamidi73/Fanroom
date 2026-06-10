"use client";

// Auth-aware nav control. Reads the current session in the browser and shows
// either "Log in / Sign up" or the user's name + Rooms + Sign out.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function MenuIcon({ path }: { path: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-muted">
      <path d={path} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function nameOf(user: { user_metadata?: { display_name?: string }; email?: string } | null) {
  if (!user) return null;
  return user.user_metadata?.display_name ?? user.email ?? null;
}

export function AccountNav() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const loadAdmin = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
      if (active) setIsAdmin(!!data?.is_admin);
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setName(nameOf(data.user));
      setReady(true);
      loadAdmin(data.user?.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setName(nameOf(session?.user ?? null));
      setReady(true);
      loadAdmin(session?.user?.id);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!ready) {
    return <span className="text-sm text-muted">…</span>;
  }

  if (!name) {
    return (
      <span className="flex items-center gap-3">
        <Link href="/rooms" className="text-sm font-medium text-muted no-underline hover:text-ink-foreground">
          Rooms
        </Link>
        <Link href="/login" className="text-sm font-medium text-muted no-underline hover:text-ink-foreground">
          Log in
        </Link>
        <Link href="/signup" className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-bold text-white no-underline">
          Sign up
        </Link>
      </span>
    );
  }

  // Twitch-style account menu: hovering (or focusing) the name drops a menu
  // with the account actions. CSS-only open state (group-hover/focus-within)
  // so it needs no outside-click handling and works with keyboard focus.
  // Icons are inline SVG strokes — no emojis (they render differently per OS).
  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-foreground no-underline transition hover:bg-surface-2";

  return (
    <span className="flex items-center gap-3">
      <Link href="/rooms" className="text-sm font-medium text-muted no-underline hover:text-ink-foreground">
        Rooms
      </Link>

      <span className="group relative">
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-foreground no-underline transition group-hover:bg-surface-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/25 text-xs font-bold text-accent-soft ring-1 ring-accent/40">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-[140px] truncate sm:block">{name}</span>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-muted transition group-hover:rotate-180">
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Dropdown — pt-2 bridges the hover gap between trigger and panel */}
        <div className="invisible absolute right-0 top-full z-50 w-52 pt-2 opacity-0 transition-all duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="overflow-hidden rounded-xl border border-line bg-ink p-1.5 shadow-2xl shadow-black/60">
            <p className="truncate px-3 pb-1.5 pt-2 text-xs font-bold uppercase tracking-wide text-muted">{name}</p>
            <Link href="/profile" className={itemClass}>
              <MenuIcon path="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.5 6a5.5 5.5 0 0 1 11 0" /> My profile
            </Link>
            <Link href="/rooms/new" className={itemClass}>
              <MenuIcon path="M1.5 4.5h9v7h-9zM10.5 7.5 14.5 5v6l-4-2.5" /> Host a room
            </Link>
            <Link href="/rooms" className={itemClass}>
              <MenuIcon path="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10Zm3.7-1.3L14 14" /> Browse rooms
            </Link>
            {isAdmin && (
              <Link href="/admin" className={`${itemClass} font-bold text-accent-soft`}>
                <MenuIcon path="M8 1.5 13.5 3.5v4c0 3.2-2.3 5.8-5.5 7-3.2-1.2-5.5-3.8-5.5-7v-4L8 1.5Z" /> Admin
              </Link>
            )}
            <div className="my-1 border-t border-line" />
            <button onClick={signOut} className={`${itemClass} text-muted`}>
              <MenuIcon path="M6 2H2.5v12H6M10.5 11.5 14 8l-3.5-3.5M14 8H5.5" /> Sign out
            </button>
          </div>
        </div>
      </span>
    </span>
  );
}
