"use client";

import { useState, useEffect } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BackendState = "Not connected" | "Missing" | "Not created" | "Active" | "Done";

interface StatusCard {
  label: string;
  state: BackendState;
  note: string;
}

// ─── BACKEND STATUS (demo / current reality) ──────────────────────────────────

const STATUS_CARDS: StatusCard[] = [
  { label: "Supabase project", state: "Not connected", note: "No project created yet." },
  { label: "Environment variables", state: "Missing", note: "No .env.local with Supabase keys." },
  { label: "Creators table", state: "Not created", note: "Planned — first table to build." },
  { label: "Outreach messages table", state: "Not created", note: "Comes after creators." },
  { label: "Nations table", state: "Not created", note: "Reference data, can stay local." },
  { label: "Rooms table", state: "Not created", note: "Connects nations + creators." },
  { label: "Agent runs table", state: "Not created", note: "Needed when real agents exist." },
  { label: "LocalStorage fallback", state: "Active", note: "Currently the source of truth." },
];

// ─── MIGRATION CHECKLIST ──────────────────────────────────────────────────────

const CHECKLIST = [
  "Create Supabase project",
  "Add .env.local",
  "Add NEXT_PUBLIC_SUPABASE_URL",
  "Add NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "Create creators table",
  "Connect /admin/creators to Supabase",
  "Keep export/import backup",
  "Add outreach_messages table",
  "Add agent_runs table",
];

const CHECKLIST_STORAGE_KEY = "wcp_backend_checklist_v1";

// ─── SAFETY RULES ─────────────────────────────────────────────────────────────

const SAFETY_RULES = [
  "Never expose the service role key in the frontend.",
  "Never commit .env.local to Git.",
  "Keep the localStorage fallback until Supabase is tested.",
  "Use Row Level Security later.",
  "Do not connect payments yet.",
  "Do not connect automated DMs yet.",
];

// ─── NAV ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "← Admin Dashboard", href: "/admin" },
  { label: "Creator Tracker", href: "/admin/creators" },
  { label: "Agent Automation", href: "/admin/agents" },
  { label: "Outreach Messages", href: "/admin/outreach" },
  { label: "Homepage", href: "/" },
];

// ─── STATE STYLING ────────────────────────────────────────────────────────────

const STATE_STYLE: Record<BackendState, { color: string; bg: string; border: string; dot: string }> = {
  "Not connected": { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", dot: "#f87171" },
  Missing: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", dot: "#f87171" },
  "Not created": { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)", dot: "#94a3b8" },
  Active: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", dot: "#34d399" },
  Done: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", dot: "#34d399" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function BackendSetupPage() {
  // Checklist progress is saved locally so the founder can track real progress.
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as boolean[];
        if (Array.isArray(parsed) && parsed.length === CHECKLIST.length) {
          setChecked(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // fail quietly
      }
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;
  const progress = Math.round((doneCount / CHECKLIST.length) * 100);

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
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── NAV ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
          ))}
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Admin / Backend
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
            Backend Setup <span style={{ color: "#facc15" }}>Command Center</span>
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 640 }}>
            Track the migration from localStorage to Supabase.
          </p>
        </div>

        {/* ── PREVIEW NOTICE ── */}
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
          🧪 <span style={{ color: "#7dd3fc" }}>Tracker only.</span> No Supabase connection exists yet. This page just tracks the migration — the checklist below saves your progress in this browser.
        </div>

        {/* ── BACKEND STATUS CARDS ── */}
        <h2 style={sectionTitle}>Backend Status</h2>
        <p style={sectionSub}>Where each piece stands right now.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 14,
            marginBottom: 40,
          }}
        >
          {STATUS_CARDS.map((card) => {
            const s = STATE_STYLE[card.state];
            return (
              <div key={card.label} className="card-glow" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13.5, color: "#fff", fontWeight: 500, lineHeight: 1.3 }}>
                    {card.label}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
                    <span style={{ fontSize: 10.5, color: s.color, whiteSpace: "nowrap" }}>{card.state}</span>
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
                  {card.note}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── MIGRATION CHECKLIST ── */}
        <div className="card-glow" style={{ padding: "26px 28px", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
            <h2 style={{ ...sectionTitle, margin: 0 }}>Migration Checklist</h2>
            <span style={{ fontSize: 12, color: doneCount === CHECKLIST.length ? "#34d399" : "rgba(255,255,255,0.4)" }}>
              {doneCount} / {CHECKLIST.length} done
            </span>
          </div>
          <p style={{ ...sectionSub, marginBottom: 16 }}>Tap each step as you complete it. Progress saves in this browser.</p>

          {/* progress bar */}
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", marginBottom: 22, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #facc15, #34d399)",
                borderRadius: 999,
                transition: "width 0.3s",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CHECKLIST.map((item, i) => (
              <div
                key={i}
                onClick={() => toggle(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  opacity: checked[i] ? 0.5 : 1,
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
                    color: checked[i] ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.78)",
                    textDecoration: checked[i] ? "line-through" : "none",
                    fontFamily: i >= 1 && i <= 3 ? "'DM Mono', monospace" : "inherit",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FIRST PRIORITY + SAFETY (two columns) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {/* First priority */}
          <div
            className="card-glow"
            style={{ padding: "26px 28px", borderColor: "rgba(250,204,21,0.25)", background: "rgba(250,204,21,0.04)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <h2 style={{ ...sectionTitle, color: "#facc15", margin: 0 }}>First Backend Priority</h2>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "0 0 14px", lineHeight: 1.6 }}>
              Move creator leads from localStorage to Supabase.
            </p>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
              It's the highest-value data, the highest-risk if lost (it lives in one browser today),
              and a self-contained page — so it proves the whole Supabase pattern in one safe step.
              Keep export/import as a backup throughout.
            </p>
          </div>

          {/* Safety rules */}
          <div
            className="card-glow"
            style={{ padding: "26px 28px", borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.03)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 18 }}>🛡️</span>
              <h2 style={{ ...sectionTitle, color: "#fbbf24", margin: 0 }}>Safety Rules</h2>
            </div>
            <p style={{ ...sectionSub, marginBottom: 16 }}>Follow these before connecting anything.</p>
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

        {/* ── DOCS POINTER ── */}
        <div className="card-glow" style={{ padding: "18px 22px", marginBottom: 28 }}>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
            📄 Full plans live in the repo:{" "}
            <span style={{ color: "#7dd3fc" }}>docs/DATABASE_SCHEMA.md</span> (table structure) and{" "}
            <span style={{ color: "#7dd3fc" }}>docs/SUPABASE_SETUP_PLAN.md</span> (step-by-step migration).
          </p>
        </div>

        {/* ── FOOTER NOTE ── */}
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 36 }}>
          Reminder: keep localStorage working until Supabase is tested. No payments, no automated DMs, no match footage.
        </p>
      </div>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

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
