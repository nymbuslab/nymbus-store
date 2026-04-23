import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { NewOrderForm } from "@/modules/orders/components/new-order-form";

export const metadata: Metadata = {
  title: "Novo pedido | Nymbus Store",
};

export default async function NewOrderPage() {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const supabase = await createClient();
  const [productsRes, deliveryRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku, price_cents, promo_price_cents")
      .eq("store_id", store.id)
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("store_delivery_config")
      .select(
        "pickup_enabled, local_delivery_enabled, delivery_fee_cents",
      )
      .eq("store_id", store.id)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo pedido manual"
        description="Cadastra cliente, itens e entrega em um só lugar."
        actions={
          <Link
            href="/admin/pedidos"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← voltar à lista
          </Link>
        }
      />
      <NewOrderForm
        products={productsRes.data ?? []}
        deliveryDefaults={{
          pickup_enabled: deliveryRes.data?.pickup_enabled ?? false,
          local_delivery_enabled: deliveryRes.data?.local_delivery_enabled ?? false,
          delivery_fee_cents: deliveryRes.data?.delivery_fee_cents ?? null,
        }}
      />
    </div>
  );
}
