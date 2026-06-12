// Left navigation rail (browse pages). Primary links on top, then the World
// Cup groups (A–L) as collapsible dropdowns — each holds today's matches
// (live score + minute) and the group's nations. Hidden on small screens; the
// top nav covers navigation there.

import Link from "next/link";
import { GroupFixtures } from "./GroupFixtures";

export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line bg-ink-deep py-4 lg:block">
      <nav className="px-2">
        <SideLink href="/rooms" label="Browse rooms" icon="browse" />
        <SideLink href="/rooms/new" label="Create a room" icon="plus" />
      </nav>

      {/* Group dropdowns with today's matches — polls for live scores. */}
      <GroupFixtures />
    </aside>
  );
}

function SideLink({ href, label, icon }: { href: string; label: string; icon: "browse" | "plus" }) {
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
};
