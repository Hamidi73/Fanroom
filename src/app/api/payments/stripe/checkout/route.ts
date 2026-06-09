// Starts a Stripe Checkout session for a paid (highlighted) chat message.
// Flow: validate the user is a member of an open room → record a pending
// donation → create a Checkout session → return its URL for the client to
// redirect to. The message is only posted later, by the webhook, once Stripe
// confirms payment. The amount comes from the server-side tier list, never the
// client.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getTier } from "@/lib/tiers";
import { getConnectInfo, applicationFee } from "@/lib/connect";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const rl = await rateLimit(`checkout:${clientIp(request)}`, 15, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
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

  // Auth + authorization (must be a logged-in member of an open room).
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: room } = await supabase.from("rooms").select("id,status,host_id").eq("id", roomId).maybeSingle();
  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (room.status === "Closed") return NextResponse.json({ error: "This room is closed." }, { status: 403 });

  // The host must have connected payouts — donations route to them, not us.
  const host = await getConnectInfo(room.host_id);
  if (!host.enabled || !host.accountId) {
    return NextResponse.json(
      { error: "This host hasn't set up payouts yet, so highlights are unavailable here." },
      { status: 403 },
    );
  }

  const { data: membership } = await supabase
    .from("room_members")
    .select("user_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "Join the room first." }, { status: 403 });

  // Record a pending donation, then create the Checkout session referencing it.
  const { data: donation, error: insertErr } = await admin
    .from("donations")
    .insert({
      provider: "stripe",
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
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tier.amountCents,
          product_data: { name: `Highlighted message — ${tier.label}` },
        },
      },
    ],
    metadata: { donationId: donation.id },
    // Destination charge: keep the platform fee, send the rest to the host.
    payment_intent_data: {
      application_fee_amount: applicationFee(tier.amountCents),
      transfer_data: { destination: host.accountId },
    },
    success_url: `${origin}/rooms/${roomId}?paid=1`,
    cancel_url: `${origin}/rooms/${roomId}?canceled=1`,
  });

  await admin.from("donations").update({ provider_ref: session.id }).eq("id", donation.id);

  return NextResponse.json({ url: session.url });
}
