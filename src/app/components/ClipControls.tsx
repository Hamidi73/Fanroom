"use client";

// "Clip" button for the live stream: grabs the last 1/5/10/20 minutes from
// the rolling ClipBuffer and saves it as a video file — all in the browser.
//
// The cut is a stream-copy (no re-encode) done by ffmpeg.wasm, which is
// lazy-loaded from a CDN only the first time someone actually clips, so it
// adds nothing to the page bundle. Recording starts when you open the room,
// so the clip can only reach back as far as your time in the room.

import { useEffect, useRef, useState } from "react";
import { ClipBuffer, type ClipSource } from "@/lib/clipBuffer";

const WINDOWS = [
  { label: "Last 1 min", ms: 60_000 },
  { label: "Last 5 min", ms: 5 * 60_000 },
  { label: "Last 10 min", ms: 10 * 60_000 },
  { label: "Last 20 min", ms: 20 * 60_000 },
];

// Self-hosted under /public/ffmpeg (same-origin) — no third-party CDN at
// clip time, so an unpkg outage can't break clipping and there's no external
// supply-chain dependency. Files are copied from @ffmpeg/core@0.12.10.
const FFMPEG_CORE = "/ffmpeg";

type Phase =
  | { kind: "idle" }
  | { kind: "working"; note: string }
  | { kind: "error"; note: string };

export function ClipControls({
  videoTrack,
  audioTrack,
  roomId,
}: {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  roomId: string;
}) {
  const bufferRef = useRef<ClipBuffer | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [buffered, setBuffered] = useState(0); // sampled when the menu opens
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  // (Re)start the rolling buffer whenever the underlying tracks change —
  // e.g. the host toggles their camera. The old buffer can't survive a track
  // swap (MediaRecorder dies with its stream), so buffering restarts.
  // State flips are deferred a tick (lint: no sync setState inside effects).
  useEffect(() => {
    if (!videoTrack || !ClipBuffer.supported()) return;
    const stream = new MediaStream(
      audioTrack ? [videoTrack, audioTrack] : [videoTrack],
    );
    const buf = new ClipBuffer(stream);
    buf.start();
    bufferRef.current = buf;
    const t = setTimeout(() => setReady(true), 0);
    return () => {
      clearTimeout(t);
      buf.stop();
      if (bufferRef.current === buf) bufferRef.current = null;
      setTimeout(() => setReady(false), 0);
    };
  }, [videoTrack, audioTrack]);

  if (!ready) return null;

  const makeClip = async (windowMs: number) => {
    const buf = bufferRef.current;
    if (!buf || phase.kind === "working") return;
    setOpen(false);
    try {
      setPhase({ kind: "working", note: "Gathering footage…" });
      const snap = await buf.snapshot(windowMs);
      if (!snap) {
        setPhase({ kind: "error", note: "Nothing buffered yet — try again in a few seconds." });
        return;
      }
      setPhase({ kind: "working", note: "Loading clip engine…" });
      const blob = await cutClip(snap.sources, snap.trimFromStartMs, buf.extension, (note) =>
        setPhase({ kind: "working", note }),
      );
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      download(blob, `fanroom-clip-${roomId.slice(0, 8)}-${stamp}.${buf.extension}`);
      setPhase({ kind: "idle" });
    } catch {
      setPhase({ kind: "error", note: "Couldn't create the clip — try again." });
    }
  };

  return (
    <div className="relative flex items-center gap-2 border-t border-line bg-panel-2 px-3 py-2">
      <button
        type="button"
        onClick={() => {
          setBuffered(bufferRef.current?.bufferedMs() ?? 0);
          setOpen((o) => !o);
        }}
        disabled={phase.kind === "working"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-foreground transition hover:border-accent/60 disabled:opacity-60"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 4.5 13 11.5M3 11.5 13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="3.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="3.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Clip
      </button>

      {phase.kind === "working" && (
        <span className="text-xs text-muted">{phase.note}</span>
      )}
      {phase.kind === "error" && (
        <span className="text-xs text-red-400">{phase.note}</span>
      )}
      {phase.kind === "idle" && (
        <span className="text-[11px] text-muted">
          Buffering since you opened the room
        </span>
      )}

      {open && (
        <div className="absolute bottom-full left-3 z-20 mb-1 w-44 overflow-hidden rounded-lg border border-line bg-surface shadow-xl shadow-black/50">
          {WINDOWS.map((w) => {
            const partial = buffered > 0 && buffered < w.ms;
            return (
              <button
                key={w.ms}
                type="button"
                onClick={() => void makeClip(w.ms)}
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ink-foreground transition hover:bg-surface-2"
              >
                {w.label}
                {partial && (
                  <span className="ml-1 text-[10px] font-normal text-muted">
                    (~{Math.max(1, Math.round(buffered / 60_000))} min so far)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ffmpeg.wasm (lazy) ────────────────────────────────────────────────────────

type FFmpegInstance = {
  load: (opts: { coreURL: string; wasmURL: string }) => Promise<boolean>;
  writeFile: (path: string, data: Uint8Array | string) => Promise<boolean>;
  readFile: (path: string) => Promise<Uint8Array | string>;
  exec: (args: string[]) => Promise<number>;
};

let ffmpegPromise: Promise<FFmpegInstance> | null = null;

function loadFFmpeg(): Promise<FFmpegInstance> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      const ffmpeg = new FFmpeg() as unknown as FFmpegInstance;
      await ffmpeg.load({
        coreURL: await toBlobURL(`${FFMPEG_CORE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${FFMPEG_CORE}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ffmpeg;
    })();
    // A failed load shouldn't poison every future attempt.
    ffmpegPromise.catch(() => {
      ffmpegPromise = null;
    });
  }
  return ffmpegPromise;
}

async function cutClip(
  sources: ClipSource[],
  trimFromStartMs: number,
  ext: string,
  onProgress: (note: string) => void,
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  onProgress("Cutting clip…");

  for (let i = 0; i < sources.length; i++) {
    const data = new Uint8Array(await sources[i].blob.arrayBuffer());
    await ffmpeg.writeFile(`in${i}.${ext}`, data);
  }

  // Two segments (recorder rotated mid-window) → stream-copy concat first.
  let input = `in0.${ext}`;
  if (sources.length > 1) {
    const list = sources.map((_, i) => `file in${i}.${ext}`).join("\n");
    await ffmpeg.writeFile("list.txt", list);
    await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", `joined.${ext}`]);
    input = `joined.${ext}`;
  }

  // Cut from the front, stream-copy (lands on the nearest keyframe).
  const ss = (trimFromStartMs / 1000).toFixed(2);
  await ffmpeg.exec(["-ss", ss, "-i", input, "-c", "copy", `out.${ext}`]);

  const out = (await ffmpeg.readFile(`out.${ext}`)) as Uint8Array;
  if (!out || out.length === 0) throw new Error("empty clip");
  const buf = new Uint8Array(out); // detach from wasm memory
  return new Blob([buf], { type: ext === "mp4" ? "video/mp4" : "video/webm" });
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
