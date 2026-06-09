// Mints a LiveKit access token for a room.
//   - The room's HOST gets publish rights (camera/mic) — they broadcast.
//   - Other members get subscribe-only — they watch.
//   - Non-members / logged-out users are refused (join the room first)…
//   - …UNLESS preview=1: anyone (even logged-out) gets a subscribe-only token
//     for muted landing-page previews. They can watch the video, nothing else.
// The API secret never leaves the server.

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const roomId = params.get("roomId");
  const preview = params.get("preview") === "1";
  if (!roomId) {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Live video isn't configured yet." }, { status: 503 });
  }

  const supabase = await createClient();

  // ── Preview: a muted, subscribe-only peek for the public landing page. No
  //    login or membership needed; can never publish or send data. ──
  if (preview) {
    const { data: room } = await supabase.from("rooms").select("id,status").eq("id", roomId).maybeSingle();
    if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
    if (room.status === "Closed") return NextResponse.json({ error: "Room is closed." }, { status: 403 });

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `preview-${crypto.randomUUID()}`,
      name: "Preview",
      ttl: "15m",
    });
    at.addGrant({
      roomJoin: true,
      room: `fanroom_${roomId}`,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
    const token = await at.toJwt();
    return NextResponse.json({ token, url: wsUrl, canPublish: false });
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "Log in to watch." }, { status: 401 });
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("id,host_id,status")
    .eq("id", roomId)
    .maybeSingle();
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const isHost = room.host_id === user.id;
  let isMember = isHost;
  if (!isMember) {
    const { data: membership } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .maybeSingle();
    isMember = !!membership;
  }
  if (!isMember) {
    return NextResponse.json({ error: "Join the room to watch." }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: profile?.display_name ?? "Fan",
    ttl: "2h",
  });
  at.addGrant({
    roomJoin: true,
    room: `fanroom_${roomId}`,
    canPublish: isHost, // only the host broadcasts
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ token, url: wsUrl, canPublish: isHost });
}
