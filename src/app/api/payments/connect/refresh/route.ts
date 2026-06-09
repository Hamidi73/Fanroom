// Stripe sends the host here if an onboarding link expires before they finish.
// We mint a fresh onboarding link and redirect straight into it.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getOrCreateConnectAccount } from "@/lib/connect";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const stripe = getStripe();
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!stripe || !user) return NextResponse.redirect(`${origin}/profile`);

  const accountId = await getOrCreateConnectAccount(user.id, user.email ?? null);
  if (!accountId) return NextResponse.redirect(`${origin}/profile?payouts=error`);

  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/api/payments/connect/refresh`,
      return_url: `${origin}/api/payments/connect/return`,
      type: "account_onboarding",
    });
    return NextResponse.redirect(link.url);
  } catch {
    return NextResponse.redirect(`${origin}/profile?payouts=error`);
  }
}
