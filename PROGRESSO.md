# Progresso do Projeto

> Detalhes de implementação ficam em `CLAUDE.md`. Aqui só etapas: feito / fazendo / a fazer.

## 🔄 Em Andamento

Nada no momento.

## 📋 Próximos Passos

### Fase 0 — Fundação técnica (pendentes)

- [ ] (P1) Design system base (tokens, tipografia escala mobile-first, cores semânticas)
- [ ] (P1) CI/CD inicial (GitHub Actions rodando build + lint em PR)

### Fase 1 — Banco e núcleo do admin

- [ ] (P0) Migration inicial `001_initial.sql` com tabelas do núcleo (stores, platform_users, store_members)
- [ ] (P0) RLS + funções `user_has_store_access()` e `is_platform_admin()`
- [ ] (P0) Gerar types do banco (`npx supabase gen types typescript --linked > src/types/database.types.ts`)
- [ ] (P1) Shell do admin (sidebar/header responsivos, contexto da loja)
- [ ] (P1) Dashboard inicial com widgets mínimos

## ✅ Concluído

- [x] (P0) Inicializar repositório git (branch `master`)
- [x] (P0) `supabase init` (config.toml) e link com o projeto `phtjzvkwrbwkablqyyzn`
- [x] (P0) Setup Next.js 16.2.4 (App Router) + TypeScript + Tailwind v4 + ESLint + Turbopack
- [x] (P0) shadcn/ui inicializado (preset base-nova, base color neutral)
- [x] (P0) TanStack Query 5 + devtools + `QueryProvider` plugado no layout raiz
- [x] (P0) Estrutura de pastas conforme seção 5 do `CLAUDE.md` (modules/, lib/, hooks/, types/, constants/, app/(admin), app/(store), app/api/webhooks)
- [x] (P0) Clientes Supabase via `@supabase/ssr`: `lib/supabase/{client,server,session}.ts`
- [x] (P0) `src/proxy.ts` (Next 16) refresh de sessão + guard de `/admin/*` → redireciona a `/login?redirectTo=...`
- [x] (P0) `.env.local` com credenciais Supabase + `.env.example` com todos os nomes (Stripe, MP/Pagar.me inclusos)
- [x] (P0) `.gitignore` ajustado (`.env*` ignorado, `!.env.example` rastreado)
- [x] (P0) `next.config.ts` com `turbopack.root` explícito (elimina warning de lockfile fantasma)
- [x] (P0) `CLAUDE.md` atualizado: seção de env vars, infra Supabase (project ref), comandos via `npx supabase`, nota sobre Next 16 `proxy.ts`
- [x] (P0) `npm run build` passando limpo (Compiled successfully, sem warnings)
