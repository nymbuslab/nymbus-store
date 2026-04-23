"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  activateStoreAction,
  type ActivateStoreActionState,
} from "@/modules/onboarding/actions";

export function ReviewActivateForm({ allReady }: { allReady: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActivateStoreActionState | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const outcome = await activateStoreAction();
      if (outcome) setResult(outcome);
    });
    // evita submissão natural; mas aqui o form só tem o botão
    void formData;
  }

  return (
    <form
      action={handleSubmit}
      noValidate
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="text-sm text-muted-foreground">
        {allReady
          ? "Tudo pronto. Ative a loja para permitir pedidos."
          : "Complete os passos pendentes antes de ativar."}
      </div>
      <Button type="submit" disabled={isPending || !allReady}>
        {isPending ? "Ativando..." : "Ativar loja"}
      </Button>
      {result?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.missing?.length ? (
        <p className="text-sm text-destructive" role="alert">
          Falta: {result.missing.map((m) => m.label).join(", ")}
        </p>
      ) : null}
    </form>
  );
}
