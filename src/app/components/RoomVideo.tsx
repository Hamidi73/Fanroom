"use client";

// Host-only live video for a room, powered by LiveKit.
//   - The host sees camera/mic controls and broadcasts.
//   - Members watch the host's stream with audio.
//   - Everyone else (logged-out or not yet joined) gets a MUTED preview — the
//     Twitch pattern: anyone can peek at the stream, joining unlocks audio and
//     chat. Uses the same subscribe-only preview tokens as the landing page.
// A LIVE pill sits on the video whenever the host's camera is actually on.
// Gracefully shows a message if LiveKit isn't configured.

import { useEffect, useRef, useState } from "react";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { ClipControls } from "./ClipControls";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-black">
      {children}
    </div>
  );
}

function Placeholder({ text, overlay }: { text: string; overlay?: React.ReactNode }) {
  return (
    <Frame>
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-6 text-center text-sm text-white/60">
        {text}
        {overlay}
      </div>
    </Frame>
  );
}

// Expand/collapse the stream to fill the screen (Twitch-style). Targets the
// passed element via the Fullscreen API, with webkit fallbacks for Safari.
// Browsers that block element-fullscreen (older iOS Safari) simply no-op.
function FullscreenButton({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const fsEl =
        document.fullscreenElement ??
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ??
        null;
      setIsFull(!!fsEl);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggle = () => {
    const el = targetRef.current;
    if (!el) return;
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    const node = el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> };
    const active =
      document.fullscreenElement ??
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ??
      null;
    // Fullscreen requests can throw synchronously OR reject async (iOS Safari
    // doesn't support element fullscreen) — swallow both so nothing crashes.
    try {
      const run = active
        ? (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc)
        : (node.requestFullscreen ?? node.webkitRequestFullscreen)?.call(node);
      void Promise.resolve(run).catch(() => {});
    } catch {
      /* fullscreen denied — ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFull ? "Exit full screen" : "Full screen"}
      className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white/90 backdrop-blur-sm transition hover:bg-black/80"
    >
      {isFull ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 2v2.5a1.5 1.5 0 0 1-1.5 1.5H2M10 2v2.5A1.5 1.5 0 0 0 11.5 6H14M6 14v-2.5A1.5 1.5 0 0 0 4.5 10H2M10 14v-2.5a1.5 1.5 0 0 1 1.5-1.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 5.5V3a1 1 0 0 1 1-1h2.5M14 5.5V3a1 1 0 0 0-1-1h-2.5M2 10.5V13a1 1 0 0 0 1 1h2.5M14 10.5V13a1 1 0 0 1-1 1h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function Stage({
  canPublish,
  preview,
  roomId,
  overlay,
}: {
  canPublish: boolean;
  preview: boolean;
  roomId: string;
  overlay?: React.ReactNode;
}) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const audioTracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }]);
  const live = tracks.length > 0;
  // Raw media tracks feed the rolling clip buffer (members + host only).
  const videoTrack = tracks[0]?.publication?.track?.mediaStreamTrack ?? null;
  const audioTrack = audioTracks[0]?.publication?.track?.mediaStreamTrack ?? null;
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={stageRef} className="fr-stage relative aspect-video bg-black">
        {live ? (
          <GridLayout tracks={tracks}>
            <ParticipantTile />
          </GridLayout>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
            {canPublish
              ? "You're the host — turn on your camera below to go live."
              : "Waiting for the host to start their camera…"}
          </div>
        )}

        {live && (
          <span className="live-badge absolute left-3 top-3 z-10">● LIVE</span>
        )}
        {live && preview && (
          <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-white/90">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 6v4h2.5L8 13V3L4.5 6H2Z" fill="currentColor" />
              <path d="m10.5 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Muted preview — join the room for sound
          </span>
        )}

        {/* Paid/gift alert pop-overs live INSIDE the fullscreen element so they
            stay visible when the stream is expanded (the Fullscreen API only
            paints the fullscreened subtree). */}
        {overlay}

        {/* Expand the stream to fill the screen (works for hosts, members, and
            muted-preview viewers alike). */}
        <FullscreenButton targetRef={stageRef} />
      </div>
      {canPublish && (
        <ControlBar
          variation="minimal"
          controls={{ camera: true, microphone: true, screenShare: false, chat: false, leave: false }}
        />
      )}
      {/* Clip the stream (members + host; preview viewers must join first). */}
      {live && !preview && (
        <ClipControls videoTrack={videoTrack} audioTrack={audioTrack} roomId={roomId} />
      )}
      {!preview && <RoomAudioRenderer />}
    </>
  );
}

export function RoomVideo({
  roomId,
  canWatch,
  overlay,
}: {
  roomId: string;
  canWatch: boolean;
  /** Rendered inside the player so it survives fullscreen (e.g. StreamAlerts). */
  overlay?: React.ReactNode;
}) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; token: string; url: string; canPublish: boolean; preview: boolean }
  >({ kind: "loading" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Members/hosts get a full token; everyone else a muted preview token.
        const qs = canWatch ? `roomId=${roomId}` : `roomId=${roomId}&preview=1`;
        const res = await fetch(`/api/livekit/token?${qs}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setState({ kind: "error", message: data.error ?? "Video unavailable." });
          return;
        }
        setState({
          kind: "ready",
          token: data.token,
          url: data.url,
          canPublish: data.canPublish,
          preview: !canWatch,
        });
      } catch {
        if (active) setState({ kind: "error", message: "Could not connect to video." });
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId, canWatch]);

  if (state.kind === "loading") return <Placeholder text="Connecting to live video…" overlay={overlay} />;
  if (state.kind === "error") return <Placeholder text={state.message} overlay={overlay} />;

  return (
    <Frame>
      <LiveKitRoom token={state.token} serverUrl={state.url} connect video={false} audio={false}>
        <Stage canPublish={state.canPublish} preview={state.preview} roomId={roomId} overlay={overlay} />
      </LiveKitRoom>
    </Frame>
  );
}
