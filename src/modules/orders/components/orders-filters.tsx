"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORDER_STATUS_LABEL } from "@/constants/orders";

export function OrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[160px,1fr,1fr]">
      <div className="space-y-1">
        <Label htmlFor="status" className="text-xs">
          Status
        </Label>
        <select
          id="status"
          value={params.get("status") ?? "all"}
          onChange={(e) => update("status", e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
        >
          <option value="all">Todos</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="from" className="text-xs">
          De
        </Label>
        <Input
          id="from"
          type="date"
          defaultValue={params.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to" className="text-xs">
          Até
        </Label>
        <Input
          id="to"
          type="date"
          defaultValue={params.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>
    </div>
  );
}
