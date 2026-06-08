"use client";

// Sticky top navigation bar with the FanRoom logo, anchor links, and a language
// selector. Used on the homepage. The language state lives in the page so the
// translations can update; this component just renders the control.

import Link from "next/link";
import { languages, type Language } from "@/app/data";
import { AccountNav } from "./AccountNav";

type SiteHeaderProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  labels: {
    chooseNation: string;
    apply: string;
  };
};

export function SiteHeader({ language, onLanguageChange, labels }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-ink/85 px-6 py-3.5 backdrop-blur-md">
      <Link href="/" className="display text-[22px] text-ink-foreground no-underline">
        FANROOM<span className="text-accent">GLOBAL</span>
      </Link>
      <nav className="flex items-center gap-5">
        <a href="#nations" className="text-sm font-medium text-muted no-underline transition hover:text-ink-foreground">
          {labels.chooseNation}
        </a>
        <a href="#apply" className="text-sm font-medium text-muted no-underline transition hover:text-ink-foreground">
          {labels.apply}
        </a>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white outline-none"
        >
          {languages.map((l) => (
            <option key={l} value={l} className="bg-ink">
              {l}
            </option>
          ))}
        </select>
        <AccountNav />
      </nav>
    </header>
  );
}
