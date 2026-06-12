// A fixture card (data from a real schedule source via data/fixtures.ts). Team
// names link to their nation hubs when the team is decided; undecided knockout
// slots (e.g. "W101") render as plain text. Shows score/status when available.

import Link from "next/link";
import type { Fixture } from "@/app/data";

function statusBadge(fixture: Fixture) {
  if (fixture.status === "live")
    return { label: `● ${fixture.minute ?? "Live"}`, className: "bg-live text-white" };
  if (fixture.status === "finished")
    return { label: "Full time", className: "bg-surface-2 text-muted" };
  return { label: "Scheduled", className: "bg-surface-2 text-online" };
}

function TeamName({ name, slug }: { name: string; slug: string }) {
  if (!slug) return <span className="text-muted">{name}</span>;
  return (
    <Link href={`/nation/${slug}`} className="text-ink-foreground no-underline hover:text-accent-soft">
      {name}
    </Link>
  );
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const badge = statusBadge(fixture);
  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;

  return (
    <div className="rounded-lg border border-line bg-surface p-4 transition hover:border-line/0 hover:ring-1 hover:ring-accent/40">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted">
          {fixture.round}{fixture.group ? ` · ${fixture.group}` : ""}
        </p>
        <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">
          <TeamName name={fixture.teamA} slug={fixture.teamASlug} />
          <span className="text-muted"> vs </span>
          <TeamName name={fixture.teamB} slug={fixture.teamBSlug} />
        </h3>
        {hasScore && (
          <span className="shrink-0 text-lg font-extrabold text-ink-foreground">
            {fixture.homeScore}–{fixture.awayScore}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-0.5 text-sm text-muted">
        <p>{fixture.date}{fixture.time !== "TBD" ? ` · ${fixture.time}` : ""}</p>
        <p>{fixture.venue}{fixture.country ? ` · ${fixture.country}` : ""}</p>
      </div>
    </div>
  );
}
