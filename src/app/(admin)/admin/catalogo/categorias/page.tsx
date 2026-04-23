import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { listStoreCategories } from "@/modules/catalog/categories/queries";
import { CategoriesManager } from "@/modules/catalog/categories/components/categories-manager";

export const metadata: Metadata = {
  title: "Categorias | Nymbus Store",
};

export default async function CategoriesPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const categories = await listStoreCategories(store.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Agrupam os produtos na sua loja. Arraste para reordenar."
      />
      <CategoriesManager
        key={categories.map((c) => `${c.id}:${c.position}:${c.is_active}`).join("|")}
        initialCategories={categories}
      />
    </div>
  );
}
