# Progresso do Projeto

> Detalhes de implementação ficam em `CLAUDE.md`. Aqui só etapas: feito / fazendo / a fazer.

## 🔄 Em Andamento

Nada no momento.

## 📋 Próximos Passos

### Fase 3 — Catálogo (categorias e produtos)

- [ ] (P0) CRUD completo de categorias: listar, criar, editar, reordenar (drag-and-drop), ativar/inativar
- [ ] (P0) CRUD completo de produtos: editar/listar/filtrar/publicar/despublicar, SKU, estoque, peso
- [ ] (P0) `product_images` — galeria com upload múltiplo no Storage + reordenação + imagem principal
- [ ] (P0) Filtros (status, categoria, busca textual) com view em cards no mobile / tabela no desktop
- [ ] (P1) Destaque (`is_featured`) + preço promocional com validações

## ✅ Concluído

### Fase 2 — Onboarding do lojista

- [x] (P0) Migration `20260423003719_phase2_onboarding_schema.sql`: `store_settings`, `store_delivery_config`, `store_payment_gateways`, `categories`, `products` + enums (`product_status`, `payment_provider`, `payment_gateway_status`) + triggers de bootstrap + RLS
- [x] (P0) Migration `20260423003912_phase2_rpcs_and_storage.sql`: RPCs `mark_store_configuring`, `upsert_store_payment_gateway`, `activate_store` + bucket `store-logos` com policies por `store_id`
- [x] (P0) Types TypeScript regenerados
- [x] (P0) Módulo `src/modules/onboarding/`: queries (`loadOnboardingState` com checklist), 8 server actions, stepper, step-frame, 8 forms clientes, submit-button
- [x] (P0) Rotas `src/app/(admin)/admin/onboarding/{page, loja, endereco, logo, categoria, produto, entrega, pagamento, revisao}`
- [x] (P0) Validações Zod por passo em `src/lib/validations/onboarding.ts`
- [x] (P0) Dashboard: card "Complete o onboarding" com link para próximo passo pendente quando loja não está ativa
- [x] (P0) `next.config.ts` com `images.remotePatterns` para o hostname do Supabase Storage
- [x] (P0) `CLAUDE.md` seção 13 atualizada com schema Fase 2 e decisões
- [x] (P0) ViaCEP no `AddressForm` — autopreenchimento de rua/bairro/cidade/UF ao digitar CEP, com fallback para preenchimento manual; helper em `src/lib/utils/cep.ts`
- [x] (P0) `npm run lint` e `npm run build` passando limpos
- [x] (P0) Validação manual pelo usuário: fluxo completo (criar loja → 8 passos → ativar) OK, auditoria registrada

### Fase 1 — Banco e núcleo do admin

- [x] (P0) Migrations inicial + create_store RPC
- [x] (P0) Triggers de sincronia auth.users ↔ platform_users + bootstrap de owner
- [x] (P0) Funções helper (is_platform_admin, user_has_store_access, user_is_store_owner, record_audit)
- [x] (P0) RLS + force em todas as tabelas
- [x] (P0) Types gerados + clients tipados
- [x] (P0) logAudit cabeado à RPC record_audit
- [x] (P0) Módulo stores com queries/actions + CreateStoreForm + StoreSwitcher + contexto de loja ativa
- [x] (P0) Dashboard real com StoreStatusBadge e contagem de membros
- [x] commit `2054f53`

### Fase 0 — Fundação técnica

- [x] (P0) Setup Next.js 16 + TypeScript + Tailwind v4 + ESLint + shadcn/ui
- [x] (P0) TanStack Query 5 + QueryProvider
- [x] (P0) Estrutura de pastas
- [x] (P0) Clientes Supabase via `@supabase/ssr` + proxy.ts (Next 16)
- [x] (P0) `.env.local` + `.env.example`
- [x] (P0) Design tokens mobile-first + componentes base (Container, PageHeader, EmptyState)
- [x] (P0) Autenticação funcional (login, signup, callback, logout)
- [x] (P0) Shell do admin
- [x] (P0) Logger estruturado
- [x] (P0) CI GitHub Actions (lint + build)
- [x] commit (feito pelo usuário no GitHub)
