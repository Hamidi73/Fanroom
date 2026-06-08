// Homepage nation-grid card. Links to that nation's hub page.
// Only the gradient colours are data-driven (inline style); everything else is
// fixed layout via Tailwind.

import type { Nation } from "@/app/data";

export function NationCard({ nation }: { nation: Nation }) {
  return (
    <a
      href={`/nation/${nation.slug}`}
      className="relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-3.5 text-white no-underline transition hover:-translate-y-1"
      style={{
        backgroundImage: `radial-gradient(circle at top left, ${nation.theme.accent}, transparent 35%), linear-gradient(160deg, ${nation.theme.border}, #0c0c14 80%)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/[0.78] to-transparent to-[65%]" />
      <span className="absolute left-3.5 top-3 z-[2] text-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
        {nation.flag}
      </span>
      <span className="display relative z-[2] text-lg">{nation.name}</span>
      <span className="relative z-[2] text-xs font-medium text-white/85">
        {nation.languages.join(" · ")}
      </span>
    </a>
  );
}
