-- Follows: a viewer can follow a creator (the room host). This is the
-- lightweight, free relationship — distinct from any paid "subscribe". A user
-- can follow many creators; following is one-directional and self-follow is
-- blocked by a check constraint.
--
-- Access is RPC-only. RLS is enabled with NO policies, so the follow graph is
-- never readable/writable through the publishable (anon) key directly — every
-- read/write goes through the SECURITY DEFINER functions below (same posture as
-- the gift RPCs and the locked-down profiles columns). This keeps "who follows
-- whom" private while still letting anyone see a creator's follower count.

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  creator_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, creator_id),
  constraint follows_no_self_follow check (follower_id <> creator_id)
);

alter table public.follows enable row level security;
-- (intentionally no policies — all access is via the RPCs below)

-- Defense in depth (same posture as donations / wallets / coin_purchases):
-- Supabase grants table privileges to anon/authenticated by default, so revoke
-- them explicitly. Then even if RLS were ever toggled off, the follow graph
-- stays unreachable via the publishable key — access is RPC-only, period.
revoke select, insert, update, delete on public.follows from anon, authenticated;

-- Fast "who follows this creator" counts.
create index if not exists follows_creator_idx on public.follows (creator_id);

-- Read the public follower count for a creator + whether the caller follows them.
-- Granted to anon so logged-out visitors still see the follower count.
create or replace function public.get_follow_state(p_creator_id uuid)
returns json
language sql security definer set search_path = public stable as $$
  select json_build_object(
    'followers', (select count(*) from public.follows f where f.creator_id = p_creator_id),
    'following', (
      auth.uid() is not null and exists (
        select 1 from public.follows f
        where f.creator_id = p_creator_id and f.follower_id = auth.uid()
      )
    )
  );
$$;
grant execute on function public.get_follow_state(uuid) to anon, authenticated;

-- Toggle the caller's follow of a creator: follow if not following, unfollow if
-- already. Returns the new state + updated follower count so the UI can sync.
create or replace function public.toggle_follow(p_creator_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  now_following boolean;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_creator_id is null then raise exception 'missing creator'; end if;
  if uid = p_creator_id then raise exception 'cannot follow yourself'; end if;
  if not exists (select 1 from auth.users u where u.id = p_creator_id) then
    raise exception 'unknown creator';
  end if;

  if exists (
    select 1 from public.follows f
    where f.creator_id = p_creator_id and f.follower_id = uid
  ) then
    delete from public.follows f
      where f.creator_id = p_creator_id and f.follower_id = uid;
    now_following := false;
  else
    insert into public.follows (follower_id, creator_id)
      values (uid, p_creator_id)
      on conflict do nothing;
    now_following := true;
  end if;

  return json_build_object(
    'followers', (select count(*) from public.follows f where f.creator_id = p_creator_id),
    'following', now_following
  );
end; $$;
grant execute on function public.toggle_follow(uuid) to authenticated;
