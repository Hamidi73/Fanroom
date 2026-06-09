"use client";

// Client shell for the homepage: holds the selected language and renders the
// browse layout (top nav + sidebar via AppShell). Real fixtures are fetched by
// the server component (page.tsx) and passed in as props.

import { useState } from "react";
import Link from "next/link";
import { getAllNations, getTranslations, languages, type Fixture, type Language } from "@/app/data";
import { AppShell, SiteFooter, NationCard, FixtureCard, ApplyForm } from "@/app/components";

const nations = getAllNations();

function SectionHeader({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="display text-xl sm:text-2xl">{title}</h2>
      {href && cta && (
        <Link href={href} className="text-sm font-semibold text-accent-soft no-underline hover:text-accent">
          {cta}
        </Link>
      )}
    </div>
  );
}

export function HomeClient({ fixtures }: { fixtures: Fixture[] }) {
  const [language, setLanguage] = useState<Language>("English");
  const t = getTranslations(language);

  const languagePicker = (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="hidden h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink-foreground outline-none sm:block"
      aria-label="Language"
    >
      {languages.map((l) => (
        <option key={l} value={l} className="bg-ink">
          {l}
        </option>
      ))}
    </select>
  );

  return (
    <AppShell rightSlot={languagePicker}>
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
        {/* Featured hero */}
        <section className="relative overflow-hidden rounded-xl border border-line bg-[radial-gradient(circle_at_15%_20%,rgba(145,71,255,0.28),transparent_45%),linear-gradient(150deg,#1c1430,#0e0e10_80%)] p-6 sm:p-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-soft">
            <span className="live-dot" /> World Cup 2026
          </div>
          <h1 className="display mt-3 max-w-3xl text-3xl leading-tight sm:text-5xl">
            {t.mainHeadline}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {t.heroSubtext}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/rooms" className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-accent-strong">
              Browse rooms
            </Link>
            <Link href="/rooms/new" className="inline-flex items-center rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-foreground no-underline transition hover:bg-surface-2">
              Create a room
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted">
            Reactions, commentary &amp; community — never match footage.
          </p>
        </section>

        {/* Upcoming matches */}
        <div className="mt-9">
          <SectionHeader title="Upcoming matches" href="/#nations" cta="Browse nations" />
          {fixtures.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
              No fixtures available from the schedule right now — they&apos;ll appear as matches are confirmed.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {fixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          )}
        </div>

        {/* Nations */}
        <div id="nations" className="mt-10 scroll-mt-20">
          <SectionHeader title="Browse by nation" />
          <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {nations.map((nation) => (
              <NationCard key={nation.slug} nation={nation} />
            ))}
          </div>
        </div>

        {/* Apply */}
        <div id="apply" className="mt-12 scroll-mt-20">
          <ApplyForm heading={t.streamerApplicationHeading} />
        </div>
      </div>

      <SiteFooter />
    </AppShell>
  );
}
