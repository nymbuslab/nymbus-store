import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderFulfillmentType =
  Database["public"]["Enums"]["order_fulfillment_type"];

export type OrderListItem = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  | "id"
  | "number_seq"
  | "status"
  | "fulfillment_type"
  | "subtotal_cents"
  | "delivery_fee_cents"
  | "total_cents"
  | "created_at"
> & {
  customer: { id: string; name: string } | null;
  item_count: number;
};

export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatusHistoryRow =
  Database["public"]["Tables"]["order_status_history"]["Row"];

export type OrderDetail = Database["public"]["Tables"]["orders"]["Row"] & {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
};

export type OrderListFilters = {
  status?: OrderStatus | "all";
  fromDate?: string; // ISO date (YYYY-MM-DD)
  toDate?: string;
};

export async function listOrders(
  storeId: string,
  filters: OrderListFilters = {},
): Promise<OrderListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, number_seq, status, fulfillment_type, subtotal_cents, delivery_fee_cents, total_cents, created_at, customer:customers(id, name), items:order_items(id)",
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.fromDate) {
    query = query.gte("created_at", `${filters.fromDate}T00:00:00`);
  }
  if (filters.toDate) {
    query = query.lte("created_at", `${filters.toDate}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar pedidos: ${error.message}`);
  return (data ?? []).map((o) => ({
    id: o.id,
    number_seq: o.number_seq,
    status: o.status,
    fulfillment_type: o.fulfillment_type,
    subtotal_cents: o.subtotal_cents,
    delivery_fee_cents: o.delivery_fee_cents,
    total_cents: o.total_cents,
    created_at: o.created_at,
    customer: o.customer,
    item_count: Array.isArray(o.items) ? o.items.length : 0,
  }));
}

export async function getOrderDetail(
  storeId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, customer:customers(id, name, email, phone), items:order_items(*), history:order_status_history(*)",
    )
    .eq("store_id", storeId)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar pedido: ${error.message}`);
  if (!data) return null;

  const detail = data as OrderDetail;
  detail.items = [...detail.items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  detail.history = [...detail.history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return detail;
}
