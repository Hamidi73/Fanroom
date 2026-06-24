-- When a viewer follows a host, drop a small system line into that room's chat
-- ("X started following the host"). This is chat-only — NOT an on-screen alert,
-- since on-screen pop-overs are the paid (highlighted) feature.
--
-- The notice is a message with the marker body '[follow]', inserted by the
-- (SECURITY DEFINER) toggle_follow RPC. RoomChat renders that marker as a
-- system line. We add a room param to toggle_follow and announce only on a NEW
-- follow, once per follower per room (so repeat follow/unfollow can't spam).

-- Replace the 1-arg version with one that also takes the room to announce in.
drop function if exists public.toggle_follow(uuid);

create or replace function public.toggle_follow(p_creator_id uuid, p_room_id uuid default null)
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); now_following boolean;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_creator_id is null then raise exception 'missing creator'; end if;
  if uid = p_creator_id then raise exception 'cannot follow yourself'; end if;
  if not exists (select 1 from auth.users u where u.id = p_creator_id) then
    raise exception 'unknown creator';
  end if;

  if exists (select 1 from public.follows f where f.creator_id = p_creator_id and f.follower_id = uid) then
    delete from public.follows f where f.creator_id = p_creator_id and f.follower_id = uid;
    now_following := false;
  else
    insert into public.follows (follower_id, creator_id) values (uid, p_creator_id)
      on conflict do nothing;
    now_following := true;
    -- Announce in the room's chat — only if the creator actually hosts that
    -- room, and only the first time this follower follows there (anti-spam).
    if p_room_id is not null
       and exists (select 1 from public.rooms r where r.id = p_room_id and r.host_id = p_creator_id)
       and not exists (
         select 1 from public.messages m
         where m.room_id = p_room_id and m.user_id = uid and m.body = '[follow]'
       )
    then
      insert into public.messages (room_id, user_id, body, highlight)
      values (p_room_id, uid, '[follow]', false);
    end if;
  end if;

  return json_build_object(
    'followers', (select count(*) from public.follows f where f.creator_id = p_creator_id),
    'following', now_following
  );
end; $$;
grant execute on function public.toggle_follow(uuid, uuid) to authenticated;

-- Block users from hand-crafting '[follow]' message bodies directly (the same
-- anti-spoof guard the gift/sticker markers have). The RPC above bypasses RLS,
-- so legitimate follow notices still post.
drop policy if exists "Members can post messages" on public.messages;
create policy "Members can post messages" on public.messages
  for insert to public
  with check (
    auth.uid() = user_id
    and highlight = false
    and body not like '[gift:%'
    and body not like '[sticker:%'
    and body not like '[follow]%'
    and exists (
      select 1 from public.room_members m
      where m.room_id = messages.room_id and m.user_id = auth.uid()
    )
  );
