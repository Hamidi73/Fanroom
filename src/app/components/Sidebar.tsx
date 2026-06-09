// Left navigation rail (browse pages). Primary links on top, then the full list
// of nations as "categories" — like a streaming app's left sidebar. Hidden on
// small screens; the top nav covers navigation there.

import Link from "next/link";
import { getAllNations } from "@/app/data";

const nations = getAllNations();

export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line bg-ink-deep py-4 lg:block">
      <nav className="px-2">
        <SideLink href="/rooms" label="Browse rooms" icon="browse" />
        <SideLink href="/rooms/new" label="Create a room" icon="plus" />
        <SideLink href="/#nations" label="Nations" icon="globe" />
      </nav>

      <p className="mt-5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted">
        Nations
      </p>
      <nav className="mt-1 px-2">
        {nations.map((n) => (
          <Link
            key={n.slug}
            href={`/nation/${n.slug}`}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 no-underline transition hover:bg-surface-2"
          >
            <span className="text-lg leading-none">{n.flag}</span>
            <span className="truncate text-sm font-medium text-ink-foreground">{n.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function SideLink({ href, label, icon }: { href: string; label: string; icon: "browse" | "plus" | "globe" }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-ink-foreground no-underline transition hover:bg-surface-2"
    >
      <span className="text-muted">{ICONS[icon]}</span>
      {label}
    </Link>
  );
}

const ICONS = {
  browse: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  globe: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9h14M9 2c2 2.5 2 11.5 0 14M9 2c-2 2.5-2 11.5 0 14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
};
