// Starts a Stripe Checkout session to buy a Roar coin bundle. Same rules as the
// highlight checkout: the price comes ONLY from the server-side bundle list
// (the client sends a bundle id, never an amount), and the wallet is credited
// later by the webhook once payment is confirmed — never by the browser.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { COIN_BUNDLES, ECONOMY } from "@/lib/gifts";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Only allow same-site relative return paths (avoid open redirect).
function safePath(p: unknown): string {
  return typeof p === "string" && /^\/[^/]/.test(p) ? p : "/rooms";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const rl = await rateLimit(`coins:${clientIp(request)}`, 15, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const { bundleId, returnTo } = await request.json().catch(() => ({}));
  const bundle = COIN_BUNDLES.find((b) => b.id === bundleId);
  if (!bundle) return NextResponse.json({ error: "Unknown bundle." }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: purchase, error: insertErr } = await admin
    .from("coin_purchases")
    .insert({
      user_id: user.id,
      provider: "stripe",
      bundle_id: bundle.id,
      roars: bundle.totalRoars,
      amount_cents: bundle.usdPriceCents,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertErr || !purchase) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const back = safePath(returnTo);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: bundle.usdPriceCents,
          product_data: { name: `${bundle.totalRoars.toLocaleString()} ${ECONOMY.coinName}` },
        },
      },
    ],
    metadata: { kind: "coins", purchaseId: purchase.id },
    success_url: `${origin}${back}?coins=1`,
    cancel_url: `${origin}${back}?coins=canceled`,
  });

  await admin.from("coin_purchases").update({ provider_ref: session.id }).eq("id", purchase.id);
  return NextResponse.json({ url: session.url });
}
