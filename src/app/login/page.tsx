"use client";

// Log in with email + password (real Supabase auth). On success → /rooms.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/app/components/AppHeader";
import { GoogleButton } from "@/app/components/GoogleButton";

const inputClass =
  "mt-1.5 w-full rounded-[10px] border border-line bg-[#07070d] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/rooms");
    router.refresh();
  };

  return (
    <main className="flex-1">
      <AppHeader />
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="display text-3xl">Log in</h1>
        <p className="mt-2 text-sm text-muted">Welcome back to FanRoom Global.</p>

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
            <span className="text-white">Email</span>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="text-[13px] text-muted">
            <span className="text-white">Password</span>
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={busy} className="mt-1 w-full rounded-lg bg-accent py-3 text-[15px] font-bold text-black disabled:opacity-60">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          No account yet? <Link href="/signup" className="text-accent">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
