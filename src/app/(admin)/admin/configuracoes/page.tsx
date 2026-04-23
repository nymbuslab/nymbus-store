import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { StockToggle } from "@/modules/settings/components/stock-toggle";

export const metadata: Metadata = {
  title: "Configurações | Nymbus Store",
};

export default async function SettingsPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("stock_enabled")
    .eq("store_id", store.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Preferências operacionais da loja."
      />
      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Estoque</h2>
        <StockToggle initialEnabled={settings?.stock_enabled ?? true} />
      </section>
    </div>
  );
}
