import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProductListItem } from "@/modules/catalog/products/queries";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const statusLabel: Record<"draft" | "active" | "inactive", string> = {
  draft: "Rascunho",
  active: "Publicado",
  inactive: "Inativo",
};

const statusTone: Record<"draft" | "active" | "inactive", string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/20 text-success-foreground",
  inactive: "bg-destructive/10 text-destructive",
};

export function ProductsList({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto encontrado"
        description="Ajuste os filtros ou cadastre um novo produto."
        action={
          <Link href="/admin/catalogo/produtos/novo" className={buttonVariants()}>
            Novo produto
          </Link>
        }
      />
    );
  }

  return (
    <>
      {/* Cards — mobile */}
      <ul className="grid gap-3 sm:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/catalogo/produtos/${p.id}`}
              className="flex gap-3 rounded-md border bg-background p-3 hover:bg-muted/30"
            >
              <ProductThumb url={p.primary_image_url} />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category?.name ?? "Sem categoria"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{formatCents(p.price_cents)}</span>
                  {p.promo_price_cents ? (
                    <span className="text-xs text-success">
                      {formatCents(p.promo_price_cents)}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      statusTone[p.status],
                    )}
                  >
                    {statusLabel[p.status]}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Tabela — desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left"></th>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Categoria</th>
              <th className="px-3 py-2 text-right">Preço</th>
              <th className="px-3 py-2 text-right">Estoque</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2">
                  <ProductThumb url={p.primary_image_url} small />
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/catalogo/produtos/${p.id}`}
                    className="font-medium hover:underline"
                  >
                    {p.name}
                  </Link>
                  {p.is_featured ? (
                    <span className="ml-2 text-xs text-warning-foreground">
                      ★ destaque
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {p.category?.name ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {p.promo_price_cents ? (
                    <>
                      <span className="line-through text-xs text-muted-foreground mr-1">
                        {formatCents(p.price_cents)}
                      </span>
                      <span className="font-medium text-success">
                        {formatCents(p.promo_price_cents)}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">{formatCents(p.price_cents)}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {p.stock_qty != null ? p.stock_qty : "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      statusTone[p.status],
                    )}
                  >
                    {statusLabel[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProductThumb({
  url,
  small = false,
}: {
  url: string | null;
  small?: boolean;
}) {
  const size = small ? 40 : 56;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md bg-muted"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image src={url} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Package className="size-4" aria-hidden />
        </div>
      )}
    </div>
  );
}
