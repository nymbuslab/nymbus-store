import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { AddressForm } from "@/modules/onboarding/components/forms/address-form";

export default async function OnboardingAddressPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  return (
    <OnboardingStepFrame
      stepKey="endereco"
      checklist={state.checklist}
      title="Endereço da loja"
      description="Usado para retirada e cálculo de entrega local por raio."
    >
      <AddressForm
        defaults={{
          address_zip_code: state.settings?.address_zip_code ?? "",
          address_street: state.settings?.address_street ?? "",
          address_number: state.settings?.address_number ?? "",
          address_complement: state.settings?.address_complement ?? "",
          address_neighborhood: state.settings?.address_neighborhood ?? "",
          address_city: state.settings?.address_city ?? "",
          address_state: state.settings?.address_state ?? "",
        }}
      />
    </OnboardingStepFrame>
  );
}
