// Stripe Connect helpers for streamer payouts.
//
// Model: each host connects a Stripe **Express** account (one-time, Stripe-hosted
// onboarding + KYC). When a fan pays for a highlighted message, the charge is a
// "destination charge" on the platform account: we keep PLATFORM_FEE_BPS as an
// application fee and the rest transfers to the host's connected account, which
// Stripe pays out to their bank. Money only ever goes to the room's own host.
//
// All of this runs server-side and uses the service role (the connect columns on
// profiles aren't exposed to client roles). If Stripe or the service role isn't
// configured, every function degrades to a safe "not available" result.
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase/admin";

/** Platform fee in basis points. 2000 = 20% to the platform, 80% to the host. */
export const PLATFORM_FEE_BPS = 2000;

/** The platform's cut (in cents) for a given donation amount. */
export function applicationFee(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
}

export type ConnectInfo = { accountId: string | null; enabled: boolean };

/** Read a user's connect account id + whether they can receive payouts. */
export async function getConnectInfo(userId: string): Promise<ConnectInfo> {
  const admin = getAdminClient();
  if (!admin) return { accountId: null, enabled: false };
  const { data } = await admin
    .from("profiles")
    .select("stripe_account_id,stripe_payouts_enabled")
    .eq("id", userId)
    .maybeSingle();
  return {
    accountId: (data?.stripe_account_id as string | null) ?? null,
    enabled: !!data?.stripe_payouts_enabled,
  };
}

/** Get the user's Express account id, creating one (and saving it) if needed. */
export async function getOrCreateConnectAccount(
  userId: string,
  email: string | null,
): Promise<string | null> {
  const stripe = getStripe();
  const admin = getAdminClient();
  if (!stripe || !admin) return null;

  const { accountId } = await getConnectInfo(userId);
  if (accountId) {
    // Make sure it still exists under the current Stripe key — a saved id from a
    // different sandbox/account would 404 ("No such account"). If so, recreate.
    try {
      await stripe.accounts.retrieve(accountId);
      return accountId;
    } catch {
      // fall through and create a fresh account below
    }
  }

  // Don't force a business_type — some countries (e.g. AE) don't support
  // "individual". Stripe collects it during onboarding instead.
  const account = await stripe.accounts.create({
    type: "express",
    email: email ?? undefined,
    capabilities: { transfers: { requested: true } },
    metadata: { userId },
  });
  await admin
    .from("profiles")
    .update({ stripe_account_id: account.id, stripe_payouts_enabled: false })
    .eq("id", userId);
  return account.id;
}

/** Re-check the account with Stripe and persist whether payouts are enabled. */
export async function syncPayoutStatus(userId: string): Promise<boolean> {
  const stripe = getStripe();
  const admin = getAdminClient();
  if (!stripe || !admin) return false;

  const { accountId } = await getConnectInfo(userId);
  if (!accountId) return false;

  try {
    const account = await stripe.accounts.retrieve(accountId);
    const enabled = account.payouts_enabled === true && account.capabilities?.transfers === "active";
    await admin.from("profiles").update({ stripe_payouts_enabled: enabled }).eq("id", userId);
    return enabled;
  } catch {
    // Stale/invalid account id — treat as not enabled (next setup will recreate).
    await admin.from("profiles").update({ stripe_payouts_enabled: false }).eq("id", userId);
    return false;
  }
}
