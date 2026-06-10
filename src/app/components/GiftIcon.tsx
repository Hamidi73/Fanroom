// Draws a gift's icon as IMAGE ART, never as a raw emoji glyph (emoji fonts
// differ per OS and Apple-style flags break on Windows):
//   • nation legend gifts → the real flag image with the waving-cloth animation
//   • everything else     → the matching OpenMoji art from /public/gifts/om
//   • text-banner gifts (GG, EZ…) render their own banner — callers handle those.

import Image from "next/image";
import { giftArt, type Gift } from "@/lib/gifts";
import { NationFlag } from "./NationFlag";

export function GiftIcon({
  gift,
  size = 36,
  wave = true,
  className = "",
}: {
  gift: Gift;
  size?: number;
  wave?: boolean;
  className?: string;
}) {
  const art = giftArt(gift);
  if (art.type === "text") return null;
  if (art.type === "flag") {
    return <NationFlag src={art.src} name={gift.name} width={size} wave={wave} className={className} />;
  }
  return (
    <Image
      src={art.src}
      alt={gift.name}
      width={size}
      height={size}
      unoptimized
      className={`inline-block align-middle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The Roars coin mark — OpenMoji lion art instead of the 🦁 emoji glyph. */
export function Coin({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/gifts/om/1F981.png"
      alt="Roars"
      width={size}
      height={size}
      unoptimized
      className={`inline-block align-[-0.15em] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
