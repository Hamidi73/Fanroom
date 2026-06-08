import type { Metadata } from "next";
import Link from "next/link";
import { getNation, getFixturesByNationSlug } from "@/app/data";
import { FixtureCard } from "@/app/components";

// Per-nation title/description. `params` is a promise in this Next.js version.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nation = getNation(slug);
  return {
    title: nation
      ? `${nation.name} fan rooms | FanRoom Global`
      : "Nation not found | FanRoom Global",
  };
}

export default async function NationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nation = getNation(slug);

  // Real fixtures for this nation, fetched live from the schedule API.
  const fixtures = nation ? await getFixturesByNationSlug(nation.slug) : [];
  const nextMatch = fixtures.find((f) => f.status !== "finished") ?? fixtures[0];

  if (!nation) {
    return (
      <main className="min-h-screen bg-ink-deep px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-panel/90 p-10 text-center shadow-lg shadow-black/30">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Nation not found</p>
          <h1 className="mt-4 text-3xl font-black text-white">No nation matches that slug.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Try a known nation route like /nation/morocco or /nation/brazil.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink-deep text-white">
      <div className="relative overflow-hidden px-6 py-10 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_25%)]" />
        <div className="relative mx-auto max-w-6xl space-y-16">
          {/* Hero */}
          <section className="rounded-[2rem] border border-white/10 bg-panel-2/95 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                  <span className="text-2xl">{nation.flag}</span>
                  {nation.name}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Nation hub</p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {nation.name} fan rooms and creator watch parties
                  </h1>
                </div>
                <p className="max-w-2xl text-base leading-7 text-slate-300">{nation.blurb}</p>
                <p className="text-sm text-slate-300">
                  Main languages:{" "}
                  <span className="font-semibold text-white">{nation.languages.join(", ")}</span>
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#07151a] via-slate-950 to-[#08121d] p-8 shadow-inner shadow-black/30">
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">Quick nation snapshot</p>
                <div className="mt-6 space-y-4 text-white/80">
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Next match</p>
                    <p className="mt-2 text-xl font-semibold">
                      {nextMatch ? `${nextMatch.teamA} vs ${nextMatch.teamB}` : "To be confirmed"}
                    </p>
                    {nextMatch && (
                      <p className="mt-1 text-sm text-slate-400">{nextMatch.date} · {nextMatch.venue}</p>
                    )}
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Top creator</p>
                    <p className="mt-2 text-xl font-semibold">Be the first</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Creators — empty until real ones sign up */}
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Creators</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  Represent {nation.name}
                </h2>
              </div>
              <p className="max-w-xl text-sm text-slate-400">
                Creators host watch parties and reactions for this nation.
              </p>
            </div>
            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-panel p-8 text-center shadow-lg shadow-black/25">
              <p className="text-sm leading-7 text-slate-400">
                No creators represent {nation.name} yet —{" "}
                <Link href="/#apply" className="text-emerald-300">apply to be the first</Link>.
              </p>
            </div>
          </section>

          {/* Official fixtures (real data) */}
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Official fixtures</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {nation.name} at the World Cup
                </h2>
              </div>
              <p className="max-w-xl text-sm text-slate-400">
                Live schedule data from a real API. No match footage, just the fixtures.
              </p>
            </div>
            {fixtures.length === 0 ? (
              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-panel p-8 text-center shadow-lg shadow-black/25">
                <p className="text-sm leading-7 text-slate-400">
                  No confirmed fixtures for {nation.name} yet — they&apos;ll appear here as the
                  schedule is finalised.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {fixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}
          </section>

          {/* Rooms — empty until creators host */}
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Fan rooms</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Watch parties</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-400">
                Rooms are for reactions and community — without match footage.
              </p>
            </div>
            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-panel p-8 text-center shadow-lg shadow-black/25">
              <p className="text-sm leading-7 text-slate-400">
                Fan rooms for {nation.name} open as creators start hosting.
              </p>
            </div>
          </section>

          {/* Safety reminder */}
          <section className="rounded-[2rem] border border-white/10 bg-panel-2 p-8 shadow-lg shadow-black/25">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Safety reminder</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">No match footage here.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Fan rooms are for reactions, commentary, and community. Creators share energy and
                  culture — not the actual match feed.
                </p>
              </div>
              <div className="rounded-[1.75rem] bg-white/5 p-6 text-slate-200">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Keep it clean</p>
                <ul className="mt-4 space-y-3 text-sm leading-6">
                  <li>• No direct match footage or live broadcast streams</li>
                  <li>• Focus on fan reactions, chat, and creator commentary</li>
                  <li>• Share the passion, not the match feed</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Apply CTA */}
          <section className="rounded-[2rem] border border-white/10 bg-panel p-8 text-center shadow-lg shadow-black/20">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Want to represent this nation?</p>
            <h2 className="mt-3 text-3xl font-black text-white">Apply to stream for {nation.name}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Use the application form on the homepage to join the nation creator stage.
            </p>
            <Link
              href="/#apply"
              className="mt-8 inline-flex rounded-full bg-emerald-400 px-8 py-4 text-base font-semibold text-black transition hover:bg-emerald-300"
            >
              Go to application
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
