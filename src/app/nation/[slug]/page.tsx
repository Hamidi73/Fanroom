import type { Metadata } from "next";
import Link from "next/link";
import { getNation, getFixturesByNationSlug } from "@/app/data";
import { AppShell, SiteFooter, FixtureCard } from "@/app/components";

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

  const fixtures = nation ? await getFixturesByNationSlug(nation.slug) : [];
  const nextMatch = fixtures.find((f) => f.status !== "finished") ?? fixtures[0];

  if (!nation) {
    return (
      <AppShell sidebar={false}>
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="display text-3xl">Nation not found</h1>
          <p className="mt-3 text-sm text-muted">Try a known route like /nation/morocco or /nation/brazil.</p>
          <Link href="/" className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-accent-strong">
            Back home
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        {/* Hero */}
        <section
          className="overflow-hidden rounded-xl border border-line p-6 sm:p-8"
          style={{
            backgroundImage: `radial-gradient(circle at 12% 20%, ${nation.theme.accent}, transparent 45%), linear-gradient(150deg, ${nation.theme.border}, #0e0e10 85%)`,
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-black/30 text-4xl">
              {nation.flag}
            </span>
            <div>
              <h1 className="display text-3xl sm:text-4xl">{nation.name}</h1>
              <p className="mt-1 text-sm text-muted">{nation.languages.join(" · ")}</p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-foreground/80">{nation.blurb}</p>
          {nextMatch && (
            <div className="mt-5 inline-flex flex-wrap items-center gap-x-2 rounded-lg border border-line bg-ink/50 px-4 py-2.5 text-sm backdrop-blur-sm">
              <span className="font-bold text-accent-soft">Next match</span>
              <span className="text-ink-foreground">{nextMatch.teamA} vs {nextMatch.teamB}</span>
              <span className="text-muted">· {nextMatch.date} · {nextMatch.venue}</span>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/rooms/new" className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-accent-strong">
              Host a {nation.name} room
            </Link>
            <Link href="/#apply" className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-foreground no-underline transition hover:bg-surface-2">
              Apply to represent {nation.name}
            </Link>
          </div>
        </section>

        {/* Rooms */}
        <div className="mt-9">
          <h2 className="display mb-3 text-xl sm:text-2xl">{nation.name} fan rooms</h2>
          <div className="rounded-lg border border-line bg-surface p-8 text-center">
            <p className="text-sm text-muted">
              No {nation.name} rooms are live yet —{" "}
              <Link href="/rooms/new" className="text-accent-soft">create the first one</Link>.
            </p>
          </div>
        </div>

        {/* Fixtures */}
        <div className="mt-9">
          <h2 className="display mb-1 text-xl sm:text-2xl">{nation.name} at the World Cup</h2>
          <p className="mb-3 text-sm text-muted">Live schedule data — fixtures only, never match footage.</p>
          {fixtures.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
              No confirmed fixtures for {nation.name} yet — they&apos;ll appear here as the schedule is finalised.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {fixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          )}
        </div>

        {/* Safety */}
        <div className="mt-9 rounded-lg border border-line bg-surface p-5">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink-foreground">No match footage.</span>{" "}
            Rooms are for reactions, commentary, and community — creators share the energy, not the broadcast.
          </p>
        </div>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
