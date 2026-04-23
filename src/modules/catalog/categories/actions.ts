"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations/catalog";
import { getActiveStore } from "@/modules/stores/queries";
import { slugify } from "@/lib/utils/slugify";
import { logAudit } from "@/lib/logger";

export type CategoryActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"name", string>>;
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

async function generateUniqueCategorySlug(
  supabase: SupabaseServerClient,
  storeId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const safe = base || "categoria";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? safe : `${safe}-${i + 1}`;
    const query = supabase
      .from("categories")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", candidate);
    const { data } = excludeId
      ? await query.neq("id", excludeId).maybeSingle()
      : await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${safe}-${Date.now()}`;
}

export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: CategoryActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "name") fieldErrors.name = issue.message;
    }
    return { fieldErrors };
  }

  const { supabase, storeId } = await requireActiveStore();
  const slug = await generateUniqueCategorySlug(
    supabase,
    storeId,
    slugify(parsed.data.name),
  );

  const { data: last } = await supabase
    .from("categories")
    .select("position")
    .eq("store_id", storeId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      store_id: storeId,
      name: parsed.data.name,
      slug,
      is_active: parsed.data.is_active,
      position: nextPosition,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Falha ao criar categoria" };

  await logAudit({
    action: "category.created",
    storeId,
    resourceType: "category",
    resourceId: data.id,
    metadata: { name: parsed.data.name, slug },
  });

  revalidatePath("/admin/catalogo/categorias");
  return {};
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: CategoryActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "name") fieldErrors.name = issue.message;
    }
    return { fieldErrors };
  }

  const { supabase, storeId } = await requireActiveStore();

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      is_active: parsed.data.is_active,
    })
    .eq("id", categoryId)
    .eq("store_id", storeId);
  if (error) return { error: error.message };

  await logAudit({
    action: "category.updated",
    storeId,
    resourceType: "category",
    resourceId: categoryId,
  });

  revalidatePath("/admin/catalogo/categorias");
  return {};
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  nextValue: boolean,
): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: nextValue })
    .eq("id", categoryId)
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);

  await logAudit({
    action: nextValue ? "category.activated" : "category.deactivated",
    storeId,
    resourceType: "category",
    resourceId: categoryId,
  });
  revalidatePath("/admin/catalogo/categorias");
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();
  const { error } = await supabase.rpc("reorder_categories", {
    p_store_id: storeId,
    p_ordered_ids: orderedIds,
  });
  if (error) throw new Error(error.message);

  await logAudit({
    action: "category.reordered",
    storeId,
    metadata: { count: orderedIds.length },
  });
  revalidatePath("/admin/catalogo/categorias");
}

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const { supabase, storeId } = await requireActiveStore();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);

  await logAudit({
    action: "category.deleted",
    storeId,
    resourceType: "category",
    resourceId: categoryId,
  });
  revalidatePath("/admin/catalogo/categorias");
}
