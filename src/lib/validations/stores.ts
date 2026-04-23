import { z } from "zod";

export const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da loja precisa ter pelo menos 2 caracteres")
    .max(120, "O nome da loja pode ter no máximo 120 caracteres"),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
