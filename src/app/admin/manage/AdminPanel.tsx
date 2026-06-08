"use client";

// Admin moderation panel: delete user accounts, and close/reopen/delete any
// room. All actions go through admin-gated RPCs / admin RLS policies, so they
// only work for admins (the server also gates the whole /admin section).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
};

export type AdminRoom = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  host: { display_name: string } | null;
};

export function AdminPanel({ users, rooms }: { users: AdminUser[]; rooms: AdminRoom[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => PromiseLike<unknown>) => {
    setBusy(key);
    await fn();
    setBusy(null);
    router.refresh();
  };

  const supabase = () => createClient();

  const deleteUser = (u: AdminUser) =>
    confirm(`Delete ${u.email}? This removes their account, rooms, and messages.`) &&
    run(`u:${u.id}`, () => supabase().rpc("admin_delete_user", { target: u.id }));

  const setRoom = (id: string, status: string) =>
    run(`r:${id}`, () => supabase().from("rooms").update({ status }).eq("id", id));

  const deleteRoom = (r: AdminRoom) =>
    confirm(`Delete room "${r.title}"? Its chat and members will be removed.`) &&
    run(`r:${r.id}`, () => supabase().from("rooms").delete().eq("id", r.id));

  return (
    <div className="space-y-10">
      {/* Users */}
      <section>
        <h2 className="display text-2xl">Users ({users.length})</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          {users.length === 0 ? (
            <p className="p-6 text-sm text-muted">No users yet.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {u.display_name}
                    {u.is_admin && <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">admin</span>}
                  </p>
                  <p className="truncate text-xs text-muted">{u.email} · joined {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => deleteUser(u)}
                  disabled={busy === `u:${u.id}` || u.is_admin}
                  title={u.is_admin ? "Admins can't be deleted here" : "Delete account"}
                  className="shrink-0 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-40"
                >
                  {busy === `u:${u.id}` ? "…" : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Rooms */}
      <section>
        <h2 className="display text-2xl">Rooms ({rooms.length})</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          {rooms.length === 0 ? (
            <p className="p-6 text-sm text-muted">No rooms yet.</p>
          ) : (
            rooms.map((r) => {
              const closed = r.status === "Closed";
              return (
                <div key={r.id} className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{r.title}</p>
                    <p className="truncate text-xs text-muted">
                      {r.status} · host {r.host?.display_name ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setRoom(r.id, closed ? "Live Soon" : "Closed")}
                      disabled={busy === `r:${r.id}`}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
                    >
                      {closed ? "Reopen" : "Close"}
                    </button>
                    <button
                      onClick={() => deleteRoom(r)}
                      disabled={busy === `r:${r.id}`}
                      className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
