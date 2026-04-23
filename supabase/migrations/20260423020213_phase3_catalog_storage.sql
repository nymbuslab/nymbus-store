-- Fase 3 — Storage para imagens de produto
-- Bucket público product-images com policies por store_id.
-- Convenção de path: {store_id}/{product_id}/{timestamp}-{n}.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5 * 1024 * 1024, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Leitura pública do bucket
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- INSERT/UPDATE/DELETE: apenas membros da loja correspondente
-- (store_id = primeiro segmento do path)
create policy "product_images_member_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_member_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_member_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.user_has_store_access((storage.foldername(name))[1]::uuid)
  );
