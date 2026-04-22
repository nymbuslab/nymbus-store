export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const,
  },
  stores: {
    all: ["stores"] as const,
    detail: (storeId: string) => ["stores", storeId] as const,
  },
} as const;
