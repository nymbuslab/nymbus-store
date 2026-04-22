# Progresso do Projeto

> Detalhes de implementação ficam em `CLAUDE.md`. Aqui só etapas: feito / fazendo / a fazer.

## 🔄 Em Andamento

### Fase 0 — validação manual pendente

- [ ] (P0) Teste end-to-end de auth pelo usuário: criar conta em `/signup` → confirmar e-mail (se exigido pelo Supabase) → entrar em `/login` → acessar `/admin` → botão "Sair"

## 📋 Próximos Passos

### Fase 1 — Banco e núcleo do admin

- [ ] (P0) Migration `001_initial.sql` — núcleo multi-tenant (`stores`, `platform_users`, `store_members`, `audit_logs`)
- [ ] (P0) RLS ativa + funções `user_has_store_access()` e `is_platform_admin()`
- [ ] (P0) Cabear `logAudit()` à tabela `audit_logs` (substitui stub do `src/lib/logger.ts`)
- [ ] (P0) Gerar types (`npx supabase gen types typescript --linked > src/types/database.types.ts`)
- [ ] (P1) Contexto da loja selecionada + seletor de loja (para usuário com mais de uma)
- [ ] (P1) Dashboard com widgets mínimos (pedidos, faturamento, clientes recentes)

## ✅ Concluído

### Fase 0 — Fundação técnica

- [x] (P0) Inicializar repositório git (branch `master`) — commit no GitHub feito pelo usuário
- [x] (P0) `supabase init` (config.toml) e link com o projeto `phtjzvkwrbwkablqyyzn`
- [x] (P0) Setup Next.js 16.2.4 (App Router) + TypeScript + Tailwind v4 + ESLint + Turbopack
- [x] (P0) shadcn/ui inicializado (preset base-nova, base color neutral) + componentes: button, input, label, card, sheet, separator
- [x] (P0) TanStack Query 5 + devtools + `QueryProvider` plugado no layout raiz
- [x] (P0) Estrutura de pastas conforme seção 5 do `CLAUDE.md`
- [x] (P0) Clientes Supabase via `@supabase/ssr`: `lib/supabase/{client,server,session}.ts`
- [x] (P0) `src/proxy.ts` (Next 16) — refresh de sessão + guard de `/admin/*`
- [x] (P0) `.env.local` com credenciais Supabase + `.env.example` com todos os nomes
- [x] (P0) `.gitignore` ajustado (`.env*` ignorado, `!.env.example` rastreado)
- [x] (P0) `next.config.ts` com `turbopack.root` explícito
- [x] (P0) Design tokens: cores semânticas `success`/`warning` adicionadas (dark+light), base styles mobile-first (font 16px em inputs para evitar zoom iOS)
- [x] (P0) Componentes base reutilizáveis: `Container`, `PageHeader`, `EmptyState` em `src/components/shared/`
- [x] (P0) Autenticação funcional: rotas `/login`, `/signup`, `/signup/check-email`, `/auth-error`, route handler `/auth/callback` (PKCE), server actions `loginAction`/`signupAction`/`signoutAction` com validação Zod
- [x] (P0) Shell do admin: `(admin)/admin/layout.tsx` com `AdminHeader` (drawer no mobile via Sheet, fixa no desktop) + `AdminNav` (8 módulos do PRD) + botão "Sair"
- [x] (P0) Home `/` redireciona conforme auth (→ `/admin` logado, → `/login` anônimo)
- [x] (P0) `src/lib/logger.ts` com logger estruturado + stub `logAudit()` pronto para ser cabeado à tabela `audit_logs` na Fase 1
- [x] (P0) CI: `.github/workflows/ci.yml` rodando `lint` + `build` em push/PR contra `master`
- [x] (P0) `CLAUDE.md` atualizado: env vars, infra Supabase, comandos via `npx supabase`, decisões de arquitetura (deploy postergado para Fase 6, multi-tenancy Fase 0 vs Fase 1)
- [x] (P0) `npm run lint` e `npm run build` passando limpos
- [x] (P0) Smoke test das rotas: formulários renderizando, redirects de auth funcionando (proxy guard OK)
