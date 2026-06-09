// src/app/data/nations.ts
//
// Reference data for the nations shown on the site: name, flag, languages and a
// card colour theme. This is real, factual reference data (the participating
// nations) — NOT invented content.
//
// There is intentionally NO streamer, room, or "fan count" data here. Those are
// user-generated and don't exist until real creators sign up, so the site starts
// empty and fills in from a real source later (see the schema types below and
// data/rooms.ts).

// ─── TYPES ────────────────────────────────────────────────────────────────────

/** Colours used to tint a nation's card. */
export type NationTheme = {
  border: string;     // outer gradient tint
  accent: string;     // inner glow tint
};

export type Nation = {
  slug: string;        // matches the /nation/[slug] route
  name: string;
  flag: string;        // emoji
  languages: string[]; // e.g. ["Arabic", "French"]
  theme: NationTheme;
  blurb: string;       // one-line description for the nation hub
};

// Schema for content that will come from real creators later. Kept here so the
// card components (StreamerCard, RoomListingCard) and a future backend share one
// shape. No instances are seeded — the site starts empty.
export type Streamer = {
  handle: string;
  style: string;
  language: string;
  viewers: string;
};

export type RoomListing = {
  match: string;
  title: string;
  host: string;
  status: string;
  viewers: string;
};

// What you type when adding a nation (blurb is auto-filled if omitted).
type RawNation = Omit<Nation, "blurb"> & { blurb?: string };

// ─── NATION REFERENCE DATA ────────────────────────────────────────────────────

const rawNations: RawNation[] = [
  { slug: "algeria", name: "Algeria", flag: "🇩🇿", languages: ["Arabic", "French"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "argentina", name: "Argentina", flag: "🇦🇷", languages: ["Spanish", "English"], theme: { border: "rgba(116,179,242,0.32)", accent: "rgba(255,215,0,0.1)" } },
  { slug: "australia", name: "Australia", flag: "🇦🇺", languages: ["English"], theme: { border: "rgba(0,82,180,0.32)", accent: "rgba(255,206,0,0.12)" } },
  { slug: "austria", name: "Austria", flag: "🇦🇹", languages: ["German", "English"], theme: { border: "rgba(200,16,46,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "belgium", name: "Belgium", flag: "🇧🇪", languages: ["Dutch", "French", "English"], theme: { border: "rgba(255,206,0,0.32)", accent: "rgba(0,0,0,0.12)" } },
  { slug: "bosnia-and-herzegovina", name: "Bosnia and Herzegovina", flag: "🇧🇦", languages: ["Bosnian", "English"], theme: { border: "rgba(0,84,166,0.32)", accent: "rgba(255,255,204,0.08)" } },
  { slug: "brazil", name: "Brazil", flag: "🇧🇷", languages: ["Portuguese", "English"], theme: { border: "rgba(16,185,129,0.32)", accent: "rgba(253,224,71,0.14)" } },
  { slug: "cabo-verde", name: "Cabo Verde", flag: "🇨🇻", languages: ["Portuguese", "Creole"], theme: { border: "rgba(0,135,155,0.32)", accent: "rgba(255,204,0,0.12)" } },
  { slug: "canada", name: "Canada", flag: "🇨🇦", languages: ["English", "French"], theme: { border: "rgba(0,114,188,0.28)", accent: "rgba(255,255,255,0.08)" } },
  { slug: "colombia", name: "Colombia", flag: "🇨🇴", languages: ["Spanish", "English"], theme: { border: "rgba(255,209,0,0.32)", accent: "rgba(220,20,60,0.1)" } },
  { slug: "congo-dr", name: "Congo DR", flag: "🇨🇩", languages: ["French", "Lingala"], theme: { border: "rgba(0,54,158,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "côte-d'ivoire", name: "Côte d'Ivoire", flag: "🇨🇮", languages: ["French", "English"], theme: { border: "rgba(255,153,0,0.32)", accent: "rgba(0,0,0,0.1)" } },
  { slug: "croatia", name: "Croatia", flag: "🇭🇷", languages: ["Croatian", "English"], theme: { border: "rgba(255,255,255,0.28)", accent: "rgba(200,16,46,0.12)" } },
  { slug: "curaçao", name: "Curaçao", flag: "🇨🇼", languages: ["Dutch", "Papiamentu"], theme: { border: "rgba(0,104,183,0.32)", accent: "rgba(255,204,0,0.1)" } },
  { slug: "czechia", name: "Czechia", flag: "🇨🇿", languages: ["Czech", "English"], theme: { border: "rgba(0,33,165,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "ecuador", name: "Ecuador", flag: "🇪🇨", languages: ["Spanish", "English"], theme: { border: "rgba(255,209,0,0.32)", accent: "rgba(0,91,187,0.12)" } },
  { slug: "egypt", name: "Egypt", flag: "🇪🇬", languages: ["Arabic", "English"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "england", name: "England", flag: "🇬🇧", languages: ["English"], theme: { border: "rgba(255,255,255,0.28)", accent: "rgba(206,17,38,0.12)" } },
  { slug: "france", name: "France", flag: "🇫🇷", languages: ["French", "English"], theme: { border: "rgba(0,85,164,0.32)", accent: "rgba(237,41,57,0.12)" } },
  { slug: "germany", name: "Germany", flag: "🇩🇪", languages: ["German", "English"], theme: { border: "rgba(0,0,0,0.32)", accent: "rgba(221,0,0,0.1)" } },
  { slug: "ghana", name: "Ghana", flag: "🇬🇭", languages: ["English"], theme: { border: "rgba(0,0,0,0.32)", accent: "rgba(255,153,0,0.12)" } },
  { slug: "haiti", name: "Haiti", flag: "🇭🇹", languages: ["French", "Creole"], theme: { border: "rgba(0,32,91,0.32)", accent: "rgba(206,17,38,0.1)" } },
  { slug: "ir-iran", name: "IR Iran", flag: "🇮🇷", languages: ["Persian", "English"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "iraq", name: "Iraq", flag: "🇮🇶", languages: ["Arabic", "Kurdish"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "japan", name: "Japan", flag: "🇯🇵", languages: ["Japanese", "English"], theme: { border: "rgba(255,255,255,0.28)", accent: "rgba(206,17,38,0.12)" } },
  { slug: "jordan", name: "Jordan", flag: "🇯🇴", languages: ["Arabic", "English"], theme: { border: "rgba(206,17,38,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "korea-republic", name: "Korea Republic", flag: "🇰🇷", languages: ["Korean", "English"], theme: { border: "rgba(255,255,255,0.28)", accent: "rgba(0,57,166,0.12)" } },
  { slug: "mexico", name: "Mexico", flag: "🇲🇽", languages: ["Spanish", "English"], theme: { border: "rgba(0,152,69,0.32)", accent: "rgba(255,0,0,0.12)" } },
  { slug: "morocco", name: "Morocco", flag: "🇲🇦", languages: ["Arabic", "French"], theme: { border: "rgba(165,42,42,0.32)", accent: "rgba(16,185,129,0.12)" } },
  { slug: "netherlands", name: "Netherlands", flag: "🇳🇱", languages: ["Dutch", "English"], theme: { border: "rgba(255,102,0,0.32)", accent: "rgba(33,37,159,0.1)" } },
  { slug: "new-zealand", name: "New Zealand", flag: "🇳🇿", languages: ["English", "Māori"], theme: { border: "rgba(0,0,0,0.32)", accent: "rgba(255,255,255,0.08)" } },
  { slug: "norway", name: "Norway", flag: "🇳🇴", languages: ["Norwegian", "English"], theme: { border: "rgba(204,51,51,0.32)", accent: "rgba(0,32,91,0.12)" } },
  { slug: "panama", name: "Panama", flag: "🇵🇦", languages: ["Spanish", "English"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,0,0,0.1)" } },
  { slug: "paraguay", name: "Paraguay", flag: "🇵🇾", languages: ["Spanish", "Guarani"], theme: { border: "rgba(255,0,0,0.32)", accent: "rgba(255,255,0,0.1)" } },
  { slug: "portugal", name: "Portugal", flag: "🇵🇹", languages: ["Portuguese", "English"], theme: { border: "rgba(155,0,0,0.32)", accent: "rgba(0,122,61,0.14)" } },
  { slug: "qatar", name: "Qatar", flag: "🇶🇦", languages: ["Arabic", "English"], theme: { border: "rgba(140,39,31,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "saudi-arabia", name: "Saudi Arabia", flag: "🇸🇦", languages: ["Arabic", "English"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "scotland", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", languages: ["English", "Scots"], theme: { border: "rgba(0,0,0,0.32)", accent: "rgba(255,0,0,0.12)" } },
  { slug: "senegal", name: "Senegal", flag: "🇸🇳", languages: ["French", "Wolof"], theme: { border: "rgba(0,122,61,0.32)", accent: "rgba(255,215,0,0.1)" } },
  { slug: "south-africa", name: "South Africa", flag: "🇿🇦", languages: ["English", "Afrikaans"], theme: { border: "rgba(0,0,0,0.32)", accent: "rgba(255,255,0,0.1)" } },
  { slug: "spain", name: "Spain", flag: "🇪🇸", languages: ["Spanish", "English"], theme: { border: "rgba(206,17,38,0.32)", accent: "rgba(255,205,0,0.1)" } },
  { slug: "sweden", name: "Sweden", flag: "🇸🇪", languages: ["Swedish", "English"], theme: { border: "rgba(0,106,167,0.32)", accent: "rgba(254,204,0,0.1)" } },
  { slug: "switzerland", name: "Switzerland", flag: "🇨🇭", languages: ["German", "French", "Italian"], theme: { border: "rgba(255,255,255,0.32)", accent: "rgba(206,17,38,0.1)" } },
  { slug: "tunisia", name: "Tunisia", flag: "🇹🇳", languages: ["Arabic", "French"], theme: { border: "rgba(206,17,38,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "türkiye", name: "Türkiye", flag: "🇹🇷", languages: ["Turkish", "English"], theme: { border: "rgba(206,17,38,0.32)", accent: "rgba(0,122,61,0.12)" } },
  { slug: "usa", name: "USA", flag: "🇺🇸", languages: ["English", "Spanish"], theme: { border: "rgba(3,82,156,0.32)", accent: "rgba(222,38,48,0.12)" } },
  { slug: "uruguay", name: "Uruguay", flag: "🇺🇾", languages: ["Spanish", "English"], theme: { border: "rgba(0,68,147,0.32)", accent: "rgba(255,255,255,0.1)" } },
  { slug: "uzbekistan", name: "Uzbekistan", flag: "🇺🇿", languages: ["Uzbek", "Russian"], theme: { border: "rgba(0,102,102,0.32)", accent: "rgba(255,255,255,0.08)" } },
];

export const nations: Nation[] = rawNations
  .map((n) => ({
    ...n,
    blurb: n.blurb ?? `Fan rooms, reactions, and creators supporting ${n.name}.`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Turn a nation name into its URL slug, the same way links are generated. */
export function nationSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/** Look up one nation by slug. Returns undefined if it doesn't exist. */
export function getNation(slug: string): Nation | undefined {
  const target = slug.trim().toLowerCase();
  return nations.find((n) => n.slug === target);
}

/** Every nation, alphabetical — used by the homepage grid. */
export function getAllNations(): Nation[] {
  return nations;
}

// ─── CONTINENTS ───────────────────────────────────────────────────────────────
// Used to group the nations in the sidebar into collapsible sections.

export const CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

export type Continent = (typeof CONTINENTS)[number];

// Which continent each nation belongs to (by slug). Australia is grouped under
// Oceania geographically even though it competes in the Asian confederation.
const continentBySlug: Record<string, Continent> = {
  algeria: "Africa",
  "cabo-verde": "Africa",
  "congo-dr": "Africa",
  "côte-d'ivoire": "Africa",
  egypt: "Africa",
  ghana: "Africa",
  morocco: "Africa",
  senegal: "Africa",
  "south-africa": "Africa",
  tunisia: "Africa",
  "ir-iran": "Asia",
  iraq: "Asia",
  japan: "Asia",
  jordan: "Asia",
  "korea-republic": "Asia",
  qatar: "Asia",
  "saudi-arabia": "Asia",
  uzbekistan: "Asia",
  austria: "Europe",
  belgium: "Europe",
  "bosnia-and-herzegovina": "Europe",
  croatia: "Europe",
  czechia: "Europe",
  england: "Europe",
  france: "Europe",
  germany: "Europe",
  netherlands: "Europe",
  norway: "Europe",
  portugal: "Europe",
  scotland: "Europe",
  spain: "Europe",
  sweden: "Europe",
  switzerland: "Europe",
  türkiye: "Europe",
  canada: "North America",
  curaçao: "North America",
  haiti: "North America",
  mexico: "North America",
  panama: "North America",
  usa: "North America",
  australia: "Oceania",
  "new-zealand": "Oceania",
  argentina: "South America",
  brazil: "South America",
  colombia: "South America",
  ecuador: "South America",
  paraguay: "South America",
  uruguay: "South America",
};

/**
 * Nations grouped by continent (each group alphabetical by name, groups in the
 * CONTINENTS order). Empty groups are dropped. Used by the sidebar dropdowns.
 */
export function getNationsByContinent(): { continent: Continent; nations: Nation[] }[] {
  return CONTINENTS.map((continent) => ({
    continent,
    nations: nations.filter((n) => continentBySlug[n.slug] === continent),
  })).filter((group) => group.nations.length > 0);
}
