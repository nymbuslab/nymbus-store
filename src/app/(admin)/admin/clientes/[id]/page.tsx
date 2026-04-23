import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";
import { getCustomerDetail } from "@/modules/customers/queries";
import { OrderStatusBadge } from "@/modules/orders/components/status-badge";
import { formatCents, formatOrderNumber } from "@/constants/orders";

export const metadata: Metadata = {
  title: "Cliente | Nymbus Store",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const { id } = await params;
  const detail = await getCustomerDetail(store.id, id);
  if (!detail) notFound();

  const totalSpent = detail.orders.reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.customer.name}
        description={detail.customer.email ?? detail.customer.phone ?? ""}
        actions={
          <Link
            href="/admin/clientes"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← voltar à lista
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Pedidos</p>
          <p className="text-xl font-semibold">{detail.orders.length}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Total gasto</p>
          <p className="text-xl font-semibold">{formatCents(totalSpent)}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Cadastrado em</p>
          <p className="text-xl font-semibold">
            {formatDate(detail.customer.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        <section className="rounded-md border bg-background p-4 sm:p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Histórico de compras
          </h2>
          {detail.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          ) : (
            <ul className="divide-y">
              {detail.orders.map((o) => (
                <li key={o.id} className="py-2">
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="flex items-center justify-between gap-3 text-sm hover:bg-muted/30 rounded px-2 py-1"
                  >
                    <span className="font-medium">
                      {formatOrderNumber(o.number_seq)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(o.created_at)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <span className="font-medium w-24 text-right">
                      {formatCents(o.total_cents)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-md border bg-background p-4 space-y-2 text-sm">
            <h2 className="text-sm font-medium text-muted-foreground">Contato</h2>
            {detail.customer.email ? (
              <p>
                <span className="text-muted-foreground">E-mail:</span>{" "}
                {detail.customer.email}
              </p>
            ) : null}
            {detail.customer.phone ? (
              <p>
                <span className="text-muted-foreground">Telefone:</span>{" "}
                {detail.customer.phone}
              </p>
            ) : null}
          </section>

          <section className="rounded-md border bg-background p-4 space-y-2 text-sm">
            <h2 className="text-sm font-medium text-muted-foreground">
              Endereço principal
            </h2>
            {detail.primary_address ? (
              <address className="not-italic text-muted-foreground text-xs space-y-0.5">
                <p>
                  {detail.primary_address.street}, {detail.primary_address.number}
                  {detail.primary_address.complement
                    ? ` — ${detail.primary_address.complement}`
                    : ""}
                </p>
                <p>
                  {detail.primary_address.neighborhood} ·{" "}
                  {detail.primary_address.city}/{detail.primary_address.state}
                </p>
                <p>CEP {detail.primary_address.zip_code ?? "—"}</p>
              </address>
            ) : (
              <p className="text-muted-foreground text-xs">
                Sem endereço cadastrado ainda.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
