"use client";

// Client shell for the homepage: holds the selected language and renders the
// sections. Real fixtures are fetched by the server component (page.tsx) and
// passed in as props. Streamers/rooms don't exist yet, so the "live" area shows
// an honest empty state.

import { useState } from "react";
import Link from "next/link";
import { getAllNations, getTranslations, type Fixture, type Language } from "@/app/data";
import { SiteHeader, SiteFooter, NationCard, FixtureCard, ApplyForm } from "@/app/components";

const nations = getAllNations();

export function HomeClient({ fixtures }: { fixtures: Fixture[] }) {
  const [language, setLanguage] = useState<Language>("English");
  const t = getTranslations(language);

  return (
    <main className="flex-1">
      <SiteHeader
        language={language}
        onLanguageChange={setLanguage}
        labels={{ chooseNation: t.navChooseNation, apply: t.navApply }}
      />

      <div className="mx-auto max-w-[1240px] px-5 py-5 sm:px-6">
        {/* Honest status banner */}
        <div className="mb-5 rounded-lg border border-accent/30 bg-accent/10 px-3.5 py-2 text-center text-xs text-accent">
          ⚡ Fixtures are live from a real schedule API. Fan rooms open as creators
          join — reactions &amp; community only, never match footage.
        </div>

        {/* Hero / empty live state */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#12121c,#0c0c14)] p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">FanRoom Global</p>
          <h1 className="display mt-2 max-w-3xl text-[clamp(28px,4vw,44px)] leading-[1.02]">
            {t.mainHeadline}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {t.heroSubtext}
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-surface/60 p-5">
            <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-muted">
              <span className="live-dot" /> Fan rooms
            </div>
            <p className="mt-2 text-sm text-muted">
              Create an account, host a watch-along, and bring fans together.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/rooms" className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black">
                Browse rooms
              </Link>
              <Link href="/rooms/new" className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white">
                Create a room
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming matches (real data) */}
        <div className="mb-4 mt-10 flex items-center justify-between">
          <h2 className="display text-2xl">📅 Upcoming matches</h2>
        </div>
        {fixtures.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center text-sm text-muted">
            No fixtures are available from the schedule API right now. They&apos;ll
            appear here as matches are confirmed.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fixtures.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        )}

        {/* Nations */}
        <div id="nations" className="mb-4 mt-12 flex items-center justify-between">
          <h2 className="display text-2xl">🌍 Pick your nation</h2>
        </div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
          {nations.map((nation) => (
            <NationCard key={nation.slug} nation={nation} />
          ))}
        </div>

        {/* Apply */}
        <div id="apply" className="mt-12">
          <ApplyForm heading={t.streamerApplicationHeading} />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
