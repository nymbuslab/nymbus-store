import { z } from "zod";

const priceRegex = /^\d+(?:[.,]\d{1,2})?$/;
const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
const zipRegex = /^\d{5}-?\d{3}$/;
const stateRegex = /^[A-Z]{2}$/;

export const orderAddressSchema = z.object({
  zip_code: z.string().trim().regex(zipRegex, "CEP inválido"),
  street: z.string().trim().min(2).max(200),
  number: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(100).optional().or(z.literal("")),
  neighborhood: z.string().trim().min(1).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().toUpperCase().regex(stateRegex, "UF inválida"),
});

export const orderItemInputSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z
  .object({
    customer_name: z.string().trim().min(1, "Nome é obrigatório").max(200),
    customer_email: z
      .string()
      .trim()
      .toLowerCase()
      .email("E-mail inválido")
      .optional()
      .or(z.literal("")),
    customer_phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Telefone inválido")
      .optional()
      .or(z.literal("")),
    fulfillment_type: z.enum(["pickup", "local_delivery"]),
    delivery_fee: z
      .string()
      .trim()
      .regex(priceRegex, "Taxa inválida")
      .optional()
      .or(z.literal("")),
    delivery_address: orderAddressSchema.optional(),
    items: z.array(orderItemInputSchema).min(1, "Adicione pelo menos um item"),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.customer_email && !data.customer_phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_phone"],
        message: "Informe e-mail ou telefone do cliente",
      });
    }
    if (data.fulfillment_type === "local_delivery" && !data.delivery_address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["delivery_address"],
        message: "Endereço é obrigatório para entrega local",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderAddressInput = z.infer<typeof orderAddressSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "novo",
    "aguardando_pagamento",
    "pago",
    "em_separacao",
    "pronto_para_retirada",
    "pronto_para_entrega",
    "saiu_para_entrega",
    "entregue",
    "cancelado",
  ]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
