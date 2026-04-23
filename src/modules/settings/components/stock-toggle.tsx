"use client";

import { useTransition } from "react";
import { toggleStockEnabledAction } from "@/modules/settings/actions";

export function StockToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.checked;
    startTransition(() => {
      void toggleStockEnabledAction(next);
    });
  }

  return (
    <label className="flex items-start gap-3 text-sm cursor-pointer">
      <input
        type="checkbox"
        defaultChecked={initialEnabled}
        disabled={isPending}
        onChange={handleToggle}
        className="mt-0.5 size-4 accent-primary"
      />
      <div className="space-y-1">
        <p className="font-medium">Controlar estoque</p>
        <p className="text-muted-foreground">
          Quando ligado, cada produto tem quantidade de estoque e a loja valida
          disponibilidade no checkout. Quando desligado, os pedidos são aceitos
          sem verificar quantidade (útil para catálogo de serviço, por exemplo).
        </p>
      </div>
    </label>
  );
}
