# Progresso do Projeto

> Detalhes de implementação ficam em `CLAUDE.md`. Aqui só etapas: feito / fazendo / a fazer.

## 🔄 Em Andamento

Nada no momento.

## 📋 Próximos Passos

### Fase 5 — Frete local e logística mínima viável

- [ ] (P0) Cálculo de elegibilidade por raio (precisa de coordenadas — ViaCEP pode dar via integração complementar, ou deixar manual)
- [ ] (P0) Endereço da loja validado no passo de "entrega local"
- [ ] (P1) Preparar estrutura para múltiplas modalidades de entrega no futuro

## ✅ Concluído

### Fase 4 — Pedidos, clientes e operação

- [x] (P0) Migration `20260423043712_phase4_orders_schema.sql`: enums `order_status`/`order_fulfillment_type`/`order_source`, tabelas `customers`, `customer_addresses`, `orders` (com `total_cents` generated column e CHECK de endereço), `order_items` (com snapshot), `order_status_history` (append-only), trigger AFTER INSERT em orders
- [x] (P0) Migration `20260423043714_phase4_orders_rpcs.sql`: RPCs `create_order` (transacional — customer find-or-create, endereço, snapshot, auditoria) e `update_order_status` (atualiza + grava history com nota)
- [x] (P0) RLS em todas as 5 tabelas
- [x] (P0) Types TypeScript regenerados
- [x] (P0) Constants `src/constants/orders.ts` (labels, tones, suggested next, format helpers)
- [x] (P0) Validações Zod `src/lib/validations/orders.ts`
- [x] (P0) Módulo `src/modules/orders/` (queries, actions, componentes: StatusBadge, Filters, List, NewOrderForm, StatusActions, NotesForm)
- [x] (P0) Módulo `src/modules/customers/` (queries com agregação de `order_count` e `total_spent`)
- [x] (P0) Rota `/admin/pedidos` — lista com filtros (status, período), cards mobile / tabela desktop
- [x] (P0) Rota `/admin/pedidos/novo` — form completo (cliente + itens + entrega com ViaCEP + notas + resumo)
- [x] (P0) Rota `/admin/pedidos/[id]` — detalhe com itens (snapshot), linha do tempo imutável, ações de status, observações editáveis, card de cliente e endereço
- [x] (P0) Rotas `/admin/clientes` e `/admin/clientes/[id]` — lista com agregados + perfil com histórico
- [x] (P0) `CLAUDE.md` §13 atualizado com schema Fase 4 e regras de status
- [x] (P0) `npm run lint` e `npm run build` passando limpos
- [x] (P0) Todas as rotas novas registradas no build output
- [x] (P0) Validação manual pelo usuário: criação de pedidos (retirada + entrega), linha do tempo com notas, reutilização de cliente e filtros — OK

### Fase 3 — Catálogo

- [x] (P0) Categorias, produtos, galeria drag-drop, configurações de estoque
- [x] commit `ae6bb06`

### Fase 2 — Onboarding do lojista

- [x] (P0) 8 steps + ativação + ViaCEP
- [x] commit `54e11c2`

### Fase 1 — Banco e núcleo do admin

- [x] (P0) Núcleo multi-tenant com RLS
- [x] commit `2054f53`

### Fase 0 — Fundação técnica

- [x] (P0) Setup completo (Next.js 16, Supabase, auth, CI)
- [x] commit (feito pelo usuário)
