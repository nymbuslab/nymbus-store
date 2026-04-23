import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name" | "slug" | "position" | "is_active" | "created_at"
>;

export async function listStoreCategories(
  storeId: string,
  options?: { onlyActive?: boolean },
): Promise<CategoryRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id, name, slug, position, is_active, created_at")
    .eq("store_id", storeId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (options?.onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar categorias: ${error.message}`);
  return data ?? [];
}
