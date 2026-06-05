"use client";

import { useState, useEffect } from "react";

type RoomData = {
  id: string;
  title: string;
  match: string;
  host: string;
  country: string;
  flag: string;
  language: string;
  status: "Live Soon" | "Scheduled" | "Live";
  viewers: number;
  style: string;
  matchTime: string;
  fanbase: string;
  demoMessages: Array<{ user: string; message: string; timestamp: string }>;
};

// Each room now defines TWO sides (home vs away).
type SideInfo = {
  team: string;
  flag: string;
  host: string;
  accent: string;       // hex used for that side's glow/badges
  fanLabel: string;     // e.g. "Morocco fans"
};

const roomData: Record<string, RoomData> = {
  "casablanca-watch-party": {
    id: "casablanca-watch-party",
    title: "Casablanca Watch Party",
    match: "Morocco vs Spain",
    host: "RashidLive",
    country: "Morocco",
    flag: "🇲🇦",
    language: "Arabic",
    status: "Live Soon",
    viewers: 780,
    style: "Passionate reaction host",
    matchTime: "Wed 27 Nov · 7:00 PM GMT",
    fanbase: "Moroccan fans",
    demoMessages: [
      { user: "FanFromCasablanca", message: "That midfield is getting cooked.", timestamp: "2 min ago" },
      { user: "MaroccoSupporter", message: "Morocco fans where are you? 🇲🇦", timestamp: "1 min ago" },
      { user: "WorldCupFan", message: "First time in a fan room, this is class.", timestamp: "1 min ago" },
      { user: "RashidLive", message: "Welcome everyone, pick a side and let's go 🔥", timestamp: "just now" },
    ],
  },
  "rivalry-room": {
    id: "rivalry-room",
    title: "Rivalry Watch Party",
    match: "England vs USA",
    host: "StadiumVibes",
    country: "England",
    flag: "🇬🇧",
    language: "English",
    status: "Scheduled",
    viewers: 1100,
    style: "Rivalry chant leader",
    matchTime: "Fri 29 Nov · 6:30 PM GMT",
    fanbase: "English fans",
    demoMessages: [
      { user: "EnglandFan123", message: "No way he starts him again.", timestamp: "3 min ago" },
      { user: "USASoccer", message: "This is gonna be epic, let's go.", timestamp: "2 min ago" },
      { user: "StadiumVibes", message: "Pick your side, settle it in the room.", timestamp: "just now" },
    ],
  },
  "england-usa-live": {
    id: "england-usa-live",
    title: "England vs USA Live Room",
    match: "England vs USA",
    host: "LionHeart",
    country: "England",
    flag: "🇬🇧",
    language: "English",
    status: "Live Soon",
    viewers: 850,
    style: "Passionate English fan",
    matchTime: "Fri 29 Nov · 6:30 PM GMT",
    fanbase: "English fans",
    demoMessages: [
      { user: "LondonLoud", message: "This match is everything!", timestamp: "5 min ago" },
      { user: "LionHeart", message: "Both sides welcome — keep it loud, keep it clean.", timestamp: "2 min ago" },
    ],
  },
  "brazil-japan-room": {
    id: "brazil-japan-room",
    title: "Samba Rush Room",
    match: "Brazil vs Japan",
    host: "RafaGoals",
    country: "Brazil",
    flag: "🇧🇷",
    language: "Portuguese",
    status: "Live Soon",
    viewers: 1200,
    style: "High-energy fan commentary",
    matchTime: "Tue 26 Nov · 10:30 PM GMT",
    fanbase: "Brazilian fans",
    demoMessages: [
      { user: "BrazilFan", message: "Brazil side is filling up fast 🟡🟢", timestamp: "4 min ago" },
      { user: "SambaEnergy", message: "Bring the samba energy!", timestamp: "2 min ago" },
      { user: "RafaGoals", message: "Japan fans, where you at? Pick a side.", timestamp: "1 min ago" },
    ],
  },
  "morocco-spain-room": {
    id: "morocco-spain-room",
    title: "Atlas Pride Watch Party",
    match: "Morocco vs Spain",
    host: "AtlasWave",
    country: "Morocco",
    flag: "🇲🇦",
    language: "French",
    status: "Scheduled",
    viewers: 420,
    style: "Culture-driven watch party",
    matchTime: "Wed 27 Nov · 7:00 PM GMT",
    fanbase: "Moroccan fans",
    demoMessages: [
      { user: "AtlasWave", message: "Bienvenue à tous! Choisissez votre côté.", timestamp: "3 min ago" },
      { user: "MoroccoFan", message: "C'est notre moment!", timestamp: "1 min ago" },
    ],
  },
  "france-germany-room": {
    id: "france-germany-room",
    title: "Bleu Fan Stadium",
    match: "France vs Germany",
    host: "ParisPulse",
    country: "France",
    flag: "🇫🇷",
    language: "French",
    status: "Scheduled",
    viewers: 1000,
    style: "Stylish live watch party",
    matchTime: "Sun 24 Nov · 8:00 PM GMT",
    fanbase: "French fans",
    demoMessages: [
      { user: "FranceFan", message: "Allez les Bleus!", timestamp: "4 min ago" },
      { user: "ParisPulse", message: "Pick a side — France or Germany?", timestamp: "2 min ago" },
    ],
  },
};

// Map each room's match string into two sides (home | away).
// flag + host + accent are demo values for the visual MVP.
function getSides(room: RoomData): { home: SideInfo; away: SideInfo } {
  const teams = room.match.split(" vs ");
  const homeTeam = teams[0]?.trim() || room.country;
  const awayTeam = teams[1]?.trim() || "Away";

  // small lookup so the two sides get sensible flags/colours
  const flagFor: Record<string, string> = {
    Morocco: "🇲🇦", Spain: "🇪🇸", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", USA: "🇺🇸",
    Brazil: "🇧🇷", Japan: "🇯🇵", France: "🇫🇷", Germany: "🇩🇪",
  };
  const accentFor: Record<string, string> = {
    Morocco: "#e11d48", Spain: "#facc15", England: "#3b82f6", USA: "#3b82f6",
    Brazil: "#22c55e", Japan: "#ef4444", France: "#3b82f6", Germany: "#eab308",
  };

  return {
    home: {
      team: homeTeam,
      flag: flagFor[homeTeam] || room.flag,
      host: room.host,
      accent: accentFor[homeTeam] || "#34d399",
      fanLabel: `${homeTeam} fans`,
    },
    away: {
      team: awayTeam,
      flag: flagFor[awayTeam] || "🏳️",
      host: `${awayTeam}Host`,
      accent: accentFor[awayTeam] || "#7dd3fc",
      fanLabel: `${awayTeam} fans`,
    },
  };
}

type LivePageProps = {
  params: { roomId: string } | Promise<{ roomId: string }>;
};

export default function LiveRoomPage({ params }: LivePageProps) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; timestamp: string }>>([]);
  const [chosenSide, setChosenSide] = useState<"home" | "away" | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const roomId = resolvedParams?.roomId?.toLowerCase();
        if (roomId && roomData[roomId]) {
          const loaded = roomData[roomId];
          setRoom(loaded);
          setChatMessages(loaded.demoMessages);
        } else {
          setRoom(null);
        }
      } catch (e) {
        console.error("Error loading live room:", e);
        setRoom(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoom();
  }, [params]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#040406] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-slate-400">Loading live room...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-[#040406] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#08131d]/90 p-10 text-center shadow-lg shadow-black/30">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Room not found</p>
          <h1 className="mt-4 text-3xl font-black text-white">No live room matches that ID.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">Try /live/casablanca-watch-party or /live/brazil-japan-room.</p>
          <a href="/" className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">
            Back to homepage
          </a>
        </div>
      </main>
    );
  }

  const sides = getSides(room);
  const nationSlug = room.country.toLowerCase().replace(/\s+/g, "-");
  const isLive = room.status === "Live";

  // One side panel: big host face-cam + 20 small fan tiles.
  const SidePanel = ({ side, which }: { side: SideInfo; which: "home" | "away" }) => {
    const isMine = chosenSide === which;
    const fanCount = which === "home" ? 14 : 11; // demo: how many of the 20 slots are filled
    return (
      <div
        className="flex flex-col rounded-[1.5rem] border bg-[#070f18] p-4 sm:p-5"
        style={{
          borderColor: isMine ? side.accent : "rgba(255,255,255,0.08)",
          boxShadow: isMine ? `0 0 0 1px ${side.accent}55, 0 0 40px -20px ${side.accent}` : "none",
        }}
      >
        {/* Side header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{side.flag}</span>
            <span className="font-black text-white">{side.team}</span>
          </div>
          {isMine ? (
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black" style={{ background: side.accent }}>
              Your side
            </span>
          ) : chosenSide ? (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-white/50">Opposition</span>
          ) : null}
        </div>

        {/* Host face-cam (big) */}
        <div
          className="relative mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-950"
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at top, ${side.accent}22, transparent 60%)` }} />
          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl">{side.flag}</div>
            <p className="mt-2 text-sm font-bold text-white">{side.host}</p>
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: side.accent }}>Main host</p>
          </div>
          {isLive && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> Live
            </span>
          )}
        </div>

        {/* 20 fan webcam tiles */}
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">{side.fanLabel} · {fanCount}/20 on cam</p>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {Array.from({ length: 20 }).map((_, i) => {
            const filled = i < fanCount;
            const youTile = isMine && i === fanCount; // show "You" as the next slot on your side
            return (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-md border text-xs"
                style={{
                  borderColor: youTile ? side.accent : "rgba(255,255,255,0.07)",
                  background: youTile
                    ? `${side.accent}22`
                    : filled
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.015)",
                }}
              >
                {youTile ? (
                  <span className="text-[9px] font-bold" style={{ color: side.accent }}>YOU</span>
                ) : filled ? (
                  <span className="text-white/30">👤</span>
                ) : (
                  <span className="text-white/10">+</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-5">

          {/* ── HEADER ── */}
          <section className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#06121d] to-[#08131d] p-4 sm:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${isLive ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                  {isLive ? "● Live" : room.status}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{room.viewers} watching</span>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Versus fan room</p>
                <h1 className="text-2xl font-black text-white sm:text-3xl">{room.match}</h1>
                <p className="text-sm text-slate-300">{room.title} · {room.matchTime}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href={`/room/${room.id}`} className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">← Back to room</a>
                <span className="rounded-[1rem] border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">No match footage — reactions and fan discussion only.</span>
              </div>
            </div>
          </section>

          {/* ── PICK A SIDE PROMPT ── */}
          {!chosenSide && (
            <section className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/[0.06] p-6 text-center">
              <h2 className="text-xl font-black text-white sm:text-2xl">Pick your side</h2>
              <p className="mt-2 text-sm text-slate-300">Join {sides.home.team} or {sides.away.team}. You&apos;ll sit with your side — but you&apos;ll still see the whole room.</p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => setChosenSide("home")}
                  className="rounded-full px-6 py-3 text-sm font-bold text-black transition hover:opacity-90"
                  style={{ background: sides.home.accent }}
                >
                  {sides.home.flag} Join {sides.home.team}
                </button>
                <button
                  onClick={() => setChosenSide("away")}
                  className="rounded-full px-6 py-3 text-sm font-bold text-black transition hover:opacity-90"
                  style={{ background: sides.away.accent }}
                >
                  {sides.away.flag} Join {sides.away.team}
                </button>
              </div>
            </section>
          )}

          {/* ── SPLIT STAGE: HOME | AWAY ── */}
          <section>
            {chosenSide && (
              <div className="mb-3 flex items-center justify-center gap-3 text-sm">
                <span className="text-slate-300">
                  You joined <span className="font-bold text-white">{sides[chosenSide].flag} {sides[chosenSide].team}</span>
                </span>
                <button onClick={() => setChosenSide(null)} className="text-xs text-emerald-300 underline">switch side</button>
              </div>
            )}

            <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SidePanel side={sides.home} which="home" />

              {/* center VS divider (desktop) */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
                <span className="rounded-full border border-white/15 bg-[#040406] px-3 py-1.5 text-sm font-black text-white shadow-lg">VS</span>
              </div>

              <SidePanel side={sides.away} which="away" />
            </div>
          </section>

          {/* ── CHAT + RULES ── */}
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <section className="rounded-[1.5rem] border border-white/10 bg-[#08131d]">
              <div className="space-y-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">Room chat</h3>
                  <span className="text-xs text-slate-400">Both sides</span>
                </div>
                <div className="max-h-72 space-y-3 overflow-y-auto rounded-[1rem] bg-white/5 p-3">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-1 border-b border-white/5 pb-2 last:border-b-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-emerald-200">{msg.user}</p>
                        <p className="text-xs text-slate-400">{msg.timestamp}</p>
                      </div>
                      <p className="text-sm text-slate-300">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    disabled
                    placeholder={chosenSide ? "Chat opens when the room goes live" : "Pick a side to chat"}
                    className="flex-1 cursor-not-allowed rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/40 placeholder-white/30 outline-none"
                  />
                  <button disabled className="cursor-not-allowed rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/40">Send</button>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-[#06121d] p-4 sm:p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Room rules</p>
              <h3 className="mt-2 text-lg font-black text-white">Loud, not toxic</h3>
              <div className="mt-3 space-y-2">
                {["No match footage", "No match audio", "No racism or harassment", "Reports go to moderators"].map((r) => (
                  <div key={r} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <span className="text-emerald-300">✓</span>
                    <span className="text-sm text-slate-300">{r}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── BOTTOM NAV ── */}
          <section className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <a href={`/room/${room.id}`} className="flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">← Back to room</a>
            <a href={`/nation/${nationSlug}`} className="flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">View nation hub →</a>
            <a href="/#apply" className="flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">Apply to stream</a>
          </section>

        </div>
      </div>
    </main>
  );
}
