// Link / unlink a crypto wallet (Phantom — Solana) to the signed-in account.
//
// POST  { address, signature, message }  → verify + save
// DELETE                                  → unlink
//
// Ownership is PROVEN, not self-asserted: the browser asks Phantom to sign a
// short message containing the caller's user id and a timestamp, and this
// route verifies the ed25519 signature against the claimed public key before
// storing anything. No funds ever move — signMessage is read-only.
import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MESSAGE_MAX_AGE_MS = 10 * 60_000;

// "FanRoom Global — link wallet\nUser: <uid>\nIssued: <iso>"
function parseMessage(message: string): { uid: string; issued: number } | null {
  const m = message.match(
    /^FanRoom Global — link wallet\nUser: ([0-9a-f-]{36})\nIssued: (\d{4}-\d{2}-\d{2}T[\d:.]+Z)$/,
  );
  if (!m) return null;
  const issued = Date.parse(m[2]);
  return Number.isNaN(issued) ? null : { uid: m[1], issued };
}

export async function POST(request: Request) {
  const rl = await rateLimit(`wallet:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const { address, signature, message } = await request.json().catch(() => ({}));
  if (
    typeof address !== "string" ||
    typeof signature !== "string" ||
    typeof message !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // The signed message must be for THIS user and fresh (no replays).
  const parsed = parseMessage(message);
  if (!parsed || parsed.uid !== user.id) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }
  if (Math.abs(Date.now() - parsed.issued) > MESSAGE_MAX_AGE_MS) {
    return NextResponse.json({ error: "Signature expired — try again." }, { status: 400 });
  }

  // ed25519 verify: the signature must come from the claimed address's key.
  let ok = false;
  try {
    const pubkey = bs58.decode(address);
    const sig = bs58.decode(signature);
    ok =
      pubkey.length === 32 &&
      sig.length === 64 &&
      nacl.sign.detached.verify(new TextEncoder().encode(message), sig, pubkey);
  } catch {
    ok = false;
  }
  if (!ok) return NextResponse.json({ error: "Signature check failed." }, { status: 400 });

  // Write with the service-role client: the authenticated role has no UPDATE
  // grant on wallet_address (only display_name), so a user-scoped write is
  // denied at the column level. Ownership is already proven by the signature.
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Wallet linking is not configured." }, { status: 503 });
  const { error } = await admin
    .from("profiles")
    .update({ wallet_address: address })
    .eq("id", user.id);
  if (error) return NextResponse.json({ error: "Couldn't save wallet." }, { status: 500 });

  return NextResponse.json({ ok: true, address });
}

export async function DELETE(request: Request) {
  const rl = await rateLimit(`wallet:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Wallet linking is not configured." }, { status: 503 });
  const { error } = await admin
    .from("profiles")
    .update({ wallet_address: null })
    .eq("id", user.id);
  if (error) return NextResponse.json({ error: "Couldn't unlink wallet." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
