"use client";

import { useTransition } from "react";
import { setActiveStoreAction } from "@/modules/stores/actions";
import type { StoreRow } from "@/modules/stores/queries";

type StoreSwitcherProps = {
  stores: StoreRow[];
  activeId: string;
};

export function StoreSwitcher({ stores, activeId }: StoreSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  if (stores.length <= 1) return null;

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData();
    formData.set("storeId", event.target.value);
    startTransition(() => {
      void setActiveStoreAction(formData);
    });
  }

  return (
    <label className="hidden items-center gap-2 text-sm sm:flex">
      <span className="sr-only">Loja ativa</span>
      <select
        value={activeId}
        onChange={onChange}
        disabled={isPending}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </label>
  );
}
