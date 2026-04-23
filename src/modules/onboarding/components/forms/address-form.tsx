"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveStoreAddressAction,
  type OnboardingActionState,
} from "@/modules/onboarding/actions";
import { OnboardingSubmitButton } from "@/modules/onboarding/components/submit-button";
import { formatCep, lookupCep, sanitizeCep } from "@/lib/utils/cep";

type Field =
  | "address_zip_code"
  | "address_street"
  | "address_number"
  | "address_complement"
  | "address_neighborhood"
  | "address_city"
  | "address_state";

type Defaults = Partial<Record<Field, string | null>>;

const initialState: OnboardingActionState<Field> = {};

export function AddressForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useActionState(saveStoreAddressAction, initialState);

  const [zip, setZip] = useState(defaults.address_zip_code ?? "");
  const [street, setStreet] = useState(defaults.address_street ?? "");
  const [number, setNumber] = useState(defaults.address_number ?? "");
  const [complement, setComplement] = useState(defaults.address_complement ?? "");
  const [neighborhood, setNeighborhood] = useState(
    defaults.address_neighborhood ?? "",
  );
  const [city, setCity] = useState(defaults.address_city ?? "");
  const [stateUf, setStateUf] = useState(defaults.address_state ?? "");

  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "not-found" | "error"
  >("idle");
  const lastLookupRef = useRef<string>("");
  const numberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const digits = sanitizeCep(zip);
    if (digits.length !== 8) {
      lastLookupRef.current = "";
      return;
    }
    if (digits === lastLookupRef.current) return;
    lastLookupRef.current = digits;

    const controller = new AbortController();
    setLookupStatus("loading");

    lookupCep(digits, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result) {
          setLookupStatus("not-found");
          return;
        }
        setLookupStatus("idle");
        // Só sobrescreve campos vazios — respeita o que o usuário já digitou.
        if (!street && result.street) setStreet(result.street);
        if (!neighborhood && result.neighborhood) setNeighborhood(result.neighborhood);
        if (!city && result.city) setCity(result.city);
        if (!stateUf && result.state) setStateUf(result.state);
        // Foca no número — próximo campo que só o user sabe.
        numberInputRef.current?.focus();
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLookupStatus("error");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intencional: buscar só quando o CEP muda
  }, [zip]);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="address_zip_code">
            CEP <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address_zip_code"
            name="address_zip_code"
            value={zip}
            onChange={(e) => {
              const next = formatCep(e.target.value);
              setZip(next);
              if (sanitizeCep(next).length !== 8) setLookupStatus("idle");
            }}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
            required
            aria-invalid={!!state.fieldErrors?.address_zip_code}
            aria-describedby={
              state.fieldErrors?.address_zip_code
                ? "address_zip_code-error"
                : "address_zip_code-hint"
            }
          />
          <p
            id="address_zip_code-hint"
            className="text-xs text-muted-foreground min-h-4"
          >
            {lookupStatus === "loading" && "Buscando endereço..."}
            {lookupStatus === "not-found" && "CEP não encontrado — preencha manualmente."}
            {lookupStatus === "error" && "Falha ao consultar CEP — preencha manualmente."}
            {lookupStatus === "idle" && ""}
          </p>
          {state.fieldErrors?.address_zip_code ? (
            <p id="address_zip_code-error" className="text-sm text-destructive">
              {state.fieldErrors.address_zip_code}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_state">
            UF <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address_state"
            name="address_state"
            value={stateUf}
            onChange={(e) => setStateUf(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="SP"
            maxLength={2}
            required
            aria-invalid={!!state.fieldErrors?.address_state}
          />
          {state.fieldErrors?.address_state ? (
            <p className="text-sm text-destructive">{state.fieldErrors.address_state}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_city">
            Cidade <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address_city"
            name="address_city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            aria-invalid={!!state.fieldErrors?.address_city}
          />
          {state.fieldErrors?.address_city ? (
            <p className="text-sm text-destructive">{state.fieldErrors.address_city}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr,120px]">
        <div className="space-y-2">
          <Label htmlFor="address_street">
            Rua <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address_street"
            name="address_street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
            autoComplete="address-line1"
            aria-invalid={!!state.fieldErrors?.address_street}
          />
          {state.fieldErrors?.address_street ? (
            <p className="text-sm text-destructive">{state.fieldErrors.address_street}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_number">
            Número <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address_number"
            name="address_number"
            ref={numberInputRef}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            inputMode="numeric"
            aria-invalid={!!state.fieldErrors?.address_number}
          />
          {state.fieldErrors?.address_number ? (
            <p className="text-sm text-destructive">{state.fieldErrors.address_number}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_complement">Complemento (opcional)</Label>
        <Input
          id="address_complement"
          name="address_complement"
          value={complement}
          onChange={(e) => setComplement(e.target.value)}
          autoComplete="address-line2"
          aria-invalid={!!state.fieldErrors?.address_complement}
        />
        {state.fieldErrors?.address_complement ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.address_complement}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_neighborhood">
          Bairro <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address_neighborhood"
          name="address_neighborhood"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          required
          aria-invalid={!!state.fieldErrors?.address_neighborhood}
        />
        {state.fieldErrors?.address_neighborhood ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.address_neighborhood}
          </p>
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
