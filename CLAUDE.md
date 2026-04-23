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
| 1 | Banco de dados, dashboard base, shell do admin | ✅ |
| 2 | Onboarding do lojista | ✅ |
| 3 | Catálogo: categorias e produtos | ✅ |
| 4 | Pedidos e clientes | ✅ |
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

### Fase 2

Tabelas adicionadas em `20260423003719_phase2_onboarding_schema.sql`:

- `store_settings` (1:1 com `stores`) — telefone, whatsapp, contact_email, endereço (CEP/rua/número/complemento/bairro/cidade/UF), política livre. Criada automaticamente pelo trigger `on_store_created_bootstrap_defaults`.
- `store_delivery_config` (1:1) — `pickup_enabled`, `local_delivery_enabled`, `delivery_radius_km`, `delivery_fee_cents`. Criada automaticamente pelo mesmo trigger. CHECK força `radius` e `fee` quando entrega local está ativa.
- `store_payment_gateways` — `provider` (enum `payment_provider`), `status` (enum `payment_gateway_status`: `pending_credentials`/`configured`/`disabled`). Unique por (store_id, provider).
- `categories` — catálogo básico (id, name, slug, position, is_active). Unique por (store_id, slug). CRUD completo fica na Fase 3.
- `products` — produto básico (name, slug, price_cents, promo_price_cents, stock_qty, weight_grams, status enum `product_status`: `draft`/`active`/`inactive`, is_featured, primary_image_url). Galeria (`product_images`) vem na Fase 3.

Enums adicionados: `product_status`, `payment_provider`, `payment_gateway_status`.

RPCs em `20260423003912_phase2_rpcs_and_storage.sql`:

- `public.mark_store_configuring(p_store_id)` — chamada implicitamente pela primeira action do onboarding; muda `status` de `draft` para `configuring`.
- `public.upsert_store_payment_gateway(p_store_id, p_provider)` — garante que cada loja tem no máximo um gateway ativo (os demais viram `disabled`).
- `public.activate_store(p_store_id)` — valida critérios (logo, contato, endereço, entrega, gateway, categoria ativa, produto publicado) e, se tudo OK, muda `status` para `active`. Retorna `jsonb { activated, missing }`.

Storage:

- Bucket público `store-logos` (limite 2 MB, PNG/JPEG/WebP). Path convencionado: `{store_id}/logo-{timestamp}.{ext}`. Policies em `storage.objects` usam `(storage.foldername(name))[1]::uuid` para derivar o `store_id` e chamam `user_has_store_access()`.

App:

- Módulo `src/modules/onboarding/`: `queries.ts` (`loadOnboardingState` com checklist), `actions.ts` (8 server actions), `components/` (stepper, step-frame, forms por passo).
- Rotas `src/app/(admin)/admin/onboarding/{page, loja, endereco, logo, categoria, produto, entrega, pagamento, revisao}`.
- Dashboard: quando a loja não está `active`, aparece card "Complete o onboarding" com link direto para o próximo passo pendente.
- `next.config.ts` registra o hostname do Supabase Storage em `images.remotePatterns` para o `<Image>` do logo.

### Fase 3

Migration `20260423020210_phase3_catalog_schema.sql`:

- **`product_images`** — galeria por produto (`id`, `product_id`, `store_id`, `url`, `storage_path`, `position`). `position=0` é a imagem principal (espelhada em `products.primary_image_url`). RLS por `user_has_store_access(store_id)`.
- **`store_settings.stock_enabled`** (boolean, default `true`) — quando `false`, a loja não controla estoque; o campo "quantidade" some do form de produto.
- **`products.sku`** — unique parcial por loja (`unique (store_id, sku) where sku is not null`). Permite múltiplos produtos sem SKU mas impede duplicatas.
- **RPCs**:
  - `public.reorder_categories(store_id, uuid[])` — atualiza `position` em lote via array ordenado. Respeita RLS via `user_has_store_access`.
  - `public.reorder_product_images(product_id, uuid[])` — idem para galeria + atualiza `products.primary_image_url` com a nova posição 0.

Migration `20260423020213_phase3_catalog_storage.sql`:

- Bucket público `product-images` (5 MB, PNG/JPEG/WebP). Path `{store_id}/{product_id}/{timestamp}-{random}.{ext}`. Policies em `storage.objects` derivam `store_id` via `(storage.foldername(name))[1]::uuid` + `user_has_store_access`.

App:

- Módulo `src/modules/catalog/categories/` — CRUD, `reorder_categories` via drag-and-drop, toggle ativo.
- Módulo `src/modules/catalog/products/` — CRUD completo + galeria. Validações Zod em `src/lib/validations/catalog.ts` (incluindo `promo_price < price`).
- Componente `src/components/shared/image-uploader.tsx` — drag-and-drop de arquivos, upload **direto do browser** para Supabase Storage (não passa por server action), preview otimista, `registerProductImageAction` grava o registro, reordenação via `@dnd-kit/sortable`.
- Módulo `src/modules/settings/` — toggle `stock_enabled` via server action.
- Rotas:
  - `/admin/catalogo/categorias` — lista + criar inline + editar + reordenar + toggle.
  - `/admin/catalogo/produtos` — lista filtrável (busca por nome/SKU, status, categoria). Cards mobile / tabela desktop.
  - `/admin/catalogo/produtos/novo` — form de criação (sem galeria — precisa do ID).
  - `/admin/catalogo/produtos/[id]` — editar + galeria + zona de perigo (excluir).
  - `/admin/configuracoes` — toggle `stock_enabled`.
- `AdminNav` atualizado: `Categorias` + `Produtos` apontando para `/admin/catalogo/*`.
- Libs novas: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

### Fase 4

Migration `20260423043712_phase4_orders_schema.sql`:

- **Enums**: `order_status` (`novo`/`aguardando_pagamento`/`pago`/`em_separacao`/`pronto_para_retirada`/`pronto_para_entrega`/`saiu_para_entrega`/`entregue`/`cancelado`), `order_fulfillment_type` (`pickup`/`local_delivery`), `order_source` (`manual`/`storefront`).
- **`customers`** — identidade do comprador por loja. CHECK exige e-mail OU telefone. Unique parcial por `(store_id, lower(email))` e `(store_id, phone)`.
- **`customer_addresses`** — endereços do cliente. Unique parcial garante **um** endereço primário por cliente.
- **`orders`** — `number_seq` sequencial por loja (exibido via `formatOrderNumber` em `src/constants/orders.ts`). `total_cents` é **generated column** (`subtotal_cents + delivery_fee_cents`). `delivery_address_snapshot` (jsonb) preserva o endereço no momento do pedido. CHECK exige snapshot quando `fulfillment_type = 'local_delivery'`.
- **`order_items`** — `product_id` nullable (`on delete set null`); `product_name_snapshot`/`sku_snapshot`/`unit_price_cents` **congelam** a informação do produto na hora da venda. `subtotal_cents` é generated column.
- **`order_status_history`** — append-only. Trigger AFTER INSERT em `orders` grava a primeira linha automaticamente.
- RLS em todas, policies `authenticated` via `user_has_store_access(store_id)`.

Migration `20260423043714_phase4_orders_rpcs.sql`:

- `public.create_order(...)` — transacional: valida acesso, faz find-or-create em `customers` por e-mail → depois telefone, grava endereço em `customer_addresses` (marca `is_primary` se for o primeiro), calcula subtotal a partir dos produtos (usa `promo_price_cents` quando presente), gera `number_seq` (max+1 por loja), insere `orders`, insere `order_items` com snapshot, grava `audit_logs`. Retorna `order.id`.
- `public.update_order_status(p_order_id, p_next_status, p_note)` — UPDATE do status + INSERT em `order_status_history` com a nota (ou só INSERT da nota se status igual). Audita em `audit_logs`.

App:

- Módulo `src/modules/orders/` — queries (`listOrders` com filtros status+período, `getOrderDetail`), actions (`createOrderAction`, `updateOrderStatusAction`, `updateOrderNotesAction`), componentes (`OrderStatusBadge`, `OrdersFilters`, `OrdersList`, `NewOrderForm` com ViaCEP, `StatusActions` com sugestão de próximo status, `NotesForm`).
- Módulo `src/modules/customers/` — `listCustomers` com agregados (`order_count`, `total_spent_cents`, `last_order_at`) e `getCustomerDetail`.
- Constants em `src/constants/orders.ts` (`ORDER_STATUS_LABEL`, `ORDER_STATUS_TONE`, `ORDER_STATUS_SUGGESTED_NEXT`, `formatOrderNumber`, `formatCents`).
- Validações Zod em `src/lib/validations/orders.ts`.
- Rotas: `/admin/pedidos`, `/admin/pedidos/novo`, `/admin/pedidos/[id]`, `/admin/clientes`, `/admin/clientes/[id]`.

Regras de negócio:

- "Pedido só avança para separação após pagamento confirmado" (PRD §15.8) — a UI **sugere** a ordem em `ORDER_STATUS_SUGGESTED_NEXT` mas **não bloqueia**. Validação forte virá na Fase 6 (webhooks de pagamento).
- Estoque **não é decrementado** ao criar pedido manual nesta fase (vem na Fase 6 junto com o checkout real).

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

### 2026-04-22 — ViaCEP no passo de endereço

Autopreenchimento de endereço no onboarding (rua/bairro/cidade/UF) usa a API pública **ViaCEP** (`https://viacep.com.br/ws/{cep}/json/`). Fetch é client-side (no `AddressForm`), sem chave, sem custo, sem rate-limit relevante. Só preenche campos **vazios** — respeita o que o usuário já digitou. Se o CEP não existe ou a API falha, o form cai para preenchimento manual sem bloquear a submissão. Helper em [`src/lib/utils/cep.ts`](src/lib/utils/cep.ts) expõe `lookupCep()`, `formatCep()`, `sanitizeCep()` — reutilizáveis em outras telas que vierem a pedir endereço (ex: endereços de cliente na Fase 4).

---

## 15. gstack — navegação web e ferramentas

### Regra obrigatória

**Toda navegação web (abrir páginas, QA, dogfood, screenshots, smoke test de deploy) deve ser feita via `/browse` do gstack.** Nunca usar as ferramentas `mcp__claude-in-chrome__*` — estão explicitamente **banidas** neste projeto.

Para UAT visual que exige navegador real com extensão/side-panel (ex: testar login OAuth com cookies reais do Chromium), usar `/open-gstack-browser`. Cookies autenticados podem ser importados para o browse headless via `/setup-browser-cookies`.

### Skills disponíveis

Slugs reais (em inglês) — a lista em português enviada pelo usuário é referência humana.

#### Navegação e QA

- `/browse` — navegação headless rápida (~100 ms/comando), screenshots anotados, diff antes/depois, teste de formulários e uploads. **Padrão para qualquer interação com URL.**
- `/open-gstack-browser` — abre Chromium controlável com sidebar visível (watch em tempo real).
- `/setup-browser-cookies` — importa cookies do Chromium real para o browse headless (autenticação).
- `/qa` — QA sistemático com correção automática (test → fix → commit → re-verify).
- `/qa-only` — QA report-only, sem tocar em código.
- `/canary` — monitor pós-deploy (console errors, regressões, screenshots periódicos).
- `/benchmark` — detecção de regressão de performance (page load, Core Web Vitals, bundle size).
- `/benchmark-models` — comparação cross-model (Claude vs GPT vs Gemini) para skills.

#### Planejamento e review

- `/office-hours` — brainstorm estilo YC (seis perguntas fundantes) antes de planejar.
- `/plan-ceo-review` — review de plano em modo CEO (expandir escopo, 10-star product).
- `/plan-eng-review` — review de plano em modo eng manager (arquitetura, edge cases).
- `/plan-design-review` — review de plano de design (0-10 por dimensão, plan mode).
- `/plan-devex-review` — review de plano de DX (personas, magical moments).
- `/design-consultation` — cria DESIGN.md com sistema de design completo.
- `/design-shotgun` — gera variantes de design para comparação.
- `/design-html` — finaliza design em HTML/CSS Pretext-native.
- `/design-review` — auditoria visual de site vivo com fix iterativo.
- `/devex-review` — auditoria ao vivo de developer experience com scorecard.
- `/review` — code review pré-merge (SQL safety, trust boundaries, side effects).
- `/autoplan` — pipeline de review automático (CEO + design + eng + DX sequenciais).
- `/codex` — second opinion via OpenAI Codex CLI (review, challenge, consult).
- `/cso` — auditoria de segurança (secrets, supply chain, OWASP, STRIDE).

#### Deploy e shipping

- `/ship` — pipeline de PR: test + review + bump VERSION + CHANGELOG + commit + push + PR.
- `/land-and-deploy` — merge do PR + espera CI + deploy + canary verify.
- `/setup-deploy` — detecta plataforma (Vercel, Fly, Render…) e configura land-and-deploy.

#### Observabilidade e saúde

- `/investigate` — debug sistemático com root cause (investigate → analyze → hypothesize → implement). **Usar sempre que o usuário reportar erro, 500, stack trace, ou "parou de funcionar".**
- `/health` — dashboard de qualidade (typecheck + lint + test + dead code) com score composto.
- `/retro` — retrospectiva engenharia com histórico e tendências.
- `/learn` — gerencia learnings (procurar, podar, exportar).
- `/document-release` — pós-ship, sincroniza docs (README, ARCHITECTURE, CHANGELOG, CLAUDE.md).
- `/make-pdf` — markdown → PDF de qualidade publicação.

#### Guardrails

- `/careful` — avisa antes de comandos destrutivos (rm -rf, DROP TABLE, force-push).
- `/freeze` — restringe edits a um diretório. **Descongela com `/unfreeze`.**
- `/guard` — modo máximo: `/careful` + `/freeze` combinados.

#### Outros

- `/gstack-upgrade` — atualiza gstack para a última versão.
- `/context-save` / `/context-restore` — checkpoint de contexto entre sessões.
- `/pair-agent` — pareia outro agente remoto com o browser local.
- `/plan-tune` — ajusta sensibilidade das perguntas AskUserQuestion do gstack.

### Deploy do Nymbus Store

Quando chegarmos na Fase 6 (webhooks de pagamento → precisa de domínio público → deploy temporário na Vercel), rodar **`/setup-deploy`** para que `/ship` e `/land-and-deploy` já saibam a configuração. Até lá, nada disso é exercido.
