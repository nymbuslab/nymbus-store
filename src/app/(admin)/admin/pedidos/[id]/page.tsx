import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { getOrderDetail } from "@/modules/orders/queries";
import { OrderStatusBadge } from "@/modules/orders/components/status-badge";
import { StatusActions } from "@/modules/orders/components/status-actions";
import { NotesForm } from "@/modules/orders/components/notes-form";
import {
  FULFILLMENT_LABEL,
  ORDER_STATUS_LABEL,
  formatCents,
  formatOrderNumber,
} from "@/constants/orders";

export const metadata: Metadata = {
  title: "Pedido | Nymbus Store",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const { id } = await params;
  const order = await getOrderDetail(store.id, id);
  if (!order) notFound();

  const address = order.delivery_address_snapshot as
    | {
        zip_code?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
      }
    | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pedido ${formatOrderNumber(order.number_seq)}`}
        description={`Criado em ${formatDateTime(order.created_at)}`}
        actions={
          <Link
            href="/admin/pedidos"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← voltar à lista
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-6">
          {/* Itens */}
          <section className="rounded-md border bg-background p-4 sm:p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Itens</h2>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.product_name_snapshot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.sku_snapshot ?? "—"}
                    </p>
                  </div>
                  <span className="text-muted-foreground">
                    {item.quantity} × {formatCents(item.unit_price_cents)}
                  </span>
                  <span className="font-medium w-24 text-right">
                    {formatCents(item.subtotal_cents)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCents(order.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span>{formatCents(order.delivery_fee_cents)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total</span>
                <span>{formatCents(order.total_cents)}</span>
              </div>
            </div>
          </section>

          {/* Linha do tempo */}
          <section className="rounded-md border bg-background p-4 sm:p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Linha do tempo
            </h2>
            <ol className="space-y-3">
              {order.history.map((event) => (
                <li key={event.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="size-2 rounded-full bg-primary mt-1.5" aria-hidden />
                    <span className="w-px flex-1 bg-border mt-1" aria-hidden />
                  </div>
                  <div className="flex-1 pb-3 border-b last:border-0">
                    <p className="font-medium">
                      {ORDER_STATUS_LABEL[event.status]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(event.created_at)}
                    </p>
                    {event.note ? (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        {event.note}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Observações */}
          <section className="rounded-md border bg-background p-4 sm:p-6">
            <NotesForm orderId={order.id} initial={order.notes} />
          </section>
        </div>

        <aside className="space-y-6">
          {/* Status + ações */}
          <section className="rounded-md border bg-background p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <StatusActions orderId={order.id} currentStatus={order.status} />
          </section>

          {/* Cliente */}
          <section className="rounded-md border bg-background p-4 space-y-2 text-sm">
            <h2 className="text-sm font-medium text-muted-foreground">Cliente</h2>
            {order.customer ? (
              <>
                <p className="font-medium">
                  <Link
                    href={`/admin/clientes/${order.customer.id}`}
                    className="hover:underline"
                  >
                    {order.customer.name}
                  </Link>
                </p>
                {order.customer.email ? (
                  <p className="text-muted-foreground">{order.customer.email}</p>
                ) : null}
                {order.customer.phone ? (
                  <p className="text-muted-foreground">{order.customer.phone}</p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">Cliente removido</p>
            )}
          </section>

          {/* Entrega */}
          <section className="rounded-md border bg-background p-4 space-y-2 text-sm">
            <h2 className="text-sm font-medium text-muted-foreground">Entrega</h2>
            <p>{FULFILLMENT_LABEL[order.fulfillment_type]}</p>
            {address ? (
              <address className="not-italic text-muted-foreground text-xs space-y-0.5">
                <p>
                  {address.street}, {address.number}
                  {address.complement ? ` — ${address.complement}` : ""}
                </p>
                <p>
                  {address.neighborhood} · {address.city}/{address.state}
                </p>
                <p>CEP {address.zip_code}</p>
              </address>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
