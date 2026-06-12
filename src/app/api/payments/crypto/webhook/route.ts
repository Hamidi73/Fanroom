// Coinbase Commerce webhook. Verifies the HMAC-SHA256 signature over the raw
// body using the shared webhook secret, then posts the highlighted message once
// the charge is confirmed.
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { fulfillDonation } from "@/lib/payments";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Generous per-IP cap (signature is the real gate; this just blunts a flood
  // of forged requests trying to burn CPU on HMAC verification).
  const rl = await rateLimit(`whcrypto:${clientIp(request)}`, 300, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const secret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const sig = request.headers.get("x-cc-webhook-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const raw = await request.text();
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  // Constant-time compare; lengths must match first or timingSafeEqual throws.
  const ok =
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let payload: { event?: { type?: string; data?: { metadata?: { donationId?: string }; id?: string } } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const type = payload.event?.type;
  const donationId = payload.event?.data?.metadata?.donationId;
  // 'confirmed' = fully settled; 'resolved' = manually marked resolved.
  if ((type === "charge:confirmed" || type === "charge:resolved") && donationId) {
    try {
      await fulfillDonation(donationId, payload.event?.data?.id);
    } catch (err) {
      console.error("crypto fulfillDonation failed", err);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
