"use client";

import { useState } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface MessageTemplate {
  id: string;
  type: string;
  accent: string; // tailwind-free color string
  bestFor: string;
  message: string;
  nextAction: string;
}

// ─── DEMO MESSAGE TEMPLATES ───────────────────────────────────────────────────

const TEMPLATES: MessageTemplate[] = [
  {
    id: "free-listing",
    type: "Free Listing",
    accent: "#94a3b8",
    bestFor: "Small to mid fan pages. Low-friction first contact. Easy yes.",
    message:
      "Hey! Love what you're building for the [Country] football community 🇦🇩 We're launching a World Cup fan watch-along platform where fans gather in live rooms to react, chat and celebrate together (no match footage — pure fan energy). We'd love to feature your page on the official [Country] nation page so your followers can find your rooms. It's free to be listed. Can I send you the quick details?",
    nextAction: "If yes → send nation page mockup + listing form link.",
  },
  {
    id: "featured-placement",
    type: "Featured Placement",
    accent: "#7dd3fc",
    bestFor: "Active fan pages with consistent engagement. Wants visibility.",
    message:
      "Hi [Name]! Your [Country] content stands out — the engagement is real. We're giving a small number of pages priority placement on the [Country] nation page and on match-day pages, so your rooms show up first when fans arrive. We're building toward a large World Cup fan audience and want strong creators front and center. Interested in a featured spot? Happy to walk you through it.",
    nextAction: "If interested → confirm placement slot + send brand assets.",
  },
  {
    id: "paid-25",
    type: "$25 Paid Game Host",
    accent: "#fcd34d",
    bestFor: "Reliable mid-size creators. Test paid hosting on key matches.",
    message:
      "Hey [Name]! We'd like to bring you on as a paid fan-room host for selected [Country] matches. The deal: $25 per match to host a live fan room — reactions, commentary, chat, predictions, community hype (no match footage). You bring the energy, we handle the platform. Want to host your first match with us?",
    nextAction: "If yes → pick a fixture, send host brief + compliance rules.",
  },
  {
    id: "paid-50",
    type: "$50 Paid Game Host",
    accent: "#fbbf24",
    bestFor: "High-engagement creators or marquee fixtures. Premium hosting.",
    message:
      "Hi [Name]! We want you hosting our biggest [Country] match days. The offer: $50 per match to run the official live fan room — your audience, your voice, our platform. Pure fan reactions and community (no footage). These are the high-traffic fixtures, so we want our strongest hosts on them. Can I lock you in for the next match?",
    nextAction: "If yes → confirm fixture + send paid host agreement.",
  },
  {
    id: "premium",
    type: "Premium Partnership",
    accent: "#fda4af",
    bestFor: "Large creators, 50k+ followers, national-level reach.",
    message:
      "Hi [Name] — big fan of your work in the [Country] football space. We're selecting a few flagship partners to represent their nation on our World Cup watch-along platform. This is a deeper partnership: revenue on paid rooms, co-branding on the [Country] page, early feature access, and a real say in how we build. We're building toward a large World Cup fan audience and want you leading [Country]. Open to a quick call to talk details?",
    nextAction: "If interested → book a call, send partnership deck.",
  },
  {
    id: "follow-up",
    type: "Follow-up",
    accent: "#c4b5fd",
    bestFor: "No reply after 2–3 days. Keep it light and short.",
    message:
      "Hey [Name], just floating this back up 👋 Still putting together the [Country] lineup for our World Cup fan platform and would love to have you in it. No pressure — just let me know if it's something you'd want to explore. Happy to keep it simple.",
    nextAction: "If still no reply after this → mark 'Follow up' in tracker, pause 1 week.",
  },
];

// ─── NAV LINKS ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "← Admin Dashboard", href: "/admin" },
  { label: "Creator Tracker", href: "/admin/creators" },
  { label: "Homepage", href: "/" },
];

// ─── FOUNDER RULES ────────────────────────────────────────────────────────────

const FOUNDER_RULES = [
  "Personalize every message — use their real name.",
  "Always mention the country / team they represent.",
  "Do not spam. Quality over volume.",
  "Track every message sent in /admin/creators.",
  "Never promise a guaranteed 100k users.",
  "Keep the very first message short.",
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OutreachPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.message).then(() => {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

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
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            Admin / Outreach
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
            Outreach <span style={{ color: "#facc15" }}>Message Center</span>
          </h1>
          <p
            style={{
              marginTop: 8,
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              maxWidth: 600,
            }}
          >
            Copy-ready messages for signing creators, fan pages, and streamers.
          </p>
        </div>

        {/* ── WARNING ── */}
        <div
          className="card-glow"
          style={{
            padding: "16px 20px",
            marginBottom: 32,
            borderColor: "rgba(251,191,36,0.25)",
            background: "rgba(251,191,36,0.04)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ color: "#fbbf24", fontSize: 13, fontWeight: 500, marginBottom: 3 }}>
              Never promise guaranteed user numbers
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>
              Don't claim a specific audience size. Instead say:{" "}
              <span style={{ color: "#fff" }}>
                "we are building toward a large World Cup fan audience."
              </span>
            </p>
          </div>
        </div>

        {/* ── MESSAGE CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
            marginBottom: 36,
          }}
        >
          {TEMPLATES.map((t) => (
            <div key={t.id} className="card-glow" style={{ padding: "22px", display: "flex", flexDirection: "column" }}>

              {/* Type badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: t.accent,
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {t.type}
                </h2>
              </div>

              {/* Best for */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 4,
                  }}
                >
                  Best used for
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
                  {t.bestFor}
                </p>
              </div>

              {/* Message */}
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
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 8,
                  }}
                >
                  Copy-ready DM
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {t.message}
                </p>
              </div>

              {/* Next action */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 4,
                  }}
                >
                  Suggested next action
                </div>
                <p style={{ fontSize: 12, color: t.accent, margin: 0, lineHeight: 1.5 }}>
                  → {t.nextAction}
                </p>
              </div>

              {/* Copy button */}
              <button
                className={`copy-btn ${copiedId === t.id ? "copied" : ""}`}
                onClick={() => handleCopy(t)}
                style={{ alignSelf: "flex-start" }}
              >
                {copiedId === t.id ? "✓ Copied!" : "Copy message"}
              </button>
            </div>
          ))}
        </div>

        {/* ── FOUNDER RULES ── */}
        <div className="card-glow" style={{ padding: "26px 28px" }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 4px",
            }}
          >
            Founder Rules
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            Follow these on every single message
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {FOUNDER_RULES.map((rule, i) => (
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
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                  {rule}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER NOTE ── */}
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            marginTop: 40,
          }}
        >
          Reminder: rooms are for reactions, commentary, chat & fan community only — never match footage.
        </p>

      </div>
    </div>
  );
}
