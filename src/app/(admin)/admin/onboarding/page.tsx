import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, CircleDashed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { getActiveStore } from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { cn } from "@/lib/utils";

export default async function OnboardingIndexPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const state = await loadOnboardingState(store.id);

  if (state.storeStatus === "active") {
    redirect("/admin");
  }

  const next =
    ONBOARDING_STEPS.find((step) => !state.checklist[step.key]) ??
    ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso</CardTitle>
        <CardDescription>
          Preencha os passos obrigatórios para ativar a loja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="divide-y rounded-md border">
          {ONBOARDING_STEPS.map((step) => {
            const done = state.checklist[step.key];
            const Icon = done ? Check : CircleDashed;
            return (
              <li key={step.key}>
                <Link
                  href={step.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        done ? "text-success" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="font-medium">{step.label}</span>
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      done ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {done ? "Concluído" : "Pendente"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="flex justify-end">
          <Link href={next.href} className={buttonVariants()}>
            Continuar em: {next.shortLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
