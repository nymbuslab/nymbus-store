"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/catalog";
import { getActiveStore } from "@/modules/stores/queries";
import { slugify } from "@/lib/utils/slugify";
import { logAudit } from "@/lib/logger";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      | "category_id"
      | "name"
      | "slug"
      | "description"
      | "sku"
      | "price"
      | "promo_price"
      | "stock_qty"
      | "weight_grams"
      | "status",
      string
    >
  >;
  productId?: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireActiveStore(): Promise<{
  supabase: SupabaseServerClient;
  storeId: string;
}> {
  const supabase = await createClient();
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  return { supabase, storeId: store.id };
}

async function generateUniqueProductSlug(
  supabase: SupabaseServerClient,
  storeId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const safe = base || "produto";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? safe : `${safe}-${i + 1}`;
    let query = supabase
      .from("products")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${safe}-${Date.now()}`;
}

function toCents(value: string): number {
  const normalized = value.replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

function parsePayload(formData: FormData) {
  return productSchema.safeParse({
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    sku: formData.get("sku") ?? "",
    price: formData.get("price"),
    promo_price: formData.get("promo_price") ?? "",
    stock_qty: formData.get("stock_qty") ?? "",
    weight_grams: formData.get("weight_grams") ?? "",
    status: formData.get("status") ?? "draft",
    is_featured: formData.get("is_featured") === "on",
  });
}

function collectErrors(
  issues: readonly {
    readonly path: readonly PropertyKey[];
    readonly message: string;
  }[],
): ProductActionState["fieldErrors"] {
  const allowed = [
    "category_id",
    "name",
    "slug",
    "description",
    "sku",
    "price",
    "promo_price",
    "stock_qty",
    "weight_grams",
    "status",
  ] as const;
  const fieldErrors: ProductActionState["fieldErrors"] = {};
  for (const issue of issues) {
    const k = issue.path[0];
    if (typeof k === "string" && (allowed as readonly string[]).includes(k)) {
      (fieldErrors as Record<string, string>)[k] ??= issue.message;
    }
  }
  return fieldErrors;
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parsePayload(formData);
  if (!parsed.success) {
    return { fieldErrors: collectErrors(parsed.error.issues) };
  }

  const { supabase, storeId } = await requireActiveStore();

  const slugBase = parsed.data.slug
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.name);
  const slug = await generateUniqueProductSlug(supabase, storeId, slugBase);

  const priceCents = toCents(parsed.data.price);
  if (priceCents <= 0) return { fieldErrors: { price: "Preço deve ser maior que zero" } };
  const promoCents = parsed.data.promo_price ? toCents(parsed.data.promo_price) : null;

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      sku: parsed.data.sku || null,
      price_cents: priceCents,
      promo_price_cents: promoCents,
      stock_qty: parsed.data.stock_qty ? Number(parsed.data.stock_qty) : null,
      weight_grams: parsed.data.weight_grams ? Number(parsed.data.weight_grams) : null,
      status: parsed.data.status,
      is_featured: parsed.data.is_featured,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Falha ao criar produto" };

  await logAudit({
    action: "product.created",
    storeId,
    resourceType: "product",
    resourceId: data.id,
    metadata: { name: parsed.data.name, slug, status: parsed.data.status },
  });

  revalidatePath("/admin/catalogo/produtos");
  redirect(`/admin/catalogo/produtos/${data.id}`);
}

export async function updateProductAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parsePayload(formData);
  if (!parsed.success) {
    return { fieldErrors: collectErrors(parsed.error.issues) };
  }

  const { supabase, storeId } = await requireActiveStore();

  const slugBase = parsed.data.slug
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.name);
  const slug = await generateUniqueProductSlug(
    supabase,
    storeId,
    slugBase,
    productId,
  );

  const priceCents = toCents(parsed.data.price);
  if (priceCents <= 0) return { fieldErrors: { price: "Preço deve ser maior que zero" } };
  const promoCents = parsed.data.promo_price ? toCents(parsed.data.promo_price) : null;

  const { error } = await supabase
    .from("products")
    .update({
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      sku: parsed.data.sku || null,
      price_cents: priceCents,
      promo_price_cents: promoCents,
      stock_qty: parsed.data.stock_qty ? Number(parsed.data.stock_qty) : null,
      weight_grams: parsed.data.weight_grams ? Number(parsed.data.weight_grams) : null,
      status: parsed.data.status,
      is_featured: parsed.data.is_featured,
    })
    .eq("id", productId)
    .eq("store_id", storeId);
  if (error) return { error: error.message };

  await logAudit({
    action: "product.updated",
    storeId,
    resourceType: "product",
    resourceId: productId,
  });

  revalidatePath("/admin/catalogo/produtos");
  revalidatePath(`/admin/catalogo/produtos/${productId}`);
  return { productId };
}

export async function deleteProductAction(productId: string): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);

  await logAudit({
    action: "product.deleted",
    storeId,
    resourceType: "product",
    resourceId: productId,
  });
  revalidatePath("/admin/catalogo/produtos");
  redirect("/admin/catalogo/produtos");
}

export async function toggleProductStatusAction(
  productId: string,
  nextStatus: "draft" | "active" | "inactive",
): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();
  const { error } = await supabase
    .from("products")
    .update({ status: nextStatus })
    .eq("id", productId)
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);

  await logAudit({
    action: `product.status_${nextStatus}`,
    storeId,
    resourceType: "product",
    resourceId: productId,
  });
  revalidatePath("/admin/catalogo/produtos");
  revalidatePath(`/admin/catalogo/produtos/${productId}`);
}

// =========================================================================
// Galeria
// =========================================================================

export async function registerProductImageAction(payload: {
  productId: string;
  url: string;
  storagePath: string;
}): Promise<{ id: string; position: number } | { error: string }> {
  const { supabase, storeId } = await requireActiveStore();

  const { data: lastImage } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", payload.productId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (lastImage?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: payload.productId,
      store_id: storeId,
      url: payload.url,
      storage_path: payload.storagePath,
      position: nextPosition,
    })
    .select("id, position")
    .single();
  if (error || !data) return { error: error?.message ?? "Falha ao registrar imagem" };

  // Se era a primeira imagem, grava em primary_image_url
  if (nextPosition === 0) {
    await supabase
      .from("products")
      .update({ primary_image_url: payload.url })
      .eq("id", payload.productId);
  }

  revalidatePath(`/admin/catalogo/produtos/${payload.productId}`);
  return { id: data.id, position: data.position };
}

export async function deleteProductImageAction(payload: {
  productId: string;
  imageId: string;
  storagePath: string | null;
}): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();

  if (payload.storagePath) {
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([payload.storagePath]);
    if (storageError) {
      // não bloqueia a remoção do registro — storage pode já estar ausente
      console.warn("Storage remove falhou:", storageError.message);
    }
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", payload.imageId)
    .eq("product_id", payload.productId);
  if (error) throw new Error(error.message);

  // Recalcula primary_image_url
  const { data: remaining } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", payload.productId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  await supabase
    .from("products")
    .update({ primary_image_url: remaining?.url ?? null })
    .eq("id", payload.productId)
    .eq("store_id", storeId);

  revalidatePath(`/admin/catalogo/produtos/${payload.productId}`);
}

export async function reorderProductImagesAction(
  productId: string,
  orderedIds: string[],
): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();
  const { error } = await supabase.rpc("reorder_product_images", {
    p_product_id: productId,
    p_ordered_ids: orderedIds,
  });
  if (error) throw new Error(error.message);

  await logAudit({
    action: "product.images_reordered",
    storeId,
    resourceType: "product",
    resourceId: productId,
    metadata: { count: orderedIds.length },
  });
  revalidatePath(`/admin/catalogo/produtos/${productId}`);
}
