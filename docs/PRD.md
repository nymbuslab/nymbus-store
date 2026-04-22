perfe# PRD — Plataforma SaaS de Loja Virtual (Admin First)

## 1. Visão geral

Este documento define o Product Requirements Document (PRD) da plataforma SaaS de e-commerce com foco em **pequenos e médios lojistas**, desenhada para ser **escalável**, **multi-tenant**, **mobile-first** e comercialmente viável.

A estratégia de produto será:

1. **Começar pelo painel administrativo e pela base de dados**.
2. Construir o núcleo operacional do lojista antes da vitrine pública.
3. Validar onboarding, catálogo, operação e gestão da loja.
4. Evoluir depois para a **vitrine/loja virtual** e experiência do comprador.

O objetivo é entregar primeiro o que gera capacidade operacional para o lojista: cadastrar produtos, configurar a loja, receber pedidos, acompanhar pagamentos, controlar envios e operar o negócio.

---

## 2. Objetivo do produto

Criar uma plataforma de loja virtual white-label/SaaS que permita a diferentes lojistas:

- configurar sua loja;
- cadastrar categorias e produtos;
- gerenciar clientes e pedidos;
- acompanhar pagamentos e envios;
- visualizar relatórios operacionais;
- pagar mensalidade pela plataforma;
- futuramente publicar uma vitrine online responsiva para venda direta ao consumidor.

---

## 3. Premissas estratégicas

### 3.1 Posicionamento inicial

O produto será pensado para atender principalmente:

- pequeno comércio;
- comércio local;
- operações com entrega local;
- segmentos que precisam entrar rápido no digital sem projeto sob medida.

### 3.2 Estratégia de construção

- **Admin first**: primeiro o backoffice, depois a vitrine.
- **MVP operacional**: priorizar recursos que colocam a loja no ar e permitem vender.
- **Escalabilidade por fases**: construir base técnica sólida para depois expandir catálogo, logística, checkout, marketing e automações.
- **Baixo custo operacional**: usar stack enxuta e serviços gerenciados.

### 3.3 Mobile-first obrigatório

Todo o produto deve nascer com prioridade para **uso em celular**, sem comprometer a experiência em tablets e desktops.

Isso vale para:

- painel administrativo;
- onboarding do lojista;
- formulários de cadastro;
- acompanhamento de pedidos;
- relatórios essenciais;
- configurações da loja;
- vitrine pública nas fases posteriores.

---

## 4. Escopo macro do produto

### 4.1 Dentro do escopo do produto

- Plataforma SaaS multi-tenant para lojistas.
- Painel administrativo por loja.
- Base de dados multi-tenant.
- Gestão de assinatura do lojista.
- Gestão de catálogo.
- Gestão de pedidos.
- Gestão de clientes.
- Gestão de frete local.
- Gestão de pagamento dos pedidos.
- Vitrine pública em fase posterior.

### 4.2 Fora do escopo inicial

- Marketplace multi-seller.
- ERP completo.
- Emissão fiscal.
- Programa de fidelidade.
- App mobile nativo.
- Integração com marketplaces externos.
- Tabelas de frete complexas por transportadora nacional.
- Módulo avançado de marketing e automações.
- Multiestoque e WMS avançado.

---

## 5. Perfis de usuário

### 5.1 Mundo 1 — Lojista / Operador administrativo

Usuários autenticados que administram a loja.

Perfis previstos:

- **Owner da loja**: cria a conta, configura a loja, assina a plataforma, gerencia equipe.
- **Administrador**: opera toda a loja, exceto billing crítico.
- **Operador**: gerencia produtos, pedidos, clientes e rotina operacional.
- **Financeiro/atendimento**: acesso parcial a pedidos, pagamentos e clientes.

### 5.2 Mundo 2 — Comprador / Cliente final

Usuários da vitrine pública que navegam, compram, acompanham pedidos e mantêm seus dados.

**Observação importante:**
Esses dois mundos têm autenticação, jornada, permissões e objetivos diferentes. O PRD já considera essa separação desde a modelagem de dados, mesmo que a vitrine pública seja entregue depois.

---

## 6. Stack e diretrizes técnicas

### 6.1 Stack definida

- **Frontend:** Next.js + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Data fetching / cache:** TanStack Query
- **Backend base:** Supabase (Postgres + Auth + Storage)
- **Billing da plataforma:** Stripe
- **Pagamento dos pedidos da loja:** Mercado Pago ou Pagar.me

### 6.2 Regra de pagamentos

A arquitetura deve separar claramente dois tipos de cobrança:

#### A. Cobrança da plataforma (SaaS)
- quem paga: **lojista**;
- finalidade: mensalidade da plataforma;
- gateway principal: **Stripe**.

#### B. Cobrança dos pedidos da loja
- quem paga: **cliente final da loja**;
- finalidade: compra de produtos;
- gateway inicial: **Mercado Pago ou Pagar.me**;
- meios mínimos desejáveis: **Pix, cartão e boleto**, conforme disponibilidade do gateway escolhido.

Essa separação deve existir no modelo de dados, no domínio e na UI.

---

## 7. Referência visual e estrutural

O repositório de referência enviado será utilizado como **referência visual e de organização funcional do painel**, não como base arquitetural do projeto final.

### 7.1 O que aproveitar da referência

- organização dos módulos do admin;
- hierarquia visual do dashboard;
- estrutura de navegação lateral;
- divisão por páginas funcionais;
- padrão de cards, tabelas, filtros e indicadores.

### 7.2 O que NÃO deve ser copiado como decisão técnica final

- estrutura monolítica de protótipo;
- acoplamento entre vitrine e admin sem regras claras;
- qualquer limitação própria de projeto demo/protótipo;
- decisões incompatíveis com Next.js App Router, Supabase e multi-tenant.

### 7.3 Módulos observados na referência

Os módulos que servem como base de inspiração para o admin são:

- Dashboard
- Produtos
- Pedidos
- Clientes
- Relatórios
- Envios
- Pagamentos
- Configurações

---

## 8. Princípios de UX e interface

### 8.1 Mobile-first

A interface deve ser projetada primeiro para telas pequenas.

Regras obrigatórias:

- formulários com layout vertical no mobile;
- ações principais fixas ou facilmente acessíveis por polegar;
- tabelas com fallback para cards/listas no mobile;
- filtros em drawers/sheets no mobile;
- navegação simples e previsível;
- densidade de informação controlada;
- componentes com área de toque confortável;
- feedbacks claros de salvamento, erro e carregamento.

### 8.2 Responsividade para telas maiores

Em tablet e desktop:

- expandir grids;
- usar sidebar fixa quando houver espaço;
- mostrar tabelas densas quando fizer sentido;
- aproveitar área para métricas, filtros e visão operacional.

### 8.3 Princípios de produto

- clareza operacional;
- baixa curva de aprendizado;
- foco em tarefas frequentes;
- configuração inicial assistida;
- evitar telas vazias sem orientação;
- reduzir abandono no primeiro acesso.

---

## 9. Fases de desenvolvimento

# Fase 0 — Fundação técnica e arquitetura

## Objetivo

Criar a base técnica do produto antes das funcionalidades de negócio.

## Entregas

- repositório principal do projeto;
- setup Next.js + TypeScript;
- setup Tailwind + shadcn/ui;
- setup TanStack Query;
- setup Supabase;
- ambiente dev/staging/prod;
- estrutura de pastas e convenções;
- autenticação base para lojista;
- política de multi-tenancy;
- design system base;
- componentes base reutilizáveis;
- estratégia inicial de logs e auditoria;
- CI/CD inicial.

## Critérios de aceite

- projeto sobe localmente e em ambiente hospedado;
- autenticação básica funcional;
- tenant isolado por loja;
- layout base responsivo pronto para expansão;
- padrão de componentes definido.

---

# Fase 1 — Modelagem de dados e núcleo do painel administrativo

## Objetivo

Criar o banco de dados e o núcleo operacional do admin.

## Entregas

- modelagem do banco de dados;
- migrations iniciais;
- seeds de desenvolvimento;
- RBAC básico para lojista/equipe;
- painel autenticado;
- dashboard inicial;
- estrutura de navegação do admin;
- contexto da loja selecionada;
- upload de logo e assets básicos;
- telas vazias com estados claros;
- auditoria mínima de ações sensíveis.

## Módulos desta fase

### 1. Dashboard
Exibir:
- resumo de pedidos;
- resumo de faturamento;
- clientes recentes;
- produtos com baixo estoque;
- status operacional da loja.

### 2. Estrutura base do admin
- sidebar/menu responsivo;
- header com contexto da loja;
- busca futura preparada;
- perfil do usuário;
- estado global da navegação.

## Critérios de aceite

- usuário autenticado acessa apenas sua loja;
- navegação admin funcional em mobile e desktop;
- dashboard exibe dados reais do banco;
- tenant não enxerga dados de outro tenant.

---

# Fase 2 — Onboarding do lojista e ativação da loja

## Objetivo

Garantir que o lojista consiga sair do zero até loja configurada com o menor atrito possível.

## Entregas

### Wizard de onboarding
Fluxo mínimo:
1. criar conta;
2. informar nome da loja;
3. enviar logo;
4. preencher dados básicos da loja;
5. criar primeira categoria;
6. criar primeiro produto;
7. configurar entrega;
8. configurar gateway de pagamento da loja;
9. revisar status;
10. marcar loja como pronta para ativação.

### Configurações iniciais obrigatórias
- nome da loja;
- slug/subdomínio futuro;
- telefone/WhatsApp;
- e-mail;
- endereço da loja;
- retirada na loja ativa/inativa;
- entrega local ativa/inativa;
- raio de atendimento;
- taxa de entrega;
- gateway configurado;
- política básica da loja.

## Critérios de aceite

- lojista consegue concluir onboarding pelo celular;
- sistema informa claramente pendências para ativar a loja;
- loja não pode ser publicada sem configurações mínimas.

---

# Fase 3 — Catálogo e cadastro de produtos

## Objetivo

Permitir operação real do catálogo pelo admin.

## Entregas

### Categorias
- criar, editar, ativar e inativar categorias;
- ordenação manual;
- categoria pai/filha somente se necessário em fase posterior.

### Produtos
- criar, editar, ativar e inativar produto;
- descrição;
- SKU/código interno;
- categoria;
- preço;
- preço promocional opcional;
- estoque;
- status;
- imagem principal;
- galeria simples;
- destaque;
- peso opcional para futura logística.

### Regras
- produto sem nome, preço ou categoria não pode ser publicado;
- estoque pode ser controlado ou ignorado por configuração futura;
- produto inativo não aparece na vitrine;
- imagem padrão deve existir quando não houver foto.

## Critérios de aceite

- lojista cadastra produto completo via mobile;
- listagem de produtos funciona em cards no mobile e tabela no desktop;
- filtros por status, categoria e busca textual estão disponíveis.

---

# Fase 4 — Pedidos, clientes e operação da loja

## Objetivo

Criar o coração operacional do painel.

## Entregas

### Pedidos
- listagem de pedidos;
- visualização do detalhe do pedido;
- linha do tempo de status;
- atualização manual de status por operador;
- filtros por período, status, pagamento e envio;
- observações internas.

### Status mínimos de pedido
- novo;
- aguardando pagamento;
- pago;
- em separação;
- pronto para retirada;
- pronto para entrega;
- saiu para entrega;
- entregue;
- cancelado.

### Clientes
- listagem de clientes;
- perfil do cliente;
- dados básicos;
- histórico de pedidos;
- endereço principal;
- tags futuras opcionalmente.

## Critérios de aceite

- equipe acompanha operação diária pelo painel;
- atualização de status gera histórico;
- cliente e pedido ficam vinculados corretamente.

---

# Fase 5 — Frete local e logística mínima viável

## Objetivo

Definir o modelo mínimo de entrega para destravar o checkout futuro.

## Modelo mínimo obrigatório

### 1. Retirada na loja
- lojista pode ativar/desativar;
- exibir endereço e instruções;
- pedido entra em fluxo de retirada.

### 2. Entrega local por raio
- lojista define raio de atendimento em km;
- lojista define taxa fixa de entrega;
- sistema valida se o endereço está dentro da área atendida;
- pedido fora da área não finaliza com entrega local.

## Entregas

- configuração de retirada;
- configuração de entrega local;
- registro de endereço da loja;
- cálculo básico de elegibilidade por raio;
- taxa fixa aplicada no pedido;
- status logísticos no painel.

## Critérios de aceite

- frete mínimo está funcional sem depender de transportadora externa;
- lojista consegue operar retirada e entrega local;
- checkout futuro já encontra regra definida.

---

# Fase 6 — Pagamentos da loja e conciliação operacional

## Objetivo

Preparar a plataforma para receber e acompanhar pagamentos dos pedidos.

## Entregas

### Gateway da loja
- abstração de gateway;
- suporte inicial para **Mercado Pago ou Pagar.me**;
- credenciais por loja;
- webhooks;
- atualização automática de status de pagamento.

### Estados de pagamento
- pendente;
- aprovado;
- recusado;
- cancelado;
- estornado.

### Painel de pagamentos
- listagem de pagamentos;
- status;
- pedido relacionado;
- valor;
- método de pagamento;
- timestamps;
- tentativa/retentativa quando aplicável.

## Critérios de aceite

- painel exibe status reais do gateway;
- webhook atualiza pedido com segurança;
- pagamento e pedido ficam reconciliados.

---

# Fase 7 — Relatórios e visão gerencial

## Objetivo

Entregar visão de negócio suficiente para o lojista operar e tomar decisão.

## Entregas

### Relatórios iniciais
- faturamento por período;
- quantidade de pedidos;
- ticket médio;
- clientes novos;
- produtos mais vendidos;
- produtos com baixo estoque;
- pedidos por status.

### Requisitos
- filtros por data;
- cards de KPI no mobile;
- gráficos simples;
- exportação CSV em fase posterior, se necessário.

## Critérios de aceite

- dados consistentes com pedidos e pagamentos;
- relatórios legíveis no celular;
- desktop aproveita espaço adicional sem quebrar UX.

---

# Fase 8 — Billing SaaS da plataforma

## Objetivo

Monetizar o uso da plataforma pelo lojista.

## Entregas

- planos internos da plataforma;
- assinatura do lojista;
- integração com Stripe;
- cobrança recorrente mensal;
- status da assinatura;
- bloqueio gracioso por inadimplência;
- tela de assinatura no admin;
- histórico de cobrança da plataforma;
- período de trial opcional.

## Regras

- cobrança da plataforma é separada do pagamento dos pedidos;
- owner da loja é o responsável principal pela assinatura;
- inadimplência não apaga dados;
- regra de bloqueio deve preservar acesso mínimo administrativo quando aplicável.

## Critérios de aceite

- mensalidade recorrente funcional;
- assinatura vinculada ao tenant;
- distinção entre billing SaaS e pagamentos da loja completamente clara.

---

# Fase 9 — Vitrine pública / loja virtual

## Objetivo

Publicar a experiência do comprador somente após a base administrativa estar sólida.

## Entregas

- home da loja;
- listagem de categorias;
- listagem de produtos;
- busca básica;
- página de produto;
- carrinho;
- checkout;
- autenticação opcional do comprador;
- área do cliente em fase seguinte;
- página institucional mínima.

## Dependências obrigatórias

- catálogo pronto;
- frete mínimo pronto;
- gateway de pedido pronto;
- status de loja pronto;
- configurações básicas completas.

## Critérios de aceite

- vitrine usa os dados do admin;
- mobile-first obrigatório;
- experiência do comprador não interfere no fluxo do admin.

---

## 10. MVP recomendado

O MVP comercial deve incluir até a **Fase 8**, com foco principal no admin.

### MVP fechado

- autenticação do lojista;
- multi-tenant;
- onboarding guiado;
- dashboard;
- categorias;
- produtos;
- pedidos;
- clientes;
- frete local mínimo;
- configuração de pagamento da loja;
- painel de pagamentos;
- relatórios básicos;
- assinatura SaaS do lojista.

### O que pode ficar para depois

- vitrine pública sofisticada;
- cupons;
- avaliações;
- variações complexas;
- SEO avançado;
- promoções avançadas;
- integrações externas;
- automações de marketing.

---

## 11. Requisitos funcionais

### 11.1 Autenticação e acesso

- o sistema deve permitir login seguro de lojistas e equipe;
- o sistema deve permitir convites de membros da equipe;
- o sistema deve separar permissões por função;
- o sistema deve isolar os dados por loja;
- o sistema deve suportar recuperação de senha.

### 11.2 Loja / tenant

- o sistema deve permitir criar uma loja;
- o sistema deve armazenar identidade visual e dados básicos;
- o sistema deve controlar status da loja: rascunho, configurando, ativa, bloqueada.

### 11.3 Onboarding

- o sistema deve apresentar wizard de ativação inicial;
- o sistema deve indicar pendências;
- o sistema deve impedir ativação sem critérios mínimos.

### 11.4 Catálogo

- o sistema deve permitir CRUD de categorias;
- o sistema deve permitir CRUD de produtos;
- o sistema deve permitir upload de imagens;
- o sistema deve permitir controle de status de publicação.

### 11.5 Pedidos

- o sistema deve listar pedidos;
- o sistema deve exibir detalhe do pedido;
- o sistema deve registrar histórico de status;
- o sistema deve associar pagamento e entrega ao pedido.

### 11.6 Clientes

- o sistema deve registrar clientes vinculados aos pedidos;
- o sistema deve exibir histórico de compras;
- o sistema deve armazenar endereço principal.

### 11.7 Frete

- o sistema deve suportar retirada na loja;
- o sistema deve suportar entrega por raio com taxa fixa;
- o sistema deve validar elegibilidade da entrega local.

### 11.8 Pagamentos

- o sistema deve integrar pagamento dos pedidos com gateway da loja;
- o sistema deve receber eventos via webhook;
- o sistema deve atualizar o status do pedido a partir do pagamento.

### 11.9 Billing SaaS

- o sistema deve cobrar mensalidade recorrente do lojista;
- o sistema deve armazenar histórico de cobranças da plataforma;
- o sistema deve refletir o status da assinatura no tenant.

---

## 12. Requisitos não funcionais

### 12.1 Responsividade

- toda tela deve funcionar bem em 360px+;
- toda tela deve ser usável em smartphone sem zoom;
- desktop deve oferecer ganho real de produtividade.

### 12.2 Segurança

- uso de RLS no Supabase;
- isolamento por tenant;
- proteção de rotas;
- webhooks assinados/verificados;
- registro de eventos críticos;
- cuidado com credenciais de gateways.

### 12.3 Performance

- primeira carga do painel deve ser otimizada;
- listas grandes devem prever paginação;
- imagens devem ser comprimidas;
- cache e invalidação devem ser controlados.

### 12.4 Manutenibilidade

- arquitetura modular;
- tipagem forte com TypeScript;
- componentes reutilizáveis;
- separação entre domínio, UI e integrações.

---

## 13. Estrutura funcional do painel administrativo

## 13.1 Dashboard

Objetivo: visão resumida da operação.

Widgets mínimos:
- vendas do período;
- pedidos do período;
- ticket médio;
- clientes novos;
- status de pedidos;
- produtos com estoque crítico.

## 13.2 Produtos

Objetivo: administrar o catálogo.

Tela deve ter:
- busca;
- filtros;
- cards no mobile;
- tabela no desktop;
- ação rápida de ativar/inativar;
- CTA de novo produto.

## 13.3 Pedidos

Objetivo: operar a rotina diária.

Tela deve ter:
- resumo por status;
- lista de pedidos;
- filtros rápidos;
- detalhe do pedido;
- atualização de status.

## 13.4 Clientes

Objetivo: visualizar relacionamento comercial.

Tela deve ter:
- lista de clientes;
- histórico de compras;
- ticket acumulado;
- data da última compra.

## 13.5 Envios

Objetivo: acompanhar pedidos em logística.

Tela deve ter:
- resumo por etapa logística;
- lista de pedidos em separação/entrega/retirada;
- ação de atualizar etapa.

## 13.6 Pagamentos

Objetivo: acompanhar liquidação operacional.

Tela deve ter:
- aprovados;
- pendentes;
- recusados;
- histórico por pedido;
- método de pagamento.

## 13.7 Relatórios

Objetivo: dar visão gerencial simples.

Tela deve ter:
- KPIs;
- gráficos básicos;
- ranking de produtos;
- período configurável.

## 13.8 Configurações

Objetivo: centralizar dados da loja.

Abas mínimas:
- dados da loja;
- pagamentos da loja;
- frete;
- assinatura da plataforma;
- equipe e permissões.

---

## 14. Modelagem de dados inicial (alto nível)

### Núcleo SaaS
- `platform_users`
- `stores`
- `store_members`
- `plans`
- `subscriptions`
- `subscription_invoices`

### Catálogo
- `categories`
- `products`
- `product_images`
- `inventory_items`

### Clientes
- `customers`
- `customer_addresses`

### Operação
- `orders`
- `order_items`
- `order_status_history`
- `payments`
- `payment_events`
- `shipments`
- `shipping_rules`

### Configuração
- `store_settings`
- `store_payment_gateways`
- `store_delivery_zones` (ou regra simplificada inicial por raio)
- `audit_logs`

### Observações de modelagem

- todas as entidades operacionais devem ser vinculadas à `store_id`;
- compradores e lojistas não devem compartilhar a mesma tabela de papel/permissão;
- o domínio de assinatura da plataforma deve ser separado do domínio de pedidos.

---

## 15. Regras de negócio iniciais

1. Cada loja possui seu próprio tenant lógico.
2. Um usuário administrativo pode participar de uma ou mais lojas, conforme regra futura.
3. Um cliente final pertence ao contexto comercial de uma loja.
4. Produto inativo não aparece na vitrine.
5. Loja sem onboarding mínimo concluído não pode ser publicada.
6. Entrega local só pode ser oferecida dentro do raio configurado.
7. Retirada na loja independe do raio.
8. Pedido pago pode avançar para separação.
9. Histórico de status do pedido deve ser rastreável.
10. Cobrança SaaS não deve se misturar com cobrança dos pedidos.
11. Inadimplência da assinatura pode restringir operação, mas não apagar dados.
12. Toda decisão de UI deve considerar primeiro a experiência mobile.

---

## 16. Prioridades absolutas

### Prioridade P0
- multi-tenant;
- autenticação do admin;
- modelagem do banco;
- onboarding do lojista;
- estrutura do painel;
- produtos;
- pedidos;
- frete mínimo;
- pagamentos da loja;
- billing SaaS.

### Prioridade P1
- relatórios mais completos;
- equipe e permissões refinadas;
- gestão mais rica de clientes;
- melhorias de UX e produtividade.

### Prioridade P2
- vitrine pública completa;
- login do comprador;
- área do cliente;
- recursos avançados de catálogo e marketing.

---

## 17. Critérios de sucesso do MVP

O MVP será considerado bem-sucedido quando:

- um lojista conseguir criar conta e configurar a loja sem suporte intenso;
- um lojista conseguir cadastrar categoria e produto pelo celular;
- o painel permitir operação real de pedidos;
- o sistema suportar retirada e entrega local por raio;
- o painel mostrar pagamentos dos pedidos;
- a plataforma cobrar mensalidade do lojista separadamente;
- a base técnica permitir evolução para vitrine pública sem retrabalho estrutural.

---

## 18. Roadmap resumido

### Etapa 1
Fundação técnica + modelagem + autenticação + multi-tenant.

### Etapa 2
Onboarding + configurações mínimas + dashboard base.

### Etapa 3
Catálogo de produtos + categorias + mídia.

### Etapa 4
Pedidos + clientes + operação diária.

### Etapa 5
Frete local + retirada + logística mínima.

### Etapa 6
Pagamento dos pedidos + webhooks + painel de pagamentos.

### Etapa 7
Relatórios.

### Etapa 8
Billing SaaS da plataforma.

### Etapa 9
Vitrine pública / checkout / experiência do comprador.

---

## 19. Próximo documento recomendado

Com este PRD aprovado, o próximo artefato ideal é um **plano técnico de execução**, contendo:

- arquitetura de pastas do projeto;
- modelagem SQL inicial;
- RLS do Supabase;
- fluxos de autenticação;
- fluxos de onboarding;
- backlog técnico por sprint;
- wireframes de telas críticas do admin;
- contrato inicial das entidades e APIs.

