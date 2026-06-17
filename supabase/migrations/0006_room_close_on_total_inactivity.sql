-- Correct the auto-close rule: a room is deleted only after 5 minutes during
-- which NOBODY (host or any viewer) has heartbeated. Keying on the host alone
-- (migration 0005) wrongly deleted rooms whose host had merely backgrounded
-- their tab while viewers were still actively watching.
--
-- touch_room (from 0005) still refreshes last_active_at for every present
-- participant and host_last_seen_at for the host; closing now uses
-- last_active_at so any open room page / mini-player keeps the room alive.
create or replace function public.close_inactive_rooms()
returns void language sql security definer set search_path = public as $$
  delete from public.rooms where last_active_at < now() - interval '5 minutes';
$$;
