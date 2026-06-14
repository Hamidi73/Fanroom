-- Rooms close 5 min after the HOST stops being present (left without closing,
-- or the room emptied out) — not whenever a generic heartbeat lapses. Host
-- presence is tracked separately so a present host (with or without viewers)
-- keeps the room open.

alter table public.rooms
  add column if not exists host_last_seen_at timestamptz not null default now();

-- Heartbeat distinguishes the host. p_is_host defaults false so any single-arg
-- callers still work during a deploy window.
drop function if exists public.touch_room(uuid);
create or replace function public.touch_room(p_room_id uuid, p_is_host boolean default false)
returns void language sql security definer set search_path = public as $$
  update public.rooms
     set last_active_at = now(),
         host_last_seen_at = case when p_is_host then now() else host_last_seen_at end
   where id = p_room_id;
$$;
grant execute on function public.touch_room(uuid, boolean) to anon, authenticated;

-- Close once the host has been gone for 5 minutes. Host present (heartbeating
-- host=true) → stays open regardless of viewers; empty room has no host
-- heartbeat → also closes after 5 min.
create or replace function public.close_inactive_rooms()
returns void language sql security definer set search_path = public as $$
  delete from public.rooms where host_last_seen_at < now() - interval '5 minutes';
$$;
