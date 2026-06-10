// ─────────────────────────────────────────────────────────────────────────────
// Sticker packs — real football player stickers (WhatsApp/Instagram-style).
// Images are the players' lead photos from Wikipedia (freely licensed),
// downloaded into /public/stickers/legends at build time so the site never
// depends on a third-party CDN at runtime.
//
// Like gifts (src/lib/gifts.ts), this file is the SERVER-AUTHORITATIVE price
// list: the client only ever sends a sticker id, never an amount. Stickers
// are paid per send with Roars (same wallet + spend_roars RPC as gifts) and —
// unlike the ephemeral gift overlay — every sticker send also posts a real
// chat message (`[sticker:<id>]`) so it stays in the room's history.
// ─────────────────────────────────────────────────────────────────────────────

export type StickerPackId = "football-legends";

export type Sticker = {
  id: string;
  name: string;
  image: string; // path under /public
  pack: StickerPackId;
  priceRoars: number;
};

export const STICKER_PACKS: { id: StickerPackId; label: string; icon: string }[] = [
  { id: "football-legends", label: "Legends", icon: "⚽" },
];

function s(id: string, name: string, priceRoars: number): Sticker {
  return { id, name, pack: "football-legends", image: `/stickers/legends/${id}.jpg`, priceRoars };
}

export const STICKERS: Sticker[] = [
  // The two GOATs anchor the pack at a premium
  s("messi", "Messi", 99),
  s("ronaldo", "CR7", 99),
  s("mbappe", "Mbappé", 79),
  s("neymar", "Neymar", 69),
  s("haaland", "Haaland", 69),
  s("salah", "Salah", 69),
  s("vinicius", "Vini Jr", 59),
  s("bellingham", "Bellingham", 59),
  s("yamal", "Yamal", 59),
  s("kane", "Kane", 49),
  s("de-bruyne", "De Bruyne", 49),
  s("modric", "Modrić", 49),
  s("son", "Son", 49),
  s("hakimi", "Hakimi", 39),
  s("mahrez", "Mahrez", 39),
  s("saka", "Saka", 39),
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
