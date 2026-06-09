// Stripe webhook. Stripe calls this when a Checkout session completes; we verify
// the signature, then post the highlighted message via fulfillDonation(). This
// is the source of truth for "the payment succeeded" — never the browser.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillDonation, creditCoins } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const raw = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: { donationId?: string; kind?: string; purchaseId?: string };
      id: string;
    };
    try {
      if (session.metadata?.kind === "coins" && session.metadata.purchaseId) {
        // Buying Roar coins → credit the wallet.
        await creditCoins(session.metadata.purchaseId);
      } else if (session.metadata?.donationId) {
        // Paid highlight → post the highlighted message.
        await fulfillDonation(session.metadata.donationId, session.id);
      }
    } catch (err) {
      // Returning 500 tells Stripe to retry later.
      console.error("webhook fulfillment failed", err);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
