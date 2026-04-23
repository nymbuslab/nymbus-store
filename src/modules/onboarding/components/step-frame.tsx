import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ONBOARDING_STEPS,
  type OnboardingChecklist,
  type OnboardingStepKey,
} from "@/constants/onboarding";
import { OnboardingStepper } from "@/modules/onboarding/components/stepper";

type StepFrameProps = {
  stepKey: OnboardingStepKey;
  checklist: OnboardingChecklist;
  title: string;
  description?: string;
  children: ReactNode;
};

export function OnboardingStepFrame({
  stepKey,
  checklist,
  title,
  description,
  children,
}: StepFrameProps) {
  const index = ONBOARDING_STEPS.findIndex((step) => step.key === stepKey);
  const prev = index > 0 ? ONBOARDING_STEPS[index - 1] : null;

  return (
    <div className="space-y-4">
      <OnboardingStepper checklist={checklist} current={stepKey} />
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
      <div className="flex items-center justify-between text-sm">
        {prev ? (
          <Link href={prev.href} className="text-muted-foreground underline underline-offset-4">
            ← Voltar: {prev.shortLabel}
          </Link>
        ) : (
          <Link href="/admin/onboarding" className="text-muted-foreground underline underline-offset-4">
            ← Visão geral
          </Link>
        )}
        <Link href="/admin" className="text-muted-foreground underline underline-offset-4">
          Sair sem concluir
        </Link>
      </div>
    </div>
  );
}
