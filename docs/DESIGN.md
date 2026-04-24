# Design System — Nymbus Store

> Fonte única da verdade para decisões visuais do admin **e** da vitrine pública.
> Sempre consulte este documento antes de qualquer decisão de UI. Não desvie sem aprovação explícita.

## 1. Contexto do produto

- **O que é:** SaaS multi-tenant de e-commerce para pequenos lojistas brasileiros (mercearia, pet shop, padaria, boutique).
- **Quem usa:** micro e pequeno comerciante, mobile-first, baixa tolerância à complexidade. Quem nunca operou um painel admin antes precisa se sentir confortável em 5 minutos.
- **Referências estéticas** (categoria): Shopify, Nuvemshop, Bling, Loja Integrada. **Anti-referências**: Linear, Notion (tom "SaaS tech para devs"), Vercel Dashboard (tom "startup-core").
- **Memorável:** profissional mas não corporativo. "Ferramenta séria que respeita o lojista". A identidade vem do roxo Nymbus sem gritar.

## 2. Theming por loja (feature crítica)

Cada loja pode escolher **sua própria cor primária e secundária** durante o onboarding. As cores Nymbus (#6344BC / #73D2E6) são o **padrão** aplicado se o lojista não customizar.

- As cores são guardadas em `store_settings.theme_primary_color` e `theme_secondary_color` (ambos TEXT, default hex Nymbus).
- Um `StoreThemeProvider` (client component) lê essas cores e aplica em `--primary` e `--secondary` no `<html>` — todos os componentes já usam essas vars via Tailwind.
- Vale tanto no admin quanto na vitrine pública (Fase 9).
- Escalas derivadas (hover, subtle, foreground sobre primary) são recalculadas em runtime via funções utilitárias (`src/lib/theme/derive.ts` — criar).

## 3. Paleta

### 3.1 Cores Nymbus (padrão do sistema)

| Token | Hex | oklch | Uso |
|---|---|---|---|
| `primary` | **#6344BC** | `oklch(0.43 0.20 295)` | Botões principais, links, ícones ativos, indicador de passo |
| `primary-foreground` | `#FFFFFF` | `oklch(1 0 0)` | Texto/ícone sobre primary |
| `secondary` | **#73D2E6** | `oklch(0.81 0.09 215)` | Hover leve, seleção, highlights, badges informativas |
| `secondary-foreground` | `#0B3A44` | `oklch(0.32 0.05 215)` | Texto sobre secondary |
| `foreground` | **#212720** | `oklch(0.22 0.01 150)` | Texto principal, bordas fortes |
| `background` | **#FFFFFF** | `oklch(1 0 0)` | Fundo |

### 3.2 Escala de neutros (derivada de #212720 — levemente esverdeada, combina com o roxo Nymbus)

| Token | Hex | Uso |
|---|---|---|
| `muted` | `#F4F5F4` | Fundo de seções secundárias, cards alternativos |
| `muted-foreground` | `#5E615E` | Texto secundário, legendas |
| `border` | `#E3E5E3` | Bordas de cards, separadores |
| `input` | `#E3E5E3` | Borda de inputs |
| `ring` | `#6344BC` | Focus ring (primary) |
| `card` | `#FFFFFF` | Fundo de cards |
| `popover` | `#FFFFFF` | Fundo de dropdowns, sheets, dialogs |
| `sidebar` | `#FAFBFA` | Fundo da sidebar do admin |
| `sidebar-accent` | `#F0E9FA` | Item ativo na sidebar (primary a 8% alpha) |
| `sidebar-accent-foreground` | `#6344BC` | Texto do item ativo |

### 3.3 Cores semânticas

| Token | Hex | Uso |
|---|---|---|
| `success` | `#16A34A` | Toasts de sucesso, badges "Ativo/Pago/Entregue" |
| `success-foreground` | `#FFFFFF` | Texto sobre success |
| `warning` | `#D97706` | Badges "Aguardando pagamento/Rascunho", avisos não-bloqueantes |
| `warning-foreground` | `#FFFFFF` | Texto sobre warning |
| `destructive` | `#DC2626` | Botões de exclusão, erros de validação, badges "Cancelado" |
| `destructive-foreground` | `#FFFFFF` | Texto sobre destructive |
| `info` | `#73D2E6` | Iguala à secondary — informativos leves |

### 3.4 Dark mode

Invertemos background e foreground, reduzimos saturação do primary em ~15% para não "gritar" no fundo escuro.

| Token | Hex (dark) |
|---|---|
| `background` | `#141814` |
| `foreground` | `#F4F5F4` |
| `primary` | `#8564D8` (primary clareado) |
| `secondary` | `#5BA8BE` (secondary escurecido) |
| `muted` | `#2E322F` |
| `border` | `#2E322F` |
| `sidebar` | `#1A1E1B` |

Toggle manual no header + respeito a `prefers-color-scheme` na primeira carga.

## 4. Tipografia

### 4.1 Stack

- **Display e Body:** **Geist Sans** (já instalado). Geométrica-humanista, excelente legibilidade mobile, suporte latin-ext (acentuação PT-BR).
- **Data/Tables:** **Geist Mono** para `tabular-nums` (preços, quantidades, datas alinhadas).
- **System fallback:** `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (caso o @font-face falhe).

**Por que Geist e não Inter/Space Grotesk:** ambas são overused ("toda startup"). Geist tem presença sem ser datada e é a padrão do scaffold Next — menos uma dependência.

### 4.2 Escala modular (base 16px, ratio 1.125 — "Major Second", adequada para densidade média)

| Token | px / rem | Uso |
|---|---|---|
| `text-xs` | 12 / 0.75 | Hints, legendas, meta |
| `text-sm` | 14 / 0.875 | Texto secundário, labels, valores em tabela |
| `text-base` | 16 / 1 | Texto padrão do body |
| `text-lg` | 18 / 1.125 | Subtítulos de card |
| `text-xl` | 20 / 1.25 | `CardTitle` (métricas, títulos de secção) |
| `text-2xl` | 24 / 1.5 | PageHeader (mobile) |
| `text-3xl` | 30 / 1.875 | PageHeader (desktop) |
| `text-4xl` | 36 / 2.25 | Hero (vitrine, Fase 9) |

Pesos usados: **400 (regular)**, **500 (medium, padrão de botões/labels)**, **600 (semibold, títulos)**, **700 (bold, apenas hero)**.

Line-height: **1.5** no body, **1.2** em títulos, **1** em stats grandes.

### 4.3 Regras

- **Nunca** usar pesos 300/200 (invisíveis em mobile).
- **Sempre** `tabular-nums` em colunas numéricas.
- Máx. 2 pesos por bloco visual.

## 5. Espaçamento e densidade

Base **4px**. Scale padrão do Tailwind. Densidade **comfortable** (nem compacta demais para mobile touch, nem esparsa demais no desktop).

| Token | rem | Uso típico |
|---|---|---|
| `1` | 4 | Gap entre ícone e label |
| `2` | 8 | Padding vertical de input |
| `3` | 12 | Padding de pill/badge |
| `4` | 16 | Gap padrão entre elementos relacionados |
| `6` | 24 | Padding interno de card |
| `8` | 32 | Gap entre seções |
| `12` | 48 | Margem de topo de PageHeader |

**Alvo de toque mobile:** 44×44 px mínimo (botões, ícones interativos). Os `size="icon"` do shadcn base-nova são 32px — precisam ser ajustados em áreas densas.

## 6. Layout

- **Grid-disciplined** no admin. Previsibilidade > criatividade. O lojista precisa saber **onde as coisas estão**.
- Max content width: `max-w-screen-xl` (1280px).
- Padding horizontal: `px-4` mobile, `px-6` tablet, `px-8` desktop.
- Cards com `rounded-md` (6px), não `rounded-lg`.

## 7. Radius, sombras, borders

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 4px | Badges, pills, inputs pequenos |
| `radius-md` | 6px | Cards, botões, inputs (padrão) |
| `radius-lg` | 10px | Sheets, drawers, dialogs |
| `radius-full` | 9999 | Avatars, toggle switches |

**Border:** 1px `border` (token). **Nunca** 2px em UI padrão.

**Sombras:**
- `shadow-sm`: cards em repouso. `0 1px 2px rgba(33, 39, 32, 0.06)`
- `shadow-md`: popovers, dropdowns. `0 4px 12px rgba(33, 39, 32, 0.08)`
- `shadow-lg`: sheets/dialogs. `0 10px 30px rgba(33, 39, 32, 0.12)`

Evitamos sombras exageradas — o padrão é **borda + background** para hierarquia.

## 8. Motion

**Minimal-functional.** Transições ajudam a compreender mudanças de estado, não decoram.

| Duração | ms | Uso |
|---|---|---|
| `micro` | 100 | Hover de botão, troca de ícone |
| `short` | 150 | Dropdown abrir, toast aparecer |
| `medium` | 250 | Sheet/drawer, dialog |
| `long` | 400 | Transição de página (quando houver) |

**Easings:**
- `ease-out` para entrada (chega desacelerando)
- `ease-in` para saída (parte acelerando)
- `ease-in-out` para movimentos (drag-and-drop, reordenação)

**Reduced motion:** respeitar `prefers-reduced-motion` — remover transforms, manter fade simples.

## 9. Componentes

### 9.1 Botões

- **Primary** (`variant="default"`): bg `primary`, text `primary-foreground`. Hover: primary 90% lightness. Foco: ring 3px `primary/50`.
- **Secondary** (`variant="secondary"`): bg `secondary/20`, text `foreground`. Hover: `secondary/30`. Para ações secundárias (Cancelar, Voltar).
- **Outline**: border `border`, bg `background`. Hover: bg `muted`.
- **Ghost**: sem bg. Hover: bg `muted`.
- **Destructive**: bg `destructive/10`, text `destructive`. Hover: `destructive/20`. (Shadcn base-nova já usa esse padrão — combina com nossa escolha.)

### 9.2 Badges

Pequenas, pill-shape (`rounded-full`), `text-xs font-medium`, padding `px-2.5 py-0.5`.

- Status de loja/produto/pedido usa a paleta semântica + variações.
- Badge "destaque" em produtos: bg `warning/20`, text `warning-foreground`.

### 9.3 Inputs

- Altura 36px (`h-9`) no desktop.
- `font-size: 16px` no mobile para **não** disparar zoom iOS (já aplicado em `globals.css`).
- Focus: border `ring`, ring 3px `ring/50`.
- Erro: `aria-invalid` → border `destructive`, ring `destructive/20`.

### 9.4 Tabelas

- Header: `bg-muted/40`, `text-xs uppercase`, `text-muted-foreground`.
- Linhas: `border-t border-border`. Hover: `bg-muted/30`.
- Densidade: `py-2 px-3`.
- **`tabular-nums`** em qualquer coluna numérica.

### 9.5 Empty states

- Ícone (lucide) grande (40px) em `text-muted-foreground`, com círculo de fundo `bg-muted`.
- Título `font-medium text-base`.
- Descrição `text-sm text-muted-foreground max-w-prose`.
- CTA opcional em `variant="default"`.

### 9.6 Toasts (Sonner)

- Position: `bottom-right` no desktop, `top-center` no mobile.
- Duração: 4s padrão, 6s para erros.
- Sucesso: ícone check, cor success, copy curto.
- Erro: ícone alert, cor destructive, copy explicativo.

## 10. Admin shell específico

### 10.1 Sidebar (desktop)

- Largura fixa 256px (`w-64`).
- Cada item: ícone lucide (16px) à esquerda + label.
- Estado ativo: `bg-sidebar-accent text-sidebar-accent-foreground` + barra vertical à esquerda de 3px em `primary`.
- Estado hover: `bg-sidebar-accent/60`.
- Divisores entre grupos (quando existirem grupos).

### 10.2 Header

- Altura fixa 56px (`h-14`).
- Logo Nymbus (SVG) à esquerda (no mobile, logo; no desktop, "Nymbus Store" wordmark).
- `StoreSwitcher` (se > 1 loja).
- Avatar do usuário + dropdown menu (perfil, tema, sair).
- Border bottom `border-border`.

### 10.3 Sheet (drawer mobile)

- Side `left`, width `w-72`.
- Mesma navegação do sidebar.
- Título "Nymbus Store" + nome da loja ativa.

## 11. Mapeamento para CSS variables

Os tokens acima entram em `src/app/globals.css` como CSS custom properties. O `StoreThemeProvider` (client) sobrescreve **apenas** `--primary` e `--secondary` com base na escolha da loja; os demais tokens são do sistema e não mudam.

```css
:root {
  --primary: oklch(0.43 0.20 295);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.81 0.09 215);
  --secondary-foreground: oklch(0.32 0.05 215);
  --foreground: oklch(0.22 0.01 150);
  --background: oklch(1 0 0);
  /* ... */
}

[data-store-theme] {
  --primary: var(--store-primary, oklch(0.43 0.20 295));
  --secondary: var(--store-secondary, oklch(0.81 0.09 215));
}
```

O provider injeta `style="--store-primary: <hex converted>; --store-secondary: <hex>;"` no `<html>`.

## 12. Aplicação nas telas já construídas (checklist)

- [ ] `globals.css` — aplicar todos os tokens da seção 3
- [ ] `AdminHeader` — logo SVG, dropdown do user, store switcher com estilo
- [ ] `AdminNav` — ícone por item, estado ativo com barra lateral + bg
- [ ] `Dashboard` — métricas com ícone, cor primary em valores importantes
- [ ] `Catálogo` — botões primary, badges coloridas por status
- [ ] `Pedidos` — linha do tempo com cor primary, status badges com paleta semântica
- [ ] `Formulários` — focus rings, erros, `aria-invalid`
- [ ] `Tabelas` — header style, hover, tabular-nums
- [ ] `Empty states` — ícones grandes coloridos, copy
- [ ] Substituir `window.confirm`/`window.alert` por toasts Sonner

## 13. Decisões e não-decisões

**Por que Geist em vez de Inter:** Inter é overused, Geist é a padrão do scaffold — reduz dependência.

**Por que não um framework de design (Radix UI direto, Arkansas, Mantine):** Shadcn base-nova (usado pelo Nymbus Store) já fornece a base sobre @base-ui/react, com trade-offs conhecidos.

**Por que theming per-store é simples (só 2 cores, não tipografia):** Fonte é decisão técnica com impacto em performance e legibilidade. Cores são decisão de marca do lojista. Separar escopo reduz surface de bug e mantém consistência visual básica.

**Por que não Design System com escolha de "aesthetic direction"** (minimalist / playful / brutalist, como a skill `/design-consultation` propõe): o público-alvo é lojista que vende queijo ou ração — não precisa de "aesthetic direction". Precisa de uma ferramenta que funciona. Um só direcionamento (profissional, clean, roxo-assinatura) é melhor que 3 opções.

## 14. Decisions Log

| Data | Decisão | Razão |
|---|---|---|
| 2026-04-23 | Sistema criado com cores Nymbus | Fase 4.5 — polimento do admin antes de seguir features operacionais |
| 2026-04-23 | Theming per-store: 2 cores apenas | Escopo mínimo que entrega identidade visual do lojista sem complicar |
| 2026-04-23 | Geist mantido como stack tipográfica | Já instalado, legibilidade mobile boa, evita dependência extra |
| 2026-04-23 | Sonner para toasts (substitui alert/confirm) | Feedback visual moderno, não-bloqueante, acessível |
