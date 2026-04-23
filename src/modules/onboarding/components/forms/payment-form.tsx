"use client";

import { useActionState } from "react";
import {
  savePaymentGatewayAction,
  type OnboardingActionState,
} from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";

type Provider = "mercadopago" | "pagarme";

const initialState: OnboardingActionState<"provider"> = {};

const options: { value: Provider; label: string; description: string }[] = [
  {
    value: "mercadopago",
    label: "Mercado Pago",
    description: "Pix, cartão e boleto. Credenciais serão configuradas na Fase 6.",
  },
  {
    value: "pagarme",
    label: "Pagar.me",
    description: "Pix, cartão e boleto. Credenciais serão configuradas na Fase 6.",
  },
];

export function PaymentForm({ current }: { current: Provider | null }) {
  const [state, formAction] = useActionState(savePaymentGatewayAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          Gateway de pagamento dos pedidos
        </legend>
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-start gap-3 rounded-md border p-3 text-sm"
          >
            <input
              type="radio"
              name="provider"
              value={opt.value}
              defaultChecked={current === opt.value}
              required
              className="mt-0.5 size-4 accent-primary"
            />
            <div>
              <p className="font-medium">{opt.label}</p>
              <p className="text-muted-foreground">{opt.description}</p>
            </div>
          </label>
        ))}
        {state.fieldErrors?.provider ? (
          <p className="text-sm text-destructive">{state.fieldErrors.provider}</p>
        ) : null}
      </fieldset>
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
