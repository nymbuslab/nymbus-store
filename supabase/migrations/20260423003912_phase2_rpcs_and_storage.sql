-- Fase 2 — RPCs + Storage para onboarding

-- =========================================================================
-- RPC: mark_store_configuring — move loja de draft → configuring
-- (chamada implicitamente pela primeira action do onboarding)
-- =========================================================================

create or replace function public.mark_store_configuring(p_store_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (public.user_has_store_access(p_store_id) or public.is_platform_admin()) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  update public.stores
     set status = 'configuring'::public.store_status
   where id = p_store_id
     and status = 'draft'::public.store_status;
end;
$$;

grant execute on function public.mark_store_configuring(uuid) to authenticated;

-- =========================================================================
-- RPC: upsert_store_payment_gateway — garante um único gateway ativo
-- =========================================================================

create or replace function public.upsert_store_payment_gateway(
  p_store_id uuid,
  p_provider public.payment_provider
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_gateway_id uuid;
begin
  v_uid := (select auth.uid());
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not (public.user_is_store_owner(p_store_id) or public.is_platform_admin()) then
    raise exception 'only the owner can set payment gateway' using errcode = '42501';
  end if;

  -- Desabilita outros gateways (só um ativo por loja)
  update public.store_payment_gateways
     set status = 'disabled'::public.payment_gateway_status,
         updated_at = now()
   where store_id = p_store_id
     and provider <> p_provider;

  -- Upsert do gateway escolhido
  insert into public.store_payment_gateways (store_id, provider, status)
  values (p_store_id, p_provider, 'pending_credentials')
  on conflict (store_id, provider)
    do update set
      status = 'pending_credentials',
      updated_at = now()
  returning id into v_gateway_id;

  return v_gateway_id;
end;
$$;

grant execute on function public.upsert_store_payment_gateway(uuid, public.payment_provider) to authenticated;

-- =========================================================================
-- RPC: activate_store — valida critérios mínimos e ativa a loja
-- Retorna jsonb { activated: bool, missing: [{key, label}] }
-- =========================================================================

create or replace function public.activate_store(p_store_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_store record;
  v_settings record;
  v_delivery record;
  v_has_gateway boolean;
  v_has_category boolean;
  v_has_product boolean;
  v_missing jsonb := '[]'::jsonb;
begin
  v_uid := (select auth.uid());
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not (public.user_is_store_owner(p_store_id) or public.is_platform_admin()) then
    raise exception 'only the owner can activate the store' using errcode = '42501';
  end if;

  select * into v_store from public.stores where id = p_store_id;
  if v_store is null then
    raise exception 'store not found' using errcode = 'P0002';
  end if;

  select * into v_settings from public.store_settings where store_id = p_store_id;
  select * into v_delivery from public.store_delivery_config where store_id = p_store_id;

  if v_store.logo_url is null then
    v_missing := v_missing || jsonb_build_object('key', 'store_logo', 'label', 'Logo da loja');
  end if;
  if v_settings.contact_email is null or v_settings.contact_email = '' then
    v_missing := v_missing || jsonb_build_object('key', 'contact_email', 'label', 'E-mail de contato');
  end if;
  if v_settings.phone is null and v_settings.whatsapp is null then
    v_missing := v_missing || jsonb_build_object('key', 'phone_or_whatsapp', 'label', 'Telefone ou WhatsApp');
  end if;
  if v_settings.address_city is null or v_settings.address_state is null then
    v_missing := v_missing || jsonb_build_object('key', 'address', 'label', 'Endereço (cidade e UF)');
  end if;

  if not (coalesce(v_delivery.pickup_enabled, false) or coalesce(v_delivery.local_delivery_enabled, false)) then
    v_missing := v_missing || jsonb_build_object('key', 'delivery', 'label', 'Habilitar retirada ou entrega local');
  end if;

  select exists(
    select 1 from public.store_payment_gateways
    where store_id = p_store_id
      and status <> 'disabled'::public.payment_gateway_status
  ) into v_has_gateway;
  if not v_has_gateway then
    v_missing := v_missing || jsonb_build_object('key', 'payment_gateway', 'label', 'Selecionar gateway de pagamento');
  end if;

  select exists(
    select 1 from public.categories
    where store_id = p_store_id and is_active = true
  ) into v_has_category;
  if not v_has_category then
    v_missing := v_missing || jsonb_build_object('key', 'category', 'label', 'Pelo menos uma categoria ativa');
  end if;

  select exists(
    select 1 from public.products
    where store_id = p_store_id and status = 'active'::public.product_status
  ) into v_has_product;
  if not v_has_product then
    v_missing := v_missing || jsonb_build_object('key', 'product', 'label', 'Pelo menos um produto publicado');
  end if;

  if jsonb_array_length(v_missing) > 0 then
    return jsonb_build_object('activated', false, 'missing', v_missing);
  end if;

  update public.stores
     set status = 'active'::public.store_status
   where id = p_store_id;

  insert into public.audit_logs (actor_id, store_id, action, resource_type, resource_id)
  values (v_uid, p_store_id, 'store.activated', 'store', p_store_id::text);

  return jsonb_build_object('activated', true, 'missing', '[]'::jsonb);
end;
$$;

grant execute on function public.activate_store(uuid) to authenticated;

-- =========================================================================
-- STORAGE: bucket `store-logos` + policies por store_id no path
-- Convenção de path: {store_id}/logo.{ext}
-- =========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-logos',
  'store-logos',
  true,
  2097152,  -- 2 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Leitura pública (bucket público, para logos aparecerem em vitrine futura)
create policy "store_logos_public_read"
  on storage.objects for select
  using (bucket_id = 'store-logos');

create policy "store_logos_member_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'store-logos'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  );

create policy "store_logos_member_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'store-logos'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'store-logos'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  );

create policy "store_logos_member_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'store-logos'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  );
