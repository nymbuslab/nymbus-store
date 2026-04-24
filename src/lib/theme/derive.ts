const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export const NYMBUS_DEFAULT_PRIMARY = "#6344BC";
export const NYMBUS_DEFAULT_SECONDARY = "#73D2E6";

export type StoreTheme = {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
};

export function isValidHex(value: string | null | undefined): value is string {
  return typeof value === "string" && HEX_REGEX.test(value);
}

export function normalizeHex(value: string | null | undefined, fallback: string): string {
  if (isValidHex(value)) return value.toUpperCase();
  return fallback.toUpperCase();
}

export function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const srgbToLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return (
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
  );
}

export function contrastForeground(hex: string): string {
  return relativeLuminance(hex) > 0.4 ? "#212720" : "#FFFFFF";
}

export function buildStoreTheme(input: {
  primary: string | null | undefined;
  secondary: string | null | undefined;
}): StoreTheme {
  const primary = normalizeHex(input.primary, NYMBUS_DEFAULT_PRIMARY);
  const secondary = normalizeHex(input.secondary, NYMBUS_DEFAULT_SECONDARY);
  return {
    primary,
    primaryForeground: contrastForeground(primary),
    secondary,
    secondaryForeground: contrastForeground(secondary),
  };
}
