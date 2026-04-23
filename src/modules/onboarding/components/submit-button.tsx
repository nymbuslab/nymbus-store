"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function OnboardingSubmitButton({
  pendingLabel = "Salvando...",
  children,
}: {
  pendingLabel?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
