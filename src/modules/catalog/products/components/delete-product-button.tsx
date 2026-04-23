"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/modules/catalog/products/actions";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Excluir "${productName}"? Esta ação é permanente.`)) return;
    startTransition(() => {
      void deleteProductAction(productId);
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Excluindo..." : "Excluir produto"}
    </Button>
  );
}
