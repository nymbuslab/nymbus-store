-- Fase 4 — Pedidos, clientes e operação
-- Tabelas: customers, customer_addresses, orders, order_items, order_status_history
-- Enums: order_status, order_fulfillment_type, order_source
-- + índices + RLS + trigger de história ao criar pedido

-- =========================================================================
-- ENUMS
-- =========================================================================

create type public.order_status as enum (
  'novo',
  'aguardando_pagamento',
  'pago',
  'em_separacao',
  'pronto_para_retirada',
  'pronto_para_entrega',
  'saiu_para_entrega',
  'entregue',
  'cancelado'
);

create type public.order_fulfillment_type as enum ('pickup', 'local_delivery');

create type public.order_source as enum ('manual', 'storefront');

-- =========================================================================
-- customers
-- =========================================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_name_length check (char_length(name) between 1 and 200),
  constraint customers_contact check (email is not null or phone is not null)
);

comment on table public.customers is 'Compradores de cada loja. Criados automaticamente ao registrar o primeiro pedido.';

create index customers_store_idx on public.customers(store_id);
create unique index customers_store_email_unique
  on public.customers(store_id, lower(email))
  where email is not null;
create unique index customers_store_phone_unique
  on public.customers(store_id, phone)
  where phone is not null;

-- =========================================================================
-- customer_addresses
-- =========================================================================

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  label text,
  zip_code text,
  street text not null,
  number text not null,
  complement text,
  neighborhood text,
  city text not null,
  state char(2) not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customer_addresses_customer_idx on public.customer_addresses(customer_id);
create index customer_addresses_store_idx on public.customer_addresses(store_id);
create unique index customer_addresses_primary_unique
  on public.customer_addresses(customer_id)
  where is_primary = true;

-- =========================================================================
-- orders
-- =========================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  number_seq integer not null,
  status public.order_status not null default 'novo',
  fulfillment_type public.order_fulfillment_type not null,
  source public.order_source not null default 'manual',
  subtotal_cents integer not null,
  delivery_fee_cents integer not null default 0,
  total_cents integer generated always as (subtotal_cents + delivery_fee_cents) stored,
  notes text,
  delivery_address_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_subtotal_nonneg check (subtotal_cents >= 0),
  constraint orders_fee_nonneg check (delivery_fee_cents >= 0),
  constraint orders_delivery_has_address check (
    fulfillment_type = 'pickup' or delivery_address_snapshot is not null
  )
);

comment on table public.orders is 'Pedidos da loja. number_seq é sequencial por loja, exibido como #0001.';
comment on column public.orders.delivery_address_snapshot is 'Cópia do endereço de entrega no momento do pedido (preservada mesmo se o cliente editar o endereço depois).';

create unique index orders_store_number_unique on public.orders(store_id, number_seq);
create index orders_store_created_idx on public.orders(store_id, created_at desc);
create index orders_store_status_idx on public.orders(store_id, status);
create index orders_customer_idx on public.orders(customer_id);

-- =========================================================================
-- order_items
-- =========================================================================

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  sku_snapshot text,
  unit_price_cents integer not null,
  quantity integer not null,
  subtotal_cents integer generated always as (unit_price_cents * quantity) stored,
  created_at timestamptz not null default now(),
  constraint order_items_qty_positive check (quantity > 0),
  constraint order_items_price_nonneg check (unit_price_cents >= 0)
);

comment on column public.order_items.product_name_snapshot is 'Nome do produto no momento da venda. Preserva histórico mesmo se o produto for editado ou deletado.';

create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

-- =========================================================================
-- order_status_history
-- =========================================================================

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  actor_id uuid references public.platform_users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.order_status_history is 'Append-only. Cada mudança de status do pedido gera uma linha. Atualizações diretas são proibidas.';

create index order_status_history_order_idx on public.order_status_history(order_id, created_at);

-- =========================================================================
-- updated_at triggers
-- =========================================================================

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger customer_addresses_set_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Trigger: ao inserir order, grava primeira linha do histórico
-- =========================================================================

create or replace function public.record_order_initial_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.order_status_history (order_id, status, actor_id)
  values (new.id, new.status, (select auth.uid()));
  return new;
end;
$$;

create trigger orders_initial_status_history
  after insert on public.orders
  for each row execute function public.record_order_initial_status();

-- =========================================================================
-- RLS
-- =========================================================================

-- customers
alter table public.customers enable row level security;
alter table public.customers force row level security;

create policy customers_member_select on public.customers
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy customers_member_insert on public.customers
  for insert to authenticated
  with check ((select public.user_has_store_access(store_id)));

create policy customers_member_update on public.customers
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

create policy customers_member_delete on public.customers
  for delete to authenticated
  using ((select public.user_has_store_access(store_id)));

-- customer_addresses
alter table public.customer_addresses enable row level security;
alter table public.customer_addresses force row level security;

create policy customer_addresses_member_select on public.customer_addresses
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy customer_addresses_member_insert on public.customer_addresses
  for insert to authenticated
  with check ((select public.user_has_store_access(store_id)));

create policy customer_addresses_member_update on public.customer_addresses
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

create policy customer_addresses_member_delete on public.customer_addresses
  for delete to authenticated
  using ((select public.user_has_store_access(store_id)));

-- orders
alter table public.orders enable row level security;
alter table public.orders force row level security;

create policy orders_member_select on public.orders
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

-- INSERT só via RPC create_order (security definer). Sem policy aqui.
-- UPDATE: permitido para campos operacionais (notes). Para status, usar RPC update_order_status.
create policy orders_member_update on public.orders
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

create policy orders_member_delete on public.orders
  for delete to authenticated
  using ((select public.user_has_store_access(store_id)));

-- order_items — leitura para membros; escrita só via RPC create_order
alter table public.order_items enable row level security;
alter table public.order_items force row level security;

create policy order_items_member_select on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (select public.user_has_store_access(o.store_id))
    )
  );

-- order_status_history — leitura para membros; escrita só via trigger/RPC
alter table public.order_status_history enable row level security;
alter table public.order_status_history force row level security;

create policy order_status_history_member_select on public.order_status_history
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (select public.user_has_store_access(o.store_id))
    )
  );
