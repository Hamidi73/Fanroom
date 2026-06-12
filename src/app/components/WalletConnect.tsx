"use client";

// "Connect wallet" card (profile page). Talks to the Phantom browser
// extension: connect → sign a one-line proof message → the server verifies
// the ed25519 signature and stores the address. signMessage is read-only —
// it can never move funds or grant the site any spending power.
//
// No Phantom installed → a download link instead of a dead button.

import { useEffect, useState } from "react";
import bs58 from "bs58";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey: { toBase58(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
};

function getPhantom(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
  };
  const provider = w.phantom?.solana ?? w.solana;
  return provider?.isPhantom ? provider : null;
}

function shortAddr(a: string): string {
  return a.length > 12 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a;
}

export function WalletConnect({
  userId,
  initialAddress,
}: {
  userId: string;
  initialAddress: string | null;
}) {
  const [address, setAddress] = useState<string | null>(initialAddress);
  const [hasPhantom, setHasPhantom] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extensions inject after hydration — detect on mount, not at render.
  // (Deferred a tick: no sync setState inside effects.)
  useEffect(() => {
    const t = setTimeout(() => setHasPhantom(!!getPhantom()), 0);
    return () => clearTimeout(t);
  }, []);

  const connect = async () => {
    const phantom = getPhantom();
    if (!phantom) return;
    setBusy(true);
    setError(null);
    try {
      const { publicKey } = await phantom.connect();
      const addr = publicKey.toBase58();
      // Prove ownership: sign a fresh message naming this account.
      const message = `FanRoom Global — link wallet\nUser: ${userId}\nIssued: ${new Date().toISOString()}`;
      const { signature } = await phantom.signMessage(new TextEncoder().encode(message), "utf8");
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: addr, signature: bs58.encode(signature), message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't link the wallet — try again.");
        return;
      }
      setAddress(addr);
    } catch {
      // User closed the Phantom popup, or the extension errored.
      setError("Wallet connection was cancelled.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet", { method: "DELETE" });
      if (!res.ok) {
        setError("Couldn't unlink the wallet — try again.");
        return;
      }
      setAddress(null);
      await getPhantom()?.disconnect().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <PhantomGlyph />
        <h2 className="text-base font-bold text-ink-foreground">Crypto wallet</h2>
        {address && (
          <span className="rounded bg-online/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-online">
            Connected
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Link a Phantom wallet to your account. Linking only proves ownership with a
        signature — it never moves funds.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {address ? (
          <>
            <span className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-ink-foreground" title={address}>
              {shortAddr(address)}
            </span>
            <button
              type="button"
              onClick={() => void disconnect()}
              disabled={busy}
              className="rounded-lg border border-line bg-surface px-4 py-1.5 text-sm font-semibold text-ink-foreground transition hover:bg-surface-2 disabled:opacity-60"
            >
              {busy ? "Unlinking…" : "Unlink"}
            </button>
          </>
        ) : hasPhantom === false ? (
          <a
            href="https://phantom.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-bold text-accent-soft no-underline transition hover:bg-accent/15"
          >
            Get the Phantom extension ↗
          </a>
        ) : (
          <button
            type="button"
            onClick={() => void connect()}
            disabled={busy || hasPhantom === null}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black transition hover:bg-accent-strong disabled:opacity-60"
          >
            {busy ? "Waiting for Phantom…" : "Connect Phantom"}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Simple ghost glyph (inline SVG, no emoji) in the gold accent.
function PhantomGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2a7 7 0 0 0-7 7v8l2.2-1.8L7.4 17l2.6-1.8L12.6 17l2.2-1.8L17 17V9a7 7 0 0 0-7-7Z"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="9" r="1" fill="var(--color-accent)" />
      <circle cx="12.5" cy="9" r="1" fill="var(--color-accent)" />
    </svg>
  );
}
