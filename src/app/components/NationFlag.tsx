// Image-based nation flag (from /public/flags). The site never renders flag
// EMOJIS — they break on Windows (Chrome/Edge show "BR"-style letter pairs).
// `wave` wraps the flag in the CSS cloth animation (see globals.css) — used by
// the paid nation-flag gifts so they feel special.

import Image from "next/image";

export function NationFlag({
  src,
  name,
  width = 22,
  wave = false,
  className = "",
}: {
  src: string;
  name: string;
  width?: number;
  wave?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`${wave ? "flag-wave" : "inline-block overflow-hidden"} shrink-0 rounded-[3px] align-middle ${className}`}
      style={{ width }}
    >
      <Image
        src={src}
        alt={`${name} flag`}
        width={width}
        height={Math.round(width * 0.7)}
        sizes={`${width}px`}
        className="h-auto w-full"
      />
    </span>
  );
}
