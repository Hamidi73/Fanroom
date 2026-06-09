"use client";

// Host-only live video for a room, powered by LiveKit.
//   - The host sees camera/mic controls and broadcasts.
//   - Members watch the host's stream.
//   - Everyone else is prompted to join.
// Gracefully shows a message if LiveKit isn't configured or the user can't watch.

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

function Stage({ canPublish }: { canPublish: boolean }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  return (
    <>
      <div className="relative aspect-video bg-black">
        {tracks.length > 0 ? (
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
      </div>
      {canPublish && (
        <ControlBar
          variation="minimal"
          controls={{ camera: true, microphone: true, screenShare: false, chat: false, leave: false }}
        />
      )}
      <RoomAudioRenderer />
    </>
  );
}

export function RoomVideo({ roomId, canWatch }: { roomId: string; canWatch: boolean }) {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; token: string; url: string; canPublish: boolean }
  >({ kind: canWatch ? "loading" : "idle" });

  useEffect(() => {
    if (!canWatch) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/livekit/token?roomId=${roomId}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setState({ kind: "error", message: data.error ?? "Video unavailable." });
          return;
        }
        setState({ kind: "ready", token: data.token, url: data.url, canPublish: data.canPublish });
      } catch {
        if (active) setState({ kind: "error", message: "Could not connect to video." });
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId, canWatch]);

  if (!canWatch) return <Placeholder text="Join the room to watch the live stream." />;
  if (state.kind === "loading") return <Placeholder text="Connecting to live video…" />;
  if (state.kind === "error") return <Placeholder text={state.message} />;
  if (state.kind !== "ready") return <Placeholder text="Video unavailable." />;

  return (
    <Frame>
      <LiveKitRoom token={state.token} serverUrl={state.url} connect video={false} audio={false}>
        <Stage canPublish={state.canPublish} />
      </LiveKitRoom>
    </Frame>
  );
}
