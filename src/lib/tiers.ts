// Preset tiers for paid "highlighted" chat messages (Twitch Hype Chat style).
// Amounts are defined ONLY here on the server side — the client never sends an
// amount, it sends a tier id, and we look the price up from this list. That way
// a user can't tamper with what they pay.

export type Tier = {
  id: string;
  label: string;
  amountCents: number;
  /** Tailwind classes for the highlighted message banner (higher = bolder). */
  ring: string;
  badge: string;
  /** How long the on-stream alert stays up (ms) — bigger tiers linger longer. */
  alertDurationMs: number;
};

export const TIERS: Tier[] = [
  {
    id: "spotlight",
    label: "Spotlight",
    amountCents: 200,
    ring: "border-accent/40 bg-accent/5",
    badge: "bg-accent/20 text-accent-soft",
    alertDurationMs: 12000,
  },
  {
    id: "featured",
    label: "Featured",
    amountCents: 500,
    ring: "border-accent/60 bg-accent/10",
    badge: "bg-accent/30 text-accent-soft",
    alertDurationMs: 20000,
  },
  {
    id: "headliner",
    label: "Headliner",
    amountCents: 1000,
    ring: "border-accent bg-accent/15",
    badge: "bg-accent text-white",
    alertDurationMs: 30000,
  },
];

export function getTier(id: string | null | undefined): Tier | undefined {
  return TIERS.find((t) => t.id === id);
}

export function formatAmount(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
