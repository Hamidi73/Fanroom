"use client";

// Client shell for the homepage: holds the selected language and renders a
// conversion-focused browse layout. Fixtures + current top rooms are fetched by
// the server component (page.tsx) and passed in. When real rooms exist they're
// featured right under the hero (one click into a room); until then we show
// inviting placeholders that funnel to hosting/browsing.

import { useState } from "react";
import Link from "next/link";
import {
  getNation,
  getTranslations,
  languages,
  type Fixture,
  type Language,
} from "@/app/data";
import {
  AppShell,
  SiteFooter,
  RoomCard,
  RoomLeaderboard,
  HeroStream,
  FixtureCard,
  NationFlag,
  type RoomCardData,
  type LeaderRoom,
} from "@/app/components";

// Nations used for the "be the first" placeholders before real rooms exist.
const PLACEHOLDER_NATIONS = ["brazil", "argentina", "france", "morocco", "england", "spain", "portugal", "usa"]
  .map((s) => getNation(s))
  .filter((n): n is NonNullable<typeof n> => !!n);

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

export function HomeClient({
  fixtures,
  live = [],
  results = [],
  rooms = [],
}: {
  fixtures: Fixture[];
  live?: Fixture[];
  results?: Fixture[];
  rooms?: RoomCardData[];
}) {
  const [language, setLanguage] = useState<Language>("English");
  const t = getTranslations(language);
  const hasRooms = rooms.length > 0;
  // Busiest rooms first — same ordering a viewer expects from a live platform.
  const featured = rooms
    .slice()
    .sort((a, b) => (b.members?.[0]?.count ?? 0) - (a.members?.[0]?.count ?? 0))
    .slice(0, 8);

  const leaderboard: LeaderRoom[] = rooms
    .map((r) => ({
      id: r.id,
      title: r.title,
      nationSlug: r.nation_slug,
      hostName: r.host?.display_name ?? "a creator",
      count: r.members?.[0]?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, 5);

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
        {/* Hero — value prop + one dominant CTA, with the top stream playing live */}
        <section className="relative overflow-hidden rounded-xl border border-line bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.22),transparent_45%),linear-gradient(150deg,#221c0e,#121212_80%)] p-6 sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,520px)]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-soft">
                <span className="live-dot" />
                {hasRooms ? `${rooms.length} room${rooms.length === 1 ? "" : "s"} live now` : "World Cup 2026"}
              </div>
              <h1 className="display-hero mt-3 text-3xl leading-tight sm:text-5xl">{t.mainHeadline}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{t.heroSubtext}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/rooms"
                  className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-ink no-underline transition hover:bg-[#e6e6e6]"
                >
                  {hasRooms ? "Watch a live room" : "Browse rooms"}
                </Link>
                <Link
                  href="/rooms/new"
                  className="inline-flex items-center rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink-foreground no-underline transition hover:bg-surface-2"
                >
                  Host a room
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted">
                Free to join · Reactions, commentary &amp; community — never match footage.
              </p>
            </div>

            <HeroStream room={leaderboard[0] ?? null} />
          </div>
        </section>

        {/* Featured rooms (the product, one click away) + live leaderboard rail */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
          <SectionHeader
            title={hasRooms ? "Live now" : "Rooms opening soon"}
            href={hasRooms ? "/rooms" : undefined}
            cta={hasRooms ? "See all" : undefined}
          />
          {hasRooms ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                {PLACEHOLDER_NATIONS.map((n) => (
                  <Link key={n.slug} href="/rooms/new" className="group block no-underline">
                    <div
                      className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line transition group-hover:border-accent/60"
                      style={{
                        backgroundImage: `radial-gradient(circle at 25% 20%, ${n.theme.accent}, transparent 60%), linear-gradient(150deg, ${n.theme.border}, #0e0e10 90%)`,
                      }}
                    >
                      <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white/80">
                        Opening soon
                      </span>
                      <span className="drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
                        <NationFlag src={n.flagImg} name={n.name} width={64} className="rounded-md" />
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm font-bold text-ink-foreground transition group-hover:text-accent-soft">
                      Host the first {n.name} room
                    </p>
                    <p className="truncate text-xs text-muted">Be the creator everyone joins</p>
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-line bg-surface p-6 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="text-base font-bold text-ink-foreground">No live rooms yet — be the first.</p>
                  <p className="mt-1 text-sm text-muted">
                    Start a watch-along in seconds, or browse as rooms go live.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <Link href="/rooms/new" className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-black no-underline transition hover:bg-accent-strong">
                    Host a room
                  </Link>
                  <Link href="/rooms" className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-5 py-2.5 text-sm font-semibold text-ink-foreground no-underline transition hover:bg-white/5">
                    Browse
                  </Link>
                </div>
              </div>
            </>
          )}
          </div>

          <div className="min-w-0">
            <RoomLeaderboard initial={leaderboard} />
          </div>
        </div>

        {/* How it works — reduce uncertainty in three steps */}
        <div className="mt-10">
          <SectionHeader title="How it works" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Pick a match or nation", d: "Find the game you care about or your country's hub." },
              { n: "2", t: "Join a fan room", d: "Hop into a creator-led watch-along in one click — free." },
              { n: "3", t: "React live", d: "Chat, celebrate, and watch the host on camera together." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-line bg-surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-sm font-bold text-accent-soft">
                  {s.n}
                </span>
                <p className="mt-3 text-base font-bold text-ink-foreground">{s.t}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live matches — the sidebar group rail covers these on desktop, so
            this strip only shows where the sidebar is hidden (mobile/tablet). */}
        {live.length > 0 && (
          <div className="mt-10 lg:hidden">
            <SectionHeader title="Live matches" />
            <div className="grid gap-4 sm:grid-cols-2">
              {live.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming matches — games drop out the moment they kick off */}
        <div className="mt-10">
          <SectionHeader title="Upcoming matches" />
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

        {/* Recent results — finished games land here (newest first) */}
        {results.length > 0 && (
          <div className="mt-10">
            <SectionHeader title="Recent results" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </div>
        )}

      </div>

      <SiteFooter />
    </AppShell>
  );
}
