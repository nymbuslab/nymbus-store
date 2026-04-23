"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  deliverySchema,
  paymentGatewaySchema,
  productSchema,
  storeAddressSchema,
  storeInfoSchema,
} from "@/lib/validations/onboarding";
import { getActiveStore } from "@/modules/stores/queries";
import { slugify } from "@/lib/utils/slugify";
import { logAudit } from "@/lib/logger";

export type OnboardingActionState<TField extends string = string> = {
  error?: string;
  fieldErrors?: Partial<Record<TField, string>>;
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

function collectFieldErrors<T extends string>(
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[],
  allowed: readonly T[],
): Partial<Record<T, string>> {
  const fieldErrors: Partial<Record<T, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && (allowed as readonly string[]).includes(key)) {
      fieldErrors[key as T] ??= issue.message;
    }
  }
  return fieldErrors;
}

async function markConfiguring(
  supabase: SupabaseServerClient,
  storeId: string,
): Promise<void> {
  const { error } = await supabase.rpc("mark_store_configuring", {
    p_store_id: storeId,
  });
  if (error) {
    // Não bloqueia o fluxo — apenas loga
    console.warn("mark_store_configuring failed", error.message);
  }
}

// =========================================================================
// Passo 1 — Dados da loja
// =========================================================================

type StoreInfoField = "name" | "phone" | "whatsapp" | "contact_email";

export async function saveStoreInfoAction(
  _prev: OnboardingActionState<StoreInfoField>,
  formData: FormData,
): Promise<OnboardingActionState<StoreInfoField>> {
  const parsed = storeInfoSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    contact_email: formData.get("contact_email"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<StoreInfoField>(parsed.error.issues, [
        "name",
        "phone",
        "whatsapp",
        "contact_email",
      ]),
    };
  }

  const { supabase, storeId } = await requireActiveStore();

  const { error: storeError } = await supabase
    .from("stores")
    .update({ name: parsed.data.name })
    .eq("id", storeId);
  if (storeError) return { error: storeError.message };

  const { error: settingsError } = await supabase
    .from("store_settings")
    .update({
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      contact_email: parsed.data.contact_email,
    })
    .eq("store_id", storeId);
  if (settingsError) return { error: settingsError.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.store_info.saved",
    storeId,
    resourceType: "store_settings",
    resourceId: storeId,
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/endereco");
}

// =========================================================================
// Passo 2 — Endereço
// =========================================================================

type AddressField =
  | "address_zip_code"
  | "address_street"
  | "address_number"
  | "address_complement"
  | "address_neighborhood"
  | "address_city"
  | "address_state";

export async function saveStoreAddressAction(
  _prev: OnboardingActionState<AddressField>,
  formData: FormData,
): Promise<OnboardingActionState<AddressField>> {
  const parsed = storeAddressSchema.safeParse({
    address_zip_code: formData.get("address_zip_code"),
    address_street: formData.get("address_street"),
    address_number: formData.get("address_number"),
    address_complement: formData.get("address_complement") ?? "",
    address_neighborhood: formData.get("address_neighborhood"),
    address_city: formData.get("address_city"),
    address_state: formData.get("address_state"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<AddressField>(parsed.error.issues, [
        "address_zip_code",
        "address_street",
        "address_number",
        "address_complement",
        "address_neighborhood",
        "address_city",
        "address_state",
      ]),
    };
  }

  const { supabase, storeId } = await requireActiveStore();

  const { error } = await supabase
    .from("store_settings")
    .update({
      address_zip_code: parsed.data.address_zip_code,
      address_street: parsed.data.address_street,
      address_number: parsed.data.address_number,
      address_complement: parsed.data.address_complement || null,
      address_neighborhood: parsed.data.address_neighborhood,
      address_city: parsed.data.address_city,
      address_state: parsed.data.address_state,
    })
    .eq("store_id", storeId);
  if (error) return { error: error.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.address.saved",
    storeId,
    resourceType: "store_settings",
    resourceId: storeId,
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/logo");
}

// =========================================================================
// Passo 3 — Upload de logo
// =========================================================================

type LogoField = "logo";

export async function uploadStoreLogoAction(
  _prev: OnboardingActionState<LogoField>,
  formData: FormData,
): Promise<OnboardingActionState<LogoField>> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { fieldErrors: { logo: "Selecione uma imagem" } };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { fieldErrors: { logo: "A imagem deve ter no máximo 2 MB" } };
  }
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { fieldErrors: { logo: "Formato inválido (PNG, JPEG ou WebP)" } };
  }

  const { supabase, storeId } = await requireActiveStore();

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${storeId}/logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("store-logos")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("store-logos").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from("stores")
    .update({ logo_url: publicUrl })
    .eq("id", storeId);
  if (updateError) return { error: updateError.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.logo.uploaded",
    storeId,
    resourceType: "store",
    resourceId: storeId,
    metadata: { path },
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/categoria");
}

// =========================================================================
// Passo 4 — Primeira categoria
// =========================================================================

type CategoryField = "name";

async function generateUniqueCategorySlug(
  supabase: SupabaseServerClient,
  storeId: string,
  base: string,
): Promise<string> {
  const safe = base || "categoria";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? safe : `${safe}-${i + 1}`;
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${safe}-${Date.now()}`;
}

export async function saveFirstCategoryAction(
  _prev: OnboardingActionState<CategoryField>,
  formData: FormData,
): Promise<OnboardingActionState<CategoryField>> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<CategoryField>(parsed.error.issues, ["name"]),
    };
  }

  const { supabase, storeId } = await requireActiveStore();

  const slug = await generateUniqueCategorySlug(
    supabase,
    storeId,
    slugify(parsed.data.name),
  );

  const { error } = await supabase.from("categories").insert({
    store_id: storeId,
    name: parsed.data.name,
    slug,
    is_active: true,
  });
  if (error) return { error: error.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.category.created",
    storeId,
    resourceType: "category",
    metadata: { name: parsed.data.name, slug },
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/produto");
}

// =========================================================================
// Passo 5 — Primeiro produto
// =========================================================================

type ProductField = "category_id" | "name" | "price" | "description";

async function generateUniqueProductSlug(
  supabase: SupabaseServerClient,
  storeId: string,
  base: string,
): Promise<string> {
  const safe = base || "produto";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? safe : `${safe}-${i + 1}`;
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${safe}-${Date.now()}`;
}

function parsePriceToCents(input: string): number {
  const normalized = input.replace(",", ".");
  const value = Number(normalized);
  return Math.round(value * 100);
}

export async function saveFirstProductAction(
  _prev: OnboardingActionState<ProductField>,
  formData: FormData,
): Promise<OnboardingActionState<ProductField>> {
  const parsed = productSchema.safeParse({
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    price: formData.get("price"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<ProductField>(parsed.error.issues, [
        "category_id",
        "name",
        "price",
        "description",
      ]),
    };
  }

  const priceCents = parsePriceToCents(parsed.data.price);
  if (priceCents <= 0) {
    return { fieldErrors: { price: "Preço precisa ser maior que zero" } };
  }

  const { supabase, storeId } = await requireActiveStore();

  const slug = await generateUniqueProductSlug(
    supabase,
    storeId,
    slugify(parsed.data.name),
  );

  const { error } = await supabase.from("products").insert({
    store_id: storeId,
    category_id: parsed.data.category_id,
    name: parsed.data.name,
    slug,
    price_cents: priceCents,
    description: parsed.data.description || null,
    status: "active",
  });
  if (error) return { error: error.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.product.created",
    storeId,
    resourceType: "product",
    metadata: { name: parsed.data.name, slug, price_cents: priceCents },
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/entrega");
}

// =========================================================================
// Passo 6 — Entrega
// =========================================================================

type DeliveryField =
  | "pickup_enabled"
  | "local_delivery_enabled"
  | "delivery_radius_km"
  | "delivery_fee_cents";

export async function saveDeliveryAction(
  _prev: OnboardingActionState<DeliveryField>,
  formData: FormData,
): Promise<OnboardingActionState<DeliveryField>> {
  const parsed = deliverySchema.safeParse({
    pickup_enabled: formData.get("pickup_enabled") === "on",
    local_delivery_enabled: formData.get("local_delivery_enabled") === "on",
    delivery_radius_km: formData.get("delivery_radius_km") ?? "",
    delivery_fee_cents: formData.get("delivery_fee_cents") ?? "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<DeliveryField>(parsed.error.issues, [
        "pickup_enabled",
        "local_delivery_enabled",
        "delivery_radius_km",
        "delivery_fee_cents",
      ]),
    };
  }

  const { supabase, storeId } = await requireActiveStore();

  const radius = parsed.data.local_delivery_enabled
    ? Number(parsed.data.delivery_radius_km)
    : null;
  const feeReais = parsed.data.local_delivery_enabled
    ? Number(String(parsed.data.delivery_fee_cents).replace(",", "."))
    : null;
  const feeCents = feeReais !== null ? Math.round(feeReais * 100) : null;

  const { error } = await supabase
    .from("store_delivery_config")
    .update({
      pickup_enabled: parsed.data.pickup_enabled,
      local_delivery_enabled: parsed.data.local_delivery_enabled,
      delivery_radius_km: radius,
      delivery_fee_cents: feeCents,
    })
    .eq("store_id", storeId);
  if (error) return { error: error.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.delivery.saved",
    storeId,
    resourceType: "store_delivery_config",
    resourceId: storeId,
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/pagamento");
}

// =========================================================================
// Passo 7 — Gateway de pagamento
// =========================================================================

type PaymentField = "provider";

export async function savePaymentGatewayAction(
  _prev: OnboardingActionState<PaymentField>,
  formData: FormData,
): Promise<OnboardingActionState<PaymentField>> {
  const parsed = paymentGatewaySchema.safeParse({
    provider: formData.get("provider"),
  });
  if (!parsed.success) {
    return { fieldErrors: { provider: "Escolha um gateway" } };
  }

  const { supabase, storeId } = await requireActiveStore();

  const { error } = await supabase.rpc("upsert_store_payment_gateway", {
    p_store_id: storeId,
    p_provider: parsed.data.provider,
  });
  if (error) return { error: error.message };

  await markConfiguring(supabase, storeId);
  await logAudit({
    action: "onboarding.payment_gateway.selected",
    storeId,
    resourceType: "store_payment_gateway",
    metadata: { provider: parsed.data.provider },
  });

  revalidatePath("/admin/onboarding", "layout");
  redirect("/admin/onboarding/revisao");
}

// =========================================================================
// Passo 8 — Ativação
// =========================================================================

export type ActivateStoreActionState = {
  error?: string;
  missing?: { key: string; label: string }[];
};

export async function activateStoreAction(): Promise<ActivateStoreActionState> {
  const { supabase, storeId } = await requireActiveStore();

  const { data, error } = await supabase.rpc("activate_store", {
    p_store_id: storeId,
  });
  if (error) {
    return { error: error.message };
  }

  const result = data as {
    activated: boolean;
    missing: { key: string; label: string }[];
  };

  if (!result.activated) {
    return { missing: result.missing };
  }

  await logAudit({
    action: "store.activated",
    storeId,
    resourceType: "store",
    resourceId: storeId,
  });

  revalidatePath("/", "layout");
  redirect("/admin");
}
