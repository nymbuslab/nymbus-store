export type CepLookup = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export function sanitizeCep(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string): string {
  const digits = sanitizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupCep(
  cep: string,
  options?: { signal?: AbortSignal },
): Promise<CepLookup | null> {
  const digits = sanitizeCep(cep);
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    signal: options?.signal,
  });
  if (!response.ok) return null;

  const data = (await response.json()) as ViaCepResponse;
  if (data.erro) return null;

  return {
    cep: formatCep(digits),
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: (data.uf ?? "").toUpperCase(),
  };
}
