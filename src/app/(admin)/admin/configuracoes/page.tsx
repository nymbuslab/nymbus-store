import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { StockToggle } from "@/modules/settings/components/stock-toggle";
import { ThemeEditor } from "@/modules/theme/components/theme-editor";
import {
  NYMBUS_DEFAULT_PRIMARY,
  NYMBUS_DEFAULT_SECONDARY,
} from "@/lib/theme/derive";

export const metadata: Metadata = {
  title: "Configurações | Nymbus Store",
};

export default async function SettingsPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("stock_enabled, theme_primary_color, theme_secondary_color")
    .eq("store_id", store.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Preferências operacionais e identidade visual da loja."
      />

      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Identidade visual</h2>
          <p className="text-sm text-muted-foreground">
            Estas cores são aplicadas no painel e, futuramente, na vitrine pública.
          </p>
        </div>
        <ThemeEditor
          initial={{
            primary: settings?.theme_primary_color ?? NYMBUS_DEFAULT_PRIMARY,
            secondary: settings?.theme_secondary_color ?? NYMBUS_DEFAULT_SECONDARY,
          }}
          submitLabel="Salvar cores"
        />
      </section>

      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Estoque</h2>
          <p className="text-sm text-muted-foreground">
            Define se a loja controla quantidade de produtos em estoque.
          </p>
        </div>
        <StockToggle initialEnabled={settings?.stock_enabled ?? true} />
      </section>
    </div>
  );
}
