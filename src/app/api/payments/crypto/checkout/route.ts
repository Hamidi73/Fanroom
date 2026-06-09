// Starts a Coinbase Commerce charge for a paid (highlighted) chat message — the
// crypto equivalent of the Stripe checkout route. Same validation and pending
// donation; the message is posted later by the crypto webhook once the charge
// is confirmed on-chain.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getTier } from "@/lib/tiers";

export const runtime = "nodejs";

const COINBASE_API = "https://api.commerce.coinbase.com/charges";

export async function POST(request: Request) {
  const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
  const admin = getAdminClient();
  if (!apiKey || !admin) {
    return NextResponse.json({ error: "Crypto payments are not configured." }, { status: 503 });
  }

  const { roomId, body, tierId } = await request.json().catch(() => ({}));
  const tier = getTier(tierId);
  const text = typeof body === "string" ? body.trim() : "";
  if (!roomId || !text || !tier) {
    return NextResponse.json({ error: "Missing room, message, or tier." }, { status: 400 });
  }
  if (text.length > 300) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: room } = await supabase.from("rooms").select("id,status").eq("id", roomId).maybeSingle();
  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (room.status === "Closed") return NextResponse.json({ error: "This room is closed." }, { status: 403 });

  const { data: membership } = await supabase
    .from("room_members")
    .select("user_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "Join the room first." }, { status: 403 });

  const { data: donation, error: insertErr } = await admin
    .from("donations")
    .insert({
      provider: "coinbase",
      room_id: roomId,
      user_id: user.id,
      body: text,
      tier: tier.id,
      amount_cents: tier.amountCents,
      currency: "usd",
      status: "pending",
    })
    .select("id")
    .single();
  if (insertErr || !donation) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const res = await fetch(COINBASE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Api-Key": apiKey,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify({
      name: `Highlighted message — ${tier.label}`,
      description: "FanRoom Global highlighted chat message",
      pricing_type: "fixed_price",
      local_price: { amount: (tier.amountCents / 100).toFixed(2), currency: "USD" },
      metadata: { donationId: donation.id },
      redirect_url: `${origin}/rooms/${roomId}?paid=1`,
      cancel_url: `${origin}/rooms/${roomId}?canceled=1`,
    }),
  });

  if (!res.ok) {
    await admin.from("donations").update({ status: "failed" }).eq("id", donation.id);
    return NextResponse.json({ error: "Could not create crypto charge." }, { status: 502 });
  }

  const json = await res.json();
  const hostedUrl = json?.data?.hosted_url;
  const chargeId = json?.data?.id;
  await admin.from("donations").update({ provider_ref: chargeId }).eq("id", donation.id);

  return NextResponse.json({ url: hostedUrl });
}
