"use client";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ToolCard {
  title: string;
  href: string;
  desc: string;
  icon: string;
  accent: string;
}

interface MvpItem {
  label: string;
  done: boolean;
}

// ─── ADMIN TOOL CARDS ─────────────────────────────────────────────────────────

const TOOLS: ToolCard[] = [
  {
    title: "Creator Acquisition",
    href: "/admin/creators",
    desc: "Track fan pages, streamers, creator leads, outreach status, and paid host offers.",
    icon: "🎯",
    accent: "#facc15",
  },
  {
    title: "Outreach Message Center",
    href: "/admin/outreach",
    desc: "Copy-ready DMs and creator recruitment messages.",
    icon: "✉️",
    accent: "#7dd3fc",
  },
  {
    title: "X Launch Command Center",
    href: "/admin/x-launch",
    desc: "Launch timeline, X profile setup, content pillars, and launch posts.",
    icon: "🚀",
    accent: "#fda4af",
  },
  {
    title: "Agent Automation Command Center",
    href: "/admin/agents",
    desc: "Monitor research agents that find, score, and prepare outreach for World Cup streamers, fan pages, and creators.",
    icon: "🤖",
    accent: "#34d399",
  },
  {
    title: "Public Homepage",
    href: "/",
    desc: "View the public fan-facing website.",
    icon: "🌐",
    accent: "#86efac",
  },
];

// ─── EXAMPLE PUBLIC ROUTES ────────────────────────────────────────────────────

const NATION_LINKS = [
  { label: "🇲🇦 Morocco", href: "/nation/morocco" },
  { label: "🇧🇷 Brazil", href: "/nation/brazil" },
  { label: "🇦🇷 Argentina", href: "/nation/argentina" },
];

const ROOM_LINKS = [
  { label: "Room page", href: "/room/casablanca-watch-party" },
  { label: "Live room", href: "/live/casablanca-watch-party" },
];

// ─── MVP STATUS ───────────────────────────────────────────────────────────────

const MVP_STATUS: MvpItem[] = [
  { label: "Homepage built", done: true },
  { label: "Nation pages built", done: true },
  { label: "Room pages built", done: true },
  { label: "Live room demo built", done: true },
  { label: "Creator tracker built", done: true },
  { label: "Outreach messages built", done: true },
  { label: "X launch center built", done: true },
  { label: "Backend not connected yet", done: false },
];

// ─── ACQUISITION PRIORITIES ───────────────────────────────────────────────────

const PRIORITIES = [
  "Find 50 creator leads",
  "Contact 20 high priority pages",
  "Sign first 5 country representatives",
  "Prepare X profile and first launch posts",
  "Schedule first test live room",
];

// ─── NEXT 7 DAYS PLAN ─────────────────────────────────────────────────────────

const SEVEN_DAYS = [
  { day: "Day 1", task: "Build the creator lead list — aim for 50 fan pages & streamers." },
  { day: "Day 2", task: "Set up the X profile and post the pinned launch announcement." },
  { day: "Day 3", task: "Send the first 20 outreach DMs to high-priority pages." },
  { day: "Day 4", task: "Follow up with non-repliers, post creator recruitment thread." },
  { day: "Day 5", task: "Confirm first interested creators, send offers." },
  { day: "Day 6", task: "Sign first country representatives, brief them on compliance." },
  { day: "Day 7", task: "Announce and run the first test live fan room." },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const builtCount = MVP_STATUS.filter((m) => m.done).length;

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background:
          "linear-gradient(160deg, #080c12 0%, #0d1520 60%, #080c12 100%)",
        minHeight: "100vh",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');

        .card-glow {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .card-glow:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.13);
        }
        .tool-card {
          text-decoration: none;
          display: block;
        }
        .tool-card:hover {
          transform: translateY(-2px);
        }
        .pill-link {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          transition: all 0.15s;
          font-family: inherit;
          display: inline-block;
        }
        .pill-link:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.04);
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Admin
          </span>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(24px, 5vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              lineHeight: 1.1,
              margin: "6px 0 0",
            }}
          >
            Founder <span style={{ color: "#facc15" }}>Command Center</span>
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 620 }}>
            Your hub for building the World Cup fan watch-along platform — acquisition, outreach, launch, and live demos in one place.
          </p>
        </div>

        {/* ── TOOL CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {TOOLS.map((tool) => (
            <a key={tool.href} href={tool.href} className="card-glow tool-card" style={{ padding: "22px" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: `${tool.accent}1a`,
                  border: `1px solid ${tool.accent}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 14,
                }}
              >
                {tool.icon}
              </div>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 6px",
                }}
              >
                {tool.title}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 12px", lineHeight: 1.5 }}>
                {tool.desc}
              </p>
              <span style={{ fontSize: 12, color: tool.accent }}>{tool.href} →</span>
            </a>
          ))}
        </div>

        {/* ── EXAMPLE PUBLIC ROUTES ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {/* Nation pages */}
          <div className="card-glow" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🌍</span>
              <h3 style={subHead}>Nation Pages</h3>
            </div>
            <p style={subDesc}>Example fan-facing country pages.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {NATION_LINKS.map((n) => (
                <a key={n.href} href={n.href} className="pill-link">
                  {n.label}
                </a>
              ))}
            </div>
          </div>

          {/* Live room demo */}
          <div className="card-glow" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🎬</span>
              <h3 style={subHead}>Live Room Demo</h3>
            </div>
            <p style={subDesc}>Example watch-party room (Casablanca).</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ROOM_LINKS.map((r) => (
                <a key={r.href} href={r.href} className="pill-link">
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── MVP STATUS + ACQUISITION PRIORITIES ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* MVP Status */}
          <div className="card-glow" style={{ padding: "24px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h2 style={blockTitle}>MVP Status</h2>
              <span style={{ fontSize: 12, color: "#34d399" }}>{builtCount} / {MVP_STATUS.length} built</span>
            </div>
            <p style={{ ...subDesc, marginBottom: 18 }}>What's shipped so far.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MVP_STATUS.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: item.done ? "rgba(52,211,153,0.15)" : "rgba(251,146,60,0.12)",
                      border: `1px solid ${item.done ? "rgba(52,211,153,0.4)" : "rgba(251,146,60,0.4)"}`,
                    }}
                  >
                    {item.done ? (
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span style={{ color: "#fb923c", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>!</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: item.done ? "rgba(255,255,255,0.7)" : "#fb923c" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Acquisition Priorities */}
          <div className="card-glow" style={{ padding: "24px 26px" }}>
            <h2 style={blockTitle}>Acquisition Priorities</h2>
            <p style={{ ...subDesc, marginBottom: 18 }}>The needle-movers right now.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRIORITIES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: "rgba(250,204,21,0.12)",
                      border: "1px solid rgba(250,204,21,0.25)",
                      color: "#facc15",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── NEXT 7 DAYS PLAN ── */}
        <div className="card-glow" style={{ padding: "24px 26px", marginBottom: 20 }}>
          <h2 style={blockTitle}>Next 7 Days Plan</h2>
          <p style={{ ...subDesc, marginBottom: 18 }}>One focused move per day.</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {SEVEN_DAYS.map((d) => (
              <div
                key={d.day}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "12px 14px",
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#facc15",
                    flexShrink: 0,
                    minWidth: 38,
                  }}
                >
                  {d.day}
                </span>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{d.task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPLIANCE REMINDER ── */}
        <div
          className="card-glow"
          style={{
            padding: "20px 24px",
            borderColor: "rgba(251,191,36,0.25)",
            background: "rgba(251,191,36,0.04)",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <div>
            <h2 style={{ ...blockTitle, color: "#fbbf24", margin: "0 0 6px" }}>Compliance Reminder</h2>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: "#fff", fontWeight: 500 }}>No match footage.</span>{" "}
              Creator rooms are only for reactions, commentary, live chat, and community.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const blockTitle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  color: "#fff",
  margin: 0,
};

const subHead: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
  margin: 0,
};

const subDesc: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.35)",
  margin: "0 0 14px",
};
