import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_STORE_COOKIE } from "@/constants/stores";
import type { Database } from "@/types/database.types";

export type StoreRow = Pick<
  Database["public"]["Tables"]["stores"]["Row"],
  "id" | "name" | "slug" | "status" | "logo_url" | "owner_id" | "created_at"
>;

export async function listUserStores(): Promise<StoreRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, status, logo_url, owner_id, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar lojas: ${error.message}`);
  }
  return data ?? [];
}

export async function getActiveStore(): Promise<StoreRow | null> {
  const stores = await listUserStores();
  if (stores.length === 0) return null;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_STORE_COOKIE)?.value;
  const active = activeId ? stores.find((s) => s.id === activeId) : undefined;
  return active ?? stores[0];
}

export async function getStoreMemberCount(storeId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("store_members")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (error) {
    throw new Error(`Falha ao contar membros: ${error.message}`);
  }
  return count ?? 0;
}
