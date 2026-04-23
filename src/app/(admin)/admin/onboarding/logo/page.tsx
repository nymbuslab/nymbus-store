import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { LogoForm } from "@/modules/onboarding/components/forms/logo-form";

export default async function OnboardingLogoPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  return (
    <OnboardingStepFrame
      stepKey="logo"
      checklist={state.checklist}
      title="Logo da loja"
      description="PNG, JPEG ou WebP · até 2 MB."
    >
      <LogoForm currentUrl={state.storeLogoUrl} />
    </OnboardingStepFrame>
  );
}
