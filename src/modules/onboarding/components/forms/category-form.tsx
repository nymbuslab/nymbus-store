"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveFirstCategoryAction,
  type OnboardingActionState,
} from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";

const initialState: OnboardingActionState<"name"> = {};

export function CategoryForm({
  existingName,
}: {
  existingName: string | null;
}) {
  const [state, formAction] = useActionState(saveFirstCategoryAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {existingName ? (
        <p className="rounded-md border bg-success/10 px-3 py-2 text-sm text-foreground">
          Você já tem a categoria <strong>{existingName}</strong>. Este passo está
          concluído — você pode avançar ou criar outra categoria.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome da categoria <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Bebidas, Higiene, Limpeza"
          required
          aria-invalid={!!state.fieldErrors?.name}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        />
        {state.fieldErrors?.name ? (
          <p id="name-error" className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <OnboardingSubmitButton>Salvar e continuar</OnboardingSubmitButton>
      </div>
    </form>
  );
}
