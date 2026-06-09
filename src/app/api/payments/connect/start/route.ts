// Starts Stripe Connect onboarding for the signed-in user (a host who wants to
// receive payouts). Creates/reuses their Express account, then returns a Stripe
// hosted onboarding URL for the client to redirect to.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getOrCreateConnectAccount } from "@/lib/connect";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Payouts are not configured." }, { status: 503 });

  const rl = await rateLimit(`connect:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const origin = new URL(request.url).origin;
  try {
    const accountId = await getOrCreateConnectAccount(user.id, user.email ?? null);
    if (!accountId) {
      return NextResponse.json({ error: "Payouts are not configured on the server." }, { status: 503 });
    }
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/api/payments/connect/refresh`,
      return_url: `${origin}/api/payments/connect/return`,
      type: "account_onboarding",
    });
    return NextResponse.json({ url: link.url });
  } catch (err) {
    // Surface Stripe's real reason (e.g. "enable Connect in the dashboard").
    const message =
      err instanceof Error ? err.message : "Could not start payout setup. Is Connect enabled in Stripe?";
    console.error("connect/start failed", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
