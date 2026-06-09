"use client";

// Top navigation bar (used on every page). Logo + primary links on the left, a
// working search box in the middle (submits to /rooms?q=…), and the account
// controls on the right. An optional control (e.g. the homepage language picker)
// can be slotted in next to the account nav.

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { AccountNav } from "./AccountNav";

export function TopNav({ rightSlot }: { rightSlot?: ReactNode }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/rooms?q=${encodeURIComponent(term)}` : "/rooms");
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-line bg-ink/95 px-3 backdrop-blur-md sm:px-4">
      <div className="flex items-center gap-5">
        <Logo />
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/rooms" className="text-sm font-semibold text-muted no-underline transition hover:text-ink-foreground">
            Browse
          </Link>
        </nav>
      </div>

      <form onSubmit={onSearch} className="mx-auto hidden w-full max-w-md items-center sm:flex">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search rooms"
          className="h-9 w-full rounded-l-lg border border-line bg-surface px-3 text-sm text-ink-foreground outline-none placeholder:text-muted focus:border-accent/60"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-9 items-center rounded-r-lg border border-l-0 border-line bg-surface-2 px-3 text-muted transition hover:text-ink-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <div className="ml-auto flex items-center gap-3">
        {rightSlot}
        <AccountNav />
      </div>
    </header>
  );
}
