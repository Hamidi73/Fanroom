"use client";

// Muted, subscribe-only live preview of a room's host camera, for the public
// landing page (hero + card hover). Fetches a preview token, connects to
// LiveKit, and renders the camera track as object-cover video. If the host
// isn't broadcasting, it renders nothing — so whatever thumbnail sits behind it
// stays visible. Never plays audio (autoplay-safe) and can't publish.

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  isTrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";

function Camera({ onLiveChange }: { onLiveChange?: (live: boolean) => void }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const track = tracks.find(isTrackReference);

  useEffect(() => {
    onLiveChange?.(!!track);
  }, [track, onLiveChange]);

  if (!track) return null;
  return <VideoTrack trackRef={track} className="h-full w-full object-cover" />;
}

export function LivePreview({
  roomId,
  onLiveChange,
}: {
  roomId: string;
  onLiveChange?: (live: boolean) => void;
}) {
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/livekit/token?roomId=${roomId}&preview=1`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.token) setConn({ token: data.token, url: data.url });
      } catch {
        /* leave thumbnail showing */
      }
    })();
    return () => {
      active = false;
      setConn(null);
    };
  }, [roomId]);

  if (!conn) return null;

  return (
    <LiveKitRoom
      token={conn.token}
      serverUrl={conn.url}
      connect
      audio={false}
      video={false}
      className="h-full w-full"
    >
      <Camera onLiveChange={onLiveChange} />
    </LiveKitRoom>
  );
}
