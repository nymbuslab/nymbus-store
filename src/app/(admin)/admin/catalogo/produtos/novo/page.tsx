import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { listStoreCategories } from "@/modules/catalog/categories/queries";
import { ProductForm } from "@/modules/catalog/products/components/product-form";

export const metadata: Metadata = {
  title: "Novo produto | Nymbus Store",
};

export default async function NewProductPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const supabase = await createClient();
  const [categoriesResult, settingsResult] = await Promise.all([
    listStoreCategories(store.id, { onlyActive: true }),
    supabase
      .from("store_settings")
      .select("stock_enabled")
      .eq("store_id", store.id)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo produto"
        description="Depois de salvar, você pode adicionar imagens e ajustar detalhes."
        actions={
          <Link
            href="/admin/catalogo/produtos"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← voltar à lista
          </Link>
        }
      />
      <ProductForm
        mode="create"
        categories={categoriesResult}
        stockEnabled={settingsResult.data?.stock_enabled ?? true}
      />
    </div>
  );
}
