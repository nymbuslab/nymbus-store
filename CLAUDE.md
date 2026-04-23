# CLAUDE.md — Plataforma SaaS de E-commerce

> Este arquivo é lido automaticamente pelo Claude Code antes de qualquer tarefa.
> Siga todas as instruções aqui antes de escrever qualquer código.

---

## 1. LEITURA OBRIGATÓRIA ANTES DE COMEÇAR

Leia os documentos nesta ordem antes de qualquer implementação:

1. `docs/PRD.md` → requisitos funcionais e fases de entrega

---

## 2. VISÃO DO PRODUTO

Plataforma **SaaS multi-tenant de e-commerce** para pequenos lojistas.

- Lojistas pagam mensalidade para usar a plataforma
- Cada lojista tem sua própria loja virtual com painel administrativo
- Estratégia **admin first**: painel vem antes da vitrine pública
- Tudo **mobile-first**: construir para tela pequena primeiro

---

## 3. STACK OBRIGATÓRIA

```
Next.js 16 (App Router) + TypeScript
Tailwind CSS + shadcn/ui
TanStack Query
Supabase (Postgres + Auth + Storage + RLS)
Stripe → cobrança da mensalidade do lojista
Mercado Pago ou Pagar.me → pagamento dos pedidos da loja
```

**Nunca misturar:** Stripe é só para billing SaaS. Mercado Pago/Pagar.me é só para pedidos da loja.

---

## 4. REGRAS DE DESENVOLVIMENTO

### Multi-tenant
- Toda tabela operacional tem `store_id`
- RLS ativa em todas as tabelas do Supabase
- Nunca buscar dados sem filtrar por `store_id`
- Usar as funções `user_has_store_access()` e `is_platform_admin()` já definidas no banco

### Autenticação
- Lojistas e compradores são dois mundos separados com fluxos diferentes
- Supabase Auth para ambos
- Proteger todas as rotas de `/admin/*` com middleware

### Pagamentos
- **Stripe** → apenas assinatura mensal do lojista (billing SaaS)
- **Mercado Pago / Pagar.me** → apenas checkout dos pedidos da loja
- Webhooks sempre server-side com service role, nunca no client
- Idempotência obrigatória em todos os webhooks

### Banco de dados
- Nunca alterar ENUMs existentes sem criar migration
- Snapshots obrigatórios em `order_items` (nome, sku, preço no momento da compra)
- Soft-delete apenas onde documentado; preferir campo `status`
- Auditoria em ações críticas via `audit_logs`

---

## 5. ESTRUTURA DE PASTAS

```
src/
  app/
    (admin)/admin/          # painel administrativo
    (store)/[storeSlug]/    # vitrine pública (fase posterior)
    api/webhooks/           # stripe, mercadopago, pagarme
  components/
    ui/                     # shadcn/ui base
    admin/                  # componentes do painel
    store/                  # componentes da vitrine
    shared/                 # compartilhados
  modules/
    auth/
    admin/
      dashboard/
      products/
      categories/
      orders/
      customers/
      reports/
      shipping/
      billing/
      settings/
      onboarding/
    storefront/             # fase posterior
  lib/
    supabase/client.ts
    supabase/server.ts
    supabase/session.ts       # helper updateSession consumido pelo proxy.ts
    query/query-client.ts
    query/keys.ts
    validations/
    utils/
    formatters/
  types/
  hooks/
  constants/
  proxy.ts                    # Next 16 usa "proxy" (antes chamado middleware)

supabase/
  migrations/
    001_initial.sql
```

---

## 6. FASES DE DESENVOLVIMENTO

| Fase | Descrição | Status |
|------|-----------|--------|
| 0 | Fundação técnica: setup, auth, multi-tenant, design system | ✅ |
| 1 | Banco de dados, dashboard base, shell do admin | ⏳ |
| 2 | Onboarding do lojista | ⏳ |
| 3 | Catálogo: categorias e produtos | ⏳ |
| 4 | Pedidos e clientes | ⏳ |
| 5 | Frete local e logística mínima | ⏳ |
| 6 | Pagamentos dos pedidos (MP/Pagar.me) | ⏳ |
| 7 | Relatórios | ⏳ |
| 8 | Billing SaaS (Stripe) | ⏳ |
| 9 | Vitrine pública e checkout | ⏳ |

**Implemente sempre em ordem. Não pule fases.**

---

## 7. REGRAS DE NEGÓCIO CRÍTICAS

1. Loja `status = draft` não pode receber pedidos
2. Produto `status = inactive` não aparece na vitrine
3. Onboarding incompleto bloqueia ativação da loja
4. Entrega local só é oferecida dentro do raio configurado
5. Retirada na loja não depende do raio
6. Pedido só avança para separação após pagamento confirmado
7. Histórico de status de pedido é imutável
8. Inadimplência da assinatura suspende a loja mas não apaga dados
9. Billing SaaS nunca se mistura com pagamentos de pedidos
10. Todo dado operacional deve carregar `store_id`

---

## 8. O QUE NÃO ENTRA NO MVP

Não implemente os itens abaixo sem instrução explícita:

- integração com marketplaces externos
- emissão fiscal / NF-e
- variações complexas de produto
- multiestoque / WMS
- programa de fidelidade / pontos
- automações de marketing
- app mobile nativo
- múltiplos planos de assinatura
- cupons (fase posterior)
- PostGIS / geofencing avançado

---

## 9. CONVENÇÕES RÁPIDAS

```ts
// Componentes: PascalCase
export function ProductCard() {}

// Hooks: use + camelCase
export function useOrders() {}

// Server Actions: em /actions, nunca em componentes
// Query keys: sempre via lib/query/keys.ts
// Validação: Zod em tudo
// Nunca usar: any, as unknown, eslint-disable
```

---

## 10. COMANDOS DO PROJETO

Supabase CLI é usado via `npx` (não instalado globalmente).

```bash
# Desenvolvimento
npm run dev
npm run build
npm run lint

# Supabase local (opcional — só se precisar rodar Postgres local via Docker)
npx supabase start
npx supabase db reset

# Migrations → rodam direto no projeto REMOTO já linkado
npx supabase migration new nome_da_migration
npx supabase db push

# Tipos do banco a partir do projeto remoto
npx supabase gen types typescript --linked > src/types/database.types.ts
```

---

## 11. VARIÁVEIS DE AMBIENTE

`.env.local` na raiz do projeto (ignorado pelo git). Os nomes estão em `.env.example`. **Nunca** commitar valores.

- `NEXT_PUBLIC_SUPABASE_URL` — URL pública do projeto Supabase (usada no client e server)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anon pública (usada no client e server)
- `SUPABASE_SERVICE_ROLE_KEY` — chave admin, **apenas server-side** (webhooks, scripts, nunca exposta ao browser)
- `STRIPE_SECRET_KEY` — secret do Stripe para billing SaaS
- `STRIPE_WEBHOOK_SECRET` — assinatura dos webhooks do Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — chave pública do Stripe (client)
- `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_WEBHOOK_SECRET` — gateway de pedidos (se MP)
- `PAGARME_API_KEY` / `PAGARME_WEBHOOK_SECRET` — gateway de pedidos (se Pagar.me)

---

## 12. INFRAESTRUTURA SUPABASE

- **Project ref:** `phtjzvkwrbwkablqyyzn`
- **URL:** `https://phtjzvkwrbwkablqyyzn.supabase.co`
- O projeto já está linkado via `npx supabase link` (arquivo `supabase/.temp/` presente)
- Todo `db push` / `migration` é feito via CLI diretamente contra o projeto remoto
- Clientes em [`src/lib/supabase/`](src/lib/supabase/): `client.ts` (browser), `server.ts` (RSC/actions/route handlers) e `session.ts` (refresh de sessão + guard de `/admin/*`, consumido pelo [`src/proxy.ts`](src/proxy.ts))
- **Next 16** usa `proxy.ts` (com `export function proxy()`) no lugar do antigo `middleware.ts` — veja [`src/proxy.ts`](src/proxy.ts)

---

## 13. SCHEMA DO BANCO (Fase 1)

Migration inicial: `supabase/migrations/20260422235451_initial_core_schema.sql`.

Tabelas do núcleo multi-tenant:

- `platform_users` — perfil estendido (1:1 com `auth.users`, criado via trigger). `is_platform_admin=true` = equipe Nymbus com acesso cross-tenant.
- `stores` — o tenant. Colunas: `id`, `slug` (único, validado por regex), `name`, `status` (`draft`/`configuring`/`active`/`blocked`), `owner_id`, `logo_url`, timestamps.
- `store_members` — M:N user↔store com `role` (`owner`/`admin`/`operator`/`financial`). Ao criar uma loja, o dono é inserido automaticamente aqui (trigger `bootstrap_store_owner_membership`).
- `audit_logs` — append-only. Gravação **só** via RPC `record_audit` (security definer).

Funções helper (todas `security definer`, `search_path = ''`, usadas nas policies):

- `public.is_platform_admin()` — true se `auth.uid()` tem `is_platform_admin=true`.
- `public.user_has_store_access(uuid)` — true se é platform admin **ou** tem membership com `joined_at` não nulo.
- `public.user_is_store_owner(uuid)` — true se `auth.uid() = stores.owner_id`.
- `public.record_audit(p_action, p_store_id, p_resource_type, p_resource_id, p_metadata)` — única rota autorizada para o cliente gravar auditoria. Valida acesso à loja antes de inserir.
- `public.create_store(p_name, p_slug)` — cria uma loja em nome do usuário autenticado. Retorna o `id` da loja criada. Substitui o INSERT direto (evita atrito com RLS no WITH CHECK via PostgREST) e garante `platform_users` (caso borda de usuário antigo sem linha de perfil).

Triggers:

- `on_auth_user_created` (após insert em `auth.users`) → cria linha em `platform_users`.
- `on_auth_user_email_updated` → mantém `platform_users.email` sincronizado.
- `on_store_created_bootstrap_owner` → insere o owner em `store_members` com role `owner` e `joined_at=now()`.
- `platform_users_set_updated_at` / `stores_set_updated_at` → mantém `updated_at`.

Convenções:

- Todas as tabelas usam UUID (`gen_random_uuid()`) como PK, exceto `audit_logs` que usa `bigint identity` (append-only de alto volume).
- FKs sempre indexadas.
- RLS ligada + `force row level security` em todas as tabelas. Policies só para `authenticated`.
- Chamadas a `auth.uid()` dentro de policies sempre envolvidas em `(select auth.uid())` para cache por query (performance).
- Tipos TypeScript são gerados do banco remoto: `npx supabase gen types typescript --linked > src/types/database.types.ts`. Clientes em `src/lib/supabase/*` usam `createXxxClient<Database>()`.

Contexto da loja ativa:

- Cookie httpOnly `nymbus-active-store` (constante em `src/constants/stores.ts`).
- Helpers em `src/modules/stores/queries.ts`: `listUserStores()`, `getActiveStore()`, `getStoreMemberCount()`.
- Actions em `src/modules/stores/actions.ts`: `createStoreAction` (chama RPC `create_store`), `setActiveStoreAction`.
- `StoreSwitcher` no header aparece só se o user tem > 1 loja.

---

## 14. DECISÕES DE ARQUITETURA

Decisões importantes tomadas durante o desenvolvimento. Sempre adicionar aqui quando uma escolha relevante for feita, com a data.

### 2026-04-22 — Deploy postergado para a Fase 6

O PRD pede "ambiente hospedado" ainda na Fase 0, mas o projeto **vai ficar só em `localhost`** até a Fase 6 (pagamentos dos pedidos). Motivo: só precisa de domínio público quando for configurar webhooks do Mercado Pago / Pagar.me. Deploy provisório será na Vercel, temporário para testes de integração. Até lá, CI roda só `lint` + `build` no GitHub Actions — sem preview.

### 2026-04-22 — Política de multi-tenancy (Fase 0) vs. schema com RLS (Fase 1)

- **Fase 0** entrega a **política** de multi-tenancy: convenções (`store_id` em toda tabela operacional), guard de rota (`src/proxy.ts`), estrutura de pastas por módulo, separação visual admin/storefront, e isolamento de clientes Supabase por contexto (browser/server/proxy).
- **Fase 1** entrega a **implementação**: tabelas com RLS ativa, funções `user_has_store_access()` / `is_platform_admin()`, e a tabela `audit_logs` com o helper `logAudit()` cabeado a ela.
- Na Fase 0 o `lib/logger.ts` existe como stub (console + placeholder `logAudit()` que só loga) para que a Fase 1 possa apenas **plugar** a gravação em `audit_logs` sem precisar tocar em chamadas já espalhadas pelo código.
