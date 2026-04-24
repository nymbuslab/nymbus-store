"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveStoreThemeAction,
  type StoreThemeActionState,
} from "@/modules/theme/actions";
import {
  NYMBUS_DEFAULT_PRIMARY,
  NYMBUS_DEFAULT_SECONDARY,
  contrastForeground,
  isValidHex,
  normalizeHex,
} from "@/lib/theme/derive";

type Props = {
  initial: { primary: string; secondary: string };
  submitLabel: string;
  nextPath?: string;
  showResetToNymbus?: boolean;
};

const initialState: StoreThemeActionState = {};

export function ThemeEditor({
  initial,
  submitLabel,
  nextPath,
  showResetToNymbus = true,
}: Props) {
  const [state, formAction] = useActionState(saveStoreThemeAction, initialState);
  const [primary, setPrimary] = useState(
    normalizeHex(initial.primary, NYMBUS_DEFAULT_PRIMARY),
  );
  const [secondary, setSecondary] = useState(
    normalizeHex(initial.secondary, NYMBUS_DEFAULT_SECONDARY),
  );

  const previewPrimaryFg = contrastForeground(
    isValidHex(primary) ? primary : NYMBUS_DEFAULT_PRIMARY,
  );
  const previewSecondaryFg = contrastForeground(
    isValidHex(secondary) ? secondary : NYMBUS_DEFAULT_SECONDARY,
  );

  function resetToNymbus() {
    setPrimary(NYMBUS_DEFAULT_PRIMARY);
    setSecondary(NYMBUS_DEFAULT_SECONDARY);
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          id="primary"
          label="Cor primária"
          description="Botões principais, ícones ativos, links."
          value={primary}
          onChange={setPrimary}
          error={state.fieldErrors?.primary}
        />
        <ColorField
          id="secondary"
          label="Cor secundária"
          description="Hovers, seleções, destaques sutis."
          value={secondary}
          onChange={setSecondary}
          error={state.fieldErrors?.secondary}
        />
      </div>

      <Preview
        primary={primary}
        primaryForeground={previewPrimaryFg}
        secondary={secondary}
        secondaryForeground={previewSecondaryFg}
      />

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 justify-end">
        {showResetToNymbus ? (
          <Button
            type="button"
            variant="ghost"
            onClick={resetToNymbus}
            disabled={
              primary === NYMBUS_DEFAULT_PRIMARY &&
              secondary === NYMBUS_DEFAULT_SECONDARY
            }
          >
            Usar cores Nymbus
          </Button>
        ) : null}
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : children}
    </Button>
  );
}

function ColorField({
  id,
  label,
  description,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-text`}>{label}</Label>
      <div className="flex items-stretch gap-2">
        <input
          type="color"
          name={id}
          id={id}
          value={isValidHex(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
          aria-label={`${label} — seletor visual`}
        />
        <Input
          id={`${id}-text`}
          value={value}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            onChange(next);
          }}
          placeholder="#000000"
          maxLength={7}
          className="font-mono uppercase flex-1"
          aria-invalid={!!error}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function Preview({
  primary,
  primaryForeground,
  secondary,
  secondaryForeground,
}: {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
}) {
  const validPrimary = isValidHex(primary) ? primary : NYMBUS_DEFAULT_PRIMARY;
  const validSecondary = isValidHex(secondary)
    ? secondary
    : NYMBUS_DEFAULT_SECONDARY;

  return (
    <div className="rounded-md border bg-muted/20 p-4 space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Pré-visualização
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium"
          style={{ backgroundColor: validPrimary, color: primaryForeground }}
          disabled
        >
          Botão principal
        </button>
        <span
          className="inline-flex h-7 items-center rounded-full px-3 text-xs font-medium"
          style={{
            backgroundColor: `${validSecondary}33`,
            color: validSecondary,
          }}
        >
          Badge secundária
        </span>
        <div
          className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm"
          style={{ boxShadow: `inset 0 -2px 0 ${validPrimary}` }}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: validPrimary }}
            aria-hidden
          />
          Elemento ativo
        </div>
        <div
          className="flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium"
          style={{
            backgroundColor: `${validSecondary}26`,
            color: secondaryForeground,
          }}
        >
          Hover
        </div>
      </div>
    </div>
  );
}
