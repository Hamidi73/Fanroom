"use client";

// Sidebar "Groups" rail: one collapsible dropdown per World Cup group (A–L).
// Today's matches sit at the top of each group — live ones show just the two
// teams, the live score and the live minute — and the group's four nations
// link to their hubs below. Polls /api/live so scores and minutes tick along
// without a page refresh; a group with a live match auto-expands.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNation } from "@/app/data/nations";
import type { GroupLive, GroupMatch } from "@/app/data/fixtures";
import { NationFlag } from "./NationFlag";

const POLL_MS = 30_000;

export function GroupFixtures() {
  const [groups, setGroups] = useState<GroupLive[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const data: { groups?: GroupLive[] } = await res.json();
        if (alive && Array.isArray(data?.groups)) setGroups(data.groups);
      } catch {
        // Transient network hiccup — keep showing the last data, retry next tick.
      }
    };
    void load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    // Coming back to the tab pulls fresh scores immediately (the interval
    // skips ticks while hidden).
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (groups.length === 0) return null;

  return (
    <>
      <p className="mt-5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted">
        Groups
      </p>
      <nav className="mt-1 px-2">
        {groups.map((g) => {
          const hasLive = g.matches.some((m) => m.status === "live");
          return (
            <details key={g.name} className="group" open={hasLive || undefined}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-ink-foreground transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  {g.name}
                  {hasLive && <span className="live-dot" />}
                </span>
                <Chevron />
              </summary>
              <div className="mb-1 mt-0.5">
                {g.matches.map((m) => (
                  <MatchLine key={m.id} m={m} />
                ))}
                {g.teams.map((t) => {
                  const n = getNation(t.slug);
                  return (
                    <Link
                      key={t.slug}
                      href={`/nation/${t.slug}`}
                      className="flex items-center gap-2.5 rounded-md py-1.5 pl-4 pr-2 no-underline transition hover:bg-surface-2"
                    >
                      {n && <NationFlag src={n.flagImg} name={n.name} width={20} />}
                      <span className="truncate text-sm font-medium text-ink-foreground">
                        {t.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </nav>
    </>
  );
}

// One of today's matches, kept deliberately minimal: teams, score, minute.
function MatchLine({ m }: { m: GroupMatch }) {
  const tag =
    m.status === "live" ? (
      <span className="font-bold text-live">● {m.minute ?? "Live"}</span>
    ) : m.status === "finished" ? (
      <span className="font-bold text-muted">Full time</span>
    ) : (
      <span className="font-bold text-muted">
        Today{m.time !== "TBD" ? ` · ${m.time}` : ""}
      </span>
    );

  return (
    <div className="mx-1 mb-1 rounded-md bg-surface-2/60 px-2.5 py-1.5">
      <div className="mb-1 text-[10px] uppercase tracking-wide">{tag}</div>
      <TeamRow name={m.teamA} score={m.homeScore} />
      <TeamRow name={m.teamB} score={m.awayScore} />
    </div>
  );
}

function TeamRow({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="min-w-0 truncate font-medium text-ink-foreground">{name}</span>
      <span className="shrink-0 font-bold text-ink-foreground">{score ?? ""}</span>
    </div>
  );
}

// Caret that rotates when its parent <details> is open (Tailwind group-open).
function Chevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-muted transition-transform group-open:rotate-90"
    >
      <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
