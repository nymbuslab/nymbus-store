import { redirect } from "next/navigation";
import { Check, CircleDashed } from "lucide-react";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { OnboardingStepFrame } from "@/modules/onboarding/components/step-frame";
import { ReviewActivateForm } from "@/modules/onboarding/components/forms/review-form";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { cn } from "@/lib/utils";

export default async function OnboardingReviewPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const state = await loadOnboardingState(store.id);

  if (state.storeStatus === "active") {
    redirect("/admin");
  }

  const required = ONBOARDING_STEPS.filter((s) => s.key !== "revisao");
  const allReady = required.every((s) => state.checklist[s.key]);

  return (
    <OnboardingStepFrame
      stepKey="revisao"
      checklist={state.checklist}
      title="Revisão e ativação"
      description="Confira os passos. Quando todos estiverem concluídos, você pode ativar a loja."
    >
      <ul className="divide-y rounded-md border">
        {required.map((step) => {
          const done = state.checklist[step.key];
          const Icon = done ? Check : CircleDashed;
          return (
            <li
              key={step.key}
              className="flex items-center gap-3 px-4 py-3 text-sm"
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  done ? "text-success" : "text-muted-foreground",
                )}
                aria-hidden
              />
              <span className="flex-1 font-medium">{step.label}</span>
              <span
                className={cn(
                  "text-xs",
                  done ? "text-success" : "text-muted-foreground",
                )}
              >
                {done ? "OK" : "Pendente"}
              </span>
            </li>
          );
        })}
      </ul>
      <ReviewActivateForm allReady={allReady} />
    </OnboardingStepFrame>
  );
}
