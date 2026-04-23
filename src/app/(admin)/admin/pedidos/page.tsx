import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getActiveStore } from "@/modules/stores/queries";
import { listOrders } from "@/modules/orders/queries";
import { OrdersFilters } from "@/modules/orders/components/orders-filters";
import { OrdersList } from "@/modules/orders/components/orders-list";

export const metadata: Metadata = {
  title: "Pedidos | Nymbus Store",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?:
      | "all"
      | "novo"
      | "aguardando_pagamento"
      | "pago"
      | "em_separacao"
      | "pronto_para_retirada"
      | "pronto_para_entrega"
      | "saiu_para_entrega"
      | "entregue"
      | "cancelado";
    from?: string;
    to?: string;
  }>;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const params = await searchParams;
  const orders = await listOrders(store.id, {
    status: params.status,
    fromDate: params.from,
    toDate: params.to,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Operação diária da loja. Filtre por status e período."
        actions={
          <Link href="/admin/pedidos/novo" className={buttonVariants()}>
            Novo pedido
          </Link>
        }
      />
      <OrdersFilters />
      <OrdersList orders={orders} />
    </div>
  );
}
