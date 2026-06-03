// src/data/fixtures.ts
//
// Official FIFA World Cup 2026 fixture data — stored locally.
//
// Source of truth: FIFA (official 2026 World Cup schedule, draw held 5 Dec 2025).
// This is a small hand-entered starter set. It is NOT scraped, and there is no
// API or backend connected. Expand the `fixtures` array as needed.
//
// Honesty rules followed here:
//  - Matchups, dates, cities, groups taken from the official published schedule.
//  - Kickoff times are only included where the official schedule clearly states
//    them. Anything uncertain is marked "TBD". No times are invented.
//  - `status` reflects schedule state, not a live result feed.

// ─── TYPE ─────────────────────────────────────────────────────────────────────

export type Fixture = {
  id: string;
  stage: string;
  group: string;
  date: string;       // ISO date, e.g. "2026-06-11"
  time: string;       // local kickoff time, or "TBD" if not confirmed here
  teamA: string;
  teamB: string;
  teamASlug: string;  // matches /nation/[slug]
  teamBSlug: string;  // matches /nation/[slug]
  venue: string;
  city: string;
  country: string;
  status: "scheduled" | "live" | "finished";
  source: "FIFA";
};

// ─── STARTER FIXTURES ─────────────────────────────────────────────────────────
// Group stage openers. Dates/cities/groups are from the official schedule.
// Local kickoff times included only where confirmed; otherwise "TBD".

export const fixtures: Fixture[] = [
  {
    id: "wc2026-grpA-mex-rsa",
    stage: "Group Stage",
    group: "A",
    date: "2026-06-11",
    time: "1:00 PM", // local (Mexico City) — tournament opener
    teamA: "Mexico",
    teamB: "South Africa",
    teamASlug: "mexico",
    teamBSlug: "south-africa",
    venue: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpB-can-bih",
    stage: "Group Stage",
    group: "B",
    date: "2026-06-12",
    time: "TBD", // Canada's opponent was UEFA Playoff A (resolved to Bosnia)
    teamA: "Canada",
    teamB: "Bosnia and Herzegovina",
    teamASlug: "canada",
    teamBSlug: "bosnia-and-herzegovina",
    venue: "BMO Field",
    city: "Toronto",
    country: "Canada",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpD-usa-par",
    stage: "Group Stage",
    group: "D",
    date: "2026-06-12",
    time: "6:00 PM", // local (Inglewood, CA)
    teamA: "USA",
    teamB: "Paraguay",
    teamASlug: "usa",
    teamBSlug: "paraguay",
    venue: "SoFi Stadium",
    city: "Inglewood",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpC-bra-mar",
    stage: "Group Stage",
    group: "C",
    date: "2026-06-13",
    time: "6:00 PM", // local (East Rutherford, NJ)
    teamA: "Brazil",
    teamB: "Morocco",
    teamASlug: "brazil",
    teamBSlug: "morocco",
    venue: "MetLife Stadium",
    city: "East Rutherford",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpE-ger-cur",
    stage: "Group Stage",
    group: "E",
    date: "2026-06-14",
    time: "1:00 PM", // local (Houston)
    teamA: "Germany",
    teamB: "Curaçao",
    teamASlug: "germany",
    teamBSlug: "curacao",
    venue: "NRG Stadium",
    city: "Houston",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpF-jpn-ned",
    stage: "Group Stage",
    group: "F",
    date: "2026-06-14",
    time: "7:00 PM", // local (Dallas) — officially listed as Netherlands vs Japan
    teamA: "Japan",
    teamB: "Netherlands",
    teamASlug: "japan",
    teamBSlug: "netherlands",
    venue: "AT&T Stadium",
    city: "Arlington",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpH-esp-cpv",
    stage: "Group Stage",
    group: "H",
    date: "2026-06-15",
    time: "12:00 PM", // local (Atlanta)
    teamA: "Spain",
    teamB: "Cabo Verde",
    teamASlug: "spain",
    teamBSlug: "cabo-verde",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpI-fra-sen",
    stage: "Group Stage",
    group: "I",
    date: "2026-06-16",
    time: "3:00 PM", // local (East Rutherford, NJ)
    teamA: "France",
    teamB: "Senegal",
    teamASlug: "france",
    teamBSlug: "senegal",
    venue: "MetLife Stadium",
    city: "East Rutherford",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpJ-arg-alg",
    stage: "Group Stage",
    group: "J",
    date: "2026-06-16",
    time: "9:00 PM", // local (Kansas City)
    teamA: "Argentina",
    teamB: "Algeria",
    teamASlug: "argentina",
    teamBSlug: "algeria",
    venue: "Arrowhead Stadium",
    city: "Kansas City",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
  {
    id: "wc2026-grpL-eng-cro",
    stage: "Group Stage",
    group: "L",
    date: "2026-06-17",
    time: "3:00 PM", // local (Arlington, TX)
    teamA: "England",
    teamB: "Croatia",
    teamASlug: "england",
    teamBSlug: "croatia",
    venue: "AT&T Stadium",
    city: "Arlington",
    country: "USA",
    status: "scheduled",
    source: "FIFA",
  },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Get every fixture involving a given nation, by its slug.
 * Matches either team in the fixture. Useful on /nation/[slug] pages.
 */
export function getFixturesByNationSlug(slug: string): Fixture[] {
  const target = slug.trim().toLowerCase();
  return fixtures.filter(
    (f) => f.teamASlug === target || f.teamBSlug === target
  );
}

/**
 * Get the soonest upcoming (scheduled) fixtures, sorted by date.
 * Pass a limit to cap how many you get back (default 5).
 * Useful for a "next matches" list on the homepage.
 */
export function getUpcomingFixtures(limit: number = 5): Fixture[] {
  return fixtures
    .filter((f) => f.status === "scheduled")
    .slice() // copy before sorting so we don't mutate the original array
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/**
 * Find a single fixture by its id. Returns undefined if not found.
 * Useful on /room/[id] or /live/[roomId] if a room maps to a fixture.
 */
export function getFixtureById(id: string): Fixture | undefined {
  return fixtures.find((f) => f.id === id);
}
