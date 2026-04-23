import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/modules/orders/components/status-badge";
import {
  FULFILLMENT_LABEL,
  formatCents,
  formatOrderNumber,
} from "@/constants/orders";
import type { OrderListItem } from "@/modules/orders/queries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersList({ orders }: { orders: OrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nenhum pedido encontrado"
        description="Ajuste os filtros ou crie um pedido manualmente."
        action={
          <Link href="/admin/pedidos/novo" className={buttonVariants()}>
            Novo pedido
          </Link>
        }
      />
    );
  }

  return (
    <>
      {/* Mobile */}
      <ul className="grid gap-3 sm:hidden">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={`/admin/pedidos/${o.id}`}
              className="block rounded-md border bg-background p-3 space-y-2 hover:bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{formatOrderNumber(o.number_seq)}</span>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {o.customer?.name ?? "Sem cliente"}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{FULFILLMENT_LABEL[o.fulfillment_type]}</span>
                <span>{formatDate(o.created_at)}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{formatCents(o.total_cents)}</span>{" "}
                <span className="text-xs text-muted-foreground">
                  · {o.item_count} {o.item_count === 1 ? "item" : "itens"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Pedido</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Entrega</th>
              <th className="px-3 py-2 text-right">Itens</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Criado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="font-medium hover:underline"
                  >
                    {formatOrderNumber(o.number_seq)}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {o.customer?.name ?? "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {FULFILLMENT_LABEL[o.fulfillment_type]}
                </td>
                <td className="px-3 py-2 text-right">{o.item_count}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCents(o.total_cents)}
                </td>
                <td className="px-3 py-2">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDate(o.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
