import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_CHECKLIST,
  ONBOARDING_STEPS,
  type OnboardingChecklist,
  type OnboardingStepKey,
} from "@/constants/onboarding";
import type { Database } from "@/types/database.types";

type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];
type DeliveryConfig = Database["public"]["Tables"]["store_delivery_config"]["Row"];
type GatewayRow = Pick<
  Database["public"]["Tables"]["store_payment_gateways"]["Row"],
  "id" | "provider" | "status"
>;
type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name"
>;
type ProductRow = Pick<Database["public"]["Tables"]["products"]["Row"], "id" | "name">;

export type OnboardingState = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl: string | null;
  storeStatus: Database["public"]["Enums"]["store_status"];
  settings: StoreSettings | null;
  delivery: DeliveryConfig | null;
  gateway: GatewayRow | null;
  firstCategory: CategoryRow | null;
  firstProduct: ProductRow | null;
  checklist: OnboardingChecklist;
  nextPendingStep: OnboardingStepKey | null;
};

export async function loadOnboardingState(storeId: string): Promise<OnboardingState> {
  const supabase = await createClient();

  const [storeRes, settingsRes, deliveryRes, gatewayRes, categoryRes, productRes] =
    await Promise.all([
      supabase
        .from("stores")
        .select("id, name, slug, logo_url, status")
        .eq("id", storeId)
        .single(),
      supabase
        .from("store_settings")
        .select("*")
        .eq("store_id", storeId)
        .maybeSingle(),
      supabase
        .from("store_delivery_config")
        .select("*")
        .eq("store_id", storeId)
        .maybeSingle(),
      supabase
        .from("store_payment_gateways")
        .select("id, provider, status")
        .eq("store_id", storeId)
        .neq("status", "disabled")
        .maybeSingle(),
      supabase
        .from("categories")
        .select("id, name")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("products")
        .select("id, name")
        .eq("store_id", storeId)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  if (storeRes.error || !storeRes.data) {
    throw new Error(`Loja não encontrada: ${storeRes.error?.message ?? "sem dados"}`);
  }

  const store = storeRes.data;
  const settings = settingsRes.data;
  const delivery = deliveryRes.data;

  const checklist: OnboardingChecklist = {
    ...EMPTY_CHECKLIST,
    loja: Boolean(
      store.name &&
        settings?.contact_email &&
        (settings?.phone || settings?.whatsapp),
    ),
    endereco: Boolean(
      settings?.address_zip_code &&
        settings?.address_street &&
        settings?.address_number &&
        settings?.address_neighborhood &&
        settings?.address_city &&
        settings?.address_state,
    ),
    logo: Boolean(store.logo_url),
    categoria: Boolean(categoryRes.data),
    produto: Boolean(productRes.data),
    entrega: Boolean(
      delivery && (delivery.pickup_enabled || delivery.local_delivery_enabled),
    ),
    pagamento: Boolean(gatewayRes.data),
    revisao: store.status === "active",
  };

  const nextPendingStep =
    ONBOARDING_STEPS.find((step) => !checklist[step.key])?.key ?? null;

  return {
    storeId: store.id,
    storeName: store.name,
    storeSlug: store.slug,
    storeLogoUrl: store.logo_url,
    storeStatus: store.status,
    settings: settings ?? null,
    delivery: delivery ?? null,
    gateway: gatewayRes.data ?? null,
    firstCategory: categoryRes.data ?? null,
    firstProduct: productRes.data ?? null,
    checklist,
    nextPendingStep,
  };
}
