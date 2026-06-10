// src/app/data/fixtures.ts
//
// LIVE fixture data for the 2026 FIFA World Cup, fetched at request time from a
// real external source — no hardcoded match list.
//
//   Source: OpenFootball (public domain) — the complete 104-match schedule.
//   File:   github.com/openfootball/worldcup.json → 2026/worldcup.json
//
// Knockout matches whose teams aren't decided yet appear with placeholder names
// (e.g. "W101", "1A") — that's accurate, those slots fill in after the groups.
// If the source is unreachable, every getter returns an empty list (the UI shows
// an empty state) rather than fake data.
//
// CONFIG (optional)
//   FIXTURES_URL  override the source URL (must return the same JSON shape).

// ─── TYPE ─────────────────────────────────────────────────────────────────────

export type FixtureStatus = "scheduled" | "live" | "finished";

export type Fixture = {
  id: string;
  round: string;       // "Matchday 1", "Round of 16", "Final", …
  group: string;       // "Group A" or "" for knockout matches
  date: string;        // ISO date "2026-06-11" (used for sorting)
  time: string;        // "13:00 UTC-6" or "TBD"
  teamA: string;
  teamB: string;
  teamASlug: string;   // matches /nation/[slug]; "" for placeholder teams
  teamBSlug: string;
  venue: string;       // host city
  country: string;     // host country (not provided per-match → "")
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
  source: string;      // attribution
};

// ─── SOURCE ───────────────────────────────────────────────────────────────────

const SOURCE_URL =
  process.env.FIXTURES_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

// ─── NAME → SLUG MAPPING ──────────────────────────────────────────────────────
// Map the team names that differ from our nation slugs; everything else falls
// back to lowercase-with-dashes.

const SLUG_OVERRIDES: Record<string, string> = {
  "south korea": "korea-republic",
  "czech republic": "czechia",
  "bosnia & herzegovina": "bosnia-and-herzegovina",
  "bosnia and herzegovina": "bosnia-and-herzegovina",
  "cape verde": "cabo-verde",
  "dr congo": "congo-dr",
  "ivory coast": "côte-d'ivoire",
  "iran": "ir-iran",
  "turkey": "türkiye",
  "united states": "usa",
};

// Placeholder "teams" for undecided knockout slots: "1A", "2B", "3A/B/C/D/F",
// "W101", "L101". These aren't real nations, so they get no slug (no link).
function isRealTeam(name: string): boolean {
  if (/^\d/.test(name)) return false;
  if (/^[WL]\d+$/.test(name)) return false;
  return true;
}

function teamSlug(name: string): string {
  if (!isRealTeam(name)) return "";
  const key = name.trim().toLowerCase();
  return SLUG_OVERRIDES[key] ?? key.replace(/\s+/g, "-");
}

// ─── RESPONSE SHAPE (only the fields we use) ──────────────────────────────────

type ApiMatch = {
  round?: string;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  ground?: string;
  score1?: number | null;
  score2?: number | null;
};

function toScore(raw: number | null | undefined): number | null {
  return typeof raw === "number" ? raw : null;
}

function mapMatch(m: ApiMatch, i: number): Fixture {
  const teamA = m.team1?.trim() || "TBD";
  const teamB = m.team2?.trim() || "TBD";
  const homeScore = toScore(m.score1);
  const awayScore = toScore(m.score2);
  const played = homeScore !== null && awayScore !== null;
  return {
    id: `wc2026-${i}`,
    round: m.round?.trim() || "Match",
    group: m.group?.trim() || "",
    date: m.date ?? "",
    time: m.time?.trim() || "TBD",
    teamA,
    teamB,
    teamASlug: teamSlug(teamA),
    teamBSlug: teamSlug(teamB),
    venue: m.ground?.trim() || "Venue TBD",
    country: "",
    status: played ? "finished" : "scheduled",
    homeScore,
    awayScore,
    source: "OpenFootball",
  };
}

// ─── FETCH (cached) ───────────────────────────────────────────────────────────
// Server-side fetch, revalidated every minute so live scores stay fresh (pages
// re-render via LiveRefresh). Returns [] on any error so the UI shows an honest
// empty state instead of crashing or inventing data.

async function fetchFixtures(): Promise<Fixture[]> {
  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data: { matches?: ApiMatch[] | null } = await res.json();
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    return matches.map(mapMatch).sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

// ─── PUBLIC GETTERS ───────────────────────────────────────────────────────────
// All async (they hit the network). Call them from Server Components, or fetch
// once in a parent and pass the results down as props.

/** Every fixture involving a nation (by slug). Matches either team. */
export async function getFixturesByNationSlug(slug: string): Promise<Fixture[]> {
  const target = slug.trim().toLowerCase();
  const all = await fetchFixtures();
  return all.filter((f) => f.teamASlug === target || f.teamBSlug === target);
}

/** Soonest upcoming (not-yet-finished) fixtures, sorted by date. */
export async function getUpcomingFixtures(limit = 9): Promise<Fixture[]> {
  const all = await fetchFixtures();
  return all.filter((f) => f.status !== "finished").slice(0, limit);
}

/** Every fixture (already sorted by date). */
export async function getAllFixtures(): Promise<Fixture[]> {
  return fetchFixtures();
}

/** A single fixture by id, or undefined. */
export async function getFixtureById(id: string): Promise<Fixture | undefined> {
  const all = await fetchFixtures();
  return all.find((f) => f.id === id);
}
