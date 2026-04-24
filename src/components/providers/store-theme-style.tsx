import type { StoreTheme } from "@/lib/theme/derive";

/**
 * Server component que emite um <style> com CSS variables override por loja.
 * Aplica no escopo `[data-store-theme]` — envolve o admin shell e a vitrine.
 * SSR-friendly, sem FOUC, sem hydration mismatch.
 */
export function StoreThemeStyle({ theme }: { theme: StoreTheme }) {
  const css = `[data-store-theme] {
  --primary: ${theme.primary};
  --primary-foreground: ${theme.primaryForeground};
  --secondary: ${theme.secondary};
  --secondary-foreground: ${theme.secondaryForeground};
  --ring: ${theme.primary};
  --sidebar-primary: ${theme.primary};
  --sidebar-primary-foreground: ${theme.primaryForeground};
  --sidebar-ring: ${theme.primary};
}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
