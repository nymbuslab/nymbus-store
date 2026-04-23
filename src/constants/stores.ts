import type { Database } from "@/types/database.types";

export const ACTIVE_STORE_COOKIE = "nymbus-active-store";

export type StoreStatus = Database["public"]["Enums"]["store_status"];
export type StoreMemberRole = Database["public"]["Enums"]["store_member_role"];

export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  draft: "Rascunho",
  configuring: "Configurando",
  active: "Ativa",
  blocked: "Bloqueada",
};

export const STORE_MEMBER_ROLE_LABEL: Record<StoreMemberRole, string> = {
  owner: "Dono",
  admin: "Administrador",
  operator: "Operador",
  financial: "Financeiro",
};
