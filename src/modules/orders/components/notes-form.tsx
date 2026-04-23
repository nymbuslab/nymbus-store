"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateOrderNotesAction } from "@/modules/orders/actions";

export function NotesForm({
  orderId,
  initial,
}: {
  orderId: string;
  initial: string | null;
}) {
  const [notes, setNotes] = useState(initial ?? "");
  const [isPending, startTransition] = useTransition();

  function onSave() {
    startTransition(() => {
      void updateOrderNotesAction(orderId, notes);
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="order-notes" className="text-xs">
        Observações internas
      </Label>
      <textarea
        id="order-notes"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={onSave} disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar observações"}
        </Button>
      </div>
    </div>
  );
}
