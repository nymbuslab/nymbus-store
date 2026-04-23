import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ONBOARDING_STEPS,
  type OnboardingChecklist,
  type OnboardingStepKey,
} from "@/constants/onboarding";

type StepperProps = {
  checklist: OnboardingChecklist;
  current: OnboardingStepKey;
};

export function OnboardingStepper({ checklist, current }: StepperProps) {
  return (
    <nav aria-label="Passos do onboarding" className="mb-6">
      <ol className="flex flex-wrap gap-2">
        {ONBOARDING_STEPS.map((step, index) => {
          const done = checklist[step.key];
          const isCurrent = step.key === current;
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                  isCurrent
                    ? "border-primary bg-primary/10 text-foreground"
                    : done
                      ? "border-success/40 bg-success/10 text-foreground"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                    done
                      ? "bg-success text-success-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {done ? <Check className="size-3" /> : index + 1}
                </span>
                <span>{step.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
