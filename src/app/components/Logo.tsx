import Link from "next/link";

// Wordmark: the "FR" monogram + the FanRoom name in the site's white-and-gold
// World Cup palette.
//
// The monogram is one continuous mark: a mirrored F (opening left) and an R
// (opening right) share a single centre stem — two letters, one shape. Drawn
// as flat gold strokes with squared caps (no gradients, no pill shapes), per
// the design system.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 no-underline ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/40 bg-ink-deep">
        <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          {/* shared centre stem */}
          <path d="M14 5v18" stroke="#d4af37" strokeWidth="3" />
          {/* mirrored F — top + middle arms reaching left */}
          <path d="M14 6.5H5" stroke="#d4af37" strokeWidth="3" />
          <path d="M14 14H7.5" stroke="#d4af37" strokeWidth="3" />
          {/* R — bowl reaching right, closing back at the middle arm */}
          <path d="M14 6.5h4.5a3.75 3.75 0 0 1 0 7.5H14" stroke="#d4af37" strokeWidth="3" />
          {/* R — leg kicking down-right */}
          <path d="M17.5 14.5 23 23" stroke="#d4af37" strokeWidth="3" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-ink-foreground">
        Fan<span className="text-accent">Room</span>
      </span>
    </Link>
  );
}
