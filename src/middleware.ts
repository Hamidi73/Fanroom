// Refreshes the Supabase auth session on every request so Server Components
// always see an up-to-date user. (Standard @supabase/ssr middleware pattern.)
//
// Hardened: if the Supabase env vars are missing, or the auth call fails for any
// reason, we let the request through untouched instead of 500-ing every route.
// A broken/absent backend should degrade to "logged out", never take down the site.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Misconfigured env — don't crash, just skip the session refresh.
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Touch the session so expired tokens get refreshed into the response cookies.
    await supabase.auth.getUser();
  } catch {
    // Network/auth hiccup — proceed without a refreshed session.
    return response;
  }

  return response;
}

export const config = {
  // Run on everything except static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
