"use client";

// Editable account settings. Two independent forms:
//   1. Display name — written to BOTH the profiles row (for joins/listings) and
//      the auth user_metadata (so the nav, which reads metadata, stays in sync).
//   2. Password — set/changed via Supabase auth (hidden for OAuth-only accounts).

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1.5 w-full rounded-[10px] border border-line bg-[#07070d] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50";

function Note({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  return (
    <p className={`text-sm ${kind === "ok" ? "text-accent-soft" : "text-red-400"}`}>{children}</p>
  );
}

export function ProfileForm({
  initialName,
  canSetPassword,
}: {
  initialName: string;
  canSetPassword: boolean;
}) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setNameMsg(null);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameMsg({ kind: "err", text: "Display name must be at least 2 characters." });
      return;
    }
    setNameBusy(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setNameMsg({ kind: "err", text: "Session expired — please log in again." });
      setNameBusy(false);
      return;
    }
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", uid);
    const { error: metaErr } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
    setNameBusy(false);
    if (profileErr || metaErr) {
      setNameMsg({ kind: "err", text: (profileErr ?? metaErr)!.message });
      return;
    }
    setNameMsg({ kind: "ok", text: "Display name updated." });
    router.refresh();
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (password.length < 6) {
      setPwMsg({ kind: "err", text: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirm) {
      setPwMsg({ kind: "err", text: "Passwords don't match." });
      return;
    }
    setPwBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPwBusy(false);
    if (error) {
      setPwMsg({ kind: "err", text: error.message });
      return;
    }
    setPassword("");
    setConfirm("");
    setPwMsg({ kind: "ok", text: "Password updated." });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={saveName} className="flex flex-col gap-3">
        <label className="text-[13px] text-muted">
          <span className="text-white">Display name</span>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
        </label>
        {nameMsg && <Note kind={nameMsg.kind}>{nameMsg.text}</Note>}
        <button
          type="submit"
          disabled={nameBusy || name.trim() === initialName.trim()}
          className="self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {nameBusy ? "Saving…" : "Save name"}
        </button>
      </form>

      <div className="border-t border-line pt-6">
        {canSetPassword ? (
          <form onSubmit={savePassword} className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-white">Change password</p>
            <label className="text-[13px] text-muted">
              <span className="text-white">New password</span>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
              />
            </label>
            <label className="text-[13px] text-muted">
              <span className="text-white">Confirm new password</span>
              <input
                type="password"
                className={inputClass}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
              />
            </label>
            {pwMsg && <Note kind={pwMsg.kind}>{pwMsg.text}</Note>}
            <button
              type="submit"
              disabled={pwBusy || !password}
              className="self-start rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {pwBusy ? "Updating…" : "Update password"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-muted">
            You signed in with Google, so your password is managed there.
          </p>
        )}
      </div>
    </div>
  );
}
