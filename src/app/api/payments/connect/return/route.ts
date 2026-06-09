// Where Stripe sends the host back after onboarding. We re-check the account
// with Stripe, persist whether payouts are now enabled, and bounce them to their
// profile with a status flag for the banner.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPayoutStatus } from "@/lib/connect";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const enabled = await syncPayoutStatus(user.id);
  return NextResponse.redirect(`${origin}/profile?payouts=${enabled ? "connected" : "pending"}`);
}
