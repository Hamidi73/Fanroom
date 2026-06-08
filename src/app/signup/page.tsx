"use client";

// Create an account (real Supabase auth). On success the user is logged in and
// sent to /rooms — unless the project requires email confirmation, in which case
// we show a "check your email" message.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/app/components/AppHeader";
import { GoogleButton } from "@/app/components/GoogleButton";

const inputClass =
  "mt-1.5 w-full rounded-[10px] border border-white/10 bg-[#07070d] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/rooms");
      router.refresh();
    } else {
      // Email confirmation is enabled on the project.
      setNeedsConfirm(true);
    }
  };

  return (
    <main className="flex-1">
      <AppHeader />
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="display text-3xl">Create your account</h1>
        <p className="mt-2 text-sm text-muted">Join FanRoom Global to create and join fan rooms.</p>

        {needsConfirm ? (
          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm text-emerald-100">
            Account created. Check <span className="font-semibold">{email}</span> for a confirmation
            link, then <Link href="/login" className="underline">log in</Link>.
          </div>
        ) : (
          <>
            <div className="mt-8">
              <GoogleButton next="/rooms" />
            </div>
            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-white/10" />
              or with email
              <span className="h-px flex-1 bg-white/10" />
            </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-[13px] text-muted">
              <span className="text-white">Display name</span>
              <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} />
            </label>
            <label className="text-[13px] text-muted">
              <span className="text-white">Email</span>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="text-[13px] text-muted">
              <span className="text-white">Password</span>
              <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={busy} className="mt-1 w-full rounded-full bg-accent py-3 text-[15px] font-bold text-black disabled:opacity-60">
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
          </>
        )}

        <p className="mt-6 text-sm text-muted">
          Already have an account? <Link href="/login" className="text-accent">Log in</Link>
        </p>
      </div>
    </main>
  );
}
