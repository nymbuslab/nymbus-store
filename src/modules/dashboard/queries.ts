import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  activeProducts: number;
  ordersLast30Days: number;
  revenueCentsLast30Days: number;
  customersCount: number;
};

const FULFILLED_STATUSES = [
  "pago",
  "em_separacao",
  "pronto_para_retirada",
  "pronto_para_entrega",
  "saiu_para_entrega",
  "entregue",
] as const;

export async function getDashboardMetrics(storeId: string): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [productsRes, ordersRes, revenueRes, customersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "active"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("orders")
      .select("total_cents")
      .eq("store_id", storeId)
      .gte("created_at", thirtyDaysAgo)
      .in("status", [...FULFILLED_STATUSES]),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId),
  ]);

  const revenueCents = (revenueRes.data ?? []).reduce(
    (sum, o) => sum + (o.total_cents ?? 0),
    0,
  );

  return {
    activeProducts: productsRes.count ?? 0,
    ordersLast30Days: ordersRes.count ?? 0,
    revenueCentsLast30Days: revenueCents,
    customersCount: customersRes.count ?? 0,
  };
}
