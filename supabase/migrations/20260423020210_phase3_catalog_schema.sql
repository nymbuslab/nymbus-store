-- Fase 3 — Catálogo
-- 1) tabela product_images (galeria por produto)
-- 2) flag stock_enabled em store_settings (default true)
-- 3) unique parcial de sku por loja (permite múltiplos NULL)
-- 4) policies RLS em product_images
-- 5) RPC reorder_categories + reorder_product_images (atualização transacional de position)

-- =========================================================================
-- store_settings.stock_enabled
-- =========================================================================

alter table public.store_settings
  add column if not exists stock_enabled boolean not null default true;

comment on column public.store_settings.stock_enabled is
  'Quando false, a loja não controla estoque: pedidos aceitos sem verificar stock_qty.';

-- =========================================================================
-- products: unique parcial de sku por loja
-- =========================================================================

create unique index if not exists products_store_sku_unique
  on public.products (store_id, sku)
  where sku is not null;

-- =========================================================================
-- product_images
-- =========================================================================

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  url text not null,
  storage_path text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_images_position_nonneg check (position >= 0)
);

comment on table public.product_images is 'Galeria de imagens por produto. Position 0 = principal.';

create index product_images_product_position_idx
  on public.product_images(product_id, position);
create index product_images_store_idx on public.product_images(store_id);

-- =========================================================================
-- RLS em product_images
-- =========================================================================

alter table public.product_images enable row level security;
alter table public.product_images force row level security;

create policy product_images_member_select on public.product_images
  for select to authenticated
  using ((select public.user_has_store_access(store_id)));

create policy product_images_member_insert on public.product_images
  for insert to authenticated
  with check ((select public.user_has_store_access(store_id)));

create policy product_images_member_update on public.product_images
  for update to authenticated
  using ((select public.user_has_store_access(store_id)))
  with check ((select public.user_has_store_access(store_id)));

create policy product_images_member_delete on public.product_images
  for delete to authenticated
  using ((select public.user_has_store_access(store_id)));

-- =========================================================================
-- RPC: reorder_categories
-- =========================================================================

create or replace function public.reorder_categories(
  p_store_id uuid,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_i integer;
  v_id uuid;
begin
  if not (public.user_has_store_access(p_store_id) or public.is_platform_admin()) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  for v_i in 1 .. array_length(p_ordered_ids, 1) loop
    v_id := p_ordered_ids[v_i];
    update public.categories
       set position = v_i - 1
     where id = v_id and store_id = p_store_id;
  end loop;
end;
$$;

grant execute on function public.reorder_categories(uuid, uuid[]) to authenticated;

-- =========================================================================
-- RPC: reorder_product_images
-- =========================================================================

create or replace function public.reorder_product_images(
  p_product_id uuid,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_store_id uuid;
  v_i integer;
  v_id uuid;
begin
  select store_id into v_store_id from public.products where id = p_product_id;
  if v_store_id is null then
    raise exception 'product not found' using errcode = 'P0002';
  end if;
  if not (public.user_has_store_access(v_store_id) or public.is_platform_admin()) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  for v_i in 1 .. array_length(p_ordered_ids, 1) loop
    v_id := p_ordered_ids[v_i];
    update public.product_images
       set position = v_i - 1
     where id = v_id and product_id = p_product_id;
  end loop;

  -- Atualiza products.primary_image_url com a nova posição 0
  update public.products p
     set primary_image_url = (
       select url from public.product_images
        where product_id = p_product_id
        order by position asc
        limit 1
     )
   where p.id = p_product_id;
end;
$$;

grant execute on function public.reorder_product_images(uuid, uuid[]) to authenticated;
