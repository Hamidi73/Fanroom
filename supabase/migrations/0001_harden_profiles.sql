-- H1: lock sensitive profile columns away from the publishable (anon) key.
-- A TABLE-level SELECT grant supersedes column-level REVOKEs, so we drop the
-- table grant and re-grant SELECT on only the public-safe columns.
revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, created_at) on public.profiles to anon, authenticated;

-- is_admin is now read via this existing SECURITY DEFINER fn instead of the column.
grant execute on function public.is_current_user_admin() to authenticated, anon;

-- Owner-scoped read of one's own linked wallet (the column is no longer readable).
create or replace function public.get_my_wallet_address()
returns text language sql security definer set search_path = public as $$
  select wallet_address from public.profiles where id = auth.uid();
$$;
grant execute on function public.get_my_wallet_address() to authenticated;
