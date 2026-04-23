import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { listStoreCategories } from "@/modules/catalog/categories/queries";
import { getProductDetail } from "@/modules/catalog/products/queries";
import { ProductForm } from "@/modules/catalog/products/components/product-form";
import { ImageUploader } from "@/components/shared/image-uploader";
import { DeleteProductButton } from "@/modules/catalog/products/components/delete-product-button";

export const metadata: Metadata = {
  title: "Editar produto | Nymbus Store",
};

function centsToDecimal(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const { id } = await params;
  const supabase = await createClient();
  const [product, categories, settings] = await Promise.all([
    getProductDetail(store.id, id),
    listStoreCategories(store.id, { onlyActive: true }),
    supabase
      .from("store_settings")
      .select("stock_enabled")
      .eq("store_id", store.id)
      .maybeSingle(),
  ]);

  if (!product) notFound();

  const stockEnabled = settings.data?.stock_enabled ?? true;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`Produto /${product.slug}`}
        actions={
          <Link
            href="/admin/catalogo/produtos"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← voltar à lista
          </Link>
        }
      />

      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Galeria</h2>
        <ImageUploader
          storeId={store.id}
          productId={product.id}
          initialImages={product.images.map((img) => ({
            id: img.id,
            url: img.url,
            storagePath: img.storage_path,
            position: img.position,
          }))}
        />
      </section>

      <section className="rounded-md border bg-background p-4 sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Detalhes</h2>
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          stockEnabled={stockEnabled}
          defaults={{
            category_id: product.category_id ?? categories[0]?.id,
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            sku: product.sku ?? "",
            price: centsToDecimal(product.price_cents),
            promo_price: centsToDecimal(product.promo_price_cents),
            stock_qty: product.stock_qty?.toString() ?? "",
            weight_grams: product.weight_grams?.toString() ?? "",
            status: product.status,
            is_featured: product.is_featured,
          }}
        />
      </section>

      <section className="rounded-md border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
        <h2 className="text-sm font-medium text-destructive mb-2">Zona de perigo</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Remover o produto também apaga todas as imagens dele. Isso é permanente.
        </p>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </section>
    </div>
  );
}
