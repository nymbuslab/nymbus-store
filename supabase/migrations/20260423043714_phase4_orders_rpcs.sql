-- Fase 4 — RPCs para criação e atualização de pedidos
-- create_order: transacional, cria customer+endereço+order+items com snapshot.
-- update_order_status: muda status e grava linha em order_status_history (com nota).

-- =========================================================================
-- RPC: create_order
-- =========================================================================

create or replace function public.create_order(
  p_store_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_fulfillment_type public.order_fulfillment_type,
  p_delivery_fee_cents integer,
  p_delivery_address jsonb,
  p_items jsonb,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_customer_id uuid;
  v_order_id uuid;
  v_subtotal integer := 0;
  v_number_seq integer;
  v_item_count integer;
  v_valid_count integer;
  v_invalid_qty_count integer;
  v_existing_primary_count integer;
begin
  v_uid := (select auth.uid());
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not (public.user_has_store_access(p_store_id) or public.is_platform_admin()) then
    raise exception 'unauthorized store access' using errcode = '42501';
  end if;

  if p_customer_name is null or char_length(trim(p_customer_name)) = 0 then
    raise exception 'customer name is required' using errcode = '23502';
  end if;
  if p_customer_email is null and p_customer_phone is null then
    raise exception 'customer email or phone is required' using errcode = '23502';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'items must be an array' using errcode = '22023';
  end if;
  v_item_count := jsonb_array_length(p_items);
  if v_item_count = 0 then
    raise exception 'at least one item is required' using errcode = '22023';
  end if;

  select count(*) into v_invalid_qty_count
  from jsonb_array_elements(p_items) as i
  where (i->>'quantity')::integer <= 0;
  if v_invalid_qty_count > 0 then
    raise exception 'quantity must be positive' using errcode = '22023';
  end if;

  -- Valida que todos os products pertencem à loja
  select count(*) into v_valid_count
  from jsonb_array_elements(p_items) as i
  join public.products p on p.id = (i->>'product_id')::uuid
  where p.store_id = p_store_id;
  if v_valid_count < v_item_count then
    raise exception 'one or more products not found in this store' using errcode = 'P0002';
  end if;

  -- Fulfillment: se entrega local, precisa de endereço
  if p_fulfillment_type = 'local_delivery' then
    if p_delivery_address is null or jsonb_typeof(p_delivery_address) <> 'object' then
      raise exception 'delivery address is required for local_delivery' using errcode = '23502';
    end if;
  end if;

  -- Find or create customer
  if p_customer_email is not null then
    select id into v_customer_id
    from public.customers
    where store_id = p_store_id and lower(email) = lower(p_customer_email)
    limit 1;
  end if;

  if v_customer_id is null and p_customer_phone is not null then
    select id into v_customer_id
    from public.customers
    where store_id = p_store_id and phone = p_customer_phone
    limit 1;
  end if;

  if v_customer_id is null then
    insert into public.customers (store_id, name, email, phone)
    values (p_store_id, trim(p_customer_name), p_customer_email, p_customer_phone)
    returning id into v_customer_id;
  else
    update public.customers
       set name = trim(p_customer_name),
           email = coalesce(email, p_customer_email),
           phone = coalesce(phone, p_customer_phone),
           updated_at = now()
     where id = v_customer_id;
  end if;

  -- Se entrega local, grava endereço em customer_addresses (primary se for o primeiro)
  if p_fulfillment_type = 'local_delivery' then
    select count(*) into v_existing_primary_count
    from public.customer_addresses
    where customer_id = v_customer_id and is_primary = true;

    insert into public.customer_addresses (
      customer_id, store_id, zip_code, street, number, complement,
      neighborhood, city, state, is_primary
    ) values (
      v_customer_id,
      p_store_id,
      p_delivery_address ->> 'zip_code',
      p_delivery_address ->> 'street',
      p_delivery_address ->> 'number',
      p_delivery_address ->> 'complement',
      p_delivery_address ->> 'neighborhood',
      p_delivery_address ->> 'city',
      upper(p_delivery_address ->> 'state'),
      v_existing_primary_count = 0
    );
  end if;

  -- Calcula subtotal usando preço do produto (promo se tiver)
  select coalesce(sum(
    coalesce(p.promo_price_cents, p.price_cents) * (i->>'quantity')::integer
  ), 0) into v_subtotal
  from jsonb_array_elements(p_items) as i
  join public.products p on p.id = (i->>'product_id')::uuid
  where p.store_id = p_store_id;

  -- Próximo number_seq por loja
  select coalesce(max(number_seq), 0) + 1 into v_number_seq
  from public.orders
  where store_id = p_store_id;

  -- Cria a order (trigger grava primeira linha de history)
  insert into public.orders (
    store_id, customer_id, number_seq, status,
    fulfillment_type, source, subtotal_cents, delivery_fee_cents,
    notes, delivery_address_snapshot
  ) values (
    p_store_id,
    v_customer_id,
    v_number_seq,
    'novo',
    p_fulfillment_type,
    'manual',
    v_subtotal,
    coalesce(p_delivery_fee_cents, 0),
    p_notes,
    case when p_fulfillment_type = 'local_delivery' then p_delivery_address else null end
  )
  returning id into v_order_id;

  -- Cria order_items com snapshot
  insert into public.order_items (
    order_id, product_id, product_name_snapshot, sku_snapshot, unit_price_cents, quantity
  )
  select
    v_order_id,
    p.id,
    p.name,
    p.sku,
    coalesce(p.promo_price_cents, p.price_cents),
    (i->>'quantity')::integer
  from jsonb_array_elements(p_items) as i
  join public.products p on p.id = (i->>'product_id')::uuid
  where p.store_id = p_store_id;

  -- Auditoria
  insert into public.audit_logs (actor_id, store_id, action, resource_type, resource_id, metadata)
  values (v_uid, p_store_id, 'order.created', 'order', v_order_id::text,
    jsonb_build_object('number_seq', v_number_seq, 'total_cents', v_subtotal + coalesce(p_delivery_fee_cents, 0)));

  return v_order_id;
end;
$$;

comment on function public.create_order is 'Cria pedido em transação: customer find-or-create, endereço, order, items com snapshot e histórico inicial.';

grant execute on function public.create_order(
  uuid, text, text, text,
  public.order_fulfillment_type,
  integer, jsonb, jsonb, text
) to authenticated;

-- =========================================================================
-- RPC: update_order_status
-- =========================================================================

create or replace function public.update_order_status(
  p_order_id uuid,
  p_next_status public.order_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_store_id uuid;
  v_current_status public.order_status;
begin
  v_uid := (select auth.uid());
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select store_id, status into v_store_id, v_current_status
  from public.orders where id = p_order_id;
  if v_store_id is null then
    raise exception 'order not found' using errcode = 'P0002';
  end if;

  if not (public.user_has_store_access(v_store_id) or public.is_platform_admin()) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  if v_current_status = p_next_status then
    -- não cria duplicata; registra nota só se houver
    if p_note is not null and char_length(trim(p_note)) > 0 then
      insert into public.order_status_history (order_id, status, note, actor_id)
      values (p_order_id, p_next_status, p_note, v_uid);
    end if;
    return;
  end if;

  update public.orders
     set status = p_next_status, updated_at = now()
   where id = p_order_id;

  insert into public.order_status_history (order_id, status, note, actor_id)
  values (p_order_id, p_next_status, p_note, v_uid);

  insert into public.audit_logs (actor_id, store_id, action, resource_type, resource_id, metadata)
  values (v_uid, v_store_id,
    'order.status_changed',
    'order',
    p_order_id::text,
    jsonb_build_object('from', v_current_status, 'to', p_next_status, 'note', p_note));
end;
$$;

comment on function public.update_order_status is 'Atualiza o status do pedido e grava linha em order_status_history com a nota opcional.';

grant execute on function public.update_order_status(uuid, public.order_status, text) to authenticated;
