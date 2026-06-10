"use client";

// Danger zone: self-service account deletion. Calls the `delete_own_account`
// RPC (SECURITY DEFINER — deletes the auth.users row; profiles, rooms,
// messages, wallets all cascade), then signs out locally and goes home.
// Two-step confirm: the user must type DELETE before the button arms.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearActiveRoom } from "@/lib/activeRoom";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const armed = confirm.trim().toUpperCase() === "DELETE";

  const deleteAccount = async () => {
    if (!armed || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) {
      setError("Couldn't delete your account — try again.");
      setBusy(false);
      return;
    }
    clearActiveRoom();
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <section className="mt-6 rounded-xl border border-red-500/30 bg-red-500/[0.04] p-6 sm:p-8">
      <h2 className="display text-xl text-red-200">Danger zone</h2>
      <p className="mt-1 text-sm text-muted">
        Deleting your account is permanent: your profile, rooms you host, messages, and wallet are
        all removed. Paid history stays with the payment provider.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-5 space-y-3">
          <label className="block text-sm text-muted">
            Type <span className="font-black text-red-300">DELETE</span> to confirm:
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              className="mt-1.5 w-full max-w-xs rounded-lg border border-red-500/30 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-red-400/60"
            />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={deleteAccount}
              disabled={!armed || busy}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Deleting…" : "Permanently delete my account"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setError(null);
              }}
              className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-foreground transition hover:bg-surface-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
