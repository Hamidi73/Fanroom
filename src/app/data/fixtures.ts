// src/app/data/fixtures.ts
//
// LIVE fixture data for the 2026 FIFA World Cup, merged at request time from
// two real external sources — no hardcoded match list:
//
//   Schedule + final scores   OpenFootball (public domain), all 104 matches:
//                             github.com/openfootball/worldcup.json → 2026/worldcup.json
//   Live state                ESPN's public scoreboard — kicked-off / live
//                             minute / live & final scores for the recent
//                             matchday window (no API key required).
//
// The two are merged per match (by team pair + date). If the scoreboard is
// unreachable, a kick-off-time heuristic still moves matches out of
// "scheduled" once they've started. If BOTH sources are unreachable every
// getter returns an empty list (the UI shows an empty state) rather than fake
// data.
//
// Knockout matches whose teams aren't decided yet appear with placeholder names
// (e.g. "W101", "1A") — that's accurate, those slots fill in after the groups.
//
// CONFIG (optional)
//   FIXTURES_URL     override the schedule source URL (same JSON shape).
//   LIVE_SCORES_URL  override the live scoreboard URL (ESPN shape).

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
  minute: string | null; // "64'" while live (from the scoreboard), else null
  homeScore: number | null;
  awayScore: number | null;
  source: string;      // attribution
};

// A match line for the sidebar group rail (subset of Fixture).
export type GroupMatch = Pick<
  Fixture,
  | "id" | "teamA" | "teamB" | "teamASlug" | "teamBSlug"
  | "status" | "minute" | "homeScore" | "awayScore" | "time" | "date"
>;

export type GroupLive = {
  name: string;                              // "Group A"
  teams: { name: string; slug: string }[];   // the group's 4 nations
  matches: GroupMatch[];                     // today's matches (live first)
};

// ─── SOURCES ──────────────────────────────────────────────────────────────────

const SOURCE_URL =
  process.env.FIXTURES_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const LIVE_URL =
  process.env.LIVE_SCORES_URL ||
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

// ─── NAME → SLUG MAPPING ──────────────────────────────────────────────────────
// Map the team names that differ from our nation slugs (covers both sources);
// everything else falls back to lowercase-with-dashes.

const SLUG_OVERRIDES: Record<string, string> = {
  "south korea": "korea-republic",
  "czech republic": "czechia",
  "bosnia & herzegovina": "bosnia-and-herzegovina",
  "bosnia and herzegovina": "bosnia-and-herzegovina",
  "bosnia-herzegovina": "bosnia-and-herzegovina",
  "cape verde": "cabo-verde",
  "dr congo": "congo-dr",
  "ivory coast": "côte-d'ivoire",
  "côte d'ivoire": "côte-d'ivoire",
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

// ─── SCHEDULE RESPONSE SHAPE (only the fields we use) ─────────────────────────

type ApiMatch = {
  round?: string;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  ground?: string;
  // Played matches carry `score: { ft: [home, away], ht: [...] }`.
  score?: { ft?: (number | null)[] | null } | null;
  // Older flat shape, kept as a fallback.
  score1?: number | null;
  score2?: number | null;
};

function toScores(m: ApiMatch): [number | null, number | null] {
  const ft = m.score?.ft;
  if (Array.isArray(ft) && typeof ft[0] === "number" && typeof ft[1] === "number") {
    return [ft[0], ft[1]];
  }
  return [
    typeof m.score1 === "number" ? m.score1 : null,
    typeof m.score2 === "number" ? m.score2 : null,
  ];
}

// ─── KICK-OFF HEURISTIC ───────────────────────────────────────────────────────
// Fallback when the live scoreboard can't confirm a match's state: derive it
// from the scheduled kick-off ("13:00 UTC-6" + the match date). A match is
// treated as live from kick-off until ~FT (incl. halftime + stoppage), then
// finished — so stale "scheduled" cards can never linger after the whistle.

const LIVE_WINDOW_MS = 165 * 60_000;

function kickoffMs(date: string, time: string): number | null {
  if (!date) return null;
  const m = time.match(/^(\d{1,2}):(\d{2})\s*UTC([+-])(\d{1,2})(?::(\d{2}))?$/i);
  if (!m) return null;
  const [, hh, mm, sign, oh, om] = m;
  const iso = `${date}T${hh.padStart(2, "0")}:${mm}:00${sign}${oh.padStart(2, "0")}:${om ?? "00"}`;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function heuristicStatus(date: string, time: string): FixtureStatus {
  const ko = kickoffMs(date, time);
  const now = Date.now();
  if (ko !== null) {
    if (now >= ko + LIVE_WINDOW_MS) return "finished";
    if (now >= ko) return "live";
    return "scheduled";
  }
  // No parseable kick-off — compare calendar dates (UTC) instead.
  const today = new Date().toISOString().slice(0, 10);
  if (date && date < today) return "finished";
  return "scheduled";
}

// ─── LIVE SCOREBOARD (ESPN) ───────────────────────────────────────────────────
// Pulls the last 3 days so just-finished results backfill even before the
// schedule source updates. Keyed by unordered team-slug pair; the date check
// in applyOverlay disambiguates any knockout rematch.

type LiveOverlay = {
  state: "in" | "post";
  minute: string | null;
  dateUTC: string;       // "2026-06-11"
  homeSlug: string;
  homeScore: number | null;
  awayScore: number | null;
};

type EspnCompetitor = {
  homeAway?: string;
  score?: string | number;
  team?: { displayName?: string };
};

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

function toInt(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function fetchLiveOverlays(): Promise<Map<string, LiveOverlay[]>> {
  const map = new Map<string, LiveOverlay[]>();
  try {
    const stamp = (t: number) => new Date(t).toISOString().slice(0, 10).replace(/-/g, "");
    const now = Date.now();
    const url = `${LIVE_URL}?dates=${stamp(now - 2 * 86_400_000)}-${stamp(now)}&limit=100`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return map;
    const data: {
      events?: {
        date?: string;
        competitions?: {
          status?: { displayClock?: string; type?: { state?: string } };
          competitors?: EspnCompetitor[];
        }[];
      }[];
    } = await res.json();

    for (const event of data?.events ?? []) {
      const comp = event?.competitions?.[0];
      const state = comp?.status?.type?.state;
      if (state !== "in" && state !== "post") continue; // "pre" adds nothing
      const home = comp?.competitors?.find((c) => c.homeAway === "home");
      const away = comp?.competitors?.find((c) => c.homeAway === "away");
      const homeSlug = teamSlug(home?.team?.displayName ?? "");
      const awaySlug = teamSlug(away?.team?.displayName ?? "");
      if (!homeSlug || !awaySlug) continue;

      const overlay: LiveOverlay = {
        state,
        minute: state === "in" ? (comp?.status?.displayClock ?? null) : null,
        dateUTC: String(event?.date ?? "").slice(0, 10),
        homeSlug,
        homeScore: toInt(home?.score),
        awayScore: toInt(away?.score),
      };
      const key = pairKey(homeSlug, awaySlug);
      const list = map.get(key);
      if (list) list.push(overlay);
      else map.set(key, [overlay]);
    }
  } catch {
    // Scoreboard down — the kick-off heuristic covers live/finished state.
  }
  return map;
}

// The scoreboard is authoritative while a match is in play or just finished —
// it knows the minute and the score before the schedule source updates.
function applyOverlay(f: Fixture, overlays: Map<string, LiveOverlay[]>): Fixture {
  if (!f.teamASlug || !f.teamBSlug) return f;
  const candidates = overlays.get(pairKey(f.teamASlug, f.teamBSlug)) ?? [];
  const o = candidates.find(
    (c) =>
      !f.date ||
      !c.dateUTC ||
      Math.abs(Date.parse(c.dateUTC) - Date.parse(f.date)) <= 86_400_000,
  );
  if (!o) return f;
  const flipped = o.homeSlug !== f.teamASlug;
  return {
    ...f,
    status: o.state === "in" ? "live" : "finished",
    minute: o.minute,
    homeScore: flipped ? o.awayScore : o.homeScore,
    awayScore: flipped ? o.homeScore : o.awayScore,
  };
}

// ─── MAP + MERGE ──────────────────────────────────────────────────────────────

function mapMatch(m: ApiMatch, i: number, overlays: Map<string, LiveOverlay[]>): Fixture {
  const teamA = m.team1?.trim() || "TBD";
  const teamB = m.team2?.trim() || "TBD";
  const [homeScore, awayScore] = toScores(m);
  const played = homeScore !== null && awayScore !== null;
  const date = m.date ?? "";
  const time = m.time?.trim() || "TBD";
  const fixture: Fixture = {
    id: `wc2026-${i}`,
    round: m.round?.trim() || "Match",
    group: m.group?.trim() || "",
    date,
    time,
    teamA,
    teamB,
    teamASlug: teamSlug(teamA),
    teamBSlug: teamSlug(teamB),
    venue: m.ground?.trim() || "Venue TBD",
    country: "",
    status: played ? "finished" : heuristicStatus(date, time),
    minute: null,
    homeScore,
    awayScore,
    source: "OpenFootball",
  };
  return applyOverlay(fixture, overlays);
}

// ─── FETCH (cached) ───────────────────────────────────────────────────────────
// Server-side fetches: schedule revalidates every minute, scoreboard every 30s
// (pages re-render via LiveRefresh; the sidebar polls /api/live). Returns []
// on any error so the UI shows an honest empty state instead of crashing.

async function fetchFixtures(): Promise<Fixture[]> {
  try {
    const [schedRes, overlays] = await Promise.all([
      fetch(SOURCE_URL, { next: { revalidate: 60 } }),
      fetchLiveOverlays(),
    ]);
    if (!schedRes.ok) return [];
    const data: { matches?: ApiMatch[] | null } = await schedRes.json();
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    return matches
      .map((m, i) => mapMatch(m, i, overlays))
      .sort((a, b) => a.date.localeCompare(b.date));
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

/** Soonest not-yet-started fixtures, sorted by date. Live/played excluded. */
export async function getUpcomingFixtures(limit = 9): Promise<Fixture[]> {
  const all = await fetchFixtures();
  return all.filter((f) => f.status === "scheduled").slice(0, limit);
}

/** Matches in play right now. */
export async function getLiveFixtures(): Promise<Fixture[]> {
  const all = await fetchFixtures();
  return all.filter((f) => f.status === "live");
}

/** Most recent completed matches (with a known score), newest first. */
export async function getRecentResults(limit = 9): Promise<Fixture[]> {
  const all = await fetchFixtures();
  return all
    .filter((f) => f.status === "finished" && f.homeScore !== null && f.awayScore !== null)
    .reverse() // source order is date-ascending
    .slice(0, limit);
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

/**
 * Groups A–L for the sidebar rail: each group's nations plus today's matches
 * (live first, with minute + score). Yesterday's games drop out here and show
 * up in the homepage "Recent results" section instead.
 */
export async function getGroupsToday(): Promise<GroupLive[]> {
  const all = await fetchFixtures();
  const today = new Date().toISOString().slice(0, 10);
  const groups = new Map<string, GroupLive>();

  for (const f of all) {
    if (!f.group) continue;
    let g = groups.get(f.group);
    if (!g) {
      g = { name: f.group, teams: [], matches: [] };
      groups.set(f.group, g);
    }
    for (const t of [
      { name: f.teamA, slug: f.teamASlug },
      { name: f.teamB, slug: f.teamBSlug },
    ]) {
      if (t.slug && !g.teams.some((x) => x.slug === t.slug)) g.teams.push(t);
    }
    if (f.status === "live" || f.date === today) {
      g.matches.push({
        id: f.id,
        teamA: f.teamA,
        teamB: f.teamB,
        teamASlug: f.teamASlug,
        teamBSlug: f.teamBSlug,
        status: f.status,
        minute: f.minute,
        homeScore: f.homeScore,
        awayScore: f.awayScore,
        time: f.time,
        date: f.date,
      });
    }
  }

  return [...groups.values()]
    .map((g) => ({
      ...g,
      teams: [...g.teams].sort((a, b) => a.name.localeCompare(b.name)),
      matches: [...g.matches].sort(
        (a, b) => Number(b.status === "live") - Number(a.status === "live"),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
