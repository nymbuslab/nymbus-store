-- RPC create_store: encapsula o INSERT em stores dentro de uma função
-- security definer, evita problemas de resolução de auth.uid() no WITH CHECK
-- do INSERT via PostgREST e garante que platform_users exista (resiliente a
-- usuários criados antes do trigger on_auth_user_created).

create or replace function public.create_store(
  p_name text,
  p_slug text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_email text;
  v_store_id uuid;
begin
  v_uid := (select auth.uid());
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  -- Garante perfil para satisfazer o FK de stores.owner_id
  if not exists (select 1 from public.platform_users where id = v_uid) then
    select email into v_email from auth.users where id = v_uid;
    if v_email is null then
      raise exception 'user has no email' using errcode = '22023';
    end if;
    insert into public.platform_users (id, email, full_name)
    values (v_uid, v_email, split_part(v_email, '@', 1))
    on conflict (id) do nothing;
  end if;

  insert into public.stores (name, slug, owner_id, status)
  values (p_name, p_slug, v_uid, 'draft'::public.store_status)
  returning id into v_store_id;

  return v_store_id;
end;
$$;

comment on function public.create_store is 'Cria uma loja em nome do usuário autenticado. Retorna o id.';

grant execute on function public.create_store(text, text) to authenticated;
