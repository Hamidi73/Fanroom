"use client";

import { useEffect, useState } from "react";

const founderAgents = [
  {
    role: "Director Agent",
    objective: "Keep the MVP launch focused.",
    status: "Active",
    roi: "Product + launch readiness",
    next: "Align the team on top priorities.",
  },
  {
    role: "Research Agent",
    objective: "Validate streamer demand.",
    status: "Collecting insights",
    roi: "Streamer acquisition",
    next: "Share top creator needs.",
  },
  {
    role: "Product Agent",
    objective: "Shape the landing page and waitlist.",
    status: "Designing MVP flows",
    roi: "Signups + retention",
    next: "Refine the streamer application UX.",
  },
  {
    role: "Growth Agent",
    objective: "Drive early fan interest.",
    status: "Testing channels",
    roi: "Waitlist growth",
    next: "Build the early viewer funnel.",
  },
  {
    role: "Operations Agent",
    objective: "Keep the launch operations smooth.",
    status: "Monitoring readiness",
    roi: "Launch execution",
    next: "Prepare launch coordination.",
  },
];

const progressItems = [
  { label: "Landing page", level: 90 },
  { label: "Streamer signup form", level: 100 },
  { label: "Fixture previews", level: 70 },
  { label: "Admin dashboard", level: 60 },
];

const riskItems = [
  "No match footage compliance",
  "Creator safety and chat moderation",
  "Launch timing for World Cup momentum",
  "Early data collection for streamer demand",
];

const nextActions = [
  "Confirm first 20 streamer signups.",
  "Refine the waiting room UX for viewers.",
  "Secure creator-friendly launch messaging.",
  "Track local saved applications and agent status.",
];

export default function AdminPage() {
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("streamerApplications");
    const parsed = stored ? JSON.parse(stored) : [];
    const apps = Array.isArray(parsed) ? parsed : [];
    setApplicationCount(apps.length);
  }, []);

  return (
    <main className="min-h-screen bg-[#030405] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <header className="relative z-10 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[#090c11]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Admin dashboard</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Founder Command Center
                </h1>
              </div>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                Back to homepage
              </a>
            </div>
            <p className="max-w-3xl text-white/70">
              A premium, cinematic founder dashboard for tracking agent progress, platform metrics, MVP delivery, and compliance risks.
            </p>
          </header>

          <section className="mt-10 grid gap-6 xl:grid-cols-5">
            {founderAgents.map((agent) => (
              <div key={agent.role} className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6 shadow-sm shadow-black/20">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">{agent.role}</p>
                <h2 className="mt-4 text-xl font-semibold text-white">{agent.objective}</h2>
                <div className="mt-5 space-y-3 text-sm text-white/70">
                  <div>
                    <span className="block text-white/50">Status</span>
                    <span className="font-medium text-white">{agent.status}</span>
                  </div>
                  <div>
                    <span className="block text-white/50">ROI focus</span>
                    <span className="font-medium text-white">{agent.roi}</span>
                  </div>
                  <div>
                    <span className="block text-white/50">Next action</span>
                    <span className="font-medium text-white">{agent.next}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Saved streamer applications</p>
              <p className="mt-4 text-3xl font-semibold text-white">{applicationCount}</p>
              <p className="mt-2 text-sm text-white/60">Live from localStorage.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Scheduled fan rooms</p>
              <p className="mt-4 text-3xl font-semibold text-white">5</p>
              <p className="mt-2 text-sm text-white/60">Visual project target.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Target viewer waitlist</p>
              <p className="mt-4 text-3xl font-semibold text-white">100</p>
              <p className="mt-2 text-sm text-white/60">Initial MVP goal.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">MVP progress</p>
              <p className="mt-4 text-3xl font-semibold text-white">68%</p>
              <p className="mt-2 text-sm text-white/60">Visual progress snapshot.</p>
            </div>
          </section>

          <section className="mt-12 rounded-[2rem] border border-white/10 bg-[#06101a]/80 p-8 shadow-inner shadow-black/30">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="lg:max-w-xl">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">MVP Build Progress</p>
                <h2 className="mt-3 text-3xl font-black text-white">Where the product stands</h2>
                <p className="mt-4 text-white/70">
                  Track the current build milestones and the remaining work needed to turn the landing page into a working streamer/viewer MVP.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {progressItems.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-[#081421] p-5">
                    <p className="text-sm text-white/50">{item.label}</p>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.level}%` }} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{item.level}% complete</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Risks & Compliance</p>
              <ul className="mt-5 space-y-3 text-sm text-white/70">
                {riskItems.map((risk) => (
                  <li key={risk} className="rounded-2xl bg-white/5 px-4 py-3">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#081017] p-6 lg:col-span-2">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Next Actions</p>
              <div className="mt-5 space-y-3 text-sm text-white/70">
                {nextActions.map((action) => (
                  <div key={action} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <p className="font-medium text-white">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
