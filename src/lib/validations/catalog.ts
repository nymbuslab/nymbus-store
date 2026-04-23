import { z } from "zod";

const priceRegex = /^\d+(?:[.,]\d{1,2})?$/;
const intRegex = /^\d+$/;
const slugRegex = /^[a-z0-9][a-z0-9-]{0,100}$/;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  is_active: z.coerce.boolean(),
});

export const productSchema = z
  .object({
    category_id: z.string().uuid("Escolha uma categoria"),
    name: z.string().trim().min(1, "Nome é obrigatório").max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(slugRegex, "Slug inválido (letras, números e hífen)")
      .optional()
      .or(z.literal("")),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    sku: z.string().trim().max(60).optional().or(z.literal("")),
    price: z
      .string()
      .trim()
      .regex(priceRegex, "Preço inválido (ex: 19,90)"),
    promo_price: z
      .string()
      .trim()
      .regex(priceRegex, "Preço promocional inválido")
      .optional()
      .or(z.literal("")),
    stock_qty: z
      .string()
      .trim()
      .regex(intRegex, "Quantidade inválida")
      .optional()
      .or(z.literal("")),
    weight_grams: z
      .string()
      .trim()
      .regex(intRegex, "Peso inválido (gramas)")
      .optional()
      .or(z.literal("")),
    status: z.enum(["draft", "active", "inactive"]),
    is_featured: z.coerce.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.promo_price) {
      const price = Number(data.price.replace(",", "."));
      const promo = Number(data.promo_price.replace(",", "."));
      if (!Number.isFinite(promo) || promo >= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["promo_price"],
          message: "O preço promocional precisa ser menor que o preço normal",
        });
      }
    }
  });

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
