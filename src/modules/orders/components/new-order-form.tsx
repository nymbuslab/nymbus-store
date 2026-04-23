"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCep,
  lookupCep,
  sanitizeCep,
} from "@/lib/utils/cep";
import { createOrderAction } from "@/modules/orders/actions";
import type { OrderAddressInput } from "@/lib/validations/orders";

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;
  price_cents: number;
  promo_price_cents: number | null;
};

type DeliveryDefaults = {
  pickup_enabled: boolean;
  local_delivery_enabled: boolean;
  delivery_fee_cents: number | null;
};

type ItemState = {
  product_id: string;
  name: string;
  price_cents: number;
  quantity: number;
};

function centsToDisplay(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function centsToInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function NewOrderForm({
  products,
  deliveryDefaults,
}: {
  products: ProductOption[];
  deliveryDefaults: DeliveryDefaults;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const initialFulfillment =
    deliveryDefaults.pickup_enabled && !deliveryDefaults.local_delivery_enabled
      ? "pickup"
      : deliveryDefaults.local_delivery_enabled && !deliveryDefaults.pickup_enabled
        ? "local_delivery"
        : "pickup";
  const [fulfillment, setFulfillment] = useState<"pickup" | "local_delivery">(
    initialFulfillment,
  );
  const [deliveryFee, setDeliveryFee] = useState(
    centsToInput(deliveryDefaults.delivery_fee_cents),
  );

  const [address, setAddress] = useState<OrderAddressInput>({
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "not-found">(
    "idle",
  );

  const [items, setItems] = useState<ItemState[]>([]);
  const [pickedProductId, setPickedProductId] = useState<string>(
    products[0]?.id ?? "",
  );
  const [pickedQty, setPickedQty] = useState<string>("1");

  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0),
    [items],
  );
  const feeCents = useMemo(() => {
    if (fulfillment !== "local_delivery" || !deliveryFee) return 0;
    const n = Number(deliveryFee.replace(",", "."));
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }, [fulfillment, deliveryFee]);

  async function onCepBlur() {
    const digits = sanitizeCep(address.zip_code);
    if (digits.length !== 8) return;
    setCepStatus("loading");
    const result = await lookupCep(digits).catch(() => null);
    if (!result) {
      setCepStatus("not-found");
      return;
    }
    setCepStatus("idle");
    setAddress((prev) => ({
      ...prev,
      zip_code: result.cep,
      street: prev.street || result.street,
      neighborhood: prev.neighborhood || result.neighborhood,
      city: prev.city || result.city,
      state: prev.state || result.state,
    }));
  }

  function addItem() {
    const product = products.find((p) => p.id === pickedProductId);
    const qty = Math.max(1, Math.min(999, Number(pickedQty) || 0));
    if (!product || qty <= 0) return;
    const price = product.promo_price_cents ?? product.price_cents;

    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [
        ...prev,
        { product_id: product.id, name: product.name, price_cents: price, quantity: qty },
      ];
    });
    setPickedQty("1");
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function updateQty(productId: string, qty: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId
          ? { ...i, quantity: Math.max(1, Math.min(999, qty)) }
          : i,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Adicione pelo menos um item.");
      return;
    }

    const payload = {
      customer_name: customerName,
      customer_email: customerEmail || undefined,
      customer_phone: customerPhone || undefined,
      fulfillment_type: fulfillment,
      delivery_fee:
        fulfillment === "local_delivery" && deliveryFee ? deliveryFee : undefined,
      delivery_address:
        fulfillment === "local_delivery"
          ? (address as OrderAddressInput)
          : undefined,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      notes: notes || undefined,
    };

    startTransition(async () => {
      const result = await createOrderAction(payload);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/admin/pedidos/${result.orderId}`);
    });
  }

  if (products.length === 0) {
    return (
      <p className="rounded-md border bg-destructive/10 p-4 text-sm text-destructive">
        Cadastre pelo menos um produto publicado antes de criar um pedido
        manualmente.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Cliente */}
      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Cliente</h2>
        <div className="space-y-2">
          <Label htmlFor="customer_name">
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customer_name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_email">E-mail</Label>
            <Input
              id="customer_email"
              type="email"
              inputMode="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_phone">Telefone / WhatsApp</Label>
            <Input
              id="customer_phone"
              inputMode="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(11) 91234-5678"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Informe e-mail ou telefone. Cliente existente com o mesmo contato será reutilizado.
        </p>
      </section>

      {/* Itens */}
      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Itens</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr,100px,auto]">
          <div className="space-y-1">
            <Label htmlFor="pick_product" className="text-xs">
              Produto
            </Label>
            <select
              id="pick_product"
              value={pickedProductId}
              onChange={(e) => setPickedProductId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.sku ? ` (${p.sku})` : ""} · {centsToDisplay(p.promo_price_cents ?? p.price_cents)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pick_qty" className="text-xs">
              Qtd
            </Label>
            <Input
              id="pick_qty"
              inputMode="numeric"
              value={pickedQty}
              onChange={(e) => setPickedQty(e.target.value.replace(/\D/g, "") || "1")}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addItem} variant="outline">
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {items.map((i) => (
              <li
                key={i.product_id}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <span className="flex-1">{i.name}</span>
                <span className="text-xs text-muted-foreground">
                  {centsToDisplay(i.price_cents)}
                </span>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={i.quantity}
                  onChange={(e) =>
                    updateQty(i.product_id, Number(e.target.value))
                  }
                  className="w-16 h-8"
                />
                <span className="font-medium w-24 text-right">
                  {centsToDisplay(i.price_cents * i.quantity)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(i.product_id)}
                  aria-label="Remover item"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Entrega */}
      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Entrega</h2>
        <div className="grid gap-2">
          {deliveryDefaults.pickup_enabled ? (
            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillment === "pickup"}
                onChange={() => setFulfillment("pickup")}
                className="mt-0.5 size-4 accent-primary"
              />
              <div>
                <p className="font-medium">Retirada na loja</p>
                <p className="text-muted-foreground">
                  O cliente busca o pedido no endereço da loja.
                </p>
              </div>
            </label>
          ) : null}
          {deliveryDefaults.local_delivery_enabled ? (
            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillment === "local_delivery"}
                onChange={() => setFulfillment("local_delivery")}
                className="mt-0.5 size-4 accent-primary"
              />
              <div>
                <p className="font-medium">Entrega local</p>
                <p className="text-muted-foreground">
                  Endereço do cliente com taxa fixa configurada.
                </p>
              </div>
            </label>
          ) : null}
          {!deliveryDefaults.pickup_enabled &&
          !deliveryDefaults.local_delivery_enabled ? (
            <p className="text-sm text-destructive">
              Nenhum modo de entrega configurado. Abra o onboarding para habilitar.
            </p>
          ) : null}
        </div>

        {fulfillment === "local_delivery" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Taxa de entrega (R$)</Label>
              <Input
                id="delivery_fee"
                inputMode="decimal"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="10,00"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={address.zip_code}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      zip_code: formatCep(e.target.value),
                    }))
                  }
                  onBlur={onCepBlur}
                  placeholder="00000-000"
                  inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground min-h-4">
                  {cepStatus === "loading" && "Buscando..."}
                  {cepStatus === "not-found" && "CEP não encontrado."}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      state: e.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr,120px]">
              <div className="space-y-1">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, street: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={address.number}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, number: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={address.neighborhood}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      neighborhood: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={address.complement ?? ""}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      complement: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Notas e resumo */}
      <section className="rounded-md border bg-background p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Observações internas (opcional)</Label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Ex: cliente prefere entrega à tarde."
          />
        </div>

        <div className="rounded-md border bg-muted/20 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{centsToDisplay(subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa de entrega</span>
            <span>{centsToDisplay(feeCents)}</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t">
            <span>Total</span>
            <span>{centsToDisplay(subtotalCents + feeCents)}</span>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar pedido"}
          </Button>
        </div>
      </section>
    </form>
  );
}
