"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
} from "@/lib/validations/orders";
import { getActiveStore } from "@/modules/stores/queries";
import { logAudit } from "@/lib/logger";

export type CreateOrderActionResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

function toCents(value: string | undefined): number {
  if (!value || value.trim() === "") return 0;
  const normalized = value.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<CreateOrderActionResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Dados inválidos. Revise o formulário.",
    };
  }

  const store = await getActiveStore();
  if (!store) return { success: false, error: "Nenhuma loja ativa." };

  const supabase = await createClient();

  const { data, error } = await (
    supabase.rpc as unknown as (
      name: "create_order",
      args: Record<string, unknown>,
    ) => Promise<{ data: string | null; error: { message: string } | null }>
  )("create_order", {
    p_store_id: store.id,
    p_customer_name: parsed.data.customer_name,
    p_customer_email: parsed.data.customer_email || null,
    p_customer_phone: parsed.data.customer_phone || null,
    p_fulfillment_type: parsed.data.fulfillment_type,
    p_delivery_fee_cents:
      parsed.data.fulfillment_type === "local_delivery"
        ? toCents(parsed.data.delivery_fee)
        : 0,
    p_delivery_address:
      parsed.data.fulfillment_type === "local_delivery"
        ? parsed.data.delivery_address
        : null,
    p_items: parsed.data.items,
    p_notes: parsed.data.notes || null,
  });

  if (error || !data) {
    return { success: false, error: error?.message ?? "Falha ao criar pedido" };
  }

  await logAudit({
    action: "order.created",
    storeId: store.id,
    resourceType: "order",
    resourceId: data,
    metadata: {
      items: parsed.data.items.length,
      fulfillment: parsed.data.fulfillment_type,
    },
  });

  revalidatePath("/admin/pedidos");
  return { success: true, orderId: data };
}

export async function updateOrderStatusAction(
  orderId: string,
  input: { status: string; note?: string },
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Status inválido",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_next_status: parsed.data.status,
    p_note: parsed.data.note || undefined,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { success: true };
}

export async function updateOrderNotesAction(
  orderId: string,
  notes: string,
): Promise<void> {
  const store = await getActiveStore();
  if (!store) redirect("/admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ notes: notes || null })
    .eq("id", orderId)
    .eq("store_id", store.id);
  if (error) throw new Error(error.message);
  await logAudit({
    action: "order.notes_updated",
    storeId: store.id,
    resourceType: "order",
    resourceId: orderId,
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
}
