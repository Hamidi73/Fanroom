"use client";

import { useState, useEffect } from "react";

type LiveRoomData = {
  roomId: string;
  title: string;
  match: string;
  host: string;
  country: string;
  flag: string;
  language: string;
  viewers: number;
  messages: Array<{ user: string; message: string; timestamp: string }>;
  poll: { question: string; options: Array<{ label: string; percentage: number }> };
};

const liveRooms: Record<string, LiveRoomData> = {
  "casablanca-watch-party": {
    roomId: "casablanca-watch-party",
    title: "Casablanca Watch Party",
    match: "Morocco vs Spain",
    host: "RashidLive",
    country: "Morocco",
    flag: "🇲🇦",
    language: "Arabic",
    viewers: 1240,
    messages: [
      { user: "FanFromCasablanca", message: "What a pass!", timestamp: "2m" },
      { user: "RashidLive", message: "Did you see that move? 🔥", timestamp: "1m" },
      { user: "SoccerFanatic", message: "This is insane energy!", timestamp: "1m" },
      { user: "MaroccoSupporter", message: "GOOOAAAL! 🇲🇦🇲🇦🇲🇦", timestamp: "now" },
    ],
    poll: {
      question: "Who will win this match?",
      options: [
        { label: "Morocco", percentage: 62 },
        { label: "Spain", percentage: 28 },
        { label: "Draw", percentage: 10 },
      ],
    },
  },
  "rivalry-room": {
    roomId: "rivalry-room",
    title: "Rivalry Watch Party",
    match: "England vs USA",
    host: "StadiumVibes",
    country: "England",
    flag: "🇬🇧",
    language: "English",
    viewers: 1850,
    messages: [
      { user: "EnglandFan123", message: "Come on England!", timestamp: "3m" },
      { user: "USASoccer", message: "USA will take this", timestamp: "2m" },
      { user: "StadiumVibes", message: "Intense match so far", timestamp: "1m" },
      { user: "WorldCupFan", message: "Best rivalry in football", timestamp: "now" },
    ],
    poll: {
      question: "Best performance so far?",
      options: [
        { label: "England Defense", percentage: 45 },
        { label: "USA Midfield", percentage: 35 },
        { label: "Equal", percentage: 20 },
      ],
    },
  },
  "england-usa-live": {
    roomId: "england-usa-live",
    title: "England vs USA Live Room",
    match: "England vs USA",
    host: "LionHeart",
    country: "England",
    flag: "🇬🇧",
    language: "English",
    viewers: 950,
    messages: [
      { user: "LondonLoud", message: "Three Lions on my chest!", timestamp: "4m" },
      { user: "LionHeart", message: "This is what we live for", timestamp: "2m" },
      { user: "FootballNation", message: "What an atmosphere", timestamp: "now" },
    ],
    poll: {
      question: "Who scores next?",
      options: [
        { label: "England", percentage: 52 },
        { label: "USA", percentage: 48 },
      ],
    },
  },
  "brazil-japan-room": {
    roomId: "brazil-japan-room",
    title: "Samba Rush Room",
    match: "Brazil vs Japan",
    host: "RafaGoals",
    country: "Brazil",
    flag: "🇧🇷",
    language: "Portuguese",
    viewers: 2100,
    messages: [
      { user: "BrazilFan", message: "Samba samba! 🟡🟢", timestamp: "5m" },
      { user: "RafaGoals", message: "THAT'S FOOTBALL!", timestamp: "2m" },
      { user: "JapanSupporter", message: "Amazing defending", timestamp: "1m" },
      { user: "SoccerWorld", message: "5 stars for this match", timestamp: "now" },
    ],
    poll: {
      question: "Best play of the game?",
      options: [
        { label: "Brazil's counter", percentage: 70 },
        { label: "Japan's save", percentage: 30 },
      ],
    },
  },
};

type LivePageProps = {
  params: { roomId: string } | Promise<{ roomId: string }>;
};

export default function LiveRoomPage({ params }: LivePageProps) {
  const [room, setRoom] = useState<LiveRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<LiveRoomData["messages"]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const roomId = resolvedParams?.roomId?.toLowerCase();

        if (roomId && liveRooms[roomId]) {
          const loadedRoom = liveRooms[roomId];
          setRoom(loadedRoom);
          setMessages(loadedRoom.messages);
          setViewerCount(loadedRoom.viewers);
          // Initialize vote counts
          const initialVotes: Record<string, number> = {};
          loadedRoom.poll.options.forEach((opt) => {
            initialVotes[opt.label] = 0;
          });
          setVotes(initialVotes);
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
    if (inputValue.trim() && room) {
      setMessages([
        ...messages,
        {
          user: "You",
          message: inputValue,
          timestamp: "now",
        },
      ]);
      setInputValue("");
    }
  };

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    setTimeout(() => setSelectedReaction(null), 500);
  };

  const handleVote = (option: string) => {
    if (room) {
      setVotes({
        ...votes,
        [option]: (votes[option] || 0) + 1,
      });
    }
  };

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
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Live room not found</p>
          <h1 className="mt-4 text-3xl font-black text-white">No live room matches that ID.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">Try a known room route like /live/casablanca-watch-party.</p>
          <a href="/" className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">
            Back to homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Live Header */}
        <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-red-500/10 to-emerald-500/10 p-4 shadow-lg shadow-black/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">LIVE</span>
              <span className="ml-2 text-sm text-slate-400">{viewerCount} watching</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{room.flag}</span>
              <span className="text-sm font-semibold text-white">{room.host}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{room.language}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Stream Area */}
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-black/40">
              <div className="relative aspect-video bg-[#020206] flex flex-col items-center justify-center space-y-4 p-8 text-center">
                <svg className="h-24 w-24 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <p className="max-w-sm text-sm font-semibold text-white">Creator reaction stream appears here</p>
                <p className="text-xs text-red-300">⚠️ Do not stream match footage</p>
              </div>
            </div>

            {/* Match Info + Reactions + Poll */}
            <div className="space-y-6">
              {/* Match Info */}
              <div className="rounded-[1.5rem] border border-white/10 bg-[#08131d] p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Now playing</p>
                <h2 className="mt-2 text-2xl font-black text-white">{room.match}</h2>
              </div>

              {/* Reactions */}
              <div className="rounded-[1.5rem] border border-white/10 bg-[#08131d] p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Fan reactions</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {["🔥", "😂", "😲", room.flag, "👏", "🎉"].map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(reaction)}
                      className={`rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-2xl transition hover:bg-white/15 ${
                        selectedReaction === reaction ? "scale-125 bg-white/20" : ""
                      }`}
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              </div>

              {/* Poll */}
              <div className="rounded-[1.5rem] border border-white/10 bg-[#08131d] p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Match poll</p>
                <h3 className="mt-3 font-semibold text-white">{room.poll.question}</h3>
                <div className="mt-4 space-y-3">
                  {room.poll.options.map((option) => {
                    const currentVotes = votes[option.label] || 0;
                    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
                    const displayPercentage = totalVotes > 0 ? Math.round((currentVotes / totalVotes) * 100) : option.percentage;
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleVote(option.label)}
                        className="w-full text-left transition hover:scale-105"
                      >
                        <div className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 p-3">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-500/0"
                            style={{ width: `${displayPercentage}%` }}
                          />
                          <div className="relative flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{option.label}</span>
                            <span className="text-xs font-bold text-emerald-300">{displayPercentage}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Chat + Stats */}
          <div className="space-y-6">
            {/* Live Chat */}
            <div className="flex flex-col rounded-[2rem] border border-white/10 bg-[#08131d] shadow-lg shadow-black/25">
              <div className="border-b border-white/10 p-4">
                <p className="text-sm font-semibold text-white">Live Chat</p>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-96 sm:max-h-64 lg:max-h-96">
                {messages.map((msg, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-emerald-300">{msg.user}</p>
                      <p className="text-slate-500">{msg.timestamp}</p>
                    </div>
                    <p className="text-slate-300 break-words">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t border-white/10 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Send message..."
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 outline-none transition focus:border-emerald-400/40 focus:bg-white/10"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Room Statistics */}
            <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[#08131d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Room stats</p>
              <div className="space-y-3 text-xs">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-slate-400">Viewers</p>
                  <p className="mt-1 text-lg font-bold text-white">{viewerCount}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-slate-400">Messages</p>
                  <p className="mt-1 text-lg font-bold text-white">{messages.length}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-slate-400">Engagement</p>
                  <p className="mt-1 text-lg font-bold text-emerald-300">94%</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <a
                href={`/room/${room.roomId}`}
                className="flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                ← Back to room
              </a>
              <a
                href="/"
                className="flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
