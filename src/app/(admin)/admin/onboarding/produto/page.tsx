import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { ProductForm } from "@/modules/onboarding/components/forms/product-form";

export default async function OnboardingProductPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <OnboardingStepFrame
      stepKey="produto"
      checklist={state.checklist}
      title="Primeiro produto"
      description="Cadastro mínimo. O CRUD completo (galeria, estoque, SKU) vem na Fase 3."
    >
      <ProductForm
        categories={categories ?? []}
        existingName={state.firstProduct?.name ?? null}
      />
    </OnboardingStepFrame>
  );
}
