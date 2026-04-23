import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { CategoryForm } from "@/modules/onboarding/components/forms/category-form";

export default async function OnboardingCategoryPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  return (
    <OnboardingStepFrame
      stepKey="categoria"
      checklist={state.checklist}
      title="Primeira categoria"
      description="Uma categoria é como você agrupa os produtos na sua loja."
    >
      <CategoryForm existingName={state.firstCategory?.name ?? null} />
    </OnboardingStepFrame>
  );
}
