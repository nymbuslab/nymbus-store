"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProductAction,
  updateProductAction,
  type ProductActionState,
} from "@/modules/catalog/products/actions";

type CategoryOption = { id: string; name: string };

export type ProductFormDefaults = {
  category_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  sku?: string;
  price?: string;
  promo_price?: string;
  stock_qty?: string;
  weight_grams?: string;
  status?: "draft" | "active" | "inactive";
  is_featured?: boolean;
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  categories: CategoryOption[];
  defaults?: ProductFormDefaults;
  stockEnabled: boolean;
};

const initialState: ProductActionState = {};

export function ProductForm({
  mode,
  productId,
  categories,
  defaults = {},
  stockEnabled,
}: Props) {
  const action =
    mode === "edit" && productId
      ? updateProductAction.bind(null, productId)
      : createProductAction;
  const [state, formAction] = useActionState(action, initialState);

  if (categories.length === 0) {
    return (
      <p className="rounded-md border bg-destructive/10 p-4 text-sm text-destructive">
        Crie uma categoria antes de cadastrar produtos.
      </p>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category_id">
          Categoria <span className="text-destructive">*</span>
        </Label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={defaults.category_id ?? categories[0]?.id}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={!!fe.category_id}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fe.category_id ? (
          <p className="text-sm text-destructive">{fe.category_id}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr,200px]">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaults.name ?? ""}
            aria-invalid={!!fe.name}
          />
          {fe.name ? <p className="text-sm text-destructive">{fe.name}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU (opcional)</Label>
          <Input
            id="sku"
            name="sku"
            defaultValue={defaults.sku ?? ""}
            aria-invalid={!!fe.sku}
          />
          {fe.sku ? <p className="text-sm text-destructive">{fe.sku}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (opcional)</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={defaults.slug ?? ""}
          placeholder="Será gerado a partir do nome se vazio"
          aria-invalid={!!fe.slug}
        />
        {fe.slug ? <p className="text-sm text-destructive">{fe.slug}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults.description ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={!!fe.description}
        />
        {fe.description ? (
          <p className="text-sm text-destructive">{fe.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">
            Preço (R$) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            placeholder="19,90"
            required
            defaultValue={defaults.price ?? ""}
            aria-invalid={!!fe.price}
          />
          {fe.price ? <p className="text-sm text-destructive">{fe.price}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo_price">Preço promocional (opcional)</Label>
          <Input
            id="promo_price"
            name="promo_price"
            inputMode="decimal"
            placeholder="Menor que o preço normal"
            defaultValue={defaults.promo_price ?? ""}
            aria-invalid={!!fe.promo_price}
          />
          {fe.promo_price ? (
            <p className="text-sm text-destructive">{fe.promo_price}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stockEnabled ? (
          <div className="space-y-2">
            <Label htmlFor="stock_qty">Estoque (unidades)</Label>
            <Input
              id="stock_qty"
              name="stock_qty"
              inputMode="numeric"
              placeholder="Deixe vazio para ilimitado"
              defaultValue={defaults.stock_qty ?? ""}
              aria-invalid={!!fe.stock_qty}
            />
            {fe.stock_qty ? (
              <p className="text-sm text-destructive">{fe.stock_qty}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:col-span-1">
            Controle de estoque desligado nas configurações — quantidade não
            é registrada para este produto.
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="weight_grams">Peso (gramas — opcional)</Label>
          <Input
            id="weight_grams"
            name="weight_grams"
            inputMode="numeric"
            placeholder="Usado para logística futura"
            defaultValue={defaults.weight_grams ?? ""}
            aria-invalid={!!fe.weight_grams}
          />
          {fe.weight_grams ? (
            <p className="text-sm text-destructive">{fe.weight_grams}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status de publicação</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults.status ?? "draft"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            <option value="draft">Rascunho</option>
            <option value="active">Publicado</option>
            <option value="inactive">Inativo</option>
          </select>
          {fe.status ? <p className="text-sm text-destructive">{fe.status}</p> : null}
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={defaults.is_featured ?? false}
            className="size-4 accent-primary"
          />
          Destaque (aparece em destaque na vitrine)
        </label>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Salvando..."
        : mode === "create"
          ? "Criar produto"
          : "Salvar alterações"}
    </Button>
  );
}
