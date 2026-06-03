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
      { user: "FanFromCasablanca", message: "Excited for this match!", timestamp: "2 min ago" },
      { user: "MaroccoSupporter", message: "Let's go! 🇲🇦", timestamp: "1 min ago" },
      { user: "WorldCupFan", message: "First time joining a fan room, love this!", timestamp: "1 min ago" },
      { user: "RashidLive", message: "Welcome everyone! So pumped for kickoff 🔥", timestamp: "just now" },
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
      { user: "EnglandFan123", message: "Come on England!", timestamp: "3 min ago" },
      { user: "USASoccer", message: "This is gonna be epic", timestamp: "2 min ago" },
      { user: "StadiumVibes", message: "Let's settle this on the pitch!", timestamp: "just now" },
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
      { user: "LionHeart", message: "Let's have fun and enjoy the football", timestamp: "2 min ago" },
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
      { user: "BrazilFan", message: "Let's goooo! 🟡🟢", timestamp: "4 min ago" },
      { user: "SambaEnergy", message: "Bring the samba energy!", timestamp: "2 min ago" },
      { user: "RafaGoals", message: "Time to celebrate! Who's ready?", timestamp: "1 min ago" },
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
      { user: "AtlasWave", message: "Bienvenue à tous!", timestamp: "3 min ago" },
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
      { user: "ParisPulse", message: "Let's make some noise for France", timestamp: "2 min ago" },
    ],
  },
};

type RoomPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default function RoomPage({ params }: RoomPageProps) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; timestamp: string }>>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const loadRoom = async () => {
      try {
        // Handle both sync and async params
        const resolvedParams = params instanceof Promise ? await params : params;
        const roomId = resolvedParams?.id?.toLowerCase();

        if (roomId && roomData[roomId]) {
          const loadedRoom = roomData[roomId];
          setRoom(loadedRoom);
          setChatMessages(loadedRoom.demoMessages);
        } else {
          setRoom(null);
        }
      } catch (error) {
        console.error("Error loading room:", error);
        setRoom(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [params]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          user: "You",
          message: inputValue,
          timestamp: "now",
        },
      ]);
      setInputValue("");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#040406] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-slate-400">Loading room...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-[#040406] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#08131d]/90 p-10 text-center shadow-lg shadow-black/30">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Room not found</p>
          <h1 className="mt-4 text-3xl font-black text-white">No room matches that ID.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">Try a known room route like /room/casablanca-watch-party or /room/brazil-japan-room.</p>
          <a href="/" className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">
            Back to homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Room Hero */}
          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#06121d] to-[#08131d] p-6 shadow-lg shadow-black/30 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.35em] font-semibold ${
                      room.status === "Live"
                        ? "bg-red-500/20 text-red-300"
                        : room.status === "Live Soon"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-slate-700/50 text-slate-300"
                    }`}
                  >
                    {room.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{room.viewers} viewers</span>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Live Fan Room</p>
                  <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{room.title}</h1>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="font-semibold text-white">Match:</span> {room.match}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Time:</span> {room.matchTime}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Host:</span> {room.host}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Language:</span> {room.language}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <p className="font-semibold">⚠️ No Match Footage</p>
                  <p className="mt-2">This room is for creator reactions and commentary only.</p>
                </div>
              </div>

              {/* Stream Placeholder */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl shadow-black/40">
                  <div className="flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
                    <svg className="h-16 w-16 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                      <line x1="7" y1="2" x2="7" y2="22" />
                      <line x1="17" y1="2" x2="17" y2="22" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <line x1="2" y1="7" x2="22" y2="7" />
                      <line x1="2" y1="17" x2="22" y2="17" />
                    </svg>
                    <p className="text-sm font-semibold text-white">Creator reaction stream will appear here</p>
                    <p className="text-xs text-white/60">Do not stream match footage</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/5 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Broadcasting</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-300">Stream status: {room.status}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Grid: Stream + Chat */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Chat Section */}
            <section className="order-2 lg:order-1 rounded-[2rem] border border-white/10 bg-[#08131d] shadow-lg shadow-black/25">
              <div className="space-y-4 p-6 sm:p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Live chat</p>
                <h2 className="text-2xl font-black text-white">Join the conversation</h2>

                {/* Chat Messages */}
                <div className="space-y-3 max-h-96 overflow-y-auto rounded-[1.5rem] bg-white/5 p-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-1 border-b border-white/5 pb-3 last:border-b-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-emerald-200">{msg.user}</p>
                        <p className="text-xs text-slate-400">{msg.timestamp}</p>
                      </div>
                      <p className="text-sm text-slate-300">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Join the conversation..."
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400/40 focus:bg-white/10"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>

            {/* Host Card + Details */}
            <div className="order-1 lg:order-2 space-y-6">
              {/* Host Card */}
              <section className="rounded-[2rem] border border-white/10 bg-[#08131d] p-6 shadow-lg shadow-black/25 sm:p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Host</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-center text-5xl">
                    {room.flag}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{room.host}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {room.country} • {room.language}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300">{room.style}</p>
                  <div className="rounded-full bg-white/5 px-4 py-2 text-center text-sm text-slate-300">
                    {room.viewers}+ expected viewers
                  </div>
                  <button className="w-full rounded-full border border-emerald-400/30 bg-emerald-400/10 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20">
                    Follow {room.host}
                  </button>
                </div>
              </section>

              {/* Room Details */}
              <section className="rounded-[2rem] border border-white/10 bg-[#08131d] p-6 shadow-lg shadow-black/25 sm:p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Room details</p>
                <div className="mt-4 space-y-4 text-sm">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Fanbase</p>
                    <p className="mt-1 font-semibold text-white">{room.fanbase}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Match</p>
                    <p className="mt-1 font-semibold text-white">{room.match}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Language</p>
                    <p className="mt-1 font-semibold text-white">{room.language}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Safety Strip */}
          <section className="rounded-[2rem] border border-white/10 bg-[#06121d] p-6 text-center shadow-lg shadow-black/25 sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Compliance reminder</p>
            <h2 className="mt-4 text-2xl font-black text-white">Reactions & commentary only</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              This room is for reactions, commentary and chat only. No match footage. Creators share the passion, culture, and energy — not the match feed.
            </p>
          </section>

          {/* Navigation CTAs */}
          <section className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <a
              href="/"
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              ← Back to homepage
            </a>
            <a
              href={`/nation/${room.country.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View nation hub →
            </a>
            <a href="/#apply" className="flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">
              Apply to stream
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
