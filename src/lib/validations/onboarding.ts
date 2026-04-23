import { z } from "zod";

const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
const zipRegex = /^\d{5}-?\d{3}$/;
const stateRegex = /^[A-Z]{2}$/;

const trimmedString = (label: string, min = 1, max = 200) =>
  z
    .string()
    .trim()
    .min(min, `${label} é obrigatório`)
    .max(max, `${label} tem no máximo ${max} caracteres`);

export const storeInfoSchema = z
  .object({
    name: trimmedString("Nome", 2, 120),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Telefone inválido (ex: 11 91234-5678)")
      .or(z.literal(""))
      .optional(),
    whatsapp: z
      .string()
      .trim()
      .regex(phoneRegex, "WhatsApp inválido (ex: 11 91234-5678)")
      .or(z.literal(""))
      .optional(),
    contact_email: z
      .string()
      .trim()
      .toLowerCase()
      .email("E-mail inválido"),
  })
  .superRefine((data, ctx) => {
    if (!data.phone && !data.whatsapp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsapp"],
        message: "Informe pelo menos telefone ou WhatsApp",
      });
    }
  });

export const storeAddressSchema = z.object({
  address_zip_code: z
    .string()
    .trim()
    .regex(zipRegex, "CEP inválido (00000-000)"),
  address_street: trimmedString("Rua", 2, 200),
  address_number: trimmedString("Número", 1, 20),
  address_complement: z.string().trim().max(100).optional().or(z.literal("")),
  address_neighborhood: trimmedString("Bairro", 2, 100),
  address_city: trimmedString("Cidade", 2, 100),
  address_state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(stateRegex, "UF inválida (ex: SP)"),
});

export const categorySchema = z.object({
  name: trimmedString("Nome da categoria", 1, 120),
});

export const productSchema = z.object({
  category_id: z.string().uuid("Escolha uma categoria"),
  name: trimmedString("Nome do produto", 1, 200),
  price: z
    .string()
    .trim()
    .regex(/^\d+(?:[.,]\d{1,2})?$/, "Preço inválido (ex: 19,90)"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const deliverySchema = z
  .object({
    pickup_enabled: z.coerce.boolean(),
    local_delivery_enabled: z.coerce.boolean(),
    delivery_radius_km: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    delivery_fee_cents: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.pickup_enabled && !data.local_delivery_enabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pickup_enabled"],
        message: "Habilite pelo menos uma opção (retirada ou entrega local)",
      });
    }
    if (data.local_delivery_enabled) {
      const radius = data.delivery_radius_km ? Number(data.delivery_radius_km) : NaN;
      const fee = data.delivery_fee_cents ? Number(data.delivery_fee_cents) : NaN;
      if (Number.isNaN(radius) || radius <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["delivery_radius_km"],
          message: "Informe o raio em km",
        });
      }
      if (Number.isNaN(fee) || fee < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["delivery_fee_cents"],
          message: "Informe a taxa fixa (R$)",
        });
      }
    }
  });

export const paymentGatewaySchema = z.object({
  provider: z.enum(["mercadopago", "pagarme"]),
});

export type StoreInfoInput = z.infer<typeof storeInfoSchema>;
export type StoreAddressInput = z.infer<typeof storeAddressSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type PaymentGatewayInput = z.infer<typeof paymentGatewaySchema>;
