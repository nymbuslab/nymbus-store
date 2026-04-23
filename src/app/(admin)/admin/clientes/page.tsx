import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getActiveStore } from "@/modules/stores/queries";
import { listCustomers } from "@/modules/customers/queries";
import { formatCents } from "@/constants/orders";

export const metadata: Metadata = {
  title: "Clientes | Nymbus Store",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  const params = await searchParams;
  const customers = await listCustomers(store.id, { search: params.q });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Clientes nascem automaticamente quando você cria um pedido."
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Crie um pedido manual — o cliente será registrado automaticamente."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left hidden sm:table-cell">Contato</th>
                <th className="px-3 py-2 text-right">Pedidos</th>
                <th className="px-3 py-2 text-right">Total gasto</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">
                  Última compra
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell text-muted-foreground">
                    {c.email ?? "—"}
                    {c.email && c.phone ? " · " : ""}
                    {c.phone ?? ""}
                  </td>
                  <td className="px-3 py-2 text-right">{c.order_count}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatCents(c.total_spent_cents)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                    {formatDate(c.last_order_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
