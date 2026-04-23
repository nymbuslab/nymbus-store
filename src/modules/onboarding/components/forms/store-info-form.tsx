"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveStoreInfoAction, type OnboardingActionState } from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";

type Field = "name" | "phone" | "whatsapp" | "contact_email";

type Defaults = {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  contact_email: string | null;
};

const initialState: OnboardingActionState<Field> = {};

export function StoreInfoForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useActionState(saveStoreInfoAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <FieldGroup
        id="name"
        label="Nome da loja"
        defaultValue={defaults.name}
        error={state.fieldErrors?.name}
        autoComplete="organization"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup
          id="phone"
          label="Telefone"
          defaultValue={defaults.phone ?? ""}
          error={state.fieldErrors?.phone}
          inputMode="tel"
          placeholder="(11) 3456-7890"
        />
        <FieldGroup
          id="whatsapp"
          label="WhatsApp"
          defaultValue={defaults.whatsapp ?? ""}
          error={state.fieldErrors?.whatsapp}
          inputMode="tel"
          placeholder="(11) 91234-5678"
        />
      </div>
      <FieldGroup
        id="contact_email"
        label="E-mail de contato"
        defaultValue={defaults.contact_email ?? ""}
        error={state.fieldErrors?.contact_email}
        type="email"
        inputMode="email"
        autoComplete="email"
        required
      />
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

type FieldGroupProps = {
  id: string;
  label: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
};

function FieldGroup({
  id,
  label,
  defaultValue,
  error,
  required,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
}: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
