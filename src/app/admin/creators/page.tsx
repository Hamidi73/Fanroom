"use client";

import { useState, useEffect } from "react";

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

type Platform =
  | "Instagram"
  | "TikTok"
  | "YouTube"
  | "X (Twitter)"
  | "Twitch"
  | "Other";

type EngagementLevel = "Low" | "Medium" | "High" | "Very High";

interface Creator {
  id: number;
  name: string;
  platform: Platform;
  profileLink?: string;
  country: string;
  flag: string;
  followers: string;
  engagement: EngagementLevel;
  contactMethod: string;
  status: Status;
  offerTier: OfferTier;
  priority: number; // 1–10
  nextAction: string;
  notes?: string;
  isLocal?: boolean; // true = added by user, saved in localStorage
}

// ─── localStorage KEY ─────────────────────────────────────────────────────────

const STORAGE_KEY = "wcp_creator_leads_v1";

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

const STATUS_OPTIONS: Status[] = [
  "Not contacted",
  "Contacted",
  "Replied",
  "Interested",
  "Signed",
  "Rejected",
  "Follow up",
];

const OFFER_OPTIONS: OfferTier[] = [
  "Free listing",
  "Featured placement",
  "$25 paid game host",
  "$50 paid game host",
  "Premium partnership",
];

const PLATFORM_OPTIONS: Platform[] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "X (Twitter)",
  "Twitch",
  "Other",
];

const ENGAGEMENT_OPTIONS: EngagementLevel[] = ["Low", "Medium", "High", "Very High"];

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
  Other: "🔗",
};

const FILTER_OPTIONS = [
  "All",
  "High priority",
  "Needs follow-up",
  "Signed",
  "Paid offer",
] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];

const NAV_LINKS = [
  { label: "← Admin Dashboard", href: "/admin" },
  { label: "Outreach Messages", href: "/admin/outreach" },
  { label: "X Launch", href: "/admin/x-launch" },
];

// ─── FORM STATE ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  platform: Platform;
  profileLink: string;
  country: string;
  followers: string;
  engagement: EngagementLevel;
  contactMethod: string;
  status: Status;
  offerTier: OfferTier;
  priority: number;
  nextAction: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  platform: "Instagram",
  profileLink: "",
  country: "",
  followers: "",
  engagement: "Medium",
  contactMethod: "",
  status: "Not contacted",
  offerTier: "Free listing",
  priority: 5,
  nextAction: "",
  notes: "",
};

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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[level]}`}>
      {level}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CreatorsAdminPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [localLeads, setLocalLeads] = useState<Creator[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load saved leads from localStorage on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Creator[];
        if (Array.isArray(parsed)) setLocalLeads(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Save to localStorage and update state together
  const persist = (leads: Creator[]) => {
    setLocalLeads(leads);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // storage may be unavailable; fail quietly
    }
  };

  // Combine saved + demo leads (saved ones first)
  const allCreators: Creator[] = [...localLeads, ...DEMO_CREATORS];

  // Derived metrics (based on combined list)
  const total = allCreators.length;
  const contacted = allCreators.filter((c) =>
    ["Contacted", "Replied", "Interested", "Signed"].includes(c.status)
  ).length;
  const replies = allCreators.filter((c) =>
    ["Replied", "Interested", "Signed"].includes(c.status)
  ).length;
  const signed = allCreators.filter((c) => c.status === "Signed").length;
  const countries = new Set(allCreators.map((c) => c.country.trim().toLowerCase())).size;
  const paid = allCreators.filter((c) => c.offerTier.includes("$")).length;

  const metrics = [
    { label: "Total Leads", value: total, accent: "text-white" },
    { label: "Contacted", value: contacted, accent: "text-sky-400" },
    { label: "Replies", value: replies, accent: "text-yellow-400" },
    { label: "Signed", value: signed, accent: "text-emerald-400" },
    { label: "Countries", value: countries, accent: "text-purple-400" },
    { label: "Paid Creators", value: paid, accent: "text-amber-400" },
  ];

  // Filter logic
  const filtered = allCreators.filter((c) => {
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

  // Form field updater
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Submit handler
  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Please enter a creator / fan page name.");
      return;
    }
    const newLead: Creator = {
      id: Date.now(),
      name: form.name.trim(),
      platform: form.platform,
      profileLink: form.profileLink.trim() || undefined,
      country: form.country.trim() || "Unknown",
      flag: "🏳️",
      followers: form.followers.trim() || "—",
      engagement: form.engagement,
      contactMethod: form.contactMethod.trim() || "—",
      status: form.status,
      offerTier: form.offerTier,
      priority: form.priority,
      nextAction: form.nextAction.trim() || "—",
      notes: form.notes.trim() || undefined,
      isLocal: true,
    };
    persist([newLead, ...localLeads]);
    setForm(EMPTY_FORM);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  // Delete a single saved lead
  const deleteLocal = (id: number) => {
    persist(localLeads.filter((l) => l.id !== id));
  };

  // Clear all saved leads
  const clearAllLocal = () => {
    if (localLeads.length === 0) return;
    if (confirm(`Delete all ${localLeads.length} saved lead(s)? Demo leads will remain.`)) {
      persist([]);
    }
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
        .form-input, .form-select, textarea.form-input {
          width: 100%;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 9px 12px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus {
          border-color: rgba(250,204,21,0.4);
        }
        .form-input::placeholder { color: rgba(255,255,255,0.25); }
        .form-select option { background: #0d1520; color: #e2e8f0; }
        .form-label {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 5px;
          display: block;
        }
        .btn-primary {
          padding: 10px 22px;
          border-radius: 9px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid rgba(250,204,21,0.4);
          background: rgba(250,204,21,0.15);
          color: #facc15;
          transition: all 0.15s;
          letter-spacing: 0.03em;
          font-weight: 500;
        }
        .btn-primary:hover { background: rgba(250,204,21,0.25); }
        .btn-ghost {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: rgba(255,255,255,0.6);
          transition: all 0.15s;
        }
        .btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
        .btn-danger {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid rgba(239,68,68,0.3);
          background: transparent;
          color: rgba(248,113,113,0.9);
          transition: all 0.15s;
        }
        .btn-danger:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.5); }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── NAV ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Admin / Creator Ops
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
            marginBottom: 24,
          }}
        >
          {metrics.map((m) => (
            <div key={m.label} className="card-glow" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Syne', sans-serif" }} className={m.accent}>
                {m.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── LEAD COUNTS + ACTIONS ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              Total leads: <span style={{ color: "#fff", fontWeight: 600 }}>{total}</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              Saved by you: <span style={{ color: "#34d399", fontWeight: 600 }}>{localLeads.length}</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              Demo: <span style={{ color: "rgba(255,255,255,0.6)" }}>{DEMO_CREATORS.length}</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "× Close form" : "+ Add Creator Lead"}
            </button>
            <button className="btn-danger" onClick={clearAllLocal}>
              Clear saved leads
            </button>
          </div>
        </div>

        {/* ── ADD CREATOR LEAD FORM ── */}
        {showForm && (
          <div className="card-glow" style={{ padding: "26px", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
                Add Creator Lead
              </h2>
              {showSuccess && (
                <span style={{ fontSize: 13, color: "#34d399" }}>✓ Lead saved!</span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 22 }}>
              Saved to your browser only (localStorage). Nothing is sent anywhere.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label className="form-label">Creator / Fan Page Name *</label>
                <input className="form-input" placeholder="e.g. Atlas Lions Fan HQ" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>

              <div>
                <label className="form-label">Platform</label>
                <select className="form-select" value={form.platform} onChange={(e) => updateField("platform", e.target.value as Platform)}>
                  {PLATFORM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Profile Link</label>
                <input className="form-input" placeholder="https://instagram.com/…" value={form.profileLink} onChange={(e) => updateField("profileLink", e.target.value)} />
              </div>

              <div>
                <label className="form-label">Country / Fanbase</label>
                <input className="form-input" placeholder="e.g. Morocco" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
              </div>

              <div>
                <label className="form-label">Follower Count</label>
                <input className="form-input" placeholder="e.g. 284K" value={form.followers} onChange={(e) => updateField("followers", e.target.value)} />
              </div>

              <div>
                <label className="form-label">Engagement Level</label>
                <select className="form-select" value={form.engagement} onChange={(e) => updateField("engagement", e.target.value as EngagementLevel)}>
                  {ENGAGEMENT_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Contact Method</label>
                <input className="form-input" placeholder="e.g. Instagram DM" value={form.contactMethod} onChange={(e) => updateField("contactMethod", e.target.value)} />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => updateField("status", e.target.value as Status)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Offer Tier</label>
                <select className="form-select" value={form.offerTier} onChange={(e) => updateField("offerTier", e.target.value as OfferTier)}>
                  {OFFER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Priority Score: {form.priority}</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={form.priority}
                  onChange={(e) => updateField("priority", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#facc15", marginTop: 8 }}
                />
              </div>

              <div>
                <label className="form-label">Next Action</label>
                <input className="form-input" placeholder="e.g. Send intro DM" value={form.nextAction} onChange={(e) => updateField("nextAction", e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                placeholder="Anything useful — best time to contact, mutual connections, content style…"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={handleSubmit}>Save lead</button>
              <button className="btn-ghost" onClick={() => setForm(EMPTY_FORM)}>Reset fields</button>
            </div>
          </div>
        )}

        {/* ── FILTERS + SEARCH ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTER_OPTIONS.map((f) => (
              <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>
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
          <div className="scrollbar-thin" style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr 1.4fr 1.6fr 0.4fr",
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                minWidth: 1000,
              }}
            >
              {["Creator / Page", "Platform", "Country", "Followers", "Engagement", "Status / Offer", "Next Action", ""].map((h, i) => (
                <div key={i} style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                  {h}
                </div>
              ))}
            </div>

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
                  gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr 1.4fr 1.6fr 0.4fr",
                  padding: "14px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  alignItems: "center",
                  minWidth: 1000,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f1f5f9", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    {creator.profileLink ? (
                      <a href={creator.profileLink} target="_blank" rel="noopener noreferrer" style={{ color: "#f1f5f9", textDecoration: "none", borderBottom: "1px dotted rgba(255,255,255,0.3)" }}>
                        {creator.name}
                      </a>
                    ) : (
                      creator.name
                    )}
                    {creator.isLocal && (
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(52,211,153,0.15)", color: "#34d399", letterSpacing: "0.05em" }}>
                        SAVED
                      </span>
                    )}
                  </div>
                  {priorityBar(creator.priority)}
                </div>

                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  {PLATFORM_ICON[creator.platform]} <span style={{ marginLeft: 4 }}>{creator.platform}</span>
                </div>

                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  {creator.flag} {creator.country}
                </div>

                <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", color: "#fff" }}>
                  {creator.followers}
                </div>

                <div>{engagementBadge(creator.engagement)}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={STATUS_CONFIG[creator.status].dot} style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }} />
                    <span className={STATUS_CONFIG[creator.status].color} style={{ fontSize: 12 }}>{creator.status}</span>
                  </div>
                  <div className={OFFER_CONFIG[creator.offerTier]} style={{ fontSize: 11, opacity: 0.8 }}>
                    {creator.offerTier}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                  {creator.nextAction}
                </div>

                <div style={{ textAlign: "right" }}>
                  {creator.isLocal && (
                    <button
                      onClick={() => deleteLocal(creator.id)}
                      title="Delete saved lead"
                      style={{ background: "transparent", border: "none", color: "rgba(248,113,113,0.7)", cursor: "pointer", fontSize: 15, padding: 4 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {filtered.map((creator) => (
            <div key={`mobile-${creator.id}`} className="card-glow" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {creator.flag} {creator.name}
                    {creator.isLocal && (
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                        SAVED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {PLATFORM_ICON[creator.platform]} {creator.platform} · {creator.country}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: "#fff" }}>{creator.followers}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>FOLLOWERS</div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>
                {engagementBadge(creator.engagement)}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }} className={STATUS_CONFIG[creator.status].dot} />
                  <span className={STATUS_CONFIG[creator.status].color} style={{ fontSize: 12 }}>{creator.status}</span>
                </div>
                <span className={OFFER_CONFIG[creator.offerTier]} style={{ fontSize: 11 }}>{creator.offerTier}</span>
              </div>

              <div style={{ marginBottom: 8 }}>{priorityBar(creator.priority)}</div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <span>→ {creator.nextAction}</span>
                {creator.isLocal && (
                  <button
                    onClick={() => deleteLocal(creator.id)}
                    style={{ background: "transparent", border: "none", color: "rgba(248,113,113,0.7)", cursor: "pointer", fontSize: 14, flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── COMPLIANCE ── */}
        <div
          className="card-glow"
          style={{
            padding: "20px 24px",
            borderColor: "rgba(251,191,36,0.2)",
            background: "rgba(251,191,36,0.03)",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
              Compliance Reminder
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
              Creators must not stream actual match footage. Rooms are for reactions, commentary, chat, and fan community only.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
