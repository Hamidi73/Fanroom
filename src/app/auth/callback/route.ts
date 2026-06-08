// OAuth callback. After the user authorises with Google, Supabase redirects
// here with a `code`. We exchange it for a session (writing the auth cookies via
// the server client) and then forward the user on to wherever they were headed.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/rooms";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or the exchange failed — send them to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
