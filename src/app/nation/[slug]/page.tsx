import { Metadata } from "next";

type NationData = {
  slug: string;
  country: string;
  flag: string;
  languages: string;
  description: string;
  streamers: Array<{ name: string; style: string; language: string; viewers: string }>;
  rooms: Array<{ match: string; title: string; host: string; status: string; viewers: string }>;
};

const nationDetails: Record<string, NationData> = {
  morocco: {
    slug: "morocco",
    country: "Morocco",
    flag: "🇲🇦",
    languages: "Arabic, French",
    description: "Watch fan rooms, reactions, and creators supporting Morocco.",
    streamers: [
      { name: "RashidLive", style: "Passionate reaction host", language: "Arabic", viewers: "3.2K" },
      { name: "AtlasWave", style: "Culture-driven watch party", language: "French", viewers: "2.7K" },
      { name: "CasablancaCast", style: "Intense match breakdowns", language: "English", viewers: "1.9K" },
    ],
    rooms: [
      { match: "Morocco vs Spain", title: "Atlas Pride Watch Party", host: "RashidLive", status: "Live soon", viewers: "780" },
      { match: "Morocco vs Portugal", title: "Green Lion Reactions", host: "AtlasWave", status: "Scheduled", viewers: "420" },
      { match: "Global Fan Room", title: "Morocco Fan Stadium", host: "CasablancaCast", status: "Scheduled", viewers: "560" },
    ],
  },
  brazil: {
    slug: "brazil",
    country: "Brazil",
    flag: "🇧🇷",
    languages: "Portuguese, English",
    description: "Watch fan rooms, reactions, and creators supporting Brazil.",
    streamers: [
      { name: "RafaGoals", style: "High-energy fan commentary", language: "Portuguese", viewers: "4.1K" },
      { name: "SambaBeat", style: "Live party watch-along", language: "English", viewers: "3.6K" },
      { name: "CarnivalCast", style: "Tactical passion stream", language: "Portuguese", viewers: "2.8K" },
    ],
    rooms: [
      { match: "Brazil vs Japan", title: "Samba Rush Room", host: "RafaGoals", status: "Live soon", viewers: "1.2K" },
      { match: "Brazil vs Germany", title: "Brazilian Fan Festa", host: "SambaBeat", status: "Scheduled", viewers: "930" },
      { match: "Open Fan Hall", title: "Rio Reaction Lounge", host: "CarnivalCast", status: "Scheduled", viewers: "670" },
    ],
  },
  argentina: {
    slug: "argentina",
    country: "Argentina",
    flag: "🇦🇷",
    languages: "Spanish, English",
    description: "Watch fan rooms, reactions, and creators supporting Argentina.",
    streamers: [
      { name: "LunaRoja", style: "Tactical breakdown voice", language: "Spanish", viewers: "3.0K" },
      { name: "TangoFan", style: "Emotional match commentary", language: "English", viewers: "2.4K" },
      { name: "BuenosAiresBar", style: "Live rivalry chat", language: "Spanish", viewers: "1.8K" },
    ],
    rooms: [
      { match: "Argentina vs Mexico", title: "Milonga Fan Zone", host: "LunaRoja", status: "Live soon", viewers: "980" },
      { match: "Argentina vs Brazil", title: "La Albiceleste Hub", host: "TangoFan", status: "Scheduled", viewers: "720" },
      { match: "Global Showcase", title: "Buenos Aires Reactions", host: "BuenosAiresBar", status: "Scheduled", viewers: "610" },
    ],
  },
  japan: {
    slug: "japan",
    country: "Japan",
    flag: "🇯🇵",
    languages: "Japanese, English",
    description: "Watch fan rooms, reactions, and creators supporting Japan.",
    streamers: [
      { name: "SakuraStream", style: "Calm tactical commentary", language: "Japanese", viewers: "2.5K" },
      { name: "TokyoTactics", style: "Fast-paced analysis", language: "English", viewers: "2.2K" },
      { name: "NipponNoise", style: "Match energy live", language: "Japanese", viewers: "1.7K" },
    ],
    rooms: [
      { match: "Japan vs South Korea", title: "Sakura Fan Patrol", host: "SakuraStream", status: "Live soon", viewers: "850" },
      { match: "Japan vs Brazil", title: "Tokyo Reaction Lab", host: "TokyoTactics", status: "Scheduled", viewers: "610" },
      { match: "Asian Playoff", title: "Nippon Noise Hub", host: "NipponNoise", status: "Scheduled", viewers: "540" },
    ],
  },
  england: {
    slug: "england",
    country: "England",
    flag: "🇬🇧",
    languages: "English",
    description: "Watch fan rooms, reactions, and creators supporting England.",
    streamers: [
      { name: "StadiumVibes", style: "Rivalry chant leader", language: "English", viewers: "3.5K" },
      { name: "LionHeart", style: "Passionate English fan", language: "English", viewers: "2.9K" },
      { name: "WembleyWave", style: "Live match energy", language: "English", viewers: "2.3K" },
    ],
    rooms: [
      { match: "England vs USA", title: "Three Lions Room", host: "StadiumVibes", status: "Live soon", viewers: "1.1K" },
      { match: "England vs France", title: "Wembley Reactions", host: "LionHeart", status: "Scheduled", viewers: "850" },
      { match: "Global English Hub", title: "English Football Fan Hall", host: "WembleyWave", status: "Scheduled", viewers: "720" },
    ],
  },
  france: {
    slug: "france",
    country: "France",
    flag: "🇫🇷",
    languages: "French, English",
    description: "Watch fan rooms, reactions, and creators supporting France.",
    streamers: [
      { name: "ParisPulse", style: "Stylish live watch party", language: "French", viewers: "3.8K" },
      { name: "BleuRoar", style: "Tactical French analysis", language: "English", viewers: "2.6K" },
      { name: "EiffelEnergy", style: "High-emotion streaming", language: "French", viewers: "2.1K" },
    ],
    rooms: [
      { match: "France vs Germany", title: "Bleu Fan Stadium", host: "ParisPulse", status: "Live soon", viewers: "1.0K" },
      { match: "France vs Spain", title: "Paris Reactions", host: "BleuRoar", status: "Scheduled", viewers: "780" },
      { match: "European Hub", title: "French Football Nation", host: "EiffelEnergy", status: "Scheduled", viewers: "650" },
    ],
  },
  usa: {
    slug: "usa",
    country: "USA",
    flag: "🇺🇸",
    languages: "English, Spanish",
    description: "Watch fan rooms, reactions, and creators supporting USA.",
    streamers: [
      { name: "StarsAndStripes", style: "Patriotic watch party", language: "English", viewers: "3.6K" },
      { name: "FanZoneUS", style: "American fan energy", language: "English", viewers: "3.1K" },
      { name: "GoalRushUSA", style: "Fast-paced soccer talk", language: "English", viewers: "2.4K" },
    ],
    rooms: [
      { match: "USA vs England", title: "Stars Fan Zone", host: "StarsAndStripes", status: "Live soon", viewers: "1.3K" },
      { match: "USA vs Mexico", title: "American Dream Room", host: "FanZoneUS", status: "Scheduled", viewers: "950" },
      { match: "Global USA Hub", title: "Soccer Nation USA", host: "GoalRushUSA", status: "Scheduled", viewers: "720" },
    ],
  },
  canada: {
    slug: "canada",
    country: "Canada",
    flag: "🇨🇦",
    languages: "English, French",
    description: "Watch fan rooms, reactions, and creators supporting Canada.",
    streamers: [
      { name: "MapleMode", style: "Cool Canadian watch party", language: "English", viewers: "2.2K" },
      { name: "NorthGate", style: "Canadian soccer passion", language: "French", viewers: "1.8K" },
      { name: "TorontoTactics", style: "Tactical Canadian fan", language: "English", viewers: "1.5K" },
    ],
    rooms: [
      { match: "Canada vs Mexico", title: "Maple Leaf Stadium", host: "MapleMode", status: "Live soon", viewers: "620" },
      { match: "Canada vs USA", title: "North American Rivals", host: "NorthGate", status: "Scheduled", viewers: "480" },
      { match: "North Hub", title: "Canadian Football Nation", host: "TorontoTactics", status: "Scheduled", viewers: "410" },
    ],
  },
  mexico: {
    slug: "mexico",
    country: "Mexico",
    flag: "🇲🇽",
    languages: "Spanish, English",
    description: "Watch fan rooms, reactions, and creators supporting Mexico.",
    streamers: [
      { name: "AztecPulse", style: "Energy-driven commentary", language: "Spanish", viewers: "3.4K" },
      { name: "VerdeVibe", style: "Mexican soccer culture", language: "English", viewers: "2.8K" },
      { name: "MexicoMomentum", style: "Live fan reactions", language: "Spanish", viewers: "2.3K" },
    ],
    rooms: [
      { match: "Mexico vs Argentina", title: "Aztec Energy Room", host: "AztecPulse", status: "Live soon", viewers: "1.05K" },
      { match: "Mexico vs USA", title: "CONCACAF Rivalry Hall", host: "VerdeVibe", status: "Scheduled", viewers: "890" },
      { match: "Latin America Hub", title: "Mexican Football Pride", host: "MexicoMomentum", status: "Scheduled", viewers: "710" },
    ],
  },
  portugal: {
    slug: "portugal",
    country: "Portugal",
    flag: "🇵🇹",
    languages: "Portuguese, English",
    description: "Watch fan rooms, reactions, and creators supporting Portugal.",
    streamers: [
      { name: "FadoFire", style: "Passionate Portuguese host", language: "Portuguese", viewers: "2.7K" },
      { name: "AzoresArena", style: "Island pride streaming", language: "English", viewers: "2.1K" },
      { name: "LisboaLive", style: "European soccer energy", language: "Portuguese", viewers: "1.9K" },
    ],
    rooms: [
      { match: "Portugal vs Spain", title: "Iberian Showdown", host: "FadoFire", status: "Live soon", viewers: "740" },
      { match: "Portugal vs France", title: "Portuguese Fan Hall", host: "AzoresArena", status: "Scheduled", viewers: "580" },
      { match: "European Hub", title: "Portugal Football Nation", host: "LisboaLive", status: "Scheduled", viewers: "490" },
    ],
  },
  spain: {
    slug: "spain",
    country: "Spain",
    flag: "🇪🇸",
    languages: "Spanish, English",
    description: "Watch fan rooms, reactions, and creators supporting Spain.",
    streamers: [
      { name: "OléWatch", style: "Spanish football passion", language: "Spanish", viewers: "3.3K" },
      { name: "RojaRally", style: "La Roja fan energy", language: "English", viewers: "2.5K" },
      { name: "MadridMomentum", style: "Madrid-based streaming", language: "Spanish", viewers: "2.2K" },
    ],
    rooms: [
      { match: "Spain vs Portugal", title: "Iberian Battle Room", host: "OléWatch", status: "Live soon", viewers: "920" },
      { match: "Spain vs France", title: "Spanish Fan Stadium", host: "RojaRally", status: "Scheduled", viewers: "760" },
      { match: "European Hall", title: "Spanish Football Crown", host: "MadridMomentum", status: "Scheduled", viewers: "640" },
    ],
  },
  germany: {
    slug: "germany",
    country: "Germany",
    flag: "🇩🇪",
    languages: "German, English",
    description: "Watch fan rooms, reactions, and creators supporting Germany.",
    streamers: [
      { name: "BerlinBounce", style: "Technical German analysis", language: "German", viewers: "3.7K" },
      { name: "DieMannschaft", style: "Team German streaming", language: "English", viewers: "3.0K" },
      { name: "BundesligaBeat", style: "German soccer culture", language: "German", viewers: "2.4K" },
    ],
    rooms: [
      { match: "Germany vs France", title: "Classic Rivals Room", host: "BerlinBounce", status: "Live soon", viewers: "1.15K" },
      { match: "Germany vs Spain", title: "German Fan Stadium", host: "DieMannschaft", status: "Scheduled", viewers: "870" },
      { match: "European Hall", title: "German Football Legacy", host: "BundesligaBeat", status: "Scheduled", viewers: "720" },
    ],
  },
  "saudi-arabia": {
    slug: "saudi-arabia",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    languages: "Arabic, English",
    description: "Watch fan rooms, reactions, and creators supporting Saudi Arabia.",
    streamers: [
      { name: "DesertDrums", style: "Arabian soccer passion", language: "Arabic", viewers: "2.1K" },
      { name: "RiyadhRush", style: "Middle East fan energy", language: "English", viewers: "1.7K" },
      { name: "GulfGoals", style: "Regional soccer culture", language: "Arabic", viewers: "1.4K" },
    ],
    rooms: [
      { match: "Saudi Arabia vs Poland", title: "Desert Pride Room", host: "DesertDrums", status: "Live soon", viewers: "580" },
      { match: "Saudi Arabia vs Japan", title: "Asian Fan Hall", host: "RiyadhRush", status: "Scheduled", viewers: "420" },
      { match: "Middle East Hub", title: "Saudi Arabia Football", host: "GulfGoals", status: "Scheduled", viewers: "340" },
    ],
  },
};

export const metadata: Metadata = {
  title: "Nation Fan Rooms | World Cup FanRoom",
};

export default async function NationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalizedSlug = slug?.toLowerCase();
  const nation = normalizedSlug ? nationDetails[normalizedSlug] : null;

  if (!nation) {
    return (
      <main className="min-h-screen bg-[#040406] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#08131d]/90 p-10 text-center shadow-lg shadow-black/30">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Nation not found</p>
          <h1 className="mt-4 text-3xl font-black text-white">No nation matches that slug.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">Try a known nation route like /nation/morocco or /nation/brazil.</p>
          <a href="/" className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">
            Back to homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="relative overflow-hidden px-6 py-10 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_25%)]" />
        <div className="relative mx-auto max-w-6xl space-y-16">
          <section className="rounded-[2rem] border border-white/10 bg-[#06121d]/95 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                  <span className="text-2xl">{nation.flag}</span>
                  {nation.country}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Nation hub</p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {nation.country} fan rooms and creator watch parties
                  </h1>
                </div>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  {nation.description}
                </p>
                <p className="text-sm text-slate-300">
                  Main languages: <span className="font-semibold text-white">{nation.languages}</span>
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#07151a] via-slate-950 to-[#08121d] p-8 shadow-inner shadow-black/30">
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">Quick nation snapshot</p>
                <div className="mt-6 space-y-4 text-white/80">
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Featured match</p>
                    <p className="mt-2 text-xl font-semibold">{nation.rooms[0].match}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Top streamer</p>
                    <p className="mt-2 text-xl font-semibold">{nation.streamers[0].name}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Top streamers</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Creators representing {nation.country}</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-400">Join the most active watch parties and creator-led reactions for this nation.</p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {nation.streamers.map((streamer) => (
                <div key={streamer.name} className="rounded-[1.75rem] border border-white/10 bg-[#08131d] p-6 shadow-lg shadow-black/25">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{streamer.language}</p>
                  <h3 className="mt-4 text-2xl font-bold text-white">{streamer.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{streamer.style}</p>
                  <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-300">
                    <span>{streamer.viewers} viewers</span>
                    <a href="/#top-streamers" className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-200 transition hover:bg-emerald-400/20">Join room</a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Upcoming fan rooms</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Live soon and scheduled rooms</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-400">Fans can choose rooms by match, host, and status without match footage.</p>
            </div>
            <div className="mt-8 space-y-4">
              {nation.rooms.map((room) => (
                <div key={room.title} className="rounded-[1.75rem] border border-white/10 bg-[#08131d] p-6 shadow-lg shadow-black/25 sm:flex sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{room.match}</p>
                    <h3 className="text-2xl font-bold text-white">{room.title}</h3>
                    <p className="text-sm text-slate-300">Host: {room.host}</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:items-end">
                    <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">{room.status}</span>
                    <span className="text-sm text-slate-300">{room.viewers} viewers</span>
                    <a href="/#apply" className="inline-flex rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300">View room</a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#06121d] p-8 shadow-lg shadow-black/25">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Safety reminder</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">No match footage here.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Fan rooms are for reactions, commentary, and community. Creators share energy and culture — not the actual match feed.
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

          <section className="rounded-[2rem] border border-white/10 bg-[#08131d] p-8 text-center shadow-lg shadow-black/20">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Want to represent this nation?</p>
            <h2 className="mt-3 text-3xl font-black text-white">Apply to stream for {nation.country}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Use the application form on the homepage to join the nation creator stage.
            </p>
            <a href="/#apply" className="mt-8 inline-flex rounded-full bg-emerald-400 px-8 py-4 text-base font-semibold text-black transition hover:bg-emerald-300">
              Go to application
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
