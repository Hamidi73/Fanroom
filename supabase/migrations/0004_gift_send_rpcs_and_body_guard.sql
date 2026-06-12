-- M2: server-authoritative gift/sticker sends. Each RPC looks up the price
-- server-side, debits Roars atomically (spend_roars raises on insufficient,
-- rolling back the whole tx including the message insert), and posts the chat
-- line — so a "gift" line can never exist without a paid debit, and the amount
-- is never client-controlled.

create or replace function public.send_gift(p_room_id uuid, p_gift_id text, p_qty int)
returns bigint language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); unit int; new_balance bigint;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_qty is null or p_qty < 1 or p_qty > 99 then raise exception 'invalid quantity'; end if;
  if not exists (select 1 from public.room_members m where m.room_id = p_room_id and m.user_id = uid) then
    raise exception 'not a room member';
  end if;
  select price into unit from public.gift_prices where id = p_gift_id and kind = 'gift';
  if unit is null then raise exception 'unknown gift'; end if;
  new_balance := public.spend_roars(unit * p_qty);  -- raises if insufficient
  insert into public.messages (room_id, user_id, body, highlight)
  values (p_room_id, uid, '[gift:' || p_gift_id || ':' || p_qty || ']', false);
  return new_balance;
end; $$;

create or replace function public.send_sticker(p_room_id uuid, p_sticker_id text)
returns bigint language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); unit int; new_balance bigint;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.room_members m where m.room_id = p_room_id and m.user_id = uid) then
    raise exception 'not a room member';
  end if;
  select price into unit from public.gift_prices where id = p_sticker_id and kind = 'sticker';
  if unit is null then raise exception 'unknown sticker'; end if;
  new_balance := public.spend_roars(unit);  -- raises if insufficient
  insert into public.messages (room_id, user_id, body, highlight)
  values (p_room_id, uid, '[sticker:' || p_sticker_id || ']', false);
  return new_balance;
end; $$;

grant execute on function public.send_gift(uuid, text, int) to authenticated;
grant execute on function public.send_sticker(uuid, text) to authenticated;

-- Block users from hand-crafting gift/sticker message bodies directly (the
-- documented spoof). The SECURITY DEFINER RPCs above bypass RLS, so legitimate
-- paid sends still insert these bodies.
drop policy if exists "Members can post messages" on public.messages;
create policy "Members can post messages" on public.messages
  for insert to public
  with check (
    auth.uid() = user_id
    and highlight = false
    and body not like '[gift:%'
    and body not like '[sticker:%'
    and exists (
      select 1 from public.room_members m
      where m.room_id = messages.room_id and m.user_id = auth.uid()
    )
  );
