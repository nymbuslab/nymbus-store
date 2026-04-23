import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getActiveStore } from "@/modules/stores/queries";
import { listStoreCategories } from "@/modules/catalog/categories/queries";
import { listProducts } from "@/modules/catalog/products/queries";
import { ProductsList } from "@/modules/catalog/products/components/products-list";
import { ProductsListFilters } from "@/modules/catalog/products/components/products-list-filters";

export const metadata: Metadata = {
  title: "Produtos | Nymbus Store",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: "draft" | "active" | "inactive" | "all";
    category?: string;
  }>;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const params = await searchParams;
  const [categories, products] = await Promise.all([
    listStoreCategories(store.id),
    listProducts(store.id, {
      search: params.q,
      status: params.status,
      categoryId: params.category,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="CRUD completo do catálogo. Use filtros para encontrar rápido."
        actions={
          <Link href="/admin/catalogo/produtos/novo" className={buttonVariants()}>
            Novo produto
          </Link>
        }
      />
      <ProductsListFilters categories={categories} />
      <ProductsList products={products} />
    </div>
  );
}
