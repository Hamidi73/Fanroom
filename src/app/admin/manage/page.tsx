// Admin → Members & Rooms. Fetches users (admin RPC) and rooms (server) and
// hands them to the client moderation panel. The /admin layout already ensures
// only admins reach this page.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/app/components";
import { AdminPanel, type AdminUser, type AdminRoom } from "./AdminPanel";

export default async function AdminManagePage() {
  const supabase = await createClient();

  const { data: usersData } = await supabase.rpc("admin_list_users");
  const { data: roomsData } = await supabase
    .from("rooms")
    .select("id,title,status,created_at,host:profiles!rooms_host_id_fkey(display_name)")
    .order("created_at", { ascending: false });

  const users = (usersData ?? []) as AdminUser[];
  const rooms = (roomsData ?? []) as unknown as AdminRoom[];

  return (
    <main className="flex-1">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/admin" className="text-sm text-muted hover:text-ink-foreground">← Admin home</Link>
        <h1 className="display mt-3 text-3xl">Members &amp; Rooms</h1>
        <p className="mt-2 text-sm text-muted">Delete accounts, and close or delete any room.</p>
        <div className="mt-8">
          <AdminPanel users={users} rooms={rooms} />
        </div>
      </div>
    </main>
  );
}
