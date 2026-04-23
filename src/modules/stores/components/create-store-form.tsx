"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createStoreAction,
  type CreateStoreActionState,
} from "@/modules/stores/actions";

const initialState: CreateStoreActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando..." : "Criar loja"}
    </Button>
  );
}

export function CreateStoreForm() {
  const [state, formAction] = useActionState(createStoreAction, initialState);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Crie sua primeira loja</CardTitle>
        <CardDescription>
          Dê um nome para começar. Você poderá ajustar mais detalhes no onboarding.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Nome da loja</Label>
            <Input
              id="store-name"
              name="name"
              type="text"
              autoComplete="organization"
              required
              minLength={2}
              maxLength={120}
              aria-invalid={!!state.fieldErrors?.name}
              aria-describedby={state.fieldErrors?.name ? "name-error" : "name-hint"}
            />
            {state.fieldErrors?.name ? (
              <p id="name-error" className="text-sm text-destructive">
                {state.fieldErrors.name}
              </p>
            ) : (
              <p id="name-hint" className="text-sm text-muted-foreground">
                Ex: Mercearia da Praça, Pet Shop do Bairro.
              </p>
            )}
          </div>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
