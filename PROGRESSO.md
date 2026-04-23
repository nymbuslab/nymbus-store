# Progresso do Projeto

> Detalhes de implementação ficam em `CLAUDE.md`. Aqui só etapas: feito / fazendo / a fazer.

## 🔄 Em Andamento

Nada no momento.

## 📋 Próximos Passos

### Fase 4 — Pedidos, clientes e operação da loja

- [ ] (P0) Modelagem `orders`, `order_items` (snapshot de nome/sku/preço), `order_status_history`, `customers`, `customer_addresses`
- [ ] (P0) Enum de status (novo/aguardando pagamento/pago/em separação/pronto para retirada/pronto para entrega/saiu para entrega/entregue/cancelado)
- [ ] (P0) Admin: lista de pedidos com filtros (período, status, pagamento, envio), detalhe com linha do tempo de status, observações internas
- [ ] (P0) Admin: lista de clientes + perfil + histórico de compras + endereço principal
- [ ] (P0) Atualização manual de status gera linha em `order_status_history`

## ✅ Concluído

### Fase 3 — Catálogo (categorias e produtos)

- [x] (P0) Migration `20260423020210_phase3_catalog_schema.sql`: `product_images`, `stock_enabled`, unique parcial de SKU por loja, RPCs `reorder_categories` e `reorder_product_images`
- [x] (P0) Migration `20260423020213_phase3_catalog_storage.sql`: bucket `product-images` (5 MB, PNG/JPEG/WebP) com policies por `store_id`
- [x] (P0) Types regenerados
- [x] (P0) Libs `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` instaladas
- [x] (P0) Módulo `src/modules/catalog/categories/`: queries, actions (create/update/toggle/delete/reorder), `CategoriesManager` client com drag-and-drop
- [x] (P0) `/admin/catalogo/categorias` — lista + criar inline + editar + reordenar + toggle ativo
- [x] (P0) Módulo `src/modules/catalog/products/`: queries (listProducts com filtros, getProductDetail), actions (CRUD + toggleStatus + registerImage + deleteImage + reorderImages), `ProductForm`, `ProductsList`, `ProductsListFilters`, `DeleteProductButton`
- [x] (P0) `src/components/shared/image-uploader.tsx`: drag-and-drop, upload direto ao Storage (sem passar por server action), preview otimista, reordenação via `@dnd-kit`, respeita limite de 8 imagens/produto
- [x] (P0) `/admin/catalogo/produtos` — lista com busca (nome/SKU), filtro por status e categoria, cards mobile / tabela desktop
- [x] (P0) `/admin/catalogo/produtos/novo` — form de criação
- [x] (P0) `/admin/catalogo/produtos/[id]` — editar + galeria + zona de perigo
- [x] (P0) `/admin/configuracoes` — toggle `stock_enabled` com descrição de impacto
- [x] (P0) `AdminNav` atualizado: Dashboard / Categorias / Produtos / Pedidos / Clientes / Envios / Pagamentos / Relatórios / Configurações
- [x] (P0) CLAUDE.md §13 com schema Fase 3 e convenções
- [x] (P0) `npm run lint` e `npm run build` passando limpos
- [x] (P0) Smoke test: rotas /admin/catalogo/* e /admin/configuracoes redirecionam corretamente sem sessão (proxy guard OK)
- [x] (P0) Validação manual pelo usuário: fluxo completo aprovado (categorias, produtos, galeria drag-drop, filtros, toggle de estoque)

### Fase 2 — Onboarding do lojista

- [x] (P0) Migrations `phase2_onboarding_schema` + `phase2_rpcs_and_storage`
- [x] (P0) Módulo `src/modules/onboarding/` com 8 steps + review/activate
- [x] (P0) Dashboard card de onboarding pendente + next.config images
- [x] (P0) ViaCEP no AddressForm
- [x] commit `54e11c2`

### Fase 1 — Banco e núcleo do admin

- [x] (P0) Núcleo multi-tenant com RLS + create_store RPC
- [x] (P0) Types gerados + clients tipados
- [x] (P0) logAudit → record_audit RPC
- [x] (P0) Dashboard real + StoreSwitcher
- [x] commit `2054f53`

### Fase 0 — Fundação técnica

- [x] (P0) Setup Next.js 16 + TS + Tailwind v4 + shadcn/ui
- [x] (P0) TanStack Query + QueryProvider
- [x] (P0) Clientes Supabase via `@supabase/ssr` + proxy.ts
- [x] (P0) Autenticação funcional (login, signup, callback, logout)
- [x] (P0) Shell do admin + componentes base
- [x] (P0) CI GitHub Actions (lint + build)
- [x] commit (feito pelo usuário no GitHub)
