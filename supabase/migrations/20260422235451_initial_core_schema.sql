-- Fase 1 — Núcleo multi-tenant
-- Tabelas: platform_users, stores, store_members, audit_logs
-- + triggers de sincronia com auth.users e bootstrap de owner em store_members
-- + funções helper (is_platform_admin, user_has_store_access, record_audit)
-- + RLS ativa em todas as tabelas

-- =========================================================================
-- ENUMS
-- =========================================================================

create type public.store_status as enum (
  'draft',        -- recém criada, onboarding não iniciado
  'configuring',  -- onboarding em andamento
  'active',       -- loja pronta para operar
  'blocked'       -- suspensa (inadimplência, violação, etc.)
);

create type public.store_member_role as enum (
  'owner',      -- dono: controla billing, equipe, tudo
  'admin',      -- admin: tudo exceto billing crítico
  'operator',   -- operação: produtos, pedidos, clientes
  'financial'   -- financeiro/atendimento: acesso parcial
);

-- =========================================================================
-- TABELAS
-- =========================================================================

-- Perfil estendido do usuário admin (1:1 com auth.users)
create table public.platform_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.platform_users is 'Perfil estendido de cada usuário admin. Criado via trigger a partir de auth.users.';
comment on column public.platform_users.is_platform_admin is 'true = equipe da Nymbus com acesso cross-tenant. false = lojista comum.';

-- Loja (tenant)
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status public.store_status not null default 'draft',
  owner_id uuid not null references public.platform_users(id) on delete restrict,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,62}[a-z0-9]$'),
  constraint stores_name_length check (char_length(name) between 2 and 120)
);

comment on table public.stores is 'Cada linha é um tenant. store_id em toda tabela operacional aponta para cá.';

-- Membership user ↔ store
create table public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  role public.store_member_role not null,
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  primary key (store_id, user_id)
);

comment on table public.store_members is 'Quem pode acessar cada loja e com qual papel. joined_at=null indica convite pendente.';

-- Auditoria (grava via RPC record_audit — não insert direto do cliente)
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.platform_users(id) on delete set null,
  store_id uuid references public.stores(id) on delete cascade,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is 'Log append-only de ações sensíveis. actor_id NULL = sistema. store_id NULL = ação cross-tenant.';

-- =========================================================================
-- ÍNDICES
-- =========================================================================

create index platform_users_platform_admin_idx on public.platform_users(is_platform_admin)
  where is_platform_admin = true;

create index stores_owner_id_idx on public.stores(owner_id);
create index stores_status_idx on public.stores(status);

create index store_members_user_id_idx on public.store_members(user_id);
create index store_members_store_role_idx on public.store_members(store_id, role);

create index audit_logs_store_created_at_idx on public.audit_logs(store_id, created_at desc);
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);

-- =========================================================================
-- HELPERS updated_at
-- =========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger platform_users_set_updated_at
  before update on public.platform_users
  for each row execute function public.set_updated_at();

create trigger stores_set_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();

-- =========================================================================
-- SYNC auth.users → platform_users
-- =========================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.platform_users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Mantém o email em platform_users sincronizado com auth.users
create or replace function public.handle_auth_user_email_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.platform_users
       set email = new.email
     where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_auth_user_email_sync();

-- =========================================================================
-- BOOTSTRAP: criador de loja vira owner em store_members automaticamente
-- =========================================================================

create or replace function public.bootstrap_store_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.store_members (store_id, user_id, role, joined_at)
  values (new.id, new.owner_id, 'owner'::public.store_member_role, now())
  on conflict (store_id, user_id) do nothing;
  return new;
end;
$$;

create trigger on_store_created_bootstrap_owner
  after insert on public.stores
  for each row execute function public.bootstrap_store_owner_membership();

-- =========================================================================
-- FUNÇÕES HELPER (SECURITY DEFINER) — usadas nas policies
-- =========================================================================

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(
    (select pu.is_platform_admin
       from public.platform_users pu
      where pu.id = (select auth.uid())),
    false
  );
$$;

comment on function public.is_platform_admin is 'true se o usuário logado é da equipe Nymbus (acesso cross-tenant).';

create or replace function public.user_has_store_access(p_store_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select public.is_platform_admin())
      or exists (
        select 1
          from public.store_members sm
         where sm.store_id = p_store_id
           and sm.user_id  = (select auth.uid())
           and sm.joined_at is not null
      );
$$;

comment on function public.user_has_store_access is 'true se o usuário logado tem membership ativa na loja ou é platform admin.';

create or replace function public.user_is_store_owner(p_store_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
      from public.stores s
     where s.id = p_store_id
       and s.owner_id = (select auth.uid())
  );
$$;

comment on function public.user_is_store_owner is 'true se o usuário logado é o dono da loja.';

-- =========================================================================
-- RPC: record_audit — rota única para o cliente gravar em audit_logs
-- =========================================================================

create or replace function public.record_audit(
  p_action text,
  p_store_id uuid default null,
  p_resource_type text default null,
  p_resource_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_id bigint;
begin
  v_actor_id := (select auth.uid());

  if p_store_id is not null
     and not (public.is_platform_admin() or public.user_has_store_access(p_store_id)) then
    raise exception 'unauthorized store access' using errcode = '42501';
  end if;

  insert into public.audit_logs (actor_id, store_id, action, resource_type, resource_id, metadata)
  values (v_actor_id, p_store_id, p_action, p_resource_type, p_resource_id, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.record_audit is 'Única rota que o cliente autenticado pode usar para gravar em audit_logs.';

grant execute on function public.record_audit(text, uuid, text, text, jsonb) to authenticated;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

-- ----- platform_users
alter table public.platform_users enable row level security;
alter table public.platform_users force row level security;

create policy platform_users_self_select on public.platform_users
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_platform_admin()));

create policy platform_users_self_update on public.platform_users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    -- impede que o usuário comum eleve o próprio privilégio
    and is_platform_admin = (
      select coalesce(pu.is_platform_admin, false)
      from public.platform_users pu
      where pu.id = (select auth.uid())
    )
  );

-- Sem policy de INSERT: inserção ocorre pelo trigger SECURITY DEFINER de auth.users.
-- Sem policy de DELETE: cascade vem de auth.users.

-- ----- stores
alter table public.stores enable row level security;
alter table public.stores force row level security;

create policy stores_member_select on public.stores
  for select to authenticated
  using ((select public.user_has_store_access(id)));

create policy stores_owner_insert on public.stores
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy stores_owner_update on public.stores
  for update to authenticated
  using (
    (select public.user_is_store_owner(id))
    or (select public.is_platform_admin())
  )
  with check (
    (select public.user_is_store_owner(id))
    or (select public.is_platform_admin())
  );

create policy stores_owner_delete on public.stores
  for delete to authenticated
  using (
    (select public.user_is_store_owner(id))
    or (select public.is_platform_admin())
  );

-- ----- store_members
alter table public.store_members enable row level security;
alter table public.store_members force row level security;

create policy store_members_store_select on public.store_members
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy store_members_owner_insert on public.store_members
  for insert to authenticated
  with check (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  );

create policy store_members_owner_update on public.store_members
  for update to authenticated
  using (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  )
  with check (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  );

create policy store_members_owner_delete on public.store_members
  for delete to authenticated
  using (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  );

-- ----- audit_logs (somente leitura do cliente; escrita via record_audit)
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

create policy audit_logs_member_select on public.audit_logs
  for select to authenticated
  using (
    (select public.is_platform_admin())
    or (store_id is not null and (select public.user_has_store_access(store_id)))
  );

-- Sem policies de INSERT/UPDATE/DELETE:
-- - INSERT só via função record_audit (security definer)
-- - UPDATE/DELETE: append-only, nunca altera via API

-- =========================================================================
-- BACKFILL: cria platform_users para auth.users já existentes
-- (o trigger só dispara em INSERTs futuros)
-- =========================================================================

insert into public.platform_users (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
from auth.users u
where u.email is not null
on conflict (id) do nothing;
