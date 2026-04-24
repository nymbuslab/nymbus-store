"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getActiveStore } from "@/modules/stores/queries";
import { logAudit } from "@/lib/logger";

const hexRegex = /^#[0-9a-fA-F]{6}$/;

const storeThemeSchema = z.object({
  primary: z.string().trim().regex(hexRegex, "Cor primária inválida"),
  secondary: z.string().trim().regex(hexRegex, "Cor secundária inválida"),
});

export type StoreThemeActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"primary" | "secondary", string>>;
};

export async function saveStoreThemeAction(
  _prev: StoreThemeActionState,
  formData: FormData,
): Promise<StoreThemeActionState> {
  const parsed = storeThemeSchema.safeParse({
    primary: formData.get("primary"),
    secondary: formData.get("secondary"),
  });
  if (!parsed.success) {
    const fieldErrors: StoreThemeActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "primary" || key === "secondary") {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      theme_primary_color: parsed.data.primary.toUpperCase(),
      theme_secondary_color: parsed.data.secondary.toUpperCase(),
    })
    .eq("store_id", store.id);

  if (error) return { error: error.message };

  await logAudit({
    action: "store.theme_updated",
    storeId: store.id,
    resourceType: "store_settings",
    resourceId: store.id,
    metadata: {
      primary: parsed.data.primary,
      secondary: parsed.data.secondary,
    },
  });

  const nextPath = (formData.get("next") as string) || null;
  revalidatePath("/admin", "layout");
  if (nextPath && nextPath.startsWith("/admin/")) {
    redirect(nextPath);
  }
  return {};
}
