import { redirect } from "next/navigation";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { ThemeEditor } from "@/modules/theme/components/theme-editor";
import {
  NYMBUS_DEFAULT_PRIMARY,
  NYMBUS_DEFAULT_SECONDARY,
} from "@/lib/theme/derive";

export default async function OnboardingIdentityPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  const primary = state.settings?.theme_primary_color ?? NYMBUS_DEFAULT_PRIMARY;
  const secondary = state.settings?.theme_secondary_color ?? NYMBUS_DEFAULT_SECONDARY;

  return (
    <OnboardingStepFrame
      stepKey="identidade"
      checklist={state.checklist}
      title="Identidade visual (opcional)"
      description="Escolha as cores que representam sua loja. Aparecem no painel e na vitrine. Pule para manter as cores padrão Nymbus."
    >
      <ThemeEditor
        initial={{ primary, secondary }}
        submitLabel="Salvar e continuar"
        nextPath="/admin/onboarding/categoria"
      />
    </OnboardingStepFrame>
  );
}
