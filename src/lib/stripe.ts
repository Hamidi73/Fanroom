// Server-side Stripe client. Returns null if the secret key isn't configured,
// so the rest of the app can degrade gracefully (paid highlights just turn off).
import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}
