"use client";

// Sidebar live rail. Polls /api/live (every 30s + on tab refocus) so scores,
// minutes and fixtures tick along without a page refresh. Renders, top to
// bottom:
//   1. "Live now"      — every match in play, inline score + live minute
//                        (auto-expanded; only shown when something is live).
//   2. "Today's matches" — today's not-yet-started fixtures with kickoff time.
//   3. "Groups" A–L    — each group's nations + today's matches inside it.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNation } from "@/app/data/nations";
import type { GroupLive, GroupMatch } from "@/app/data/fixtures";
import { NationFlag } from "./NationFlag";

const POLL_MS = 30_000;

type LiveData = { groups: GroupLive[]; live: GroupMatch[]; todayScheduled: GroupMatch[] };

export function GroupFixtures() {
  const [data, setData] = useState<LiveData | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const json = (await res.json()) as Partial<LiveData>;
        if (!alive) return;
        setData({
          groups: Array.isArray(json.groups) ? json.groups : [],
          live: Array.isArray(json.live) ? json.live : [],
          todayScheduled: Array.isArray(json.todayScheduled) ? json.todayScheduled : [],
        });
      } catch {
        // Transient network hiccup — keep showing the last data, retry next tick.
      }
    };
    void load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
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

  if (!data) return null;
  const { groups, live, todayScheduled } = data;

  return (
    <>
      {/* 1. Live now */}
      {live.length > 0 && (
        <>
          <SectionLabel>Live now</SectionLabel>
          <nav className="mt-1 px-2">
            <details className="group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-ink-foreground transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="live-dot" />
                  {live.length} live
                </span>
                <Chevron />
              </summary>
              <div className="mb-1 mt-0.5">
                {live.map((m) => (
                  <SidebarMatch key={m.id} m={m} />
                ))}
              </div>
            </details>
          </nav>
        </>
      )}

      {/* 2. Today's scheduled matches */}
      {todayScheduled.length > 0 && (
        <>
          <SectionLabel>Today&apos;s matches</SectionLabel>
          <nav className="mt-1 px-2">
            <details className="group" open={live.length === 0 || undefined}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-ink-foreground transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span>{todayScheduled.length} scheduled today</span>
                <Chevron />
              </summary>
              <div className="mb-1 mt-0.5">
                {todayScheduled.map((m) => (
                  <SidebarMatch key={m.id} m={m} />
                ))}
              </div>
            </details>
          </nav>
        </>
      )}

      {/* 3. Groups A–L */}
      {groups.length > 0 && (
        <>
          <SectionLabel>Groups</SectionLabel>
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
                      <SidebarMatch key={m.id} m={m} />
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
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

// Inline scoreline used everywhere in the rail: "[flag] Argentina 1 - 1 Algeria
// [flag]", with the live minute / kickoff time / "Full time" beneath.
function SidebarMatch({ m }: { m: GroupMatch }) {
  const a = getNation(m.teamASlug);
  const b = getNation(m.teamBSlug);
  const hasScore = m.homeScore !== null && m.awayScore !== null;

  return (
    <div className="mx-1 mb-1 rounded-md bg-surface-2/60 px-2 py-1.5">
      <div className="flex items-center gap-1.5 text-xs">
        {a && <NationFlag src={a.flagImg} name={a.name} width={16} />}
        <span className="min-w-0 flex-1 truncate font-medium text-ink-foreground">{m.teamA}</span>
        {hasScore ? (
          <span className="shrink-0 font-bold tabular-nums text-ink-foreground">
            {m.homeScore} - {m.awayScore}
          </span>
        ) : (
          <span className="shrink-0 text-muted">vs</span>
        )}
        <span className="min-w-0 flex-1 truncate text-right font-medium text-ink-foreground">{m.teamB}</span>
        {b && <NationFlag src={b.flagImg} name={b.name} width={16} />}
      </div>
      <div className="mt-0.5 text-center text-[10px] font-bold uppercase tracking-wide">
        {m.status === "live" ? (
          <span className="text-live">● {m.minute ?? "Live"}</span>
        ) : m.status === "finished" ? (
          <span className="text-muted">Full time</span>
        ) : (
          <span className="text-muted">{m.time !== "TBD" ? m.time : "Today"}</span>
        )}
      </div>
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
