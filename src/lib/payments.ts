// Shared payment fulfillment. Both the Stripe and crypto webhooks call this
// once a payment is confirmed: it posts the user's message as a HIGHLIGHTED
// message (via the service role, so it bypasses the "no self-highlight" RLS) and
// marks the donation paid. Idempotent — running it twice for the same donation
// is a no-op, so duplicate webhook deliveries are safe.
import { getAdminClient } from "@/lib/supabase/admin";

export async function fulfillDonation(donationId: string, providerRef?: string): Promise<void> {
  const admin = getAdminClient();
  if (!admin) throw new Error("Service role not configured");

  const { data: donation } = await admin
    .from("donations")
    .select("id,room_id,user_id,body,tier,amount_cents,status,message_id")
    .eq("id", donationId)
    .maybeSingle();

  if (!donation) throw new Error(`Donation ${donationId} not found`);
  if (donation.status === "paid" && donation.message_id) return; // already fulfilled

  const { data: message, error: msgErr } = await admin
    .from("messages")
    .insert({
      room_id: donation.room_id,
      user_id: donation.user_id,
      body: donation.body,
      highlight: true,
      amount_cents: donation.amount_cents,
      tier: donation.tier,
    })
    .select("id")
    .single();
  if (msgErr) throw msgErr;

  await admin
    .from("donations")
    .update({ status: "paid", message_id: message.id, ...(providerRef ? { provider_ref: providerRef } : {}) })
    .eq("id", donationId);
}

// Credit a confirmed Roar coin purchase to the buyer's wallet. The DB function
// claims the pending row and credits in one transaction, so duplicate webhook
// deliveries are safe (idempotent).
export async function creditCoins(purchaseId: string): Promise<void> {
  const admin = getAdminClient();
  if (!admin) throw new Error("Service role not configured");
  const { error } = await admin.rpc("credit_coins", { purchase: purchaseId });
  if (error) throw error;
}
