// Nation tile, styled like a streaming app's category "boxart": a portrait
// cover (flag over the nation's colour gradient) with the name + languages below.

import Link from "next/link";
import type { Nation } from "@/app/data";

export function NationCard({ nation }: { nation: Nation }) {
  return (
    <Link href={`/nation/${nation.slug}`} className="group block no-underline">
      <div
        className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg ring-1 ring-line transition group-hover:ring-2 group-hover:ring-accent"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 25%, ${nation.theme.accent}, transparent 55%), linear-gradient(155deg, ${nation.theme.border}, #131316 85%)`,
        }}
      >
        <span className="text-5xl drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-110">
          {nation.flag}
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-bold text-ink-foreground transition group-hover:text-accent-soft">
        {nation.name}
      </p>
      <p className="truncate text-xs text-muted">{nation.languages.join(", ")}</p>
    </Link>
  );
}
