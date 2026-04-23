"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveFirstProductAction,
  type OnboardingActionState,
} from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";

type Field = "category_id" | "name" | "price" | "description";

const initialState: OnboardingActionState<Field> = {};

type CategoryOption = { id: string; name: string };

export function ProductForm({
  categories,
  existingName,
}: {
  categories: CategoryOption[];
  existingName: string | null;
}) {
  const [state, formAction] = useActionState(saveFirstProductAction, initialState);

  if (categories.length === 0) {
    return (
      <p className="text-sm text-destructive">
        Você precisa criar uma categoria antes de cadastrar o primeiro produto.
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      {existingName ? (
        <p className="rounded-md border bg-success/10 px-3 py-2 text-sm text-foreground">
          Você já tem o produto <strong>{existingName}</strong> publicado. Este
          passo está concluído — você pode avançar ou cadastrar outro.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="category_id">
          Categoria <span className="text-destructive">*</span>
        </Label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={categories[0].id}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={!!state.fieldErrors?.category_id}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.category_id ? (
          <p className="text-sm text-destructive">{state.fieldErrors.category_id}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr,160px]">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome do produto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            aria-invalid={!!state.fieldErrors?.name}
          />
          {state.fieldErrors?.name ? (
            <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">
            Preço (R$) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            placeholder="19,90"
            required
            aria-invalid={!!state.fieldErrors?.price}
          />
          {state.fieldErrors?.price ? (
            <p className="text-sm text-destructive">{state.fieldErrors.price}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={!!state.fieldErrors?.description}
        />
        {state.fieldErrors?.description ? (
          <p className="text-sm text-destructive">{state.fieldErrors.description}</p>
        ) : null}
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <OnboardingSubmitButton>Salvar e continuar</OnboardingSubmitButton>
      </div>
    </form>
  );
}
