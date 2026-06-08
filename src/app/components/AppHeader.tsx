// Simple header for non-homepage pages (auth, rooms): logo + account nav.
import Link from "next/link";
import { AccountNav } from "./AccountNav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-ink/85 px-6 py-3.5 backdrop-blur-md">
      <Link href="/" className="display text-[22px] text-ink-foreground no-underline">
        FANROOM<span className="text-accent">GLOBAL</span>
      </Link>
      <AccountNav />
    </header>
  );
}
