import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type CustomerListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  order_count: number;
  last_order_at: string | null;
  total_spent_cents: number;
};

export type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerAddressRow =
  Database["public"]["Tables"]["customer_addresses"]["Row"];

export type CustomerDetail = {
  customer: CustomerRow;
  primary_address: CustomerAddressRow | null;
  orders: {
    id: string;
    number_seq: number;
    status: Database["public"]["Enums"]["order_status"];
    total_cents: number;
    created_at: string;
  }[];
};

export async function listCustomers(
  storeId: string,
  filters: { search?: string } = {},
): Promise<CustomerListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select(
      "id, name, email, phone, created_at, orders(id, total_cents, created_at)",
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar clientes: ${error.message}`);

  return (data ?? []).map((c) => {
    const orders = Array.isArray(c.orders) ? c.orders : [];
    const totalSpent = orders.reduce((sum, o) => sum + (o.total_cents ?? 0), 0);
    const lastOrderAt = orders.length
      ? orders
          .map((o) => o.created_at)
          .sort()
          .reverse()[0]
      : null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      created_at: c.created_at,
      order_count: orders.length,
      last_order_at: lastOrderAt,
      total_spent_cents: totalSpent,
    };
  });
}

export async function getCustomerDetail(
  storeId: string,
  customerId: string,
): Promise<CustomerDetail | null> {
  const supabase = await createClient();

  const [customerRes, addressRes, ordersRes] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("store_id", storeId)
      .eq("id", customerId)
      .maybeSingle(),
    supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customerId)
      .eq("is_primary", true)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id, number_seq, status, total_cents, created_at")
      .eq("store_id", storeId)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (customerRes.error) {
    throw new Error(`Falha ao carregar cliente: ${customerRes.error.message}`);
  }
  if (!customerRes.data) return null;

  return {
    customer: customerRes.data,
    primary_address: addressRes.data ?? null,
    orders: (ordersRes.data ?? []).map((o) => ({
      id: o.id,
      number_seq: o.number_seq,
      status: o.status,
      total_cents: o.total_cents ?? 0,
      created_at: o.created_at,
    })),
  };
}
