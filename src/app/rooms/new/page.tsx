"use client";

// Create a room (requires login). Inserts a room with the current user as host,
// auto-joins them as the first member, then opens the room.

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAllNations } from "@/app/data";
import { AppHeader } from "@/app/components/AppHeader";

const nations = getAllNations();
const inputClass =
  "mt-1.5 w-full rounded-[10px] border border-white/10 bg-[#07070d] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50";

export default function NewRoomPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [title, setTitle] = useState("");
  const [nation, setNation] = useState("");
  const [match, setMatch] = useState("");
  const [language, setLanguage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setLoggedIn(!!data.user);
        setChecking(false);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: room, error: insertError } = await supabase
      .from("rooms")
      .insert({
        host_id: user.id,
        title: title.trim(),
        nation_slug: nation || null,
        match: match.trim() || null,
        language: language.trim() || null,
      })
      .select("id")
      .single();

    if (insertError || !room) {
      setError(insertError?.message ?? "Could not create the room.");
      setBusy(false);
      return;
    }
    // Host auto-joins their own room.
    await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });
    router.push(`/rooms/${room.id}`);
    router.refresh();
  };

  if (checking) {
    return (
      <main className="flex-1">
        <AppHeader />
        <p className="px-5 py-16 text-center text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="flex-1">
        <AppHeader />
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="display text-3xl">Log in to host a room</h1>
          <p className="mt-3 text-sm text-muted">You need an account to create a fan room.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white">Log in</Link>
            <Link href="/signup" className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black">Sign up</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <AppHeader />
      <div className="mx-auto max-w-md px-5 py-12">
        <h1 className="display text-3xl">Create a room</h1>
        <p className="mt-2 text-sm text-muted">Host a watch-along. Reactions and chat only — no match footage.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="text-[13px] text-muted">
            <span className="text-white">Room title</span>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} placeholder="Atlas Pride Watch Party" />
          </label>
          <label className="text-[13px] text-muted">
            <span className="text-white">Nation</span>
            <select className={inputClass} value={nation} onChange={(e) => setNation(e.target.value)}>
              <option value="">— optional —</option>
              {nations.map((n) => (
                <option key={n.slug} value={n.slug} className="bg-ink">{n.name}</option>
              ))}
            </select>
          </label>
          <label className="text-[13px] text-muted">
            <span className="text-white">Match (optional)</span>
            <input className={inputClass} value={match} onChange={(e) => setMatch(e.target.value)} placeholder="Morocco vs Spain" />
          </label>
          <label className="text-[13px] text-muted">
            <span className="text-white">Language (optional)</span>
            <input className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Arabic" />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={busy} className="mt-1 w-full rounded-full bg-accent py-3 text-[15px] font-bold text-black disabled:opacity-60">
            {busy ? "Creating…" : "Create room"}
          </button>
        </form>
      </div>
    </main>
  );
}
