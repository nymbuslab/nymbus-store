-- Fase 2 — Onboarding do lojista
-- Tabelas: store_settings (1:1), store_delivery_config (1:1),
--          store_payment_gateways, categories, products
-- + triggers de bootstrap de settings/delivery quando loja é criada
-- + RLS em todas as tabelas (policies por user_has_store_access)

-- =========================================================================
-- ENUMS
-- =========================================================================

create type public.product_status as enum (
  'draft',     -- ainda sendo criado
  'active',    -- publicado, aparece na vitrine
  'inactive'   -- ocultado sem excluir
);

create type public.payment_provider as enum (
  'mercadopago',
  'pagarme'
);

create type public.payment_gateway_status as enum (
  'pending_credentials',  -- provider escolhido, credenciais não configuradas
  'configured',           -- credenciais válidas (Fase 6)
  'disabled'              -- desligado manualmente
);

-- =========================================================================
-- TABELAS
-- =========================================================================

-- Configurações gerais da loja (1:1)
create table public.store_settings (
  store_id uuid primary key references public.stores(id) on delete cascade,
  phone text,
  whatsapp text,
  contact_email text,
  address_zip_code text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state char(2),
  policy text,
  updated_at timestamptz not null default now(),
  constraint store_settings_state_format check (
    address_state is null or address_state ~ '^[A-Z]{2}$'
  ),
  constraint store_settings_zip_format check (
    address_zip_code is null or address_zip_code ~ '^[0-9]{5}-?[0-9]{3}$'
  )
);

comment on table public.store_settings is 'Configurações gerais + endereço da loja. 1:1 com stores, criada via trigger.';

-- Configuração de entrega (1:1)
create table public.store_delivery_config (
  store_id uuid primary key references public.stores(id) on delete cascade,
  pickup_enabled boolean not null default false,
  local_delivery_enabled boolean not null default false,
  delivery_radius_km numeric(5,1),
  delivery_fee_cents integer,
  updated_at timestamptz not null default now(),
  constraint delivery_radius_positive check (
    delivery_radius_km is null or delivery_radius_km > 0
  ),
  constraint delivery_fee_nonneg check (
    delivery_fee_cents is null or delivery_fee_cents >= 0
  ),
  constraint delivery_local_requires_radius_and_fee check (
    local_delivery_enabled = false
    or (delivery_radius_km is not null and delivery_fee_cents is not null)
  )
);

comment on table public.store_delivery_config is 'Retirada e entrega local por raio+taxa. 1:1 com stores, criada via trigger.';

-- Gateway de pagamento da loja (dos pedidos — NÃO confundir com billing SaaS)
create table public.store_payment_gateways (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  provider public.payment_provider not null,
  status public.payment_gateway_status not null default 'pending_credentials',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, provider)
);

comment on table public.store_payment_gateways is 'Gateway da loja (MP/Pagar.me). Credenciais reais vêm na Fase 6.';

-- Categorias do catálogo
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug),
  constraint categories_name_length check (char_length(name) between 1 and 120)
);

comment on table public.categories is 'Categorias do catálogo. CRUD completo na Fase 3.';

-- Produtos
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  sku text,
  price_cents integer not null,
  promo_price_cents integer,
  stock_qty integer,
  weight_grams integer,
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  primary_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug),
  constraint products_name_length check (char_length(name) between 1 and 200),
  constraint products_price_nonneg check (price_cents >= 0),
  constraint products_promo_nonneg check (promo_price_cents is null or promo_price_cents >= 0),
  constraint products_promo_less_than_price check (
    promo_price_cents is null or promo_price_cents < price_cents
  ),
  constraint products_stock_nonneg check (stock_qty is null or stock_qty >= 0),
  constraint products_weight_nonneg check (weight_grams is null or weight_grams >= 0)
);

comment on table public.products is 'Produtos da loja. Galeria completa (product_images) chega na Fase 3.';

-- =========================================================================
-- ÍNDICES
-- =========================================================================

create index store_payment_gateways_store_idx on public.store_payment_gateways(store_id);

create index categories_store_position_idx on public.categories(store_id, position);
create index categories_store_active_idx on public.categories(store_id) where is_active = true;

create index products_store_status_idx on public.products(store_id, status);
create index products_store_category_idx on public.products(store_id, category_id);
create index products_store_featured_idx on public.products(store_id) where is_featured = true;

-- =========================================================================
-- TRIGGERS updated_at
-- =========================================================================

create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

create trigger store_delivery_config_set_updated_at
  before update on public.store_delivery_config
  for each row execute function public.set_updated_at();

create trigger store_payment_gateways_set_updated_at
  before update on public.store_payment_gateways
  for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =========================================================================
-- BOOTSTRAP: ao criar loja, cria store_settings + store_delivery_config
-- =========================================================================

create or replace function public.bootstrap_store_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.store_settings (store_id) values (new.id)
  on conflict (store_id) do nothing;

  insert into public.store_delivery_config (store_id) values (new.id)
  on conflict (store_id) do nothing;

  return new;
end;
$$;

create trigger on_store_created_bootstrap_defaults
  after insert on public.stores
  for each row execute function public.bootstrap_store_defaults();

-- Backfill para lojas já existentes
insert into public.store_settings (store_id)
select id from public.stores
on conflict (store_id) do nothing;

insert into public.store_delivery_config (store_id)
select id from public.stores
on conflict (store_id) do nothing;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

-- Policy padrão "membros podem tudo na própria loja".
-- Operações críticas (activate_store, upload de logo) usam RPC/Storage policies.

-- ----- store_settings
alter table public.store_settings enable row level security;
alter table public.store_settings force row level security;

create policy store_settings_member_select on public.store_settings
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy store_settings_member_update on public.store_settings
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

-- INSERT/DELETE só via trigger (bootstrap) e cascade de stores.

-- ----- store_delivery_config
alter table public.store_delivery_config enable row level security;
alter table public.store_delivery_config force row level security;

create policy store_delivery_config_member_select on public.store_delivery_config
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy store_delivery_config_member_update on public.store_delivery_config
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

-- ----- store_payment_gateways
alter table public.store_payment_gateways enable row level security;
alter table public.store_payment_gateways force row level security;

create policy store_payment_gateways_member_select on public.store_payment_gateways
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy store_payment_gateways_owner_insert on public.store_payment_gateways
  for insert to authenticated
  with check (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  );

create policy store_payment_gateways_owner_update on public.store_payment_gateways
  for update to authenticated
  using (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  )
  with check (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  );

create policy store_payment_gateways_owner_delete on public.store_payment_gateways
  for delete to authenticated
  using (
    (select public.user_is_store_owner(store_id))
    or (select public.is_platform_admin())
  );

-- ----- categories
alter table public.categories enable row level security;
alter table public.categories force row level security;

create policy categories_member_select on public.categories
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy categories_member_insert on public.categories
  for insert to authenticated
  with check ((select public.user_has_store_access(store_id)));

create policy categories_member_update on public.categories
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

create policy categories_member_delete on public.categories
  for delete to authenticated
  using ((select public.user_has_store_access(store_id)));

-- ----- products
alter table public.products enable row level security;
alter table public.products force row level security;

create policy products_member_select on public.products
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy products_member_insert on public.products
  for insert to authenticated
  with check ((select public.user_has_store_access(store_id)));

create policy products_member_update on public.products
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

create policy products_member_delete on public.products
  for delete to authenticated
  using ((select public.user_has_store_access(store_id)));
