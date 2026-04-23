"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveDeliveryAction,
  type OnboardingActionState,
} from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";

type Field =
  | "pickup_enabled"
  | "local_delivery_enabled"
  | "delivery_radius_km"
  | "delivery_fee_cents";

type Defaults = {
  pickup_enabled: boolean;
  local_delivery_enabled: boolean;
  delivery_radius_km: number | null;
  delivery_fee_cents: number | null;
};

const initialState: OnboardingActionState<Field> = {};

export function DeliveryForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useActionState(saveDeliveryAction, initialState);
  const [localOn, setLocalOn] = useState(defaults.local_delivery_enabled);

  const initialFeeReais =
    defaults.delivery_fee_cents != null
      ? (defaults.delivery_fee_cents / 100).toFixed(2).replace(".", ",")
      : "";

  return (
    <form action={formAction} noValidate className="space-y-4">
      <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
        <input
          type="checkbox"
          name="pickup_enabled"
          defaultChecked={defaults.pickup_enabled}
          className="mt-0.5 size-4 accent-primary"
        />
        <div>
          <p className="font-medium">Retirada na loja</p>
          <p className="text-muted-foreground">
            O cliente busca o pedido no endereço da loja.
          </p>
        </div>
      </label>

      <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
        <input
          type="checkbox"
          name="local_delivery_enabled"
          defaultChecked={defaults.local_delivery_enabled}
          onChange={(e) => setLocalOn(e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <div className="flex-1">
          <p className="font-medium">Entrega local por raio</p>
          <p className="text-muted-foreground">
            Entrega dentro de um raio em km a partir do endereço da loja, com taxa
            fixa.
          </p>
        </div>
      </label>

      {state.fieldErrors?.pickup_enabled ? (
        <p className="text-sm text-destructive">{state.fieldErrors.pickup_enabled}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="delivery_radius_km">Raio de atendimento (km)</Label>
          <Input
            id="delivery_radius_km"
            name="delivery_radius_km"
            inputMode="decimal"
            placeholder="5"
            defaultValue={defaults.delivery_radius_km ?? ""}
            disabled={!localOn}
            aria-invalid={!!state.fieldErrors?.delivery_radius_km}
          />
          {state.fieldErrors?.delivery_radius_km ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.delivery_radius_km}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="delivery_fee_cents">Taxa fixa (R$)</Label>
          <Input
            id="delivery_fee_cents"
            name="delivery_fee_cents"
            inputMode="decimal"
            placeholder="10,00"
            defaultValue={initialFeeReais}
            disabled={!localOn}
            aria-invalid={!!state.fieldErrors?.delivery_fee_cents}
          />
          {state.fieldErrors?.delivery_fee_cents ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.delivery_fee_cents}
            </p>
          ) : null}
        </div>
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
