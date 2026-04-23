"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStoreSchema } from "@/lib/validations/stores";
import { ACTIVE_STORE_COOKIE } from "@/constants/stores";
import { slugify } from "@/lib/utils/slugify";
import { logAudit } from "@/lib/logger";

export type CreateStoreActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"name", string>>;
};

const ACTIVE_STORE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
): Promise<string> {
  const safeBase = base || "loja";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? safeBase : `${safeBase}-${i + 1}`;
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${safeBase}-${Date.now()}`;
}

export async function createStoreAction(
  _prev: CreateStoreActionState,
  formData: FormData,
): Promise<CreateStoreActionState> {
  const parsed = createStoreSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    const fieldErrors: CreateStoreActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "name") {
        fieldErrors.name = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirou. Entre novamente." };
  }

  const slug = await generateUniqueSlug(supabase, slugify(parsed.data.name));

  const { data: storeId, error } = await supabase.rpc("create_store", {
    p_name: parsed.data.name,
    p_slug: slug,
  });

  if (error || !storeId) {
    return { error: error?.message ?? "Não foi possível criar a loja." };
  }

  await logAudit({
    action: "store.created",
    storeId,
    resourceType: "store",
    resourceId: storeId,
    metadata: { slug, name: parsed.data.name },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_STORE_COOKIE, storeId, ACTIVE_STORE_COOKIE_OPTIONS);

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setActiveStoreAction(formData: FormData): Promise<void> {
  const storeId = formData.get("storeId");
  if (typeof storeId !== "string" || storeId.length === 0) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .maybeSingle();

  if (!data) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_STORE_COOKIE, storeId, ACTIVE_STORE_COOKIE_OPTIONS);

  revalidatePath("/", "layout");
  redirect("/admin");
}
