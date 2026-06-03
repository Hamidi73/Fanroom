"use client";

import { useState } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface TimelineStep {
  step: string;
  detail: string;
  icon: string;
}

interface LaunchPost {
  id: string;
  type: string;
  accent: string;
  text: string;
}

interface Pillar {
  name: string;
  desc: string;
  icon: string;
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

const TIMELINE: TimelineStep[] = [
  { step: "Account Setup", icon: "🛠️", detail: "Create the X account, secure the handle, set up 2FA. Foundation first." },
  { step: "Bio & Positioning", icon: "📝", detail: "Write a clear bio that says exactly what the platform is and what it is NOT." },
  { step: "First Announcement Post", icon: "📢", detail: "The launch post. Pin it. This is the front door for everyone who finds you." },
  { step: "Creator Recruitment Thread", icon: "🧵", detail: "A thread inviting creators and fan pages to host rooms for their nation." },
  { step: "Country Fan Page Outreach", icon: "🌍", detail: "Reach out to nation-specific fan pages, one country at a time." },
  { step: "Daily Posting Rhythm", icon: "🔁", detail: "Lock a daily cadence using the content pillars. Consistency builds trust." },
  { step: "First Test Room Announcement", icon: "🎬", detail: "Announce a live test fan room. Proof the concept works in public." },
];

// ─── LAUNCH POSTS ─────────────────────────────────────────────────────────────

const POSTS: LaunchPost[] = [
  {
    id: "main",
    type: "Main Launch Post",
    accent: "#facc15",
    text:
      "Introducing FanRoom World Cup ⚽\n\nChoose your nation. Join creator-led fan rooms. React, debate, and celebrate every match with your people.\n\nNo match footage — just pure fan energy: reactions, commentary, chat & community.\n\nWe're building toward a huge global fan audience. Come build it with us 👇",
  },
  {
    id: "creator-recruit",
    type: "Creator Recruitment Post",
    accent: "#7dd3fc",
    text:
      "Calling football creators & fan pages 🧵\n\nWe're signing creators to host live World Cup fan rooms for their nation. Your audience, your voice, our platform.\n\n• Free listing on your nation page\n• Featured placement options\n• Paid hosting for selected fixtures\n\nWant to represent your country? Reply or DM 🌍",
  },
  {
    id: "country",
    type: "Country Fan Page Post",
    accent: "#86efac",
    text:
      "🇲🇦 🇧🇷 🇦🇷 🇯🇵 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇫🇷\n\nEvery nation deserves its own home for the World Cup.\n\nWe're building official fan pages where supporters gather in live rooms to react together. Tag the fan page that should represent YOUR country 👇\n\n(Creators — DMs are open.)",
  },
  {
    id: "paid-host",
    type: "Paid Host Recruitment Post",
    accent: "#fbbf24",
    text:
      "We're paying creators to host fan rooms 💸\n\nSelected creators earn per match to run live fan rooms — reactions, commentary, chat & hype (no footage).\n\nYou bring the energy. We handle the platform.\n\nIf you've got a real football audience, let's talk. DM open 👇",
  },
  {
    id: "safety",
    type: "Safety / No Match Footage Post",
    accent: "#fda4af",
    text:
      "Quick note on how we operate 🛡️\n\nFanRoom is NOT a place to stream matches. We never host match footage.\n\nRooms are for reactions, commentary, chat, predictions & fan community — the stuff that makes watching with others special.\n\nReal fans. Real energy. Done right.",
  },
  {
    id: "follow-up",
    type: "Follow-up Post",
    accent: "#c4b5fd",
    text:
      "The response to FanRoom World Cup has been unreal 🙏\n\nStill onboarding creators & fan pages nation by nation. If you host football content and haven't reached out yet — now's the time.\n\nWhich country still needs its room? Drop it below 👇",
  },
];

// ─── CONTENT PILLARS ──────────────────────────────────────────────────────────

const PILLARS: Pillar[] = [
  { name: "Nation Spotlight", icon: "🌍", desc: "Feature one country's fans, story & upcoming rooms." },
  { name: "Creator Spotlight", icon: "⭐", desc: "Highlight a signed creator and their hosting style." },
  { name: "Match Room Preview", icon: "📅", desc: "Tease an upcoming fixture and its live fan room." },
  { name: "Fan Debates", icon: "🔥", desc: "Spark engagement — predictions, hot takes, rivalries." },
  { name: "Behind the Build", icon: "🏗️", desc: "Share the founder journey of building the platform." },
  { name: "Recruitment Posts", icon: "📣", desc: "Ongoing calls for creators & fan pages to join." },
  { name: "Safety / Compliance", icon: "🛡️", desc: "Reinforce the no-footage, fan-community-only rule." },
];

// ─── FOUNDER CHECKLIST ────────────────────────────────────────────────────────

const CHECKLIST = [
  "Create X account",
  "Add profile photo & banner",
  "Post first announcement (and pin it)",
  "Follow 100 football fan pages",
  "DM 20 creators",
  "Track every lead in /admin/creators",
  "Use ready messages from /admin/outreach",
];

// ─── NAV ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "← Admin Dashboard", href: "/admin" },
  { label: "Creator Tracker", href: "/admin/creators" },
  { label: "Outreach Messages", href: "/admin/outreach" },
  { label: "Homepage", href: "/" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function XLaunchPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));

  const handleCopy = (post: LaunchPost) => {
    navigator.clipboard.writeText(post.text).then(() => {
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const toggleCheck = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;

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
        .copy-btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #fff;
          transition: all 0.15s;
          letter-spacing: 0.04em;
        }
        .copy-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.3);
        }
        .copy-btn.copied {
          background: rgba(52,211,153,0.15);
          border-color: #34d399;
          color: #34d399;
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── NAV ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Admin / X Launch
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
            X Launch <span style={{ color: "#facc15" }}>Command Center</span>
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 620 }}>
            Plan launch posts, creator recruitment threads, and country fan page outreach.
          </p>
        </div>

        {/* ── LAUNCH TIMELINE ── */}
        <h2 style={sectionTitle}>Launch Timeline</h2>
        <p style={sectionSub}>Work top to bottom — each step unlocks the next.</p>
        <div style={{ position: "relative", marginBottom: 40 }}>
          {TIMELINE.map((t, i) => (
            <div
              key={t.step}
              className="card-glow"
              style={{ padding: "16px 20px", marginBottom: 10, display: "flex", gap: 16, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "rgba(250,204,21,0.1)",
                  border: "1px solid rgba(250,204,21,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {t.icon}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                    {t.step}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>
                  {t.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── X PROFILE SETUP ── */}
        <h2 style={sectionTitle}>X Profile Setup</h2>
        <p style={sectionSub}>Copy these straight into your new account.</p>
        <div className="card-glow" style={{ padding: "24px", marginBottom: 40 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <ProfileRow label="Handle" value="@FanRoomWorldCup" mono />
            <ProfileRow label="Display Name" value="FanRoom World Cup" />
            <div>
              <div style={profileLabel}>Bio</div>
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  padding: "14px 16px",
                  fontSize: 13.5,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                }}
              >
                Choose your nation. Join creator-led World Cup fan rooms. No match footage — just reactions, commentary, chat, and fan energy.
              </div>
            </div>
            <ProfileRow label="Link" value="localhost/demo (for now)" mono dim />
          </div>
        </div>

        {/* ── COPY-READY POSTS ── */}
        <h2 style={sectionTitle}>Copy-Ready Launch Posts</h2>
        <p style={sectionSub}>Personalize, then post. Pin the main launch post.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {POSTS.map((p) => (
            <div key={p.id} className="card-glow" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.accent, flexShrink: 0 }} />
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>
                  {p.type}
                </h3>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  padding: "14px 16px",
                  marginBottom: 14,
                  flexGrow: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {p.text}
                </p>
              </div>
              <button
                className={`copy-btn ${copiedId === p.id ? "copied" : ""}`}
                onClick={() => handleCopy(p)}
                style={{ alignSelf: "flex-start" }}
              >
                {copiedId === p.id ? "✓ Copied!" : "Copy post"}
              </button>
            </div>
          ))}
        </div>

        {/* ── CONTENT PILLARS ── */}
        <h2 style={sectionTitle}>Daily Content Pillars</h2>
        <p style={sectionSub}>Rotate these so you never run out of things to post.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {PILLARS.map((pillar) => (
            <div key={pillar.name} className="card-glow" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{pillar.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {pillar.name}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── FOUNDER CHECKLIST ── */}
        <div className="card-glow" style={{ padding: "26px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
            <h2 style={{ ...sectionTitle, margin: 0 }}>Founder Checklist</h2>
            <span style={{ fontSize: 12, color: doneCount === CHECKLIST.length ? "#34d399" : "rgba(255,255,255,0.4)" }}>
              {doneCount} / {CHECKLIST.length} done
            </span>
          </div>
          <p style={{ ...sectionSub, marginBottom: 20 }}>Tap to check off as you go.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CHECKLIST.map((item, i) => (
              <div
                key={i}
                onClick={() => toggleCheck(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  opacity: checked[i] ? 0.45 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `1.5px solid ${checked[i] ? "#34d399" : "rgba(255,255,255,0.2)"}`,
                    background: checked[i] ? "rgba(52,211,153,0.15)" : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {checked[i] && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13.5,
                    color: checked[i] ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)",
                    textDecoration: checked[i] ? "line-through" : "none",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER NOTE ── */}
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 40 }}>
          Reminder: every room is for reactions, commentary, chat & fan community only — never match footage.
        </p>

      </div>
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

const profileLabel: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.3)",
  marginBottom: 6,
};

function ProfileRow({
  label,
  value,
  mono,
  dim,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dim?: boolean;
}) {
  return (
    <div>
      <div style={profileLabel}>{label}</div>
      <div
        style={{
          fontSize: 15,
          color: dim ? "rgba(255,255,255,0.5)" : "#fff",
          fontFamily: mono ? "'DM Mono', monospace" : "'Syne', sans-serif",
          fontWeight: mono ? 400 : 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}
