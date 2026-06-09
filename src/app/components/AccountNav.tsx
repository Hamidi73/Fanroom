"use client";

// Auth-aware nav control. Reads the current session in the browser and shows
// either "Log in / Sign up" or the user's name + Rooms + Sign out.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

  return (
    <span className="flex items-center gap-3">
      <Link href="/rooms" className="text-sm font-medium text-muted no-underline hover:text-ink-foreground">
        Rooms
      </Link>
      {isAdmin && (
        <Link href="/admin" className="text-sm font-bold text-accent no-underline hover:opacity-80">
          Admin
        </Link>
      )}
      <Link href="/profile" className="text-sm font-medium text-ink-foreground no-underline hover:text-accent">
        {name}
      </Link>
      <button
        onClick={signOut}
        className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-muted transition hover:text-ink-foreground"
      >
        Sign out
      </button>
    </span>
  );
}
