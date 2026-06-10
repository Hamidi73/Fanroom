"use client";

// Host-only live video for a room, powered by LiveKit.
//   - The host sees camera/mic controls and broadcasts.
//   - Members watch the host's stream with audio.
//   - Everyone else (logged-out or not yet joined) gets a MUTED preview — the
//     Twitch pattern: anyone can peek at the stream, joining unlocks audio and
//     chat. Uses the same subscribe-only preview tokens as the landing page.
// A LIVE pill sits on the video whenever the host's camera is actually on.
// Gracefully shows a message if LiveKit isn't configured.

import { useEffect, useState } from "react";
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

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-black">
      {children}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <Frame>
      <div className="flex aspect-video items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-6 text-center text-sm text-white/60">
        {text}
      </div>
    </Frame>
  );
}

function Stage({ canPublish, preview }: { canPublish: boolean; preview: boolean }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const live = tracks.length > 0;
  return (
    <>
      <div className="relative aspect-video bg-black">
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
      </div>
      {canPublish && (
        <ControlBar
          variation="minimal"
          controls={{ camera: true, microphone: true, screenShare: false, chat: false, leave: false }}
        />
      )}
      {!preview && <RoomAudioRenderer />}
    </>
  );
}

export function RoomVideo({ roomId, canWatch }: { roomId: string; canWatch: boolean }) {
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

  if (state.kind === "loading") return <Placeholder text="Connecting to live video…" />;
  if (state.kind === "error") return <Placeholder text={state.message} />;

  return (
    <Frame>
      <LiveKitRoom token={state.token} serverUrl={state.url} connect video={false} audio={false}>
        <Stage canPublish={state.canPublish} preview={state.preview} />
      </LiveKitRoom>
    </Frame>
  );
}
