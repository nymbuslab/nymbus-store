"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_SUGGESTED_NEXT,
  type OrderStatus,
} from "@/constants/orders";
import { updateOrderStatusAction } from "@/modules/orders/actions";

export function StatusActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const suggested = ORDER_STATUS_SUGGESTED_NEXT[currentStatus];
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (suggested.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido está em estado final ({ORDER_STATUS_LABEL[currentStatus]}).
      </p>
    );
  }

  function advance(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, {
        status: next,
        note: note.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNote("");
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="status-note" className="text-xs">
          Nota da mudança (opcional)
        </Label>
        <Input
          id="status-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: cliente confirmou pagamento por Pix"
          maxLength={500}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {suggested.map((next) => (
          <Button
            key={next}
            type="button"
            variant={next === "cancelado" ? "destructive" : "default"}
            size="sm"
            disabled={isPending}
            onClick={() => advance(next)}
          >
            {ORDER_STATUS_LABEL[next]}
          </Button>
        ))}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
