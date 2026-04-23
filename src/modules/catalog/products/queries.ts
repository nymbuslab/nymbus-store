import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type ProductStatus = Database["public"]["Enums"]["product_status"];

export type ProductListItem = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  | "id"
  | "name"
  | "slug"
  | "price_cents"
  | "promo_price_cents"
  | "stock_qty"
  | "status"
  | "is_featured"
  | "primary_image_url"
  | "created_at"
> & {
  category: { id: string; name: string } | null;
};

export type ProductDetail = Database["public"]["Tables"]["products"]["Row"] & {
  category: { id: string; name: string } | null;
  images: { id: string; url: string; storage_path: string | null; position: number }[];
};

export type ProductListFilters = {
  search?: string;
  status?: ProductStatus | "all";
  categoryId?: string | "all";
};

export async function listProducts(
  storeId: string,
  filters: ProductListFilters = {},
): Promise<ProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price_cents, promo_price_cents, stock_qty, status, is_featured, primary_image_url, created_at, category:categories(id, name)",
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.categoryId && filters.categoryId !== "all") {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},sku.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar produtos: ${error.message}`);
  return (data ?? []) as ProductListItem[];
}

export async function getProductDetail(
  storeId: string,
  productId: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name), images:product_images(id, url, storage_path, position)",
    )
    .eq("store_id", storeId)
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar produto: ${error.message}`);
  if (!data) return null;

  const detail = data as ProductDetail;
  detail.images = [...detail.images].sort((a, b) => a.position - b.position);
  return detail;
}
