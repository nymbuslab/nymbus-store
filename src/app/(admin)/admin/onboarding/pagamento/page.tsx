import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { PaymentForm } from "@/modules/onboarding/components/forms/payment-form";

export default async function OnboardingPaymentPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  return (
    <OnboardingStepFrame
      stepKey="pagamento"
      checklist={state.checklist}
      title="Gateway de pagamento"
      description="Mercado Pago ou Pagar.me. As credenciais reais serão configuradas na Fase 6."
    >
      <PaymentForm current={state.gateway?.provider ?? null} />
    </OnboardingStepFrame>
  );
}
