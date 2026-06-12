-- M1: server-side room validation (client checks are bypassable via REST).
alter table public.rooms
  add constraint rooms_title_len    check (char_length(btrim(title)) between 3 and 80) not valid;
alter table public.rooms
  add constraint rooms_match_len     check (match is null or char_length(match) <= 80) not valid;
alter table public.rooms
  add constraint rooms_language_len  check (language is null or char_length(language) <= 40) not valid;

-- Cap simultaneously-open rooms per host (anti-spam). Closed rooms don't count.
create or replace function public.enforce_room_cap()
returns trigger language plpgsql security definer set search_path = public as $$
declare open_count int;
begin
  select count(*) into open_count from public.rooms
   where host_id = new.host_id and coalesce(status,'') <> 'Closed';
  if open_count >= 8 then
    raise exception 'You already have the maximum number of open rooms. Close one first.'
      using errcode = 'check_violation';
  end if;
  return new;
end; $$;

drop trigger if exists trg_enforce_room_cap on public.rooms;
create trigger trg_enforce_room_cap before insert on public.rooms
  for each row execute function public.enforce_room_cap();
