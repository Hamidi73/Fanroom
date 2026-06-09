// Gates every /admin route behind an admin login. Non-admins (and logged-out
// visitors) get an access screen instead of the internal tooling.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/app/components";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    isAdmin = !!data?.is_admin;
  }

  if (!isAdmin) {
    return (
      <main className="flex-1">
        <AppHeader />
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="display text-3xl">Admin access only</h1>
          <p className="mt-3 text-sm text-muted">
            {user ? "Your account doesn't have admin access." : "Log in with an admin account to continue."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {!user && (
              <Link href="/login" className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white">
                Log in
              </Link>
            )}
            <Link href="/" className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white">
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
