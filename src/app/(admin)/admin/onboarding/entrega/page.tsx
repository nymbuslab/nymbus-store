import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { DeliveryForm } from "@/modules/onboarding/components/forms/delivery-form";

export default async function OnboardingDeliveryPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  return (
    <OnboardingStepFrame
      stepKey="entrega"
      checklist={state.checklist}
      title="Retirada e entrega"
      description="Você precisa oferecer pelo menos uma das opções para ativar a loja."
    >
      <DeliveryForm
        defaults={{
          pickup_enabled: state.delivery?.pickup_enabled ?? false,
          local_delivery_enabled: state.delivery?.local_delivery_enabled ?? false,
          delivery_radius_km: state.delivery?.delivery_radius_km ?? null,
          delivery_fee_cents: state.delivery?.delivery_fee_cents ?? null,
        }}
      />
    </OnboardingStepFrame>
  );
}
