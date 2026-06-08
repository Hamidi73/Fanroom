// Mints a LiveKit access token for a room.
//   - The room's HOST gets publish rights (camera/mic) — they broadcast.
//   - Other members get subscribe-only — they watch.
//   - Non-members / logged-out users are refused (join the room first).
// The API secret never leaves the server.

import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const roomId = new URL(request.url).searchParams.get("roomId");
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
