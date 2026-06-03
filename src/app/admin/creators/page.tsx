"use client";

import { useState } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Status =
  | "Not contacted"
  | "Contacted"
  | "Replied"
  | "Interested"
  | "Signed"
  | "Rejected"
  | "Follow up";

type OfferTier =
  | "Free listing"
  | "Featured placement"
  | "$25 paid game host"
  | "$50 paid game host"
  | "Premium partnership";

type Platform = "Instagram" | "TikTok" | "YouTube" | "X (Twitter)" | "Twitch";

type EngagementLevel = "Low" | "Medium" | "High" | "Very High";

interface Creator {
  id: number;
  name: string;
  platform: Platform;
  country: string;
  flag: string;
  followers: string;
  engagement: EngagementLevel;
  contactMethod: string;
  status: Status;
  offerTier: OfferTier;
  priority: number; // 1–10
  nextAction: string;
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const DEMO_CREATORS: Creator[] = [
  {
    id: 1,
    name: "Atlas Lions Fan HQ",
    platform: "Instagram",
    country: "Morocco",
    flag: "🇲🇦",
    followers: "284K",
    engagement: "Very High",
    contactMethod: "Instagram DM",
    status: "Not contacted",
    offerTier: "Featured placement",
    priority: 9,
    nextAction: "Send intro DM with platform overview",
  },
  {
    id: 2,
    name: "Samba Streamer BR",
    platform: "TikTok",
    country: "Brazil",
    flag: "🇧🇷",
    followers: "1.2M",
    engagement: "High",
    contactMethod: "TikTok DM",
    status: "Contacted",
    offerTier: "$50 paid game host",
    priority: 10,
    nextAction: "Follow up — no reply after 3 days",
  },
  {
    id: 3,
    name: "Albiceleste World",
    platform: "X (Twitter)",
    country: "Argentina",
    flag: "🇦🇷",
    followers: "620K",
    engagement: "Very High",
    contactMethod: "X DM",
    status: "Replied",
    offerTier: "Premium partnership",
    priority: 10,
    nextAction: "Send partnership deck + contract draft",
  },
  {
    id: 4,
    name: "Nashama Jordan",
    platform: "Instagram",
    country: "Jordan",
    flag: "🇯🇴",
    followers: "98K",
    engagement: "High",
    contactMethod: "Instagram DM",
    status: "Interested",
    offerTier: "$25 paid game host",
    priority: 8,
    nextAction: "Confirm onboarding call date",
  },
  {
    id: 5,
    name: "Green Falcons FC",
    platform: "YouTube",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    followers: "450K",
    engagement: "Medium",
    contactMethod: "YouTube / Email",
    status: "Signed",
    offerTier: "$50 paid game host",
    priority: 9,
    nextAction: "Brief on room setup + compliance rules",
  },
  {
    id: 6,
    name: "Samurai Blue Stream",
    platform: "Twitch",
    country: "Japan",
    flag: "🇯🇵",
    followers: "310K",
    engagement: "High",
    contactMethod: "Twitch / Twitter",
    status: "Follow up",
    offerTier: "Featured placement",
    priority: 7,
    nextAction: "Re-engage — send updated platform demo",
  },
  {
    id: 7,
    name: "Three Lions Hub",
    platform: "YouTube",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    followers: "875K",
    engagement: "Very High",
    contactMethod: "Email / YouTube",
    status: "Not contacted",
    offerTier: "Premium partnership",
    priority: 10,
    nextAction: "Research best contact — find email on About page",
  },
  {
    id: 8,
    name: "Les Bleus Passion",
    platform: "TikTok",
    country: "France",
    flag: "🇫🇷",
    followers: "530K",
    engagement: "Very High",
    contactMethod: "TikTok DM",
    status: "Rejected",
    offerTier: "Free listing",
    priority: 4,
    nextAction: "Archive — re-approach closer to tournament",
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { color: string; dot: string }> = {
  "Not contacted": { color: "text-slate-400", dot: "bg-slate-500" },
  Contacted: { color: "text-blue-400", dot: "bg-blue-500" },
  Replied: { color: "text-yellow-400", dot: "bg-yellow-400" },
  Interested: { color: "text-orange-400", dot: "bg-orange-400" },
  Signed: { color: "text-emerald-400", dot: "bg-emerald-400" },
  Rejected: { color: "text-red-400", dot: "bg-red-500" },
  "Follow up": { color: "text-purple-400", dot: "bg-purple-400" },
};

const OFFER_CONFIG: Record<OfferTier, string> = {
  "Free listing": "text-slate-300",
  "Featured placement": "text-sky-300",
  "$25 paid game host": "text-amber-300",
  "$50 paid game host": "text-amber-400",
  "Premium partnership": "text-rose-300",
};

const PLATFORM_ICON: Record<Platform, string> = {
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "▶️",
  "X (Twitter)": "𝕏",
  Twitch: "🟣",
};

const FILTER_OPTIONS = [
  "All",
  "High priority",
  "Needs follow-up",
  "Signed",
  "Paid offer",
] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];

const NEXT_ACTIONS = [
  { icon: "🔍", task: "Find 50 creator leads today", done: false },
  { icon: "📬", task: "Contact 20 high-priority pages", done: false },
  { icon: "✍️", task: "Sign first 5 country representatives", done: false },
  { icon: "🐦", task: "Prepare X launch post", done: false },
  { icon: "🎮", task: "Schedule first test fan room", done: false },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function priorityBar(score: number) {
  const filled = Math.round(score / 2); // 1–5 bars
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-3 rounded-sm ${
            i < filled
              ? score >= 9
                ? "bg-rose-500"
                : score >= 7
                ? "bg-amber-400"
                : "bg-sky-500"
              : "bg-white/10"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-white/40">{score}</span>
    </div>
  );
}

function engagementBadge(level: EngagementLevel) {
  const map: Record<EngagementLevel, string> = {
    Low: "bg-slate-700 text-slate-300",
    Medium: "bg-sky-900/60 text-sky-300",
    High: "bg-amber-900/60 text-amber-300",
    "Very High": "bg-emerald-900/60 text-emerald-300",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[level]}`}
    >
      {level}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CreatorsAdminPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionsDone, setActionsDone] = useState<boolean[]>(
    NEXT_ACTIONS.map(() => false)
  );

  // Derived metrics
  const total = DEMO_CREATORS.length;
  const contacted = DEMO_CREATORS.filter((c) =>
    ["Contacted", "Replied", "Interested", "Signed"].includes(c.status)
  ).length;
  const replies = DEMO_CREATORS.filter((c) =>
    ["Replied", "Interested", "Signed"].includes(c.status)
  ).length;
  const signed = DEMO_CREATORS.filter((c) => c.status === "Signed").length;
  const countries = new Set(DEMO_CREATORS.map((c) => c.country)).size;
  const paid = DEMO_CREATORS.filter((c) =>
    c.offerTier.includes("$")
  ).length;

  const metrics = [
    { label: "Total Leads", value: total, accent: "text-white" },
    { label: "Contacted", value: contacted, accent: "text-sky-400" },
    { label: "Replies", value: replies, accent: "text-yellow-400" },
    { label: "Signed", value: signed, accent: "text-emerald-400" },
    { label: "Countries", value: countries, accent: "text-purple-400" },
    { label: "Paid Creators", value: paid, accent: "text-amber-400" },
  ];

  // Filter logic
  const filtered = DEMO_CREATORS.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "High priority" && c.priority >= 8) ||
      (activeFilter === "Needs follow-up" &&
        (c.status === "Follow up" || c.status === "Contacted")) ||
      (activeFilter === "Signed" && c.status === "Signed") ||
      (activeFilter === "Paid offer" && c.offerTier.includes("$"));

    return matchesSearch && matchesFilter;
  });

  const toggleAction = (i: number) => {
    setActionsDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background: "linear-gradient(160deg, #080c12 0%, #0d1520 60%, #080c12 100%)",
        minHeight: "100vh",
        color: "#e2e8f0",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');

        .card-glow {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          transition: border-color 0.2s, background 0.2s;
        }
        .card-glow:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.13);
        }
        .filter-btn {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          transition: all 0.15s;
          font-family: inherit;
          letter-spacing: 0.03em;
        }
        .filter-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.8);
        }
        .filter-btn.active {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
          color: #fff;
        }
        .creator-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 1024px) {
          .creator-row {
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
          }
        }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
              Admin / Creator Ops
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(22px, 5vw, 38px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Streamer Acquisition
            <span style={{ color: "#facc15" }}> Command Center</span>
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 600 }}>
            Track creators, fan pages, outreach, offers, and signed streamers by country.
          </p>
        </div>

        {/* ── METRICS CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {metrics.map((m) => (
            <div key={m.label} className="card-glow" style={{ padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                }}
                className={m.accent}
              >
                {m.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS + SEARCH ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name or country…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "7px 14px",
              color: "#e2e8f0",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              width: "100%",
              maxWidth: 260,
            }}
          />
        </div>

        {/* ── TABLE (desktop) ── */}
        <div className="card-glow" style={{ overflow: "hidden", marginBottom: 32 }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr 1.4fr 1.6fr",
              padding: "10px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
            className="hidden-mobile"
          >
            {["Creator / Page", "Platform", "Country", "Followers", "Engagement", "Status / Offer", "Next Action"].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="scrollbar-thin" style={{ overflowX: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                No creators match this filter.
              </div>
            )}
            {filtered.map((creator, idx) => (
              <div
                key={creator.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr 1.4fr 1.6fr",
                  padding: "14px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  alignItems: "center",
                  transition: "background 0.15s",
                  minWidth: 900,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.025)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Name + Priority */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f1f5f9", marginBottom: 4 }}>
                    {creator.name}
                  </div>
                  {priorityBar(creator.priority)}
                </div>

                {/* Platform */}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  {PLATFORM_ICON[creator.platform]}{" "}
                  <span style={{ marginLeft: 4 }}>{creator.platform}</span>
                </div>

                {/* Country */}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  {creator.flag} {creator.country}
                </div>

                {/* Followers */}
                <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", color: "#fff" }}>
                  {creator.followers}
                </div>

                {/* Engagement */}
                <div>{engagementBadge(creator.engagement)}</div>

                {/* Status + Offer */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      className={`${STATUS_CONFIG[creator.status].dot}`}
                      style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }}
                    />
                    <span
                      className={STATUS_CONFIG[creator.status].color}
                      style={{ fontSize: 12 }}
                    >
                      {creator.status}
                    </span>
                  </div>
                  <div
                    className={OFFER_CONFIG[creator.offerTier]}
                    style={{ fontSize: 11, opacity: 0.8 }}
                  >
                    {creator.offerTier}
                  </div>
                </div>

                {/* Next Action */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                  {creator.nextAction}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {filtered.map((creator) => (
            <div
              key={`mobile-${creator.id}`}
              className="card-glow"
              style={{ padding: "16px 18px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                    {creator.flag} {creator.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {PLATFORM_ICON[creator.platform]} {creator.platform} · {creator.country}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: "#fff" }}>
                    {creator.followers}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
                    FOLLOWERS
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>
                {engagementBadge(creator.engagement)}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div
                    style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }}
                    className={STATUS_CONFIG[creator.status].dot}
                  />
                  <span className={STATUS_CONFIG[creator.status].color} style={{ fontSize: 12 }}>
                    {creator.status}
                  </span>
                </div>
                <span className={OFFER_CONFIG[creator.offerTier]} style={{ fontSize: 11 }}>
                  {creator.offerTier}
                </span>
              </div>

              <div style={{ marginBottom: 8 }}>{priorityBar(creator.priority)}</div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                → {creator.nextAction}
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM GRID: Next Actions + Compliance ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {/* Next Actions */}
          <div className="card-glow" style={{ padding: "24px" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Next Actions
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>
              Founder priority checklist
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {NEXT_ACTIONS.map((action, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                    opacity: actionsDone[i] ? 0.4 : 1,
                    transition: "opacity 0.2s",
                  }}
                  onClick={() => toggleAction(i)}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: `1.5px solid ${actionsDone[i] ? "#34d399" : "rgba(255,255,255,0.2)"}`,
                      background: actionsDone[i] ? "rgba(52,211,153,0.15)" : "transparent",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {actionsDone[i] && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: 13, color: actionsDone[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)" }}>
                      {action.icon} {action.task}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Legend */}
          <div className="card-glow" style={{ padding: "24px" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Status Key
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>
              Creator pipeline stages
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.entries(STATUS_CONFIG) as [Status, { color: string; dot: string }][]).map(
                ([status, config]) => (
                  <div key={status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      className={config.dot}
                      style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }}
                    />
                    <span className={config.color} style={{ fontSize: 13 }}>
                      {status}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Compliance */}
          <div
            className="card-glow"
            style={{
              padding: "24px",
              borderColor: "rgba(251,191,36,0.2)",
              background: "rgba(251,191,36,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fbbf24",
                }}
              >
                Compliance Reminder
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              Brief every signed creator before onboarding
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "No live match footage in rooms — ever.",
                "Rooms are for reactions, commentary & community.",
                "Fan chat, predictions, and hype only.",
                "Any footage violation = immediate removal.",
                "Platform is watch-along, not broadcast.",
              ].map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#fbbf24", fontSize: 12, flexShrink: 0, marginTop: 1 }}>✕</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    {rule}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── OFFER TIERS LEGEND ── */}
        <div className="card-glow" style={{ padding: "20px 24px", marginTop: 20 }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Offer Tiers
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(Object.entries(OFFER_CONFIG) as [OfferTier, string][]).map(([tier, cls]) => (
              <div
                key={tier}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 12,
                }}
                className={cls}
              >
                {tier}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
