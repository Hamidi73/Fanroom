-- FanRoom Global — complete database schema (all 11 migrations, in order).
-- Replay this into a fresh Supabase project to reproduce the full backend:
-- tables, RLS policies, triggers, admin RPCs, donations/paid-highlights, and
-- realtime publications. Safe to run once on an empty project.
--
-- Apply via: Supabase dashboard → SQL Editor → paste → Run.

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607194639  init_fanroom_schema
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  match text,
  nation_slug text,
  language text,
  status text not null default 'Scheduled',
  created_at timestamptz not null default now()
);
alter table public.rooms enable row level security;
create policy "Rooms are viewable by everyone" on public.rooms for select using (true);
create policy "Authenticated users can create rooms" on public.rooms for insert to authenticated with check (auth.uid() = host_id);
create policy "Hosts can update own rooms" on public.rooms for update to authenticated using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy "Hosts can delete own rooms" on public.rooms for delete to authenticated using (auth.uid() = host_id);

create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
alter table public.room_members enable row level security;
create policy "Memberships are viewable by everyone" on public.room_members for select using (true);
create policy "Users can join rooms" on public.room_members for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can leave rooms" on public.room_members for delete to authenticated using (auth.uid() = user_id);

create table public.messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Messages are viewable by everyone" on public.messages for select using (true);
create policy "Members can post messages" on public.messages for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.room_members m
      where m.room_id = messages.room_id and m.user_id = auth.uid()
    )
  );

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.room_members;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607195145  repoint_user_fks_to_profiles
-- ─────────────────────────────────────────────────────────────────────────
alter table public.rooms drop constraint rooms_host_id_fkey;
alter table public.rooms add constraint rooms_host_id_fkey
  foreign key (host_id) references public.profiles(id) on delete cascade;

alter table public.room_members drop constraint room_members_user_id_fkey;
alter table public.room_members add constraint room_members_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.messages drop constraint messages_user_id_fkey;
alter table public.messages add constraint messages_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607200342  harden_handle_new_user
-- ─────────────────────────────────────────────────────────────────────────
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607202120  auto_confirm_new_users
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

create trigger auto_confirm_email_before_insert
  before insert on auth.users
  for each row execute function public.auto_confirm_email();

revoke execute on function public.auto_confirm_email() from anon, authenticated, public;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607204554  admin_features
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column is_admin boolean not null default false;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin);
$$;
revoke execute on function public.is_current_user_admin() from anon, public;
grant execute on function public.is_current_user_admin() to authenticated;

create policy "Admins can update any room" on public.rooms for update to authenticated
  using (public.is_current_user_admin()) with check (true);
create policy "Admins can delete any room" on public.rooms for delete to authenticated
  using (public.is_current_user_admin());

create or replace function public.admin_list_users()
returns table (id uuid, email text, display_name text, is_admin boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;
  return query
    select u.id, u.email::text, p.display_name, p.is_admin, u.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    order by u.created_at desc;
end;
$$;
revoke execute on function public.admin_list_users() from anon, public;
grant execute on function public.admin_list_users() to authenticated;

create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;
  if target = auth.uid() then
    raise exception 'admins cannot delete their own account here';
  end if;
  delete from auth.users where id = target;
end;
$$;
revoke execute on function public.admin_delete_user(uuid) from anon, public;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607204834  protect_is_admin_column
-- ─────────────────────────────────────────────────────────────────────────
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260607210153  tighten_admin_room_update_check
-- ─────────────────────────────────────────────────────────────────────────
drop policy "Admins can update any room" on public.rooms;
create policy "Admins can update any room" on public.rooms for update to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 20260608111513  handle_new_user_oauth_name
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$function$;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260609095503  paid_highlighted_messages
-- ─────────────────────────────────────────────────────────────────────────
alter table public.messages
  add column if not exists highlight boolean not null default false,
  add column if not exists amount_cents integer not null default 0,
  add column if not exists tier text;

drop policy if exists "Members can post messages" on public.messages;
create policy "Members can post messages" on public.messages
  for insert
  with check (
    auth.uid() = user_id
    and highlight = false
    and exists (
      select 1 from public.room_members m
      where m.room_id = messages.room_id and m.user_id = auth.uid()
    )
  );

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_ref text unique,
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  tier text not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null default 'pending',
  message_id bigint references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;

drop policy if exists "Own donations are readable" on public.donations;
create policy "Own donations are readable" on public.donations
  for select using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 20260609124442  realtime_rooms_for_leaderboard
-- ─────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 20260609132301  security_hardening_pass_1
-- ─────────────────────────────────────────────────────────────────────────
alter table public.messages
  add constraint messages_body_len check (char_length(body) between 1 and 500);

revoke select (is_admin) on public.profiles from anon;

revoke insert, update, delete on public.profiles from anon;
revoke insert, update, delete on public.rooms from anon;
revoke insert, update, delete on public.room_members from anon;
revoke insert, update, delete on public.messages from anon;
revoke insert, update, delete, select on public.donations from anon;

revoke insert, delete on public.profiles from authenticated;
revoke update, delete on public.messages from authenticated;
revoke insert, update, delete on public.donations from authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- stripe_connect_payouts  (host payouts via Stripe Connect)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists stripe_account_id text,
  add column if not exists stripe_payouts_enabled boolean not null default false;

-- Managed server-side via the service role only; never exposed to client roles.
revoke select (stripe_account_id, stripe_payouts_enabled) on public.profiles from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- roar_wallets_and_coin_purchases  (gift economy)
-- ─────────────────────────────────────────────────────────────────────────
create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_roars bigint not null default 0 check (balance_roars >= 0),
  updated_at timestamptz not null default now()
);
alter table public.wallets enable row level security;
create policy "Own wallet is readable" on public.wallets for select using (auth.uid() = user_id);
revoke select on public.wallets from anon;
revoke insert, update, delete on public.wallets from anon, authenticated;

create table public.coin_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_ref text unique,
  bundle_id text not null,
  roars integer not null,
  amount_cents integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.coin_purchases enable row level security;
create policy "Own purchases are readable" on public.coin_purchases for select using (auth.uid() = user_id);
revoke select on public.coin_purchases from anon;
revoke insert, update, delete on public.coin_purchases from anon, authenticated;

create or replace function public.get_or_seed_wallet()
returns bigint language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); bal bigint;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.wallets (user_id, balance_roars) values (uid, 500) on conflict (user_id) do nothing;
  select balance_roars into bal from public.wallets where user_id = uid;
  return bal;
end; $$;
revoke execute on function public.get_or_seed_wallet() from anon, public;
grant execute on function public.get_or_seed_wallet() to authenticated;

create or replace function public.spend_roars(amount integer)
returns bigint language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); bal bigint;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if amount is null or amount <= 0 then raise exception 'invalid amount'; end if;
  insert into public.wallets (user_id, balance_roars) values (uid, 500) on conflict (user_id) do nothing;
  update public.wallets set balance_roars = balance_roars - amount, updated_at = now()
    where user_id = uid and balance_roars >= amount returning balance_roars into bal;
  if bal is null then raise exception 'insufficient roars'; end if;
  return bal;
end; $$;
revoke execute on function public.spend_roars(integer) from anon, public;
grant execute on function public.spend_roars(integer) to authenticated;

create or replace function public.credit_coins(purchase uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid; amt integer;
begin
  update public.coin_purchases set status = 'paid'
    where id = purchase and status = 'pending' returning user_id, roars into uid, amt;
  if not found then return; end if;
  insert into public.wallets (user_id, balance_roars) values (uid, amt)
    on conflict (user_id) do update
      set balance_roars = public.wallets.balance_roars + excluded.balance_roars, updated_at = now();
end; $$;
revoke execute on function public.credit_coins(uuid) from anon, authenticated, public;
grant execute on function public.credit_coins(uuid) to service_role;
