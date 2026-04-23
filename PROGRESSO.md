# Progresso do Projeto

> Detalhes de implementação ficam em `CLAUDE.md`. Aqui só etapas: feito / fazendo / a fazer.

## 🔄 Em Andamento

Nada no momento.

## 📋 Próximos Passos

### Fase 2 — Onboarding do lojista

- [ ] (P0) Wizard de onboarding multi-step: nome/slug, logo upload, dados básicos, primeira categoria, primeiro produto, entrega, pagamento, ativação
- [ ] (P0) Configurações iniciais obrigatórias: nome, slug/subdomínio, telefone/WhatsApp, email, endereço, retirada, entrega local, raio, taxa, política
- [ ] (P0) Supabase Storage: bucket `store-logos` com policy por `store_id` + upload de logo na UI
- [ ] (P0) Travamento: loja `draft` não pode ser ativada sem critérios mínimos
- [ ] (P1) Exibição de pendências na dashboard até a ativação
- [ ] (P1) Convidar membros (store_members com `joined_at=null`)

## ✅ Concluído

### Fase 1 — Banco e núcleo do admin

- [x] (P0) Migration `20260422235451_initial_core_schema.sql`: enums (`store_status`, `store_member_role`), tabelas (`platform_users`, `stores`, `store_members`, `audit_logs`)
- [x] (P0) Triggers: `on_auth_user_created`, `on_auth_user_email_updated`, `on_store_created_bootstrap_owner`, `set_updated_at`
- [x] (P0) Funções helper security definer: `is_platform_admin()`, `user_has_store_access(uuid)`, `user_is_store_owner(uuid)`, `record_audit(...)`
- [x] (P0) RLS ativa + `force row level security` em todas as 4 tabelas; policies para `authenticated` com `(select auth.uid())` para cache
- [x] (P0) Backfill: usuários pré-existentes receberam linha em `platform_users`
- [x] (P0) Índices em FKs e colunas de filtro
- [x] (P0) Migration `20260423001656_add_create_store_rpc.sql`: RPC `create_store()` para contornar RLS no INSERT direto via PostgREST e garantir perfil (idempotente)
- [x] (P0) Migrations aplicadas no projeto remoto `phtjzvkwrbwkablqyyzn` via `npx supabase db push`
- [x] (P0) Types TypeScript gerados: `src/types/database.types.ts`
- [x] (P0) Clientes Supabase em `src/lib/supabase/*` tipados com `<Database>`
- [x] (P0) `logAudit()` cabeado à RPC `record_audit` — falha não derruba ação do usuário
- [x] (P0) Módulo `src/modules/stores/`: `queries.ts`, `actions.ts` (usa RPC `create_store`), validações Zod, componentes `CreateStoreForm` e `StoreSwitcher`
- [x] (P0) Contexto da loja ativa via cookie httpOnly `nymbus-active-store` + constantes/labels em `src/constants/stores.ts`
- [x] (P0) `slugify()` + geração de slug único com sufixo incremental
- [x] (P0) Dashboard real: CreateStoreForm se sem lojas, senão exibe nome/slug, `StoreStatusBadge`, contagem de membros e placeholders para Fases 3/4/6
- [x] (P0) `AdminHeader` renderiza `StoreSwitcher` quando > 1 loja
- [x] (P0) `CLAUDE.md` seção 13 "SCHEMA DO BANCO" com tabelas, funções, triggers, convenções e contexto de loja ativa
- [x] (P0) `npm run lint` e `npm run build` passando limpos
- [x] (P0) Smoke test automatizado: rotas públicas 200, `/` e `/admin` redirecionam sem sessão
- [x] (P0) Validação manual pelo usuário: criação de loja funciona end-to-end (registros em `stores`, `store_members` com `owner` + `joined_at`, e `audit_logs` com `store.created`)

### Fase 0 — Fundação técnica

- [x] (P0) Inicializar repositório git (branch `master`) — commit no GitHub feito pelo usuário
- [x] (P0) `supabase init` (config.toml) e link com o projeto `phtjzvkwrbwkablqyyzn`
- [x] (P0) Setup Next.js 16.2.4 (App Router) + TypeScript + Tailwind v4 + ESLint + Turbopack
- [x] (P0) shadcn/ui inicializado (preset base-nova, base color neutral) + componentes: button, input, label, card, sheet, separator
- [x] (P0) TanStack Query 5 + devtools + `QueryProvider` plugado no layout raiz
- [x] (P0) Estrutura de pastas conforme seção 5 do `CLAUDE.md`
- [x] (P0) Clientes Supabase via `@supabase/ssr`: `lib/supabase/{client,server,session}.ts`
- [x] (P0) `src/proxy.ts` (Next 16) — refresh de sessão + guard de `/admin/*`
- [x] (P0) `.env.local` com credenciais Supabase + `.env.example`
- [x] (P0) `.gitignore` ajustado
- [x] (P0) `next.config.ts` com `turbopack.root` explícito
- [x] (P0) Design tokens: cores semânticas `success`/`warning`, base styles mobile-first
- [x] (P0) Componentes base reutilizáveis: `Container`, `PageHeader`, `EmptyState`
- [x] (P0) Autenticação funcional: `/login`, `/signup`, `/signup/check-email`, `/auth-error`, `/auth/callback`, actions completas
- [x] (P0) Shell do admin: layout com `AdminHeader` + `AdminNav`
- [x] (P0) Home `/` redireciona conforme auth
- [x] (P0) `src/lib/logger.ts` estruturado
- [x] (P0) CI: `.github/workflows/ci.yml` (lint + build)
- [x] (P0) Validação manual end-to-end de auth aprovada pelo usuário
