"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  uploadStoreLogoAction,
  type OnboardingActionState,
} from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";

const initialState: OnboardingActionState<"logo"> = {};

export function LogoForm({ currentUrl }: { currentUrl: string | null }) {
  const [state, formAction] = useActionState(uploadStoreLogoAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-4" encType="multipart/form-data">
      {currentUrl ? (
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted">
            <Image
              src={currentUrl}
              alt="Logo atual"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Logo atual. Envie outro arquivo para substituir.
          </p>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="logo">
          Arquivo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          aria-invalid={!!state.fieldErrors?.logo}
          aria-describedby={state.fieldErrors?.logo ? "logo-error" : "logo-hint"}
        />
        {state.fieldErrors?.logo ? (
          <p id="logo-error" className="text-sm text-destructive">
            {state.fieldErrors.logo}
          </p>
        ) : (
          <p id="logo-hint" className="text-sm text-muted-foreground">
            PNG, JPEG ou WebP · até 2 MB.
          </p>
        )}
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <OnboardingSubmitButton pendingLabel="Enviando...">
          Enviar e continuar
        </OnboardingSubmitButton>
      </div>
    </form>
  );
}
