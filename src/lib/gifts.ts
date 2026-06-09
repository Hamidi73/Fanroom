// ─────────────────────────────────────────────────────────────────────────────
// FanRoom gift economy — "Roars" virtual currency + the full gift catalogue.
//
// This is the SERVER-AUTHORITATIVE source of truth for prices. The client only
// ever sends a gift id; it never sends an amount. (Same rule the paid-highlight
// tiers follow — see src/lib/tiers.ts.)
//
// Monetization model (designed by the finance/commercial pass):
//   • Coins ("Roars"), 100 Roars = $1.00 at the zero-bonus reference rate.
//   • Coins are ONE-WAY (USD → Roars only), non-cashable, non-transferable.
//     That single rule keeps us out of both gambling and money-transmitter law.
//   • A wide gift price ladder (5 → 25,000 Roars) does the "financial splitting":
//     it captures both $1 minnows and $250 whales on the same screen.
//   • Casino-feel comes from combos, streaks, scarcity and whale recognition —
//     the high-spend mechanics that carry ZERO gambling exposure. Randomized
//     "lucky" boxes are gated behind `flagged` + `geoDeny` until cleared.
//
// Nothing here charges a card on its own. Buying Roars (CoinStore) and crediting
// a wallet is a backend step (Stripe + a wallet table) wired separately.
// ─────────────────────────────────────────────────────────────────────────────

import { getAllNations, type Nation } from "@/app/data";

// ─── ECONOMY CONSTANTS ───────────────────────────────────────────────────────

export const ECONOMY = {
  coinName: "Roars",
  coinSymbol: "🦁",
  roarsPerUsd: 100, // 100 Roars = $1.00 reference rate
  platformSplit: 0.7, // platform keeps 70% of gift face value…
  creatorSplit: 0.3, // …creator earns 30% (sweetened for signed creators)
  defaultDailyCapUsd: 300, // spend-velocity guardrail
  purchaseMinAge: 18, // hard age-gate on buying Roars
} as const;

/** Face value of an amount of Roars, in whole US cents. */
export function roarsToUsdCents(roars: number): number {
  return Math.round((roars / ECONOMY.roarsPerUsd) * 100);
}

/** How a gift's Roars are split between the house and the creator. */
export function revenueSplit(roars: number): { platformRoars: number; creatorRoars: number } {
  const platformRoars = Math.round(roars * ECONOMY.platformSplit);
  return { platformRoars, creatorRoars: roars - platformRoars };
}

// ─── COIN BUNDLES (the recharge store) ───────────────────────────────────────
// Bonus % scales with size to pull buyers up the ladder; charm pricing; the
// "Ultra" tier is the anchored "most popular" sweet spot.

export type CoinBundle = {
  id: string;
  usdPriceCents: number;
  baseRoars: number;
  bonusPct: number;
  totalRoars: number;
  badge?: "popular" | "best_value";
};

function bundle(id: string, usdPriceCents: number, baseRoars: number, bonusPct: number, badge?: CoinBundle["badge"]): CoinBundle {
  return { id, usdPriceCents, baseRoars, bonusPct, totalRoars: Math.round(baseRoars * (1 + bonusPct)), badge };
}

export const COIN_BUNDLES: CoinBundle[] = [
  bundle("starter", 199, 199, 0),
  bundle("fan", 499, 499, 0.04),
  bundle("supporter", 999, 999, 0.08),
  bundle("ultra", 1999, 1999, 0.15, "popular"),
  bundle("champion", 4999, 4999, 0.22),
  bundle("legend", 9999, 9999, 0.3, "best_value"),
];

// ─── RARITY TIERS ────────────────────────────────────────────────────────────

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export const RARITY: Record<Rarity, { label: string; color: string; glow: string }> = {
  common: { label: "Common", color: "#9aa0a6", glow: "rgba(154,160,166,0.4)" },
  rare: { label: "Rare", color: "#3ea6ff", glow: "rgba(62,166,255,0.5)" },
  epic: { label: "Epic", color: "#b36bff", glow: "rgba(179,107,255,0.55)" },
  legendary: { label: "Legendary", color: "#ffb020", glow: "rgba(255,176,32,0.6)" },
  mythic: { label: "Mythic", color: "#ff4d6d", glow: "rgba(255,77,109,0.65)" },
};

// ─── GIFT TYPES ──────────────────────────────────────────────────────────────

/** Animation style the overlay renders. Kept small + reusable so 48 nation
 *  gifts come from ~8 loops, recoloured per nation. */
export type Celebration =
  | "pop"
  | "rise"
  | "spin-jump"
  | "knee-slide"
  | "dribble"
  | "bicycle"
  | "header"
  | "dance"
  | "charge"
  | "roar"
  | "takeover";

export type GiftSound =
  | "pop"
  | "whoosh"
  | "sparkle"
  | "horn"
  | "drum"
  | "boom"
  | "cheer"
  | "whistle";

/** Tab the gift lives under in the drawer. Universal packs first, then the six
 *  continent packs hold the nation legends (mirrors the sidebar grouping). */
export type GiftPackId =
  | "reactions"
  | "atmosphere"
  | "legendary"
  | "mythic"
  | "africa"
  | "asia"
  | "europe"
  | "north-america"
  | "oceania"
  | "south-america";

export type Gift = {
  id: string;
  name: string;
  icon: string; // emoji or flag
  rarity: Rarity;
  priceRoars: number;
  pack: GiftPackId;
  celebration: Celebration;
  sound: GiftSound;
  color: string; // accent used by the animation
  fullScreen?: boolean; // mythic gifts take over the whole stream
  nationSlug?: string; // set for the 48 nation legends
  flagged?: boolean; // true = dark at launch (Flagged Vault)
  geoDeny?: string[]; // ISO country codes where this gift is unavailable
};

export const PACKS: { id: GiftPackId; label: string; icon: string }[] = [
  { id: "reactions", label: "Reactions", icon: "👏" },
  { id: "atmosphere", label: "Atmosphere", icon: "🎺" },
  { id: "legendary", label: "Legendary", icon: "🏆" },
  { id: "mythic", label: "Mythic", icon: "🔥" },
  { id: "south-america", label: "S. America", icon: "🌎" },
  { id: "europe", label: "Europe", icon: "🏰" },
  { id: "africa", label: "Africa", icon: "🦁" },
  { id: "asia", label: "Asia", icon: "🐉" },
  { id: "north-america", label: "N. America", icon: "⭐" },
  { id: "oceania", label: "Oceania", icon: "🌊" },
];

// ─── UNIVERSAL GIFTS (every room, all fanbases) ──────────────────────────────

const UNIVERSAL_GIFTS: Gift[] = [
  // Common (5–50) — habit-forming spam reactions
  { id: "clap", name: "Clap", icon: "👏", rarity: "common", priceRoars: 5, pack: "reactions", celebration: "pop", sound: "pop", color: "#9aa0a6" },
  { id: "whistle", name: "Whistle", icon: "📣", rarity: "common", priceRoars: 9, pack: "reactions", celebration: "pop", sound: "whistle", color: "#9aa0a6" },
  { id: "flag-wave", name: "Flag Wave", icon: "🚩", rarity: "common", priceRoars: 19, pack: "reactions", celebration: "rise", sound: "whoosh", color: "#3ea6ff" },
  { id: "drumbeat", name: "Drumbeat", icon: "🥁", rarity: "common", priceRoars: 29, pack: "reactions", celebration: "pop", sound: "drum", color: "#c98a2b" },
  { id: "flare", name: "Flare", icon: "🔴", rarity: "common", priceRoars: 49, pack: "reactions", celebration: "rise", sound: "whoosh", color: "#ff4d4d" },
  // More celebration reactions — cheap, spammable, goal-moment energy
  { id: "thumbs-up", name: "Respect", icon: "👍", rarity: "common", priceRoars: 5, pack: "reactions", celebration: "pop", sound: "pop", color: "#9aa0a6" },
  { id: "hearts", name: "Love It", icon: "❤️", rarity: "common", priceRoars: 8, pack: "reactions", celebration: "rise", sound: "sparkle", color: "#ff4d6d" },
  { id: "star", name: "Star", icon: "⭐", rarity: "common", priceRoars: 10, pack: "reactions", celebration: "pop", sound: "sparkle", color: "#ffd23f" },
  { id: "fire", name: "On Fire", icon: "🔥", rarity: "common", priceRoars: 12, pack: "reactions", celebration: "rise", sound: "whoosh", color: "#ff6b3d" },
  { id: "goal", name: "GOAL!", icon: "⚽", rarity: "common", priceRoars: 15, pack: "reactions", celebration: "pop", sound: "cheer", color: "#ffffff" },
  { id: "raise-roof", name: "Raise the Roof", icon: "🙌", rarity: "common", priceRoars: 14, pack: "reactions", celebration: "pop", sound: "cheer", color: "#ffb020" },
  { id: "muscle", name: "Let's Go", icon: "💪", rarity: "common", priceRoars: 16, pack: "reactions", celebration: "charge", sound: "drum", color: "#3ea6ff" },
  { id: "cheers", name: "Cheers", icon: "🍻", rarity: "common", priceRoars: 18, pack: "reactions", celebration: "pop", sound: "pop", color: "#ffb020" },
  { id: "party-popper", name: "Party Popper", icon: "🎊", rarity: "common", priceRoars: 19, pack: "reactions", celebration: "pop", sound: "cheer", color: "#b36bff" },
  { id: "sparkler", name: "Sparkler", icon: "✨", rarity: "common", priceRoars: 20, pack: "reactions", celebration: "spin-jump", sound: "sparkle", color: "#ffe27a" },
  { id: "mic-drop", name: "Mic Drop", icon: "🎤", rarity: "common", priceRoars: 22, pack: "reactions", celebration: "knee-slide", sound: "drum", color: "#e85d75" },
  { id: "goat", name: "The GOAT", icon: "🐐", rarity: "common", priceRoars: 25, pack: "reactions", celebration: "spin-jump", sound: "sparkle", color: "#ffd23f" },
  { id: "dancing", name: "Dance Off", icon: "🕺", rarity: "common", priceRoars: 28, pack: "reactions", celebration: "dance", sound: "drum", color: "#b36bff" },
  { id: "crown", name: "Crown", icon: "👑", rarity: "common", priceRoars: 35, pack: "reactions", celebration: "rise", sound: "sparkle", color: "#ffd23f" },
  { id: "rocket", name: "To the Moon", icon: "🚀", rarity: "common", priceRoars: 45, pack: "reactions", celebration: "rise", sound: "whoosh", color: "#3ea6ff" },

  // Rare (75–499) — the expressive workhorses
  { id: "scarf-throw", name: "Scarf Throw", icon: "🧣", rarity: "rare", priceRoars: 99, pack: "atmosphere", celebration: "rise", sound: "whoosh", color: "#3ea6ff" },
  { id: "vuvuzela", name: "Vuvuzela", icon: "🎺", rarity: "rare", priceRoars: 149, pack: "atmosphere", celebration: "rise", sound: "horn", color: "#ffd23f" },
  { id: "smoke-bomb", name: "Smoke Bomb", icon: "💨", rarity: "rare", priceRoars: 249, pack: "atmosphere", celebration: "rise", sound: "whoosh", color: "#e85d75" },
  { id: "confetti-burst", name: "Confetti Burst", icon: "🎉", rarity: "rare", priceRoars: 399, pack: "atmosphere", celebration: "pop", sound: "cheer", color: "#b36bff" },
  { id: "pyro-combo", name: "Pyro Combo", icon: "🎆", rarity: "rare", priceRoars: 499, pack: "atmosphere", celebration: "rise", sound: "boom", color: "#ff8a3d" },

  // Legendary (3,000–9,999) — statement gifts
  { id: "stadium-roar", name: "Stadium Roar", icon: "🏟️", rarity: "legendary", priceRoars: 3999, pack: "legendary", celebration: "roar", sound: "cheer", color: "#ffb020" },
  { id: "trophy-lift", name: "Trophy Lift", icon: "🏆", rarity: "legendary", priceRoars: 5999, pack: "legendary", celebration: "takeover", sound: "cheer", color: "#ffd23f" },
  { id: "hat-trick-hero", name: "Hat-Trick Hero", icon: "🎩", rarity: "legendary", priceRoars: 7999, pack: "legendary", celebration: "spin-jump", sound: "sparkle", color: "#ffb020" },

  // Mythic (10,000–25,000) — full-screen whale anchors
  { id: "golden-goal", name: "Golden Goal", icon: "⚽", rarity: "mythic", priceRoars: 12000, pack: "mythic", celebration: "takeover", sound: "boom", color: "#ffd23f", fullScreen: true },
  { id: "world-on-fire", name: "World on Fire", icon: "🌍", rarity: "mythic", priceRoars: 19999, pack: "mythic", celebration: "takeover", sound: "boom", color: "#ff6b3d", fullScreen: true },
  { id: "the-cup", name: "The Cup", icon: "🏆", rarity: "mythic", priceRoars: 25000, pack: "mythic", celebration: "takeover", sound: "cheer", color: "#ffe27a", fullScreen: true },
];

// ─── NATION LEGENDS (the 48, generated from nations.ts) ──────────────────────
// Each is an archetype — nation + number + signature move — deliberately generic
// (no real names/faces/footage). Priced by fanbase demand tier (price
// discrimination), not equality: A = 1,499 · B = 999 · C = 699 Roars (Epic band).

type LegendMeta = { legend: string; celebration: Celebration; sound: GiftSound; tier: "A" | "B" | "C"; pack: GiftPackId };

const LEGEND_TIER_PRICE = { A: 1499, B: 999, C: 699 } as const;

const LEGENDS: Record<string, LegendMeta> = {
  // South America
  argentina: { legend: "La Albiceleste Maestro #10", celebration: "dribble", sound: "cheer", tier: "A", pack: "south-america" },
  brazil: { legend: "The Samba King", celebration: "bicycle", sound: "sparkle", tier: "A", pack: "south-america" },
  uruguay: { legend: "La Garra Charrúa", celebration: "charge", sound: "cheer", tier: "B", pack: "south-america" },
  colombia: { legend: "The Cafetero Dance", celebration: "dance", sound: "drum", tier: "B", pack: "south-america" },
  ecuador: { legend: "La Tri Altitude", celebration: "charge", sound: "horn", tier: "C", pack: "south-america" },
  paraguay: { legend: "The Guaraní Swordsman", celebration: "dance", sound: "drum", tier: "C", pack: "south-america" },
  // Europe
  france: { legend: "Les Bleus Rocket #10", celebration: "charge", sound: "boom", tier: "A", pack: "europe" },
  portugal: { legend: "The Lisbon Leap #7", celebration: "spin-jump", sound: "sparkle", tier: "A", pack: "europe" },
  spain: { legend: "La Roja Tiki-Taka", celebration: "dribble", sound: "sparkle", tier: "A", pack: "europe" },
  germany: { legend: "Die Mannschaft Machine", celebration: "header", sound: "boom", tier: "A", pack: "europe" },
  england: { legend: "The Three Lions Roar", celebration: "knee-slide", sound: "cheer", tier: "A", pack: "europe" },
  netherlands: { legend: "Total Football Orange", celebration: "dribble", sound: "sparkle", tier: "A", pack: "europe" },
  croatia: { legend: "The Checkerboard Engine", celebration: "dribble", sound: "sparkle", tier: "B", pack: "europe" },
  belgium: { legend: "The Red Devil", celebration: "charge", sound: "boom", tier: "B", pack: "europe" },
  norway: { legend: "The Fjord Bull", celebration: "charge", sound: "boom", tier: "B", pack: "europe" },
  austria: { legend: "Das Team Press", celebration: "charge", sound: "horn", tier: "C", pack: "europe" },
  switzerland: { legend: "The Clockwork Cross", celebration: "header", sound: "sparkle", tier: "C", pack: "europe" },
  sweden: { legend: "The Yellow Tower", celebration: "header", sound: "boom", tier: "C", pack: "europe" },
  türkiye: { legend: "The Crescent Wolf", celebration: "roar", sound: "cheer", tier: "C", pack: "europe" },
  czechia: { legend: "The Bohemian Thunderbolt", celebration: "charge", sound: "boom", tier: "C", pack: "europe" },
  "bosnia-and-herzegovina": { legend: "The Dragon's Volley", celebration: "bicycle", sound: "sparkle", tier: "C", pack: "europe" },
  scotland: { legend: "The Tartan Charge", celebration: "charge", sound: "horn", tier: "C", pack: "europe" },
  // Africa
  morocco: { legend: "The Atlas Lion", celebration: "roar", sound: "cheer", tier: "B", pack: "africa" },
  senegal: { legend: "Lions of Teranga", celebration: "dance", sound: "drum", tier: "B", pack: "africa" },
  egypt: { legend: "The Pharaoh's Curl #10", celebration: "knee-slide", sound: "cheer", tier: "B", pack: "africa" },
  ghana: { legend: "The Black Star", celebration: "dance", sound: "drum", tier: "C", pack: "africa" },
  "côte-d'ivoire": { legend: "The Elephant Charge", celebration: "charge", sound: "boom", tier: "C", pack: "africa" },
  algeria: { legend: "The Desert Fox", celebration: "dribble", sound: "sparkle", tier: "C", pack: "africa" },
  tunisia: { legend: "Eagle of Carthage", celebration: "header", sound: "cheer", tier: "C", pack: "africa" },
  "south-africa": { legend: "Bafana Shibobo", celebration: "dance", sound: "horn", tier: "C", pack: "africa" },
  "cabo-verde": { legend: "The Blue Shark", celebration: "dribble", sound: "sparkle", tier: "C", pack: "africa" },
  "congo-dr": { legend: "The Leopard Pounce", celebration: "charge", sound: "drum", tier: "C", pack: "africa" },
  // Asia
  japan: { legend: "The Samurai Blue", celebration: "header", sound: "sparkle", tier: "B", pack: "asia" },
  "korea-republic": { legend: "The Taegeuk Tiger", celebration: "charge", sound: "cheer", tier: "B", pack: "asia" },
  "saudi-arabia": { legend: "The Green Falcon", celebration: "charge", sound: "horn", tier: "C", pack: "asia" },
  "ir-iran": { legend: "The Persian Lion", celebration: "header", sound: "cheer", tier: "C", pack: "asia" },
  iraq: { legend: "Lions of Mesopotamia", celebration: "bicycle", sound: "boom", tier: "C", pack: "asia" },
  qatar: { legend: "The Maroon Falcon", celebration: "charge", sound: "horn", tier: "C", pack: "asia" },
  jordan: { legend: "The Nashama Pride", celebration: "charge", sound: "drum", tier: "C", pack: "asia" },
  uzbekistan: { legend: "The Steppe Wolf", celebration: "charge", sound: "horn", tier: "C", pack: "asia" },
  // North America
  mexico: { legend: "El Tri Cucaracha", celebration: "dance", sound: "horn", tier: "A", pack: "north-america" },
  usa: { legend: "Stars & Stripes Sprint", celebration: "charge", sound: "cheer", tier: "A", pack: "north-america" },
  canada: { legend: "The Maple Rocket", celebration: "charge", sound: "boom", tier: "B", pack: "north-america" },
  panama: { legend: "The Canal Express", celebration: "charge", sound: "horn", tier: "C", pack: "north-america" },
  haiti: { legend: "The Kompa Dancer", celebration: "dance", sound: "drum", tier: "C", pack: "north-america" },
  curaçao: { legend: "The Blue Wave", celebration: "dribble", sound: "sparkle", tier: "C", pack: "north-america" },
  // Oceania
  australia: { legend: "The Socceroo Bounce", celebration: "header", sound: "cheer", tier: "C", pack: "oceania" },
  "new-zealand": { legend: "The All-Whites Haka", celebration: "roar", sound: "drum", tier: "C", pack: "oceania" },
};

function nationLegendGift(nation: Nation): Gift | null {
  const meta = LEGENDS[nation.slug];
  if (!meta) return null;
  return {
    id: `legend-${nation.slug}`,
    name: meta.legend,
    icon: nation.flag,
    rarity: "epic",
    priceRoars: LEGEND_TIER_PRICE[meta.tier],
    pack: meta.pack,
    celebration: meta.celebration,
    sound: meta.sound,
    // animation tint comes from the nation's own theme — generated, not bespoke
    color: nation.theme.border.replace(/0?\.\d+\)$/, "0.85)"),
    nationSlug: nation.slug,
  };
}

const NATION_GIFTS: Gift[] = getAllNations()
  .map(nationLegendGift)
  .filter((g): g is Gift => g !== null);

// ─── LUCKY BOX (gacha — Flagged Vault, dark until cleared) ────────────────────
// Randomized reward. Stays out of "gambling" by two rules: it ALWAYS returns a
// gift worth ≥ its price (no-loss), and outcomes are cosmetic gifts only — never
// cashable Roars. Disclosed odds. Geo-denied where paid loot boxes are banned.

export type LuckyBox = {
  id: string;
  name: string;
  icon: string;
  priceRoars: number;
  guaranteedMinFaceRoars: number; // === priceRoars (no-loss rule)
  odds: { rarity: Rarity; pct: number }[]; // disclosed, sums to 100
  flagged: true;
  geoDeny: string[];
};

export const LUCKY_BOXES: LuckyBox[] = [
  {
    id: "lucky-penalty",
    name: "Lucky Penalty",
    icon: "🎁",
    priceRoars: 199,
    guaranteedMinFaceRoars: 199,
    odds: [
      { rarity: "rare", pct: 70 },
      { rarity: "epic", pct: 22 },
      { rarity: "legendary", pct: 7 },
      { rarity: "mythic", pct: 1 },
    ],
    flagged: true,
    geoDeny: ["BE", "NL"], // paid loot boxes banned
  },
];

// ─── ENGAGEMENT MECHANICS (config the UI reads) ──────────────────────────────

export const COMBO = {
  /** Window to keep a combo alive after the last tap (ms). */
  windowMs: 2500,
  /** Multiplier rungs shown as the combo climbs. */
  rungs: [1, 2, 5, 10, 25, 50, 99],
  /** Sending this many of one gift in a room triggers a screen takeover. */
  takeoverStreak: 10,
} as const;

// ─── PUBLIC HELPERS ──────────────────────────────────────────────────────────

export const ALL_GIFTS: Gift[] = [...UNIVERSAL_GIFTS, ...NATION_GIFTS];

const GIFTS_BY_ID = new Map(ALL_GIFTS.map((g) => [g.id, g]));

export function getGift(id: string): Gift | undefined {
  return GIFTS_BY_ID.get(id);
}

export function giftsInPack(pack: GiftPackId): Gift[] {
  return ALL_GIFTS.filter((g) => g.pack === pack).sort((a, b) => a.priceRoars - b.priceRoars);
}

/** The nation legend gift for a room's nation, if any — pinned to the top of
 *  the drawer so the room's own fans see their gift first. */
export function featuredGiftForNation(nationSlug: string | null | undefined): Gift | undefined {
  if (!nationSlug) return undefined;
  return getGift(`legend-${nationSlug}`);
}

/** Packs that actually contain gifts, in display order (drops empty continents). */
export function activePacks(): { id: GiftPackId; label: string; icon: string }[] {
  return PACKS.filter((p) => ALL_GIFTS.some((g) => g.pack === p.id && !g.flagged));
}
