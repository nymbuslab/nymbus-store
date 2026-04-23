"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryOption = { id: string; name: string };

export function ProductsListFilters({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr,160px,200px]">
      <div className="space-y-1">
        <Label htmlFor="q" className="text-xs">
          Buscar
        </Label>
        <Input
          id="q"
          type="search"
          placeholder="Nome ou SKU"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status" className="text-xs">
          Status
        </Label>
        <select
          id="status"
          value={params.get("status") ?? "all"}
          onChange={(e) => updateParam("status", e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
        >
          <option value="all">Todos</option>
          <option value="draft">Rascunho</option>
          <option value="active">Publicado</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="category" className="text-xs">
          Categoria
        </Label>
        <select
          id="category"
          value={params.get("category") ?? "all"}
          onChange={(e) => updateParam("category", e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
        >
          <option value="all">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
