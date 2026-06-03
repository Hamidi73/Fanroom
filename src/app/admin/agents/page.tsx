"use client";

import { useState } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AgentStatus = "Running" | "Standby" | "Needs approval";

interface Agent {
  id: string;
  name: string;
  icon: string;
  mission: string;
  status: AgentStatus;
  priorityCountry: string;
  lastRun: string;
  nextRun: string;
  leadsFound: number;
  currentTask: string;
}

interface Platform {
  name: string;
  icon: string;
  purpose: string;
  collect: string;
  access: string;
  compliance: string;
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id: "streamer",
    name: "Streamer Research Agent",
    icon: "🎮",
    mission: "Find live streamers and gaming creators who cover football across Twitch, Kick & YouTube.",
    status: "Running",
    priorityCountry: "🇲🇦 Morocco",
    lastRun: "Today, 09:14",
    nextRun: "Today, 15:00",
    leadsFound: 23,
    currentTask: "Scanning Twitch football category for Arabic-speaking streamers.",
  },
  {
    id: "fanpage",
    name: "Fan Page Research Agent",
    icon: "📣",
    mission: "Discover nation fan pages and football communities across Instagram, X, TikTok & Facebook.",
    status: "Running",
    priorityCountry: "🇧🇷 Brazil",
    lastRun: "Today, 08:40",
    nextRun: "Today, 14:30",
    leadsFound: 41,
    currentTask: "Collecting Brazil fan accounts with 50K+ followers.",
  },
  {
    id: "scoring",
    name: "Lead Scoring Agent",
    icon: "📊",
    mission: "Score every new lead on relevance, engagement, and commercial potential.",
    status: "Standby",
    priorityCountry: "🌍 All countries",
    lastRun: "Today, 09:20",
    nextRun: "On new leads",
    leadsFound: 0,
    currentTask: "Idle — waiting for the research agents to deliver a new batch.",
  },
  {
    id: "outreach",
    name: "Outreach Drafting Agent",
    icon: "✍️",
    mission: "Draft personalized DMs for high-scoring leads using the outreach templates.",
    status: "Needs approval",
    priorityCountry: "🇦🇷 Argentina",
    lastRun: "Today, 09:25",
    nextRun: "After approval",
    leadsFound: 0,
    currentTask: "12 drafts ready for founder review before sending.",
  },
  {
    id: "followup",
    name: "Follow-up Agent",
    icon: "🔁",
    mission: "Track non-repliers and queue gentle follow-ups after 2–3 days.",
    status: "Standby",
    priorityCountry: "🇯🇵 Japan",
    lastRun: "Yesterday, 18:00",
    nextRun: "Tomorrow, 10:00",
    leadsFound: 0,
    currentTask: "Watching 8 contacted leads for reply timeout.",
  },
];

// ─── PIPELINE ─────────────────────────────────────────────────────────────────

const PIPELINE = [
  { label: "Research platforms", icon: "🔍" },
  { label: "Qualify leads", icon: "✅" },
  { label: "Score priority", icon: "📊" },
  { label: "Draft outreach", icon: "✍️" },
  { label: "Founder approval", icon: "👤" },
  { label: "Update creator tracker", icon: "🗂️" },
];

// ─── PLATFORMS ────────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  {
    name: "Twitch",
    icon: "🟣",
    purpose: "Find live football streamers & watch-party hosts.",
    collect: "Channel name, category, avg viewers, language.",
    access: "Official API",
    compliance: "Use Twitch API only. No private data.",
  },
  {
    name: "Kick",
    icon: "🟢",
    purpose: "Find emerging streamers with football audiences.",
    collect: "Channel, follower count, stream topics.",
    access: "Scraper later",
    compliance: "Respect terms. Public data only.",
  },
  {
    name: "YouTube",
    icon: "▶️",
    purpose: "Find football commentary & reaction channels.",
    collect: "Channel, subs, upload cadence, contact email.",
    access: "Official API",
    compliance: "Use YouTube Data API. Public info only.",
  },
  {
    name: "X",
    icon: "𝕏",
    purpose: "Find nation fan accounts & football personalities.",
    collect: "Handle, followers, engagement, bio links.",
    access: "API / manual",
    compliance: "Public posts only. No scraping DMs.",
  },
  {
    name: "Instagram",
    icon: "📸",
    purpose: "Find country fan pages & visual creators.",
    collect: "Handle, followers, post engagement.",
    access: "Manual / scraper later",
    compliance: "Public profiles only. Respect terms.",
  },
  {
    name: "TikTok",
    icon: "🎵",
    purpose: "Find viral football fan creators.",
    collect: "Handle, followers, views, country.",
    access: "Manual / scraper later",
    compliance: "Public data only. No private info.",
  },
  {
    name: "Reddit",
    icon: "👽",
    purpose: "Find nation subreddits & active community mods.",
    collect: "Subreddit, members, top contributors.",
    access: "Official API",
    compliance: "Follow Reddit API rules. No DMs scraping.",
  },
  {
    name: "Discord",
    icon: "💬",
    purpose: "Find football fan servers & community owners.",
    collect: "Public server name, size, invite link.",
    access: "Manual",
    compliance: "Public servers only. Never join uninvited.",
  },
  {
    name: "Facebook",
    icon: "📘",
    purpose: "Find large nation fan groups & pages.",
    collect: "Page/group name, size, admin contact.",
    access: "Manual / API",
    compliance: "Public pages only. Respect group rules.",
  },
];

// ─── SCORING RULES ────────────────────────────────────────────────────────────

const SCORING_RULES = [
  { label: "Country relevance", desc: "Does the creator clearly represent a World Cup nation?" },
  { label: "Engagement quality", desc: "Real comments & interaction, not just follower count." },
  { label: "Posting frequency", desc: "Active and consistent during football moments." },
  { label: "Follower count", desc: "Audience size — weighted, not the only factor." },
  { label: "Streamer potential", desc: "Could they host a live fan room well?" },
  { label: "Reply likelihood", desc: "Open DMs, responsive, collaborative history." },
  { label: "Commercial value", desc: "Fit for paid hosting or premium partnership." },
];

// ─── SAFETY RULES ─────────────────────────────────────────────────────────────

const SAFETY_RULES = [
  "Do not spam.",
  "Do not auto-DM without founder approval.",
  "Do not scrape private data.",
  "Respect platform terms.",
  "Use official APIs where possible.",
  "Track source links for every lead.",
  "No match footage — ever.",
];

// ─── BUILD STEPS ──────────────────────────────────────────────────────────────

const BUILD_STEPS = [
  "Connect creator tracker to a real database",
  "Add scheduled research jobs",
  "Add Twitch API search",
  "Add X / fan page research workflow",
  "Add lead scoring",
  "Add outreach draft queue",
  "Add approval workflow",
];

// ─── NAV ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "← Admin Dashboard", href: "/admin" },
  { label: "Creator Tracker", href: "/admin/creators" },
  { label: "Outreach Messages", href: "/admin/outreach" },
  { label: "X Launch", href: "/admin/x-launch" },
  { label: "Homepage", href: "/" },
];

// ─── STATUS STYLING ───────────────────────────────────────────────────────────

const STATUS_STYLE: Record<AgentStatus, { color: string; bg: string; border: string }> = {
  Running: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.35)" },
  Standby: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)" },
  "Needs approval": { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.35)" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const handleManualRun = (agentName: string) => {
    setToast(`▶ ${agentName} queued (demo only — no real run yet)`);
    setTimeout(() => setToast(null), 2600);
  };

  const totalLeads = AGENTS.reduce((sum, a) => sum + a.leadsFound, 0);
  const running = AGENTS.filter((a) => a.status === "Running").length;

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background: "linear-gradient(160deg, #080c12 0%, #0d1520 60%, #080c12 100%)",
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
          transition: border-color 0.2s, background 0.2s;
        }
        .card-glow:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.13);
        }
        .nav-link {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          transition: all 0.15s;
          font-family: inherit;
        }
        .nav-link:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.04);
        }
        .run-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #fff;
          transition: all 0.15s;
          letter-spacing: 0.03em;
          width: 100%;
        }
        .run-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.3);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .pulse-dot { animation: pulse 1.6s ease-in-out infinite; }
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(13,21,32,0.95);
          border: 1px solid rgba(52,211,153,0.4);
          color: #34d399;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 13px;
          z-index: 50;
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── NAV ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
          ))}
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Admin / Automation
          </span>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(22px, 5vw, 38px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              lineHeight: 1.1,
              margin: "6px 0 0",
            }}
          >
            Agent Automation <span style={{ color: "#facc15" }}>Command Center</span>
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 640 }}>
            Monitor research agents that find, score, and prepare outreach for World Cup creators and fan pages.
          </p>
        </div>

        {/* ── DEMO NOTICE ── */}
        <div
          className="card-glow"
          style={{
            padding: "12px 18px",
            marginBottom: 28,
            borderColor: "rgba(125,211,252,0.2)",
            background: "rgba(125,211,252,0.04)",
            fontSize: 12.5,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          🧪 <span style={{ color: "#7dd3fc" }}>Preview mode.</span> This is a visual mock-up of the automation system. No real scraping, API calls, or DMs happen yet — everything below is demo data.
        </div>

        {/* ── QUICK STATS ── */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28, fontSize: 13 }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>
            Agents running: <span style={{ color: "#34d399", fontWeight: 600 }}>{running} / {AGENTS.length}</span>
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>
            Leads found today: <span style={{ color: "#facc15", fontWeight: 600 }}>{totalLeads}</span>
          </span>
        </div>

        {/* ── AGENT CARDS ── */}
        <h2 style={sectionTitle}>Research Agents</h2>
        <p style={sectionSub}>Each agent has one job. Together they fill the creator tracker.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {AGENTS.map((agent) => {
            const s = STATUS_STYLE[agent.status];
            return (
              <div key={agent.id} className="card-glow" style={{ padding: "22px", display: "flex", flexDirection: "column" }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{agent.icon}</span>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                      {agent.name}
                    </h3>
                  </div>
                </div>

                {/* Status badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    alignSelf: "flex-start",
                    padding: "4px 11px",
                    borderRadius: 999,
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    marginBottom: 14,
                  }}
                >
                  <span
                    className={agent.status === "Running" ? "pulse-dot" : ""}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }}
                  />
                  <span style={{ fontSize: 11.5, color: s.color }}>{agent.status}</span>
                </div>

                {/* Mission */}
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  {agent.mission}
                </p>

                {/* Meta grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginBottom: 16 }}>
                  <Meta label="Priority country" value={agent.priorityCountry} />
                  <Meta label="Leads found" value={String(agent.leadsFound)} accent="#facc15" />
                  <Meta label="Last run" value={agent.lastRun} />
                  <Meta label="Next run" value={agent.nextRun} />
                </div>

                {/* Current task */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 16,
                    flexGrow: 1,
                  }}
                >
                  <div style={metaLabel}>Current task</div>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", lineHeight: 1.5 }}>
                    {agent.currentTask}
                  </p>
                </div>

                {/* Manual run */}
                <button className="run-btn" onClick={() => handleManualRun(agent.name)}>
                  ▶ Manual Run
                </button>
              </div>
            );
          })}
        </div>

        {/* ── PIPELINE ── */}
        <h2 style={sectionTitle}>Automation Pipeline</h2>
        <p style={sectionSub}>How a lead travels from discovery to your tracker.</p>
        <div className="card-glow" style={{ padding: "26px 24px", marginBottom: 40 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 8 }}>
            {PIPELINE.map((step, i) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8, flexGrow: 1 }}>
                <div
                  style={{
                    flexGrow: 1,
                    minWidth: 120,
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 9,
                    padding: "14px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{step.icon}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{step.label}</div>
                </div>
                {i < PIPELINE.length - 1 && (
                  <span style={{ color: "rgba(250,204,21,0.5)", fontSize: 16, flexShrink: 0 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── PLATFORM COVERAGE ── */}
        <h2 style={sectionTitle}>Platform Coverage</h2>
        <p style={sectionSub}>Where the agents will look — and the rules for each.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginBottom: 40,
          }}
        >
          {PLATFORMS.map((p) => (
            <div key={p.name} className="card-glow" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>{p.name}</span>
              </div>
              <PlatformRow label="Purpose" value={p.purpose} />
              <PlatformRow label="Collect" value={p.collect} />
              <PlatformRow label="Access" value={p.access} accentValue />
              <PlatformRow label="Compliance" value={p.compliance} dim />
            </div>
          ))}
        </div>

        {/* ── SCORING + SAFETY (two columns) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {/* Scoring rules */}
          <div className="card-glow" style={{ padding: "24px 26px" }}>
            <h2 style={{ ...sectionTitle, marginBottom: 2 }}>Lead Scoring Rules</h2>
            <p style={{ ...sectionSub, marginBottom: 18 }}>What makes a lead high-priority.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SCORING_RULES.map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.25)",
                      color: "#facc15", fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 500 }}>{rule.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{rule.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety rules */}
          <div
            className="card-glow"
            style={{ padding: "24px 26px", borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.03)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 18 }}>🛡️</span>
              <h2 style={{ ...sectionTitle, color: "#fbbf24", margin: 0 }}>Safety Rules</h2>
            </div>
            <p style={{ ...sectionSub, marginBottom: 18 }}>Non-negotiable. The agents obey these first.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {SAFETY_RULES.map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#fbbf24", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── NEXT BUILD STEPS ── */}
        <div className="card-glow" style={{ padding: "24px 26px", marginBottom: 28 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 2 }}>Next Automation Build Steps</h2>
          <p style={{ ...sectionSub, marginBottom: 18 }}>The roadmap from this mock-up to a live system.</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {BUILD_STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 12, alignItems: "center",
                  padding: "12px 14px", background: "rgba(0,0,0,0.2)",
                  borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700,
                    color: "rgba(255,255,255,0.3)", flexShrink: 0, minWidth: 22,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER NOTE ── */}
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 36 }}>
          Reminder: agents prepare outreach only. No auto-sending, no scraping private data, no match footage.
        </p>
      </div>

      {/* ── TOAST ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ─── SMALL HELPER COMPONENTS ──────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  color: "#fff",
  margin: "0 0 2px",
};

const sectionSub: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.35)",
  margin: "0 0 18px",
};

const metaLabel: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.3)",
};

function Meta({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div style={metaLabel}>{label}</div>
      <div style={{ fontSize: 13, color: accent || "rgba(255,255,255,0.75)", marginTop: 3 }}>{value}</div>
    </div>
  );
}

function PlatformRow({
  label,
  value,
  accentValue,
  dim,
}: {
  label: string;
  value: string;
  accentValue?: boolean;
  dim?: boolean;
}) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={metaLabel}>{label}</div>
      <div
        style={{
          fontSize: 12.5,
          color: accentValue ? "#7dd3fc" : dim ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
          marginTop: 2,
          lineHeight: 1.45,
        }}
      >
        {value}
      </div>
    </div>
  );
}
