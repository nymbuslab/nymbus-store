import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { StoreInfoForm } from "@/modules/onboarding/components/forms/store-info-form";

export default async function OnboardingStoreInfoPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  return (
    <OnboardingStepFrame
      stepKey="loja"
      checklist={state.checklist}
      title="Dados da loja"
      description="Nome, telefone ou WhatsApp, e-mail de contato."
    >
      <StoreInfoForm
        defaults={{
          name: state.storeName,
          phone: state.settings?.phone ?? null,
          whatsapp: state.settings?.whatsapp ?? null,
          contact_email: state.settings?.contact_email ?? null,
        }}
      />
    </OnboardingStepFrame>
  );
}
