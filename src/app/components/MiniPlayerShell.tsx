"use client";

// Thin client-shell that lazy-loads MiniPlayer (and its LiveKit bundle) only
// when the component actually mounts. The `ssr: false` + dynamic import keeps
// ~300 kB of LiveKit JS out of every server-rendered page.

import dynamic from "next/dynamic";

const MiniPlayer = dynamic(
  () => import("./MiniPlayer").then((m) => ({ default: m.MiniPlayer })),
  { ssr: false },
);

export function MiniPlayerShell() {
  return <MiniPlayer />;
}
