import type { Database } from "@/types/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderFulfillmentType =
  Database["public"]["Enums"]["order_fulfillment_type"];
export type OrderSource = Database["public"]["Enums"]["order_source"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  novo: "Novo",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_separacao: "Em separação",
  pronto_para_retirada: "Pronto para retirada",
  pronto_para_entrega: "Pronto para entrega",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  novo: "bg-muted text-muted-foreground",
  aguardando_pagamento: "bg-warning/20 text-warning-foreground",
  pago: "bg-success/20 text-success-foreground",
  em_separacao: "bg-primary/10 text-primary",
  pronto_para_retirada: "bg-primary/10 text-primary",
  pronto_para_entrega: "bg-primary/10 text-primary",
  saiu_para_entrega: "bg-primary/10 text-primary",
  entregue: "bg-success/20 text-success-foreground",
  cancelado: "bg-destructive/10 text-destructive",
};

export const FULFILLMENT_LABEL: Record<OrderFulfillmentType, string> = {
  pickup: "Retirada na loja",
  local_delivery: "Entrega local",
};

/**
 * Ordem visual e ações sugeridas por status. A regra de negócio
 * "pedido só avança para separação após pago" é só orientação na UI —
 * a validação forte virá na Fase 6 (webhooks de pagamento).
 */
export const ORDER_STATUS_SUGGESTED_NEXT: Record<
  OrderStatus,
  OrderStatus[]
> = {
  novo: ["aguardando_pagamento", "pago", "cancelado"],
  aguardando_pagamento: ["pago", "cancelado"],
  pago: ["em_separacao", "cancelado"],
  em_separacao: ["pronto_para_retirada", "pronto_para_entrega", "cancelado"],
  pronto_para_retirada: ["entregue", "cancelado"],
  pronto_para_entrega: ["saiu_para_entrega", "cancelado"],
  saiu_para_entrega: ["entregue", "cancelado"],
  entregue: [],
  cancelado: [],
};

export function formatOrderNumber(numberSeq: number): string {
  return `#${numberSeq.toString().padStart(4, "0")}`;
}

export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}
