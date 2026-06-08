// A fixture card (data from a real schedule source via data/fixtures.ts). Team
// names link to their nation hubs when the team is decided; undecided knockout
// slots (e.g. "W101") render as plain text. Shows score/status when available.

import Link from "next/link";
import type { Fixture } from "@/app/data";

function statusBadge(status: Fixture["status"]) {
  if (status === "live") return { label: "● Live", className: "border-red-500/30 bg-red-500/10 text-red-300" };
  if (status === "finished") return { label: "Full time", className: "border-white/15 bg-white/5 text-slate-300" };
  return { label: "Scheduled", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" };
}

// Link to the nation hub only when the team is a real, decided nation.
function TeamName({ name, slug }: { name: string; slug: string }) {
  if (!slug) return <span className="text-slate-400">{name}</span>;
  return (
    <Link href={`/nation/${slug}`} className="hover:text-emerald-300">
      {name}
    </Link>
  );
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const badge = statusBadge(fixture.status);
  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-panel p-6 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          {fixture.round}{fixture.group ? ` · ${fixture.group}` : ""}
        </p>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-bold text-white">
          <TeamName name={fixture.teamA} slug={fixture.teamASlug} />
          <span className="text-slate-500"> vs </span>
          <TeamName name={fixture.teamB} slug={fixture.teamBSlug} />
        </h3>
        {hasScore && (
          <span className="shrink-0 text-2xl font-black text-white">
            {fixture.homeScore}–{fixture.awayScore}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-300">
        <p>{fixture.date}{fixture.time !== "TBD" ? ` · ${fixture.time}` : ""}</p>
        <p>{fixture.venue}</p>
        {fixture.country && <p className="text-slate-400">{fixture.country}</p>}
      </div>

      <p className="mt-4 text-xs text-slate-500">Source: {fixture.source}</p>
    </div>
  );
}
