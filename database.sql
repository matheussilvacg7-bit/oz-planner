-- OZ PLANNER | Execute uma única vez no SQL Editor do seu Supabase.
-- IMPORTANTE: substitua o e-mail no último INSERT antes de executar.

create table if not exists public.oz_allowed_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint oz_email_lowercase check (email = lower(email))
);
revoke all on public.oz_allowed_emails from anon, authenticated;

create or replace function public.oz_email_allowed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.oz_allowed_emails a
    where a.email = lower((select auth.jwt() ->> 'email'))
      and (select auth.uid()) is not null
  );
$$;
revoke all on function public.oz_email_allowed() from public, anon;
grant execute on function public.oz_email_allowed() to authenticated;

create table if not exists public.oz_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"companies":[],"clients":[],"batches":[],"tasks":[],"events":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.oz_workspaces enable row level security;
revoke all on public.oz_workspaces from anon;
grant select, insert, update, delete on public.oz_workspaces to authenticated;

drop policy if exists "oz_select_own_workspace" on public.oz_workspaces;
create policy "oz_select_own_workspace" on public.oz_workspaces
for select to authenticated using (owner_id=(select auth.uid()) and (select public.oz_email_allowed()));

drop policy if exists "oz_insert_own_workspace" on public.oz_workspaces;
create policy "oz_insert_own_workspace" on public.oz_workspaces
for insert to authenticated with check (owner_id=(select auth.uid()) and (select public.oz_email_allowed()));

drop policy if exists "oz_update_own_workspace" on public.oz_workspaces;
create policy "oz_update_own_workspace" on public.oz_workspaces
for update to authenticated using (owner_id=(select auth.uid()) and (select public.oz_email_allowed()))
with check (owner_id=(select auth.uid()) and (select public.oz_email_allowed()));

drop policy if exists "oz_delete_own_workspace" on public.oz_workspaces;
create policy "oz_delete_own_workspace" on public.oz_workspaces
for delete to authenticated using (owner_id=(select auth.uid()) and (select public.oz_email_allowed()));

-- Troque o Gmail de exemplo pelo e-mail Google que será administrador.
insert into public.oz_allowed_emails(email)
values (lower('SEU_EMAIL@gmail.com'))
on conflict (email) do nothing;

-- Para permitir o login de outro Gmail (espaço pessoal separado, ainda não colaborativo):
-- insert into public.oz_allowed_emails(email) values (lower('colaborador@gmail.com')) on conflict do nothing;
