"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveStore } from "@/modules/stores/queries";
import { logAudit } from "@/lib/logger";

export async function toggleStockEnabledAction(nextValue: boolean): Promise<void> {
  const supabase = await createClient();
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const { error } = await supabase
    .from("store_settings")
    .update({ stock_enabled: nextValue })
    .eq("store_id", store.id);
  if (error) throw new Error(error.message);

  await logAudit({
    action: nextValue ? "settings.stock_enabled" : "settings.stock_disabled",
    storeId: store.id,
    resourceType: "store_settings",
    resourceId: store.id,
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/catalogo/produtos", "layout");
}
