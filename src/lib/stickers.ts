// ─────────────────────────────────────────────────────────────────────────────
// Sticker packs — real meme images (WhatsApp/Instagram-style), served from
// /public/stickers. Sourced from the memegen.link template library and
// imported at build time so the site never depends on a third-party CDN.
//
// Like gifts (src/lib/gifts.ts), this file is the SERVER-AUTHORITATIVE price
// list: the client only ever sends a sticker id, never an amount. Stickers
// are paid per send with Roars (same wallet + spend_roars RPC as gifts) and —
// unlike the ephemeral gift overlay — every sticker send also posts a real
// chat message (`[sticker:<id>]`) so it stays in the room's history.
// ─────────────────────────────────────────────────────────────────────────────

export type StickerPackId = "meme-classics" | "football-memes";

export type Sticker = {
  id: string;
  name: string;
  image: string; // path under /public
  pack: StickerPackId;
  priceRoars: number;
};

export const STICKER_PACKS: { id: StickerPackId; label: string; icon: string }[] = [
  { id: "football-memes", label: "FC Memes", icon: "⚽" },
  { id: "meme-classics", label: "Memes", icon: "😂" },
];

function s(id: string, name: string, pack: StickerPackId, file: string, priceRoars: number): Sticker {
  return { id, name, pack, image: `/stickers/${pack === "meme-classics" ? "memes" : "football"}/${file}`, priceRoars };
}

export const STICKERS: Sticker[] = [
  // Football memes — captioned classics with match-day energy
  s("golazo", "GOLAZO", "football-memes", "golazo.jpg", 29),
  s("down-3-0", "Down 3–0, This Is Fine", "football-memes", "down-3-0.jpg", 29),
  s("it-was-offside", "IT WAS OFFSIDE", "football-memes", "it-was-offside.jpg", 35),
  s("var-ruined-football", "VAR Ruined Football", "football-memes", "var-ruined-football.jpg", 35),
  s("offsides-everywhere", "Offsides Everywhere", "football-memes", "offsides-everywhere.jpg", 29),
  s("much-goal", "Much Goal Very Wow", "football-memes", "much-goal.jpg", 25),
  s("nutmegged", "Nutmegged the Keeper", "football-memes", "nutmegged.jpg", 25),
  s("to-the-knockouts", "To the Knockouts", "football-memes", "to-the-knockouts.jpg", 39),
  s("always-offside", "Always Has Been Offside", "football-memes", "always-offside.jpg", 35),
  s("pen-retake", "VAR Orders a Retake", "football-memes", "pen-retake.jpg", 35),
  s("just-pass", "Just Pass the Ball", "football-memes", "just-pass.jpg", 29),
  s("cant-concede", "Park the Bus", "football-memes", "cant-concede.jpg", 29),
  s("ref-red-card", "Ref Pulls a Red", "football-memes", "ref-red-card.jpg", 35),
  s("watch-in-fanroom", "Watching in a FanRoom", "football-memes", "watch-in-fanroom.jpg", 19),

  // Meme classics — the all-time greats
  s("drake", "Drake", "meme-classics", "drake.jpg", 25),
  s("distracted", "Distracted Boyfriend", "meme-classics", "distracted.jpg", 25),
  s("this-is-fine", "This Is Fine", "meme-classics", "this-is-fine.jpg", 25),
  s("stonks", "Stonks", "meme-classics", "stonks.jpg", 25),
  s("doge", "Doge", "meme-classics", "doge.jpg", 19),
  s("success-kid", "Success Kid", "meme-classics", "success-kid.jpg", 19),
  s("harold", "Hide the Pain Harold", "meme-classics", "harold.jpg", 25),
  s("roll-safe", "Roll Safe", "meme-classics", "roll-safe.jpg", 25),
  s("disaster-girl", "Disaster Girl", "meme-classics", "disaster-girl.jpg", 29),
  s("woman-cat", "Woman Yelling at Cat", "meme-classics", "woman-cat.jpg", 29),
  s("mocking-spongebob", "Mocking Spongebob", "meme-classics", "mocking-spongebob.jpg", 25),
  s("khaby", "Khaby Shrug", "meme-classics", "khaby.jpg", 25),
  s("no-god-no", "No God No", "meme-classics", "no-god-no.jpg", 25),
  s("feels-bad", "Feels Bad Man", "meme-classics", "feels-bad.jpg", 19),
];

const byId = new Map(STICKERS.map((st) => [st.id, st]));

export function getSticker(id: string): Sticker | undefined {
  return byId.get(id);
}

export function stickersInPack(pack: StickerPackId): Sticker[] {
  return STICKERS.filter((st) => st.pack === pack);
}

// ─── Chat encoding ───────────────────────────────────────────────────────────
// Sticker and gift sends are persisted as compact chat-message bodies and
// rendered specially by RoomChat. (A member could type these by hand, but the
// same is true of the gift overlay broadcasts — acceptable for the demo.)

const STICKER_RE = /^\[sticker:([a-z0-9-]+)\]$/;
const GIFT_RE = /^\[gift:([a-z0-9-]+):(\d{1,3})\]$/;

export function stickerBody(id: string): string {
  return `[sticker:${id}]`;
}

export function giftBody(id: string, mult: number): string {
  return `[gift:${id}:${mult}]`;
}

/** If a chat body encodes a sticker send, return the sticker. */
export function parseStickerBody(body: string): Sticker | undefined {
  const m = STICKER_RE.exec(body.trim());
  return m ? getSticker(m[1]) : undefined;
}

/** If a chat body encodes a gift send, return the gift id + multiplier. */
export function parseGiftBody(body: string): { giftId: string; mult: number } | undefined {
  const m = GIFT_RE.exec(body.trim());
  return m ? { giftId: m[1], mult: Number(m[2]) } : undefined;
}
